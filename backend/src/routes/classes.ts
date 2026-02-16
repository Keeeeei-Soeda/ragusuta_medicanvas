import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middlewares/auth';
import { prisma } from '../index';

const router = Router();

/**
 * GET /api/classes
 * 教室一覧を取得（Mock）
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Mockデータを返す（実際のデータベースから取得する場合は以下をコメントアウト）
    const mockClasses = [
      {
        id: '1',
        title: 'オフィスストレッチ教室',
        description: 'デスクワークで凝り固まった体をほぐすストレッチ教室です。',
        date: '2026-01-15',
        time: '18:00-19:00',
        startTime: '18:00',
        endTime: '19:00',
        location: 'オンライン',
        onlineUrl: 'https://example.com/meeting/1',
        capacity: 20,
        reserved: 12,
        instructor: 'ラグスタトレーナー',
        category: 'PHYSICAL',
        type: 'ONLINE',
        status: 'SCHEDULED',
      },
      {
        id: '2',
        title: 'マインドフルネス瞑想教室',
        description: 'ストレス軽減に効果的な瞑想の方法を学びます。',
        date: '2026-01-20',
        time: '19:00-20:00',
        startTime: '19:00',
        endTime: '20:00',
        location: 'オンライン',
        onlineUrl: 'https://example.com/meeting/2',
        capacity: 15,
        reserved: 8,
        instructor: 'ラグスタトレーナー',
        category: 'MENTAL',
        type: 'ONLINE',
        status: 'SCHEDULED',
      },
      {
        id: '3',
        title: '親子で楽しむ運動教室',
        description: '家族で楽しみながら体を動かせる運動教室です。',
        date: '2026-01-25',
        time: '10:00-11:00',
        startTime: '10:00',
        endTime: '11:00',
        location: 'オンライン',
        onlineUrl: 'https://example.com/meeting/3',
        capacity: 10,
        reserved: 5,
        instructor: 'ラグスタトレーナー',
        category: 'FAMILY',
        type: 'ONLINE',
        status: 'SCHEDULED',
      },
    ];

    res.json(mockClasses);

    // 実際のデータベースから取得する場合（Phase 3で実装）
    /*
    const { companyId } = req.user;
    const classes = await prisma.class.findMany({
      where: {
        companyId,
        status: 'SCHEDULED',
        date: { gte: new Date() },
      },
      orderBy: {
        date: 'asc',
      },
    });

    res.json(classes);
    */
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/classes/:id
 * 教室詳細を取得（Mock）
 */
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Mockデータ
    const mockClasses: Record<string, any> = {
      '1': {
        id: '1',
        title: 'オフィスストレッチ教室',
        description: 'デスクワークで凝り固まった体をほぐすストレッチ教室です。',
        date: '2026-01-15',
        time: '18:00-19:00',
        startTime: '18:00',
        endTime: '19:00',
        location: 'オンライン',
        onlineUrl: 'https://example.com/meeting/1',
        capacity: 20,
        reserved: 12,
        instructor: 'ラグスタトレーナー',
        category: 'PHYSICAL',
        type: 'ONLINE',
        status: 'SCHEDULED',
      },
      '2': {
        id: '2',
        title: 'マインドフルネス瞑想教室',
        description: 'ストレス軽減に効果的な瞑想の方法を学びます。',
        date: '2026-01-20',
        time: '19:00-20:00',
        startTime: '19:00',
        endTime: '20:00',
        location: 'オンライン',
        onlineUrl: 'https://example.com/meeting/2',
        capacity: 15,
        reserved: 8,
        instructor: 'ラグスタトレーナー',
        category: 'MENTAL',
        type: 'ONLINE',
        status: 'SCHEDULED',
      },
      '3': {
        id: '3',
        title: '親子で楽しむ運動教室',
        description: '家族で楽しみながら体を動かせる運動教室です。',
        date: '2026-01-25',
        time: '10:00-11:00',
        startTime: '10:00',
        endTime: '11:00',
        location: 'オンライン',
        onlineUrl: 'https://example.com/meeting/3',
        capacity: 10,
        reserved: 5,
        instructor: 'ラグスタトレーナー',
        category: 'FAMILY',
        type: 'ONLINE',
        status: 'SCHEDULED',
      },
    };

    const classItem = mockClasses[id];

    if (!classItem) {
      return res.status(404).json({ error: '教室が見つかりません' });
    }

    res.json(classItem);
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/classes/:id/reserve
 * 教室を予約（Mock）
 */
router.post('/:id/reserve', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    // Mock予約処理
    // 実際の実装では、予約テーブルにレコードを作成する
    res.json({
      success: true,
      message: '予約が完了しました（Mock）',
      reservationId: `reservation-${id}-${Date.now()}`,
    });
  } catch (error) {
    console.error('Reserve class error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;






