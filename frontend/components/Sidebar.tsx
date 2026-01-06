'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  PlusCircleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  BookOpenIcon,
  HeartIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAdmin?: boolean;
}

const menuItems: MenuItem[] = [
  {
    name: 'ホーム',
    href: '/home',
    icon: HomeIcon,
  },
  {
    name: '体験談',
    href: '/experiences',
    icon: BookOpenIcon,
  },
  {
    name: '体験談を投稿',
    href: '/experiences/new',
    icon: PlusCircleIcon,
  },
  {
    name: '健康コンテンツ',
    href: '/contents',
    icon: HeartIcon,
  },
  {
    name: '教室',
    href: '/classes',
    icon: AcademicCapIcon,
  },
  {
    name: '統計',
    href: '/stats',
    icon: ChartBarIcon,
  },
  {
    name: 'マイページ',
    href: '/my',
    icon: UserCircleIcon,
  },
  {
    name: '管理画面',
    href: '/admin',
    icon: Cog6ToothIcon,
    requiresAdmin: true,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {/* ロゴ・ヘッダー */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500" />
          <span className="ml-3 text-xl font-bold text-gray-900">HealthConnect</span>
        </div>
      </div>

      {/* ナビゲーションメニュー */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Icon
                className={`
                  mr-3 h-5 w-5 flex-shrink-0 transition-colors
                  ${isActive ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-500'}
                `}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* ユーザー情報（フッター） */}
      <div className="border-t border-gray-200 p-4">
        <Link href="/my" className="flex items-center hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors">
          <UserCircleIcon className="h-8 w-8 text-gray-400" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">マイページ</p>
            <p className="text-xs text-gray-500">プロフィール・設定</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

