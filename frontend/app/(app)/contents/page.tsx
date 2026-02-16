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

/**
 * Unsplash画像URLを取得
 * Unsplashのランダム画像APIを使用（認証不要）
 */
function getUnsplashImage(contentId: string, category: string, type: string, fallback: boolean = false): string {
  // カテゴリに応じた画像ID（Unsplashの実際の画像IDを使用）
  const imageIds: Record<string, string[]> = {
    PHYSICAL: [
      '1571019613454-0c5ecd80d7a3', // フィットネス
      '1576678927484-3fb4a1c7b5a3', // 運動
      '1544367567-0f2fcb009e0b', // 健康
    ],
    MENTAL: [
      '1506126613408-eca07ce68773', // 瞑想
      '1516589178581-6b0cf9e0b5b1', // マインドフルネス
      '1519389950473-47ba0277781c', // ウェルネス
    ],
    FAMILY: [
      '1522771739844-6a9f6d5f14b1', // 家族
      '1503454537195-1dcabb73ffb9', // 子供
      '1511895426328-dc371419e107', // 健康
    ],
    LIFESTYLE: [
      '1490645935967-10de6ba17061', // 健康的な生活
      '1505576391880-b3f9d713dc4f', // ライフスタイル
      '1512621776951-a57141f2eefd', // ウェルネス
    ],
    SENIOR: [
      '1522771739844-6a9f6d5f14b1', // シニア
      '1503454537195-1dcabb73ffb1', // 高齢者
      '1511895426328-dc371419e107', // 健康
    ],
  };

  // タイプに応じた画像ID
  const typeImageIds: Record<string, string[]> = {
    VIDEO: [
      '1492691527719-9d1e07e534b4', // ビデオ
      '1516321318423-f06f85e504b3', // メディア
    ],
    ARTICLE: [
      '1481627834876-b7833e8f5570', // 読書
      '1507003211169-0a1dd7228f2d', // 記事
    ],
    PDF: [
      '1452860606245-08f2d23f2f97', // ドキュメント
      '1502920914262-07a00d3743a1', // ペーパー
    ],
  };

  // カテゴリとタイプに応じた画像IDを選択
  const categoryIds = imageIds[category] || imageIds.PHYSICAL;
  const typeIds = typeImageIds[type] || [];
  const allIds = [...categoryIds, ...typeIds];

  // コンテンツIDに基づいて決定論的に選択（同じコンテンツには常に同じ画像）
  let hash = 0;
  for (let i = 0; i < contentId.length; i++) {
    hash = ((hash << 5) - hash) + contentId.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % allIds.length;
  const imageId = allIds[index] || '1571019613454-0c5ecd80d7a3';

  // Unsplashの画像URL（サイズ指定: 800x600）
  return `https://images.unsplash.com/photo-${imageId}?w=800&h=600&fit=crop&auto=format`;
}

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
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedCategory === cat.value
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
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedType === type.value
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
            <div className="aspect-video bg-gray-200 relative overflow-hidden">
              {content.thumbnailUrl ? (
                <img
                  src={content.thumbnailUrl}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={getUnsplashImage(content.id, content.category, content.type)}
                  alt={content.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // フォールバック画像
                    (e.target as HTMLImageElement).src = getUnsplashImage(content.id, content.category, content.type, true);
                  }}
                />
              )}
            </div>

            {/* コンテンツ情報 */}
            <div className="p-4">
              {/* タイプバッジ */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-1 rounded-full ${content.type === 'VIDEO' ? 'bg-red-100 text-red-800' :
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
