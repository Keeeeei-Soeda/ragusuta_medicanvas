import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middlewares/auth';
import { prisma } from '../index';
import { z } from 'zod';

const router = Router();

// バリデーションスキーマ
const createExperienceSchema = z.object({
  category: z.string().min(1, 'カテゴリは必須です'),
  subcategory: z.string().optional(),
  targetPerson: z.enum(['SELF', 'CHILD', 'SPOUSE', 'PARENT']),
  title: z.string().min(1, 'タイトルは必須です').max(200, 'タイトルは200文字以内である必要があります'),
  content: z.string().min(10, '本文は10文字以上である必要があります').max(10000, '本文は10000文字以内である必要があります'),
  tags: z.array(z.string()).optional(),
  isAnonymous: z.boolean().default(false),
});

/**
 * GET /api/experiences
 * 体験談一覧を取得
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { category, search, limit = '20', offset = '0' } = req.query;

    const where: any = {
      status: 'PUBLISHED',
      isPublic: true,
    };

    // カテゴリフィルター
    if (category && typeof category === 'string') {
      where.category = category;
    }

    // キーワード検索
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [experiences, total] = await Promise.all([
      prisma.experience.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              jobType: true,
              birthDate: true,
              gender: true,
            },
          },
          reactions: {
            select: {
              type: true,
              userId: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      }),
      prisma.experience.count({ where }),
    ]);

    // 匿名化処理
    const maskedExperiences = experiences.map((exp) => {
      const age = calculateAge(exp.user.birthDate);
      return {
        ...exp,
        user: exp.isAnonymous
          ? {
              id: exp.user.id,
              name: '匿名ユーザー',
              jobType: exp.user.jobType,
              age,
              gender: exp.user.gender,
            }
          : {
              id: exp.user.id,
              name: exp.user.name,
              jobType: exp.user.jobType,
              age,
              gender: exp.user.gender,
            },
        reactions: exp.reactions.map((r) => ({
          type: r.type,
          isMyReaction: r.userId === req.user?.userId,
        })),
      };
    });

    res.json({
      experiences: maskedExperiences,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error('Get experiences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/experiences/matched
 * マッチングされた体験談を取得
 * TODO: Phase 2で実装
 */
router.get('/matched', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Phase 2で実装予定
    res.json({
      forYou: [],
      forChildren: [],
      forSpouse: [],
      forParents: [],
      ageTrends: [],
    });
  } catch (error) {
    console.error('Get matched experiences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/experiences/:id
 * 体験談詳細を取得
 */
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const experience = await prisma.experience.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            jobType: true,
            birthDate: true,
            gender: true,
          },
        },
        reactions: {
          select: {
            type: true,
            userId: true,
          },
        },
      },
    });

    if (!experience) {
      return res.status(404).json({ error: '体験談が見つかりません' });
    }

    // 閲覧数をインクリメント
    await prisma.experience.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    // ActivityLogに記録
    if (req.user) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.userId,
          action: 'VIEW_EXPERIENCE',
          targetId: id,
          metadata: {
            category: experience.category,
          },
        },
      });
    }

    // 匿名化処理
    const age = calculateAge(experience.user.birthDate);
    const maskedExperience = {
      ...experience,
      user: experience.isAnonymous
        ? {
            id: experience.user.id,
            name: '匿名ユーザー',
            jobType: experience.user.jobType,
            age,
            gender: experience.user.gender,
          }
        : {
            id: experience.user.id,
            name: experience.user.name,
            jobType: experience.user.jobType,
            age,
            gender: experience.user.gender,
          },
      reactions: experience.reactions.map((r) => ({
        type: r.type,
        isMyReaction: r.userId === req.user?.userId,
      })),
    };

    res.json(maskedExperience);
  } catch (error) {
    console.error('Get experience error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/experiences
 * 体験談を投稿
 */
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // バリデーション
    const validated = createExperienceSchema.parse(req.body);

    // 体験談を作成
    const experience = await prisma.experience.create({
      data: {
        userId: req.user.userId,
        category: validated.category,
        subcategory: validated.subcategory,
        targetPerson: validated.targetPerson,
        title: validated.title,
        content: validated.content,
        tags: validated.tags || [],
        isAnonymous: validated.isAnonymous,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            jobType: true,
            birthDate: true,
            gender: true,
          },
        },
      },
    });

    // ActivityLogに記録
    await prisma.activityLog.create({
      data: {
        userId: req.user.userId,
        action: 'POST_EXPERIENCE',
        targetId: experience.id,
        metadata: {
          category: experience.category,
        },
      },
    });

    res.status(201).json(experience);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    console.error('Post experience error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/experiences/:id/helpful
 * 「参考になった」を押す
 */
router.post('/:id/helpful', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    // 体験談が存在するか確認
    const experience = await prisma.experience.findUnique({
      where: { id },
    });

    if (!experience) {
      return res.status(404).json({ error: '体験談が見つかりません' });
    }

    // 既に「参考になった」を押しているか確認
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        experienceId_userId_type: {
          experienceId: id,
          userId: req.user.userId,
          type: 'HELPFUL',
        },
      },
    });

    if (existingReaction) {
      // 既に押している場合は取り消し
      await prisma.reaction.delete({
        where: {
          id: existingReaction.id,
        },
      });

      // 体験談のhelpfulCountをデクリメント
      await prisma.experience.update({
        where: { id },
        data: { helpfulCount: { decrement: 1 } },
      });

      return res.json({ success: true, action: 'removed' });
    } else {
      // 新規に「参考になった」を作成
      await prisma.reaction.create({
        data: {
          experienceId: id,
          userId: req.user.userId,
          type: 'HELPFUL',
        },
      });

      // 体験談のhelpfulCountをインクリメント
      await prisma.experience.update({
        where: { id },
        data: { helpfulCount: { increment: 1 } },
      });

      // ActivityLogに記録
      await prisma.activityLog.create({
        data: {
          userId: req.user.userId,
          action: 'HELPFUL',
          targetId: id,
        },
      });

      return res.json({ success: true, action: 'added' });
    }
  } catch (error) {
    console.error('Helpful error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 年齢計算ヘルパー関数
 */
function calculateAge(birthDate: Date): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default router;
