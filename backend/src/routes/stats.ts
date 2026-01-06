import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middlewares/auth';
import { prisma } from '../index';

const router = Router();

/**
 * GET /api/stats/personal
 * 個人統計を取得
 */
router.get('/personal', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { period = 'month' } = req.query;
    const { userId, companyId } = req.user;

    // 期間の開始日を取得
    const { startDate, prevStartDate } = getDateRange(period as string);

    // 今月の閲覧数
    const viewCount = await prisma.activityLog.count({
      where: {
        userId,
        action: 'VIEW_EXPERIENCE',
        createdAt: { gte: startDate },
      },
    });

    // 先月の閲覧数
    const prevViewCount = await prisma.activityLog.count({
      where: {
        userId,
        action: 'VIEW_EXPERIENCE',
        createdAt: {
          gte: prevStartDate,
          lt: startDate,
        },
      },
    });

    // 今月の投稿数
    const postCount = await prisma.experience.count({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
    });

    // 先月の投稿数
    const prevPostCount = await prisma.experience.count({
      where: {
        userId,
        createdAt: {
          gte: prevStartDate,
          lt: startDate,
        },
      },
    });

    // もらった「参考になった」数
    const helpfulReceived = await prisma.reaction.count({
      where: {
        experience: { userId },
        type: 'HELPFUL',
        createdAt: { gte: startDate },
      },
    });

    // 押した「参考になった」数
    const helpfulGiven = await prisma.reaction.count({
      where: {
        userId,
        type: 'HELPFUL',
        createdAt: { gte: startDate },
      },
    });

    // 累計統計
    const totalViews = await prisma.activityLog.count({
      where: {
        userId,
        action: 'VIEW_EXPERIENCE',
      },
    });

    const totalPosts = await prisma.experience.count({
      where: { userId },
    });

    const totalHelpfulReceived = await prisma.reaction.count({
      where: {
        experience: { userId },
        type: 'HELPFUL',
      },
    });

    // 社内ランキング
    const ranking = await calculateRanking(userId, companyId, startDate);

    res.json({
      period,
      current: {
        viewCount,
        postCount,
        helpfulReceived,
        helpfulGiven,
      },
      comparison: {
        viewCountDiff: viewCount - prevViewCount,
        viewCountPercent: calculatePercent(viewCount, prevViewCount),
        postCountDiff: postCount - prevPostCount,
      },
      total: {
        viewCount: totalViews,
        postCount: totalPosts,
        helpfulReceived: totalHelpfulReceived,
      },
      ranking,
    });
  } catch (error) {
    console.error('Get personal stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/stats/departments
 * 部署別統計を取得
 */
router.get('/departments', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { period = 'month' } = req.query;
    const { companyId, userId } = req.user;

    const { startDate } = getDateRange(period as string);

    // ユーザーの部署を取得
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { departmentId: true },
    });

    // 全部署を取得
    const departments = await prisma.department.findMany({
      where: { companyId, isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    // 部署別統計を計算
    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        // 部署のユーザー数
        const userCount = await prisma.user.count({
          where: { departmentId: dept.id, isActive: true },
        });

        // 部署の閲覧数
        const viewCount = await prisma.activityLog.count({
          where: {
            user: { departmentId: dept.id },
            action: 'VIEW_EXPERIENCE',
            createdAt: { gte: startDate },
          },
        });

        // 部署の投稿数
        const postCount = await prisma.experience.count({
          where: {
            user: { departmentId: dept.id },
            createdAt: { gte: startDate },
          },
        });

        // 最も関心の高いカテゴリを取得
        const topCategory = await getTopCategoryByDepartment(dept.id, startDate);

        // 投稿が活発な時間帯を取得
        const activeHours = await getActiveHours(dept.id, startDate);

        return {
          departmentId: dept.id,
          departmentName: dept.name,
          userCount,
          viewCount,
          postCount,
          avgViewsPerUser: userCount > 0 ? (viewCount / userCount).toFixed(1) : '0',
          topCategory,
          activeHours,
          isMyDepartment: dept.id === currentUser?.departmentId,
        };
      })
    );

    // 閲覧数順にソート
    const byViewCount = [...departmentStats].sort((a, b) => b.viewCount - a.viewCount);

    // 投稿数順にソート
    const byPostCount = [...departmentStats].sort((a, b) => b.postCount - a.postCount);

    res.json({
      byViewCount,
      byPostCount,
    });
  } catch (error) {
    console.error('Get department stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/stats/comparison
 * 会社間比較を取得
 */
router.get('/comparison', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // TODO: Phase 2 Week 11-12で実装
    res.status(501).json({ error: 'Not implemented yet' });
  } catch (error) {
    console.error('Get company comparison error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * ヘルパー関数: 期間の開始日を取得
 */
function getDateRange(period: string) {
  const now = new Date();
  let startDate: Date;
  let prevStartDate: Date;

  switch (period) {
    case 'week':
      // 今週（月曜日から）
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay() + 1);
      startDate.setHours(0, 0, 0, 0);

      // 先週
      prevStartDate = new Date(startDate);
      prevStartDate.setDate(startDate.getDate() - 7);
      break;

    case 'quarter':
      // 今四半期
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);

      // 前四半期
      prevStartDate = new Date(startDate);
      prevStartDate.setMonth(startDate.getMonth() - 3);
      break;

    case 'year':
      // 今年
      startDate = new Date(now.getFullYear(), 0, 1);

      // 去年
      prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
      break;

    case 'month':
    default:
      // 今月
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);

      // 先月
      prevStartDate = new Date(startDate);
      prevStartDate.setMonth(startDate.getMonth() - 1);
      break;
  }

  return { startDate, prevStartDate };
}

/**
 * ヘルパー関数: パーセント計算
 */
function calculatePercent(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * ヘルパー関数: ランキング計算
 */
async function calculateRanking(userId: string, companyId: string, startDate: Date) {
  // 閲覧数ランキング
  const allUsers = await prisma.user.findMany({
    where: { companyId, isActive: true },
    select: { id: true },
  });

  const viewCounts = await Promise.all(
    allUsers.map(async (user) => ({
      userId: user.id,
      count: await prisma.activityLog.count({
        where: {
          userId: user.id,
          action: 'VIEW_EXPERIENCE',
          createdAt: { gte: startDate },
        },
      }),
    }))
  );

  const sortedByViews = viewCounts.sort((a, b) => b.count - a.count);
  const viewRank = sortedByViews.findIndex((u) => u.userId === userId) + 1;

  // 投稿数ランキング
  const postCounts = await Promise.all(
    allUsers.map(async (user) => ({
      userId: user.id,
      count: await prisma.experience.count({
        where: {
          userId: user.id,
          createdAt: { gte: startDate },
        },
      }),
    }))
  );

  const sortedByPosts = postCounts.sort((a, b) => b.count - a.count);
  const postRank = sortedByPosts.findIndex((u) => u.userId === userId) + 1;

  return {
    viewRank: viewRank || null,
    postRank: postRank || null,
    totalUsers: allUsers.length,
  };
}

/**
 * ヘルパー関数: 部署の最も関心の高いカテゴリを取得
 */
async function getTopCategoryByDepartment(departmentId: string, startDate: Date) {
  // 部署のユーザーが閲覧した体験談のカテゴリを集計
  const activities = await prisma.activityLog.findMany({
    where: {
      user: { departmentId },
      action: 'VIEW_EXPERIENCE',
      createdAt: { gte: startDate },
    },
    select: {
      targetId: true,
    },
  });

  if (activities.length === 0) {
    return { category: null, percentage: 0 };
  }

  // 体験談のカテゴリを取得
  const experienceIds = activities.map((a) => a.targetId).filter((id): id is string => id !== null);
  const experiences = await prisma.experience.findMany({
    where: { id: { in: experienceIds } },
    select: { category: true },
  });

  // カテゴリ別に集計
  const categoryCount: Record<string, number> = {};
  experiences.forEach((exp) => {
    categoryCount[exp.category] = (categoryCount[exp.category] || 0) + 1;
  });

  // 最も多いカテゴリを取得
  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];

  if (!topCategory) {
    return { category: null, percentage: 0 };
  }

  return {
    category: topCategory[0],
    percentage: Math.round((topCategory[1] / experiences.length) * 100),
  };
}

/**
 * ヘルパー関数: 投稿が活発な時間帯を取得
 */
async function getActiveHours(departmentId: string, startDate: Date) {
  const posts = await prisma.experience.findMany({
    where: {
      user: { departmentId },
      createdAt: { gte: startDate },
    },
    select: {
      createdAt: true,
    },
  });

  if (posts.length === 0) {
    return null;
  }

  // 時間帯別に集計
  const hourCount: Record<number, number> = {};
  posts.forEach((post) => {
    const hour = post.createdAt.getHours();
    hourCount[hour] = (hourCount[hour] || 0) + 1;
  });

  // 最も多い時間帯を取得
  const topHour = Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0];

  if (!topHour) {
    return null;
  }

  const hour = parseInt(topHour[0]);
  return `${hour.toString().padStart(2, '0')}:00-${(hour + 1).toString().padStart(2, '0')}:00`;
}

export default router;
