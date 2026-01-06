import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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
  // 開発モード: 認証をスキップ（x-dev-user-idヘッダーがある場合）
  if (process.env.NODE_ENV === 'development' && req.headers['x-dev-user-id']) {
    req.user = {
      userId: req.headers['x-dev-user-id'] as string,
      companyId: req.headers['x-dev-company-id'] as string || 'default-company-id',
      role: req.headers['x-dev-role'] as string || 'EMPLOYEE',
    };
    return next();
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

