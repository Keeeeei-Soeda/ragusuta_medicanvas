'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { announcementsApi } from '@/lib/api'
import { useParams, useRouter } from 'next/navigation'

export default function AnnouncementDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: announcement, isLoading } = useQuery({
    queryKey: ['announcement', id],
    queryFn: async () => {
      const response = await announcementsApi.getById(id)
      return response.data
    },
  })

  const markAsReadMutation = useMutation({
    mutationFn: () => announcementsApi.markAsRead(id),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  if (!announcement) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">お知らせが見つかりません</p>
      </div>
    )
  }

  return (
    <div>
      {/* 戻るボタン */}
      <button
        onClick={() => router.back()}
        className="text-purple-600 hover:text-purple-700 mb-6"
      >
        ← 戻る
      </button>

      <div className="max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* タイプバッジ */}
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 text-sm rounded-full ${
              announcement.type === 'URGENT' ? 'bg-red-100 text-red-800' :
              announcement.type === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {announcement.type === 'URGENT' ? '🔴 緊急' :
               announcement.type === 'WARNING' ? '⚠️ 重要' :
               'ℹ️ お知らせ'}
            </span>
          </div>

          {/* タイトル */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{announcement.title}</h1>

          {/* 日付 */}
          <p className="text-sm text-gray-500 mb-6">
            {new Date(announcement.createdAt).toLocaleDateString('ja-JP')}
          </p>

          {/* 内容 */}
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {announcement.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}






