import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    companyId: string;
    role: string;
  };
}

/**
 * JWT認証ミドルウェア
 */
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  // 認証をスキップ（x-dev-user-idヘッダーがある場合）
  // 本番環境でも一時的に有効化
  if (req.headers['x-dev-user-id']) {
    // データベースから最初のユーザーを取得して設定
    prisma.user.findFirst({
      orderBy: { createdAt: 'asc' }
    }).then(user => {
      if (user) {
        req.user = {
          userId: user.id,
          companyId: user.companyId,
          role: user.role,
        };
      } else {
        // ユーザーが見つからない場合、ヘッダーの値を使用
        req.user = {
          userId: req.headers['x-dev-user-id'] as string,
          companyId: req.headers['x-dev-company-id'] as string || 'default-company-id',
          role: req.headers['x-dev-role'] as string || 'EMPLOYEE',
        };
      }
      next();
    }).catch((err) => {
      console.error('Error fetching user for dev auth:', err);
      // エラー時もヘッダーの値を使用
      req.user = {
        userId: req.headers['x-dev-user-id'] as string,
        companyId: req.headers['x-dev-company-id'] as string || 'default-company-id',
        role: req.headers['x-dev-role'] as string || 'EMPLOYEE',
      };
      next();
    });
    return;
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Token required' });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }

    if (decoded && typeof decoded === 'object') {
      req.user = {
        userId: decoded.userId as string,
        companyId: decoded.companyId as string,
        role: decoded.role as string,
      };
    }

    next();
  });
}

/**
 * ロールベースアクセス制御
 */
export function requireRole(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
}

/**
 * 会社IDによるデータ分離チェック
 */
export function requireSameCompany(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // システム管理者とラグスタは全社データにアクセス可能
  if (req.user.role === 'SYSTEM' || req.user.role === 'RAGUSTA') {
    return next();
  }

  // リクエストパラメータやボディから会社IDを取得
  const requestedCompanyId = req.params.companyId || req.body.companyId;

  if (requestedCompanyId && requestedCompanyId !== req.user.companyId) {
    return res.status(403).json({ 
      error: 'Access denied: Different company' 
    });
  }

  next();
}

