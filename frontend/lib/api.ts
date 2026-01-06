import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Axiosインスタンスを作成
export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター: トークンを自動付与
api.interceptors.request.use((config) => {
  // 開発モード: 認証をスキップ
  if (process.env.NODE_ENV === 'development') {
    config.headers['x-dev-user-id'] = 'dev-user-id';
    config.headers['x-dev-company-id'] = 'dev-company-id';
    config.headers['x-dev-role'] = 'EMPLOYEE';
    return config;
  }
  
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
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
  getAll: async (params?: { category?: string; search?: string; limit?: number; offset?: number }) => {
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
  // 部署管理
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
  // ユーザー管理
  getUsers: async (params?: { departmentId?: string; isActive?: boolean; search?: string; limit?: number; offset?: number }) => {
    return api.get('/admin/users', { params });
  },
  updateUser: async (id: string, data: { isActive?: boolean; role?: string; departmentId?: string }) => {
    return api.put(`/admin/users/${id}`, data);
  },
  // お知らせ管理
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
  // 管理者・ラグスタ向け
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

