'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { contentsApi } from '@/lib/api'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function ContentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: content, isLoading } = useQuery({
    queryKey: ['content', id],
    queryFn: async () => {
      const response = await contentsApi.getById(id)
      return response.data
    },
  })

  const recordViewMutation = useMutation({
    mutationFn: () => contentsApi.recordView(id),
  })

  // 閲覧記録（初回のみ）
  const [hasRecorded, setHasRecorded] = useState(false)
  useEffect(() => {
    if (content && !hasRecorded) {
      recordViewMutation.mutate()
      setHasRecorded(true)
    }
  }, [content])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">コンテンツが見つかりません</p>
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
        {/* タイプバッジ */}
        <div className="mb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-sm ${
            content.type === 'VIDEO' ? 'bg-red-100 text-red-800' :
            content.type === 'ARTICLE' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }`}>
            {content.type === 'VIDEO' ? '🎥 動画' :
             content.type === 'ARTICLE' ? '📄 記事' :
             '📁 PDF'}
          </span>
          {content.duration && (
            <span className="ml-2 text-sm text-gray-600">
              {Math.floor(content.duration / 60)}分
            </span>
          )}
        </div>

        {/* タイトル */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{content.title}</h1>

        {/* メタ情報 */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
          <span>👁 {content.viewCount} 閲覧</span>
          {content.tags && content.tags.map((tag: string) => (
            <span key={tag} className="px-2 py-1 bg-gray-100 rounded">#{tag}</span>
          ))}
        </div>

        {/* コンテンツ表示 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* 動画 */}
          {content.type === 'VIDEO' && (
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              {content.contentUrl.includes('youtube.com') ? (
                <div className="text-white text-center p-8">
                  <p className="mb-4">動画プレイヤー</p>
                  <p className="text-sm text-gray-400">実際の環境では、YouTubeやVimeoの埋め込みを表示します</p>
                  <a 
                    href={content.contentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 px-4 py-2 bg-red-600 text-white rounded"
                  >
                    YouTubeで開く
                  </a>
                </div>
              ) : (
                <video controls className="w-full h-full">
                  <source src={content.contentUrl} />
                </video>
              )}
            </div>
          )}

          {/* 記事 */}
          {content.type === 'ARTICLE' && (
            <div className="p-8">
              <div className="prose max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {content.description}
                </p>
              </div>
            </div>
          )}

          {/* PDF */}
          {content.type === 'PDF' && (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-bold mb-4">PDFドキュメント</h3>
              <p className="text-gray-600 mb-6">{content.description}</p>
              <a
                href={content.contentUrl}
                download
                className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                📥 ダウンロード
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

