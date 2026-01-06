import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middlewares/auth';
import { prisma } from '../index';

const router = Router();

/**
 * GET /api/announcements
 * ユーザー向けお知らせ一覧を取得（公開されているもののみ）
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { companyId } = req.user;

    // 公開されているお知らせのみ取得
    const announcements = await prisma.announcement.findMany({
      where: {
        companyId,
        isPublished: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(announcements);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/announcements/:id
 * お知らせ詳細を取得
 */
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { companyId } = req.user;

    const announcement = await prisma.announcement.findFirst({
      where: {
        id,
        companyId,
        isPublished: true,
      },
    });

    if (!announcement) {
      return res.status(404).json({ error: 'お知らせが見つかりません' });
    }

    res.json(announcement);
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/announcements/:id/read
 * お知らせを既読にする（Mock - 実際の実装ではNotificationテーブルを使用）
 */
router.post('/:id/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Mock実装 - 実際の実装ではNotificationテーブルに既読フラグを設定
    res.json({ success: true, message: '既読にしました' });
  } catch (error) {
    console.error('Mark announcement as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

