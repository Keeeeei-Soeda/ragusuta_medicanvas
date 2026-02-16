'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { useState } from 'react'
import Link from 'next/link'

export default function AdminExperiencesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'experiences', search, category, status],
    queryFn: async () => {
      const response = await adminApi.getExperiences({ search, category, status })
      return response.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteExperience(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'experiences'] })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateExperienceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'experiences'] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">エラーが発生しました</p>
      </div>
    )
  }

  return (
    <div>
      {/* ページヘッダー */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">体験談管理</h2>
            <p className="text-gray-600">全 {data?.total || 0} 件の体験談</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={async () => {
                try {
                  const response = await adminApi.exportExperiences()
                  const data = response.data
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `experiences_export_${new Date().toISOString().split('T')[0]}.json`
                  document.body.appendChild(a)
                  a.click()
                  window.URL.revokeObjectURL(url)
                  document.body.removeChild(a)
                } catch (error) {
                  console.error('Export error:', error)
                  alert('エクスポートに失敗しました')
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
            >
              📥 JSONエクスポート
            </button>
            <Link
              href="/admin"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              ← ダッシュボードに戻る
            </Link>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                キーワード検索
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="タイトル・本文で検索"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリ
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">すべて</option>
                <option value="PHYSICAL">PHYSICAL</option>
                <option value="MENTAL">MENTAL</option>
                <option value="FAMILY">FAMILY</option>
                <option value="LIFESTYLE">LIFESTYLE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">すべて</option>
                <option value="PUBLISHED">公開中</option>
                <option value="DRAFT">下書き</option>
                <option value="ARCHIVED">アーカイブ</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 体験談一覧テーブル */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                タイトル
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                カテゴリ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                投稿者
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                閲覧数
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                作成日
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.experiences?.map((experience: any) => (
              <tr key={experience.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                  {experience.id.substring(0, 8)}...
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 line-clamp-1">
                    {experience.title}
                  </div>
                  <div className="text-xs text-gray-500 line-clamp-1 mt-1">
                    {experience.content.substring(0, 50)}...
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                    {experience.category}
                  </span>
                  {experience.subcategory && (
                    <div className="text-xs text-gray-500 mt-1">{experience.subcategory}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {experience.isAnonymous ? (
                    <span className="text-gray-400">匿名</span>
                  ) : (
                    <div>
                      <div>{experience.user.name}</div>
                      <div className="text-xs text-gray-500">
                        {experience.user.age}歳 {experience.user.gender === 'MALE' ? '男性' : '女性'}
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>👁 {experience.viewCount}</div>
                  <div className="text-xs text-gray-500">👍 {experience.helpfulCount}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={experience.status}
                    onChange={(e) =>
                      updateStatusMutation.mutate({ id: experience.id, status: e.target.value })
                    }
                    className={`text-xs px-2 py-1 rounded-full border ${
                      experience.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : experience.status === 'DRAFT'
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                    }`}
                  >
                    <option value="PUBLISHED">公開中</option>
                    <option value="DRAFT">下書き</option>
                    <option value="ARCHIVED">アーカイブ</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(experience.createdAt).toLocaleDateString('ja-JP')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <Link
                      href={`/experiences/${experience.id}`}
                      target="_blank"
                      className="text-purple-600 hover:text-purple-900"
                    >
                      閲覧
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('本当に削除しますか？')) {
                          deleteMutation.mutate(experience.id)
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      削除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(!data?.experiences || data.experiences.length === 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">体験談が見つかりません</p>
        </div>
      )}
    </div>
  )
}

