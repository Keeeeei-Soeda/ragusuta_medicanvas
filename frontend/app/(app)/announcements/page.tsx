'use client'

import { useQuery } from '@tanstack/react-query'
import { announcementsApi } from '@/lib/api'
import Link from 'next/link'

export default function AnnouncementsPage() {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      try {
        const response = await announcementsApi.getAll()
        return response.data || []
      } catch (error) {
        // エラーの場合は空配列を返す
        return []
      }
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">お知らせ</h2>
        <p className="text-gray-600">重要な情報や更新をお知らせします</p>
      </div>

      {/* お知らせ一覧 */}
      <div className="space-y-4">
        {announcements?.map((announcement: any) => (
          <Link
            key={announcement.id}
            href={`/announcements/${announcement.id}`}
            className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    announcement.type === 'URGENT' ? 'bg-red-100 text-red-800' :
                    announcement.type === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {announcement.type === 'URGENT' ? '🔴 緊急' :
                     announcement.type === 'WARNING' ? '⚠️ 重要' :
                     'ℹ️ お知らせ'}
                  </span>
                  {!announcement.isRead && (
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                      未読
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{announcement.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(announcement.createdAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>
            <p className="text-gray-700 line-clamp-2">{announcement.content}</p>
          </Link>
        ))}

        {(!announcements || announcements.length === 0) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <span className="text-6xl mb-4 block">📢</span>
            <p className="text-gray-600">お知らせはありません</p>
          </div>
        )}
      </div>
    </div>
  )
}

