import { Router } from 'express';
import { prisma } from '../index';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { authenticateToken, AuthRequest } from '../middlewares/auth';
import { validate, loginSchema, registerSchema, profileSchema } from '../utils/validation';
import { Request, Response } from 'express';

const router = Router();

/**
 * POST /api/auth/login
 * ログイン
 */
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { companyCode, employeeNumber, password } = req.body;

    // 法人を取得
    const company = await prisma.company.findUnique({
      where: { code: companyCode, isActive: true },
    });

    if (!company) {
      return res.status(401).json({ error: '法人コードまたはパスワードが正しくありません' });
    }

    // ユーザーを取得
    const user = await prisma.user.findUnique({
      where: {
        companyId_employeeNumber: {
          companyId: company.id,
          employeeNumber,
        },
      },
      include: {
        profile: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: '法人コードまたはパスワードが正しくありません' });
    }

    // パスワード検証
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: '法人コードまたはパスワードが正しくありません' });
    }

    // 最終ログイン時刻を更新
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 初回ログイン判定（プロフィール未登録）
    const isFirstLogin = !user.profile;

    // トークン生成
    const token = generateToken({
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
      },
      isFirstLogin,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/register
 * ユーザー登録（基本情報）
 */
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const {
      companyCode,
      employeeNumber,
      name,
      birthDate,
      gender,
      departmentId,
      jobType,
      password,
    } = req.body;

    // 法人を取得
    const company = await prisma.company.findUnique({
      where: { code: companyCode, isActive: true },
    });

    if (!company) {
      return res.status(404).json({ error: '法人が見つかりません' });
    }

    // 部署が存在し、同じ法人に属しているか確認
    const department = await prisma.department.findFirst({
      where: {
        id: departmentId,
        companyId: company.id,
        isActive: true,
      },
    });

    if (!department) {
      return res.status(404).json({ error: '部署が見つかりません' });
    }

    // 既存ユーザーチェック
    const existingUser = await prisma.user.findUnique({
      where: {
        companyId_employeeNumber: {
          companyId: company.id,
          employeeNumber,
        },
      },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'この社員番号は既に登録されています' });
    }

    // パスワードハッシュ化
    const passwordHash = await hashPassword(password);

    // ユーザー作成
    const user = await prisma.user.create({
      data: {
        companyId: company.id,
        departmentId,
        employeeNumber,
        name,
        birthDate: new Date(birthDate),
        gender,
        jobType: jobType || null,
        passwordHash,
        role: 'EMPLOYEE',
      },
    });

    // トークン生成
    const token = generateToken({
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/register-profile
 * プロフィール登録（家族情報）
 */
router.post(
  '/register-profile',
  authenticateToken,
  validate(profileSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const { hasChildren, childrenAges, isMarried, interestedCategories } = req.body;

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // プロフィールが既に存在するか確認
      const existingProfile = await prisma.userProfile.findUnique({
        where: { userId: req.user.userId },
      });

      if (existingProfile) {
        // 更新
        await prisma.userProfile.update({
          where: { userId: req.user.userId },
          data: {
            hasChildren,
            childrenAges: childrenAges || [],
            isMarried,
            interestedCategories: interestedCategories || [],
          },
        });
      } else {
        // 新規作成
        await prisma.userProfile.create({
          data: {
            userId: req.user.userId,
            hasChildren,
            childrenAges: childrenAges || [],
            isMarried,
            interestedCategories: interestedCategories || [],
          },
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Profile register error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /api/auth/me
 * 現在のユーザー情報を取得
 */
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        profile: true,
      },
    });

    // 開発モード: ユーザーが見つからない場合、最初のユーザーを返す
    if (!user && process.env.NODE_ENV === 'development') {
      user = await prisma.user.findFirst({
        include: {
          company: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          profile: true,
        },
      });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // パスワードハッシュを除外
    const { passwordHash, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

