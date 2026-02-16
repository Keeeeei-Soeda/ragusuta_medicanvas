#!/bin/bash
# ログインスキップ機能のデプロイスクリプト
# シリアルコンソールで実行してください

set -e

echo "=========================================="
echo "ログインスキップ機能のデプロイ"
echo "=========================================="
echo ""

# 1. バックエンドの認証ミドルウェアを修正
echo "📝 1. バックエンドの認証ミドルウェアを修正中..."
cd /var/www/healthconnect/backend/src/middlewares

cat > auth.ts << 'EOF'
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
EOF

echo "✅ バックエンドの認証ミドルウェア修正完了"
echo ""

# 2. フロントエンドのAPIクライアントを修正（認証をスキップ）
echo "📝 2. フロントエンドのAPIクライアントを修正中..."
cd /var/www/healthconnect/frontend/lib

# api.tsのバックアップ
cp api.ts api.ts.backup

# リクエストインターセプターの部分だけ修正
sed -i '/^api.interceptors.request.use/,/^});$/c\
api.interceptors.request.use((config) => {\
  config.headers['\''x-dev-user-id'\''] = '\''dev-user-id'\'';\
  config.headers['\''x-dev-company-id'\''] = '\''dev-company-id'\'';\
  config.headers['\''x-dev-role'\''] = '\''EMPLOYEE'\'';\
  return config;\
});' api.ts

echo "✅ フロントエンドのAPIクライアント修正完了"
echo ""

# 3. ログインページを修正（自動リダイレクト）
echo "📝 3. ログインページを修正中..."
cd /var/www/healthconnect/frontend/app/\(auth\)/login

# page.tsxのバックアップ
cp page.tsx page.tsx.backup

# useEffectを追加してログインスキップ
sed -i "s/import { useState } from 'react'/import { useState, useEffect } from 'react'/" page.tsx
sed -i "/const \[loading, setLoading\] = useState(false)/a\\
\\
  // ログインをスキップしてホームにリダイレクト\\
  useEffect(() => {\\
    router.push('/home')\\
  }, [router])" page.tsx

echo "✅ ログインページ修正完了"
echo ""

# 4. フロントエンドを再ビルド
echo "📝 4. フロントエンドを再ビルド中..."
cd /var/www/healthconnect/frontend
npm run build

echo "✅ フロントエンドビルド完了"
echo ""

# 5. PM2で再起動
echo "📝 5. PM2で再起動中..."
cd /var/www/healthconnect
pm2 restart all

echo ""
echo "=========================================="
echo "✅ デプロイ完了！"
echo "=========================================="
echo ""
echo "ブラウザで http://162.43.8.168:3000 にアクセスしてください"
echo "ログインページが自動的にホーム画面にリダイレクトされます"
echo ""
echo "PM2ステータス："
pm2 status



