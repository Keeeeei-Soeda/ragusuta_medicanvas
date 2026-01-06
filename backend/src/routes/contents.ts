import { Router, Response } from 'express';
import { authenticateToken, requireRole, AuthRequest } from '../middlewares/auth';
import { prisma } from '../index';
import { z } from 'zod';

const router = Router();

// バリデーションスキーマ
const createContentSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(200),
  description: z.string(),
  type: z.enum(['VIDEO', 'ARTICLE', 'PDF']),
  category: z.string().min(1, 'カテゴリは必須です'),
  contentUrl: z.string().min(1, 'コンテンツURLは必須です'),
  thumbnailUrl: z.string().optional(),
  duration: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(true),
});

const updateContentSchema = createContentSchema.partial();

/**
 * GET /api/health-contents
 * 健康コンテンツ一覧を取得
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { category, type, limit = '20', offset = '0', search } = req.query;

    const where: any = {
      isPublic: true,
    };

    // カテゴリフィルター
    if (category && typeof category === 'string') {
      where.category = category;
    }

    // コンテンツタイプフィルター
    if (type && typeof type === 'string') {
      where.type = type;
    }

    // キーワード検索
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [contents, total] = await Promise.all([
      prisma.healthContent.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      }),
      prisma.healthContent.count({ where }),
    ]);

    res.json({
      contents,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error('Get health contents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/health-contents/:id
 * 健康コンテンツ詳細を取得
 */
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const content = await prisma.healthContent.findUnique({
      where: { id },
    });

    if (!content) {
      return res.status(404).json({ error: 'コンテンツが見つかりません' });
    }

    // 閲覧数をインクリメント
    await prisma.healthContent.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    res.json(content);
  } catch (error) {
    console.error('Get health content error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/health-contents/:id/view
 * 健康コンテンツの閲覧を記録
 */
router.post('/:id/view', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    // コンテンツが存在するか確認
    const content = await prisma.healthContent.findUnique({
      where: { id },
    });

    if (!content) {
      return res.status(404).json({ error: 'コンテンツが見つかりません' });
    }

    // 視聴履歴を記録
    await prisma.contentViewLog.create({
      data: {
        userId: req.user.userId,
        contentId: id,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Record content view error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/health-contents/user/history
 * ユーザーの視聴履歴を取得
 */
router.get('/user/history', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const history = await prisma.contentViewLog.findMany({
      where: {
        userId: req.user.userId,
      },
      include: {
        content: true,
      },
      orderBy: {
        viewedAt: 'desc',
      },
      take: 50,
    });

    res.json(history);
  } catch (error) {
    console.error('Get content history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/health-contents
 * 健康コンテンツを作成（ラグスタ・管理者向け）
 */
router.post('/', authenticateToken, requireRole(['RAGUSTA', 'SYSTEM']), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validated = createContentSchema.parse(req.body);

    const content = await prisma.healthContent.create({
      data: {
        ...validated,
        tags: validated.tags || [],
        publishedAt: validated.isPublic ? new Date() : null,
      },
    });

    res.status(201).json(content);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    console.error('Create health content error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/health-contents/:id
 * 健康コンテンツを更新（ラグスタ・管理者向け）
 */
router.put('/:id', authenticateToken, requireRole(['RAGUSTA', 'SYSTEM']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validated = updateContentSchema.parse(req.body);

    const updateData: any = { ...validated };
    if (validated.isPublic !== undefined) {
      updateData.publishedAt = validated.isPublic ? new Date() : null;
    }

    const content = await prisma.healthContent.update({
      where: { id },
      data: updateData,
    });

    res.json(content);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    console.error('Update health content error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/health-contents/:id
 * 健康コンテンツを削除（ラグスタ・管理者向け）
 */
router.delete('/:id', authenticateToken, requireRole(['RAGUSTA', 'SYSTEM']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.healthContent.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete health content error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
