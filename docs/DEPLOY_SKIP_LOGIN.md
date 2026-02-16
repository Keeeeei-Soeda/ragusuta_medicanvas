# 🔓 ログインスキップ機能のデプロイ手順

## 📋 シリアルコンソールで実行するコマンド

シリアルコンソールでサーバーに接続し、以下を順番に実行してください。

### 1. バックエンドの認証ミドルウェアを修正

```bash
cd /var/www/healthconnect/backend/src/middlewares
cat > auth.ts << 'AUTH_EOF'
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
AUTH_EOF
```

### 2. フロントエンドのAPIクライアントを修正

```bash
cd /var/www/healthconnect/frontend/lib
cat > api.ts << 'API_EOF'
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// Axiosインスタンスを作成
export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター: トークンを自動付与
api.interceptors.request.use((config) => {
  // 常に認証をスキップ（開発ヘッダーを送信）
  config.headers['x-dev-user-id'] = 'dev-user-id';
  config.headers['x-dev-company-id'] = 'dev-company-id';
  config.headers['x-dev-role'] = 'EMPLOYEE';
  return config;
});

// レスポンスインターセプター: エラーハンドリング
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 認証エラーの場合、トークンを削除してログイン画面へ
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API関数
export const authApi = {
  login: async (data: { companyCode: string; employeeNumber: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  register: async (data: {
    companyCode: string;
    employeeNumber: string;
    name: string;
    birthDate: string;
    gender: string;
    departmentId: string;
    jobType?: string;
    password: string;
  }) => {
    const response = await api.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  registerProfile: async (data: {
    hasChildren: boolean;
    childrenAges?: number[];
    isMarried: boolean;
    interestedCategories?: string[];
  }) => {
    return api.post('/auth/register-profile', data);
  },
  getMe: async () => {
    return api.get('/auth/me');
  },
};

export const experienceApi = {
  getAll: async (params?: { category?: string; search?: string; age?: number; gender?: string; limit?: number; offset?: number }) => {
    return api.get('/experiences', { params });
  },
  getMatched: async () => {
    return api.get('/experiences/matched');
  },
  getById: async (id: string) => {
    return api.get(`/experiences/${id}`);
  },
  create: async (data: {
    category: string;
    subcategory?: string;
    targetPerson: string;
    title: string;
    content: string;
    tags?: string[];
    isAnonymous: boolean;
  }) => {
    return api.post('/experiences', data);
  },
  helpful: async (id: string) => {
    return api.post(`/experiences/${id}/helpful`);
  },
};

export const statsApi = {
  getPersonal: async (period?: string) => {
    return api.get('/stats/personal', { params: { period } });
  },
  getDepartments: async (period?: string) => {
    return api.get('/stats/departments', { params: { period } });
  },
  getComparison: async (period?: string) => {
    return api.get('/stats/comparison', { params: { period } });
  },
};

export const adminApi = {
  getDashboard: async () => {
    return api.get('/admin/dashboard');
  },
  getDepartments: async (companyId?: string) => {
    return api.get('/admin/departments', { params: { companyId } });
  },
  createDepartment: async (data: { name: string; displayOrder?: number }) => {
    return api.post('/admin/departments', data);
  },
  updateDepartment: async (id: string, data: { name?: string; displayOrder?: number; isActive?: boolean }) => {
    return api.put(`/admin/departments/${id}`, data);
  },
  deleteDepartment: async (id: string) => {
    return api.delete(`/admin/departments/${id}`);
  },
  getUsers: async (params?: { departmentId?: string; isActive?: boolean; search?: string; limit?: number; offset?: number }) => {
    return api.get('/admin/users', { params });
  },
  updateUser: async (id: string, data: { isActive?: boolean; role?: string; departmentId?: string }) => {
    return api.put(`/admin/users/${id}`, data);
  },
  getExperiences: async (params?: { search?: string; category?: string; status?: string; limit?: number; offset?: number }) => {
    return api.get('/admin/experiences', { params });
  },
  updateExperienceStatus: async (id: string, status: string) => {
    return api.put(`/admin/experiences/${id}/status`, { status });
  },
  deleteExperience: async (id: string) => {
    return api.delete(`/admin/experiences/${id}`);
  },
  exportExperiences: async () => {
    return api.get('/admin/experiences/export');
  },
  getAnnouncements: async (companyId?: string) => {
    return api.get('/admin/announcements', { params: { companyId } });
  },
  createAnnouncement: async (data: { title: string; content: string; type?: string; isPublished?: boolean }) => {
    return api.post('/admin/announcements', data);
  },
  updateAnnouncement: async (id: string, data: { title?: string; content?: string; type?: string; isPublished?: boolean }) => {
    return api.put(`/admin/announcements/${id}`, data);
  },
  deleteAnnouncement: async (id: string) => {
    return api.delete(`/admin/announcements/${id}`);
  },
};

export const contentsApi = {
  getAll: async (params?: { category?: string; type?: string; limit?: number; offset?: number; search?: string }) => {
    return api.get('/health-contents', { params });
  },
  getById: async (id: string) => {
    return api.get(`/health-contents/${id}`);
  },
  recordView: async (id: string) => {
    return api.post(`/health-contents/${id}/view`);
  },
  getHistory: async () => {
    return api.get('/health-contents/user/history');
  },
  create: async (data: any) => {
    return api.post('/health-contents', data);
  },
  update: async (id: string, data: any) => {
    return api.put(`/health-contents/${id}`, data);
  },
  delete: async (id: string) => {
    return api.delete(`/health-contents/${id}`);
  },
};

export const announcementsApi = {
  getAll: async () => {
    return api.get('/announcements');
  },
  getById: async (id: string) => {
    return api.get(`/announcements/${id}`);
  },
  markAsRead: async (id: string) => {
    return api.post(`/announcements/${id}/read`);
  },
};

export const classesApi = {
  getAll: async () => {
    return api.get('/classes');
  },
  getById: async (id: string) => {
    return api.get(`/classes/${id}`);
  },
  reserve: async (id: string) => {
    return api.post(`/classes/${id}/reserve`);
  },
};
API_EOF
```

