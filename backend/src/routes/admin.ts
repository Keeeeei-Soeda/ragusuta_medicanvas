import { Router, Response } from 'express';
import { authenticateToken, requireRole, AuthRequest } from '../middlewares/auth';
import { prisma } from '../index';
import { z } from 'zod';

const router = Router();

// すべての管理者ルートは認証とロールチェックが必要
router.use(authenticateToken);

/**
 * GET /api/admin/dashboard
 * 管理者ダッシュボード（全社統計）
 */
router.get('/dashboard', requireRole(['ADMIN', 'RAGUSTA', 'SYSTEM']), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { companyId, role } = req.user;

    // 期間の開始日
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // システム管理者とラグスタは全社データ、それ以外は自社のみ
    const targetCompanyId = role === 'SYSTEM' || role === 'RAGUSTA' ? undefined : companyId;

    // 総ユーザー数
    const totalUsers = await prisma.user.count({
      where: {
        ...(targetCompanyId && { companyId: targetCompanyId }),
        isActive: true,
      },
    });

    // アクティブユーザー数（今月ログインしたユーザー）
    const activeUsers = await prisma.user.count({
      where: {
        ...(targetCompanyId && { companyId: targetCompanyId }),
        isActive: true,
        lastLoginAt: { gte: startOfMonth },
      },
    });

    // 総体験談数
    const totalExperiences = await prisma.experience.count({
      where: {
        ...(targetCompanyId && { user: { companyId: targetCompanyId } }),
      },
    });

    // 今月の体験談数
    const monthlyExperiences = await prisma.experience.count({
      where: {
        ...(targetCompanyId && { user: { companyId: targetCompanyId } }),
        createdAt: { gte: startOfMonth },
      },
    });

    // 総閲覧数
    const totalViews = await prisma.activityLog.count({
      where: {
        ...(targetCompanyId && { user: { companyId: targetCompanyId } }),
        action: 'VIEW_EXPERIENCE',
      },
    });

    // 今月の閲覧数
    const monthlyViews = await prisma.activityLog.count({
      where: {
        ...(targetCompanyId && { user: { companyId: targetCompanyId } }),
        action: 'VIEW_EXPERIENCE',
        createdAt: { gte: startOfMonth },
      },
    });

    // カテゴリ別の体験談数
    const experiencesByCategory = await prisma.experience.groupBy({
      by: ['category'],
      where: {
        ...(targetCompanyId && { user: { companyId: targetCompanyId } }),
        status: 'PUBLISHED',
      },
      _count: true,
    });

    // 部署別統計
    const departments = await prisma.department.findMany({
      where: {
        ...(targetCompanyId && { companyId: targetCompanyId }),
        isActive: true,
      },
      include: {
        _count: {
          select: {
            users: { where: { isActive: true } },
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    const departmentStats = await Promise.all(
      departments.map(async (dept) => ({
        id: dept.id,
        name: dept.name,
        userCount: dept._count.users,
        experienceCount: await prisma.experience.count({
          where: {
            user: { departmentId: dept.id },
            createdAt: { gte: startOfMonth },
          },
        }),
      }))
    );

    res.json({
      summary: {
        totalUsers,
        activeUsers,
        totalExperiences,
        monthlyExperiences,
        totalViews,
        monthlyViews,
        activationRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0,
      },
      experiencesByCategory: experiencesByCategory.map((item) => ({
        category: item.category,
        count: item._count,
      })),
      departmentStats,
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/departments
 * 部署一覧を取得
 */
router.get('/departments', requireRole(['ADMIN', 'SYSTEM']), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { companyId, role } = req.user;
    const targetCompanyId = role === 'SYSTEM' ? req.query.companyId as string : companyId;

    const departments = await prisma.department.findMany({
      where: { companyId: targetCompanyId },
      include: {
        _count: {
          select: {
            users: { where: { isActive: true } },
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/departments
 * 部署を作成
 */
router.post('/departments', requireRole(['ADMIN', 'SYSTEM']), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const schema = z.object({
      name: z.string().min(1, '部署名は必須です').max(50),
      displayOrder: z.number().int().min(0).optional(),
    });

    const validated = schema.parse(req.body);
    const { companyId } = req.user;

    // 重複チェック
    const existing = await prisma.department.findUnique({
      where: {
        companyId_name: {
          companyId,
          name: validated.name,
        },
      },
    });

    if (existing) {
      return res.status(409).json({ error: 'この部署名は既に存在します' });
    }

    const department = await prisma.department.create({
      data: {
        companyId,
        name: validated.name,
        displayOrder: validated.displayOrder ?? 0,
      },
    });

    res.status(201).json(department);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/admin/departments/:id
 * 部署を更新
 */
router.put('/departments/:id', requireRole(['ADMIN', 'SYSTEM']), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const schema = z.object({
      name: z.string().min(1).max(50).optional(),
      displayOrder: z.number().int().min(0).optional(),
      isActive: z.boolean().optional(),
    });

    const validated = schema.parse(req.body);

    const department = await prisma.department.update({
      where: { id },
      data: validated,
    });

    res.json(department);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/admin/departments/:id
 * 部署を削除
 */
router.delete('/departments/:id', requireRole(['ADMIN', 'SYSTEM']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // 部署に所属するユーザーがいないか確認
    const userCount = await prisma.user.count({
      where: { departmentId: id, isActive: true },
    });

    if (userCount > 0) {
      return res.status(400).json({ 
        error: `この部署には${userCount}人のユーザーが所属しているため削除できません` 
      });
    }

    await prisma.department.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/users
 * ユーザー一覧を取得
 */
router.get('/users', requireRole(['ADMIN', 'SYSTEM']), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { companyId, role } = req.user;
    const { departmentId, isActive, search, limit = '50', offset = '0' } = req.query;

    const where: any = {
      ...(role !== 'SYSTEM' && { companyId }),
    };

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { employeeNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          department: {
            select: { id: true, name: true },
          },
          profile: true,
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      }),
      prisma.user.count({ where }),
    ]);

    // パスワードハッシュを除外
    const usersWithoutPassword = users.map(({ passwordHash, ...user }) => user);

    res.json({
      users: usersWithoutPassword,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/admin/users/:id
 * ユーザーを更新
 */
router.put('/users/:id', requireRole(['ADMIN', 'SYSTEM']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const schema = z.object({
      isActive: z.boolean().optional(),
      role: z.enum(['EMPLOYEE', 'ADMIN', 'RAGUSTA', 'SYSTEM']).optional(),
      departmentId: z.string().uuid().optional(),
    });

    const validated = schema.parse(req.body);

    const user = await prisma.user.update({
      where: { id },
      data: validated,
      include: {
        department: true,
      },
    });

    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/admin/announcements
 * お知らせ一覧を取得
 */
router.get('/announcements', requireRole(['ADMIN', 'RAGUSTA', 'SYSTEM']), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { companyId, role } = req.user;
    const targetCompanyId = role === 'SYSTEM' || role === 'RAGUSTA' ? req.query.companyId as string : companyId;

    const announcements = await prisma.announcement.findMany({
      where: { companyId: targetCompanyId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(announcements);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/announcements
 * お知らせを作成
 */
router.post('/announcements', requireRole(['ADMIN', 'RAGUSTA', 'SYSTEM']), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const schema = z.object({
      title: z.string().min(1, 'タイトルは必須です').max(200),
      content: z.string().min(1, '内容は必須です'),
      type: z.enum(['INFO', 'WARNING', 'URGENT']).default('INFO'),
      isPublished: z.boolean().default(false),
    });

    const validated = schema.parse(req.body);
    const { companyId, userId } = req.user;

    const announcement = await prisma.announcement.create({
      data: {
        companyId,
        title: validated.title,
        content: validated.content,
        type: validated.type,
        isPublished: validated.isPublished,
        publishedAt: validated.isPublished ? new Date() : null,
        createdBy: userId,
      },
    });

    res.status(201).json(announcement);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/admin/announcements/:id
 * お知らせを更新
 */
router.put('/announcements/:id', requireRole(['ADMIN', 'RAGUSTA', 'SYSTEM']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const schema = z.object({
      title: z.string().min(1).max(200).optional(),
      content: z.string().min(1).optional(),
      type: z.enum(['INFO', 'WARNING', 'URGENT']).optional(),
      isPublished: z.boolean().optional(),
    });

    const validated = schema.parse(req.body);

    // 公開状態が変更された場合、publishedAtを更新
    const updateData: any = { ...validated };
    if (validated.isPublished !== undefined) {
      updateData.publishedAt = validated.isPublished ? new Date() : null;
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: updateData,
    });

    res.json(announcement);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/admin/announcements/:id
 * お知らせを削除
 */
router.delete('/announcements/:id', requireRole(['ADMIN', 'RAGUSTA', 'SYSTEM']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.announcement.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/health-contents
 * 健康コンテンツを作成（ラグスタ向け）
 */
router.post('/health-contents', requireRole(['RAGUSTA', 'SYSTEM']), async (req: AuthRequest, res: Response) => {
  try {
    // TODO: Phase 3で実装
    res.status(501).json({ error: 'Not implemented yet' });
  } catch (error) {
    console.error('Create health content error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/admin/classes
 * 教室を作成（ラグスタ向け）
 */
router.post('/classes', requireRole(['RAGUSTA', 'SYSTEM']), async (req: AuthRequest, res: Response) => {
  try {
    // TODO: Phase 3で実装
    res.status(501).json({ error: 'Not implemented yet' });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
