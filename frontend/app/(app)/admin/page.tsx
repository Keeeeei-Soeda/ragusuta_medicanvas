'use client'

import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import Link from 'next/link'

export default function AdminPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const response = await adminApi.getDashboard()
      return response.data
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  return (
    <div>
      {/* ページヘッダー */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">管理者ダッシュボード</h2>
        <p className="text-gray-600">システム全体の管理と統計情報</p>
      </div>

      {/* クイックアクセス */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/departments"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-2">🏢 部署管理</h3>
          <p className="text-sm text-gray-600">部署の追加・編集・削除</p>
        </Link>
        <Link
          href="/admin/users"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-2">👥 ユーザー管理</h3>
          <p className="text-sm text-gray-600">ユーザー一覧・権限管理</p>
        </Link>
        <Link
          href="/admin/announcements"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-2">📢 お知らせ管理</h3>
          <p className="text-sm text-gray-600">お知らせの作成・配信</p>
        </Link>
      </div>

      {/* サマリー統計 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 全社統計</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">総ユーザー数</h3>
            <p className="text-3xl font-bold text-gray-900">{dashboard?.summary.totalUsers || 0}</p>
            <p className="text-sm text-gray-600 mt-2">
              アクティブ: {dashboard?.summary.activeUsers || 0}人
              ({dashboard?.summary.activationRate || 0}%)
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">体験談</h3>
            <p className="text-3xl font-bold text-gray-900">{dashboard?.summary.totalExperiences || 0}</p>
            <p className="text-sm text-gray-600 mt-2">
              今月: {dashboard?.summary.monthlyExperiences || 0}件
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">閲覧数</h3>
            <p className="text-3xl font-bold text-gray-900">{dashboard?.summary.totalViews || 0}</p>
            <p className="text-sm text-gray-600 mt-2">
              今月: {dashboard?.summary.monthlyViews || 0}件
            </p>
          </div>
        </div>
      </section>

      {/* カテゴリ別体験談 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📁 カテゴリ別体験談</h2>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-3">
            {dashboard?.experiencesByCategory.map((item: any) => (
              <div key={item.category} className="flex items-center justify-between">
                <span className="text-gray-700">{item.category}</span>
                <span className="text-lg font-bold text-gray-900">{item.count}件</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 部署別統計 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🏢 部署別統計（今月）</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  部署名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ユーザー数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  今月の投稿数
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboard?.departmentStats.map((dept: any) => (
                <tr key={dept.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {dept.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dept.userCount}人
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dept.experienceCount}件
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