### 3. ログインページを修正（自動リダイレクト）

```bash
cd /var/www/healthconnect/frontend/app/\(auth\)/login
cat > page.tsx << 'LOGIN_EOF'
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    companyCode: '',
    employeeNumber: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // ログインをスキップしてホームにリダイレクト
  useEffect(() => {
    router.push('/home')
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authApi.login(formData)
      
      if (response.isFirstLogin) {
        router.push('/register-profile')
      } else {
        router.push('/home')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'ログインに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            HealthConnect
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            法人向け健康プラットフォーム
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="companyCode" className="block text-sm font-medium text-gray-700">
                法人コード
              </label>
              <input
                id="companyCode"
                name="companyCode"
                type="text"
                required
                maxLength={8}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={formData.companyCode}
                onChange={(e) => setFormData({ ...formData, companyCode: e.target.value.toUpperCase() })}
                placeholder="TEST0001"
              />
            </div>
            <div>
              <label htmlFor="employeeNumber" className="block text-sm font-medium text-gray-700">
                社員番号
              </label>
              <input
                id="employeeNumber"
                name="employeeNumber"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={formData.employeeNumber}
                onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value.toUpperCase() })}
                placeholder="EMP001"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </div>

          <div className="text-center">
            <a href="/register" className="text-sm text-primary-600 hover:text-primary-500">
              初回の方はこちら
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
LOGIN_EOF
```

### 4. フロントエンドを再ビルド

```bash
cd /var/www/healthconnect/frontend
npm run build
```

### 5. PM2で再起動

```bash
cd /var/www/healthconnect
pm2 restart all
pm2 logs
```

## ✅ 確認

ブラウザで以下にアクセス：
- http://162.43.8.168:3000

ログインページが自動的にホーム画面にリダイレクトされ、認証なしでアクセスできるようになります。



