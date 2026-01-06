'use client'

import { useQuery } from '@tanstack/react-query'
import { contentsApi } from '@/lib/api'
import Link from 'next/link'
import { useState } from 'react'

const categories = [
  { value: '', label: 'すべて' },
  { value: 'PHYSICAL', label: '身体の健康' },
  { value: 'MENTAL', label: '心の健康' },
  { value: 'FAMILY', label: '家族の健康' },
  { value: 'LIFESTYLE', label: '生活習慣' },
  { value: 'SENIOR', label: 'シニア' },
]

const types = [
  { value: '', label: 'すべて' },
  { value: 'VIDEO', label: '動画', icon: '🎥' },
  { value: 'ARTICLE', label: '記事', icon: '📄' },
  { value: 'PDF', label: 'PDF', icon: '📁' },
]

export default function ContentsPage() {
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedType, setSelectedType] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['contents', selectedCategory, selectedType],
    queryFn: async () => {
      const response = await contentsApi.getAll({
        category: selectedCategory || undefined,
        type: selectedType || undefined,
      })
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">健康コンテンツ</h2>
        <p className="text-gray-600">専門家による健康情報・動画・資料</p>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* カテゴリフィルター */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedCategory === cat.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* タイプフィルター */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">タイプ</label>
            <div className="flex flex-wrap gap-2">
              {types.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedType === type.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.icon && <span className="mr-1">{type.icon}</span>}
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* コンテンツグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.contents?.map((content: any) => (
          <Link
            key={content.id}
            href={`/contents/${content.id}`}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* サムネイル */}
            {content.thumbnailUrl && (
              <div className="aspect-video bg-gray-200">
                <img
                  src={content.thumbnailUrl}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* コンテンツ情報 */}
            <div className="p-4">
              {/* タイプバッジ */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  content.type === 'VIDEO' ? 'bg-red-100 text-red-800' :
                  content.type === 'ARTICLE' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {content.type === 'VIDEO' ? '🎥 動画' :
                   content.type === 'ARTICLE' ? '📄 記事' :
                   '📁 PDF'}
                </span>
                {content.duration && (
                  <span className="text-xs text-gray-600">
                    {Math.floor(content.duration / 60)}分
                  </span>
                )}
              </div>

              {/* タイトル */}
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                {content.title}
              </h3>

              {/* 説明 */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {content.description}
              </p>

              {/* メタ情報 */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>👁 {content.viewCount} 閲覧</span>
                {content.tags && content.tags.length > 0 && (
                  <span className="text-xs text-gray-500">
                    #{content.tags[0]}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* コンテンツがない場合 */}
      {(!data?.contents || data.contents.length === 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <span className="text-6xl mb-4 block">📚</span>
          <p className="text-gray-600">該当するコンテンツがありません</p>
        </div>
      )}
    </div>
  )
}
