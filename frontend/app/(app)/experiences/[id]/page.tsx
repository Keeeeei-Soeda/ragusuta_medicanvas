'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { experienceApi } from '@/lib/api'
import { useParams, useRouter } from 'next/navigation'

export default function ExperienceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const id = params.id as string

  const { data: experience, isLoading, error } = useQuery({
    queryKey: ['experience', id],
    queryFn: async () => {
      const response = await experienceApi.getById(id)
      return response.data
    },
  })

  const helpfulMutation = useMutation({
    mutationFn: () => experienceApi.helpful(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experience', id] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  if (error || !experience) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">体験談が見つかりません</p>
      </div>
    )
  }

  const isHelpful = experience.reactions?.some(
    (r: any) => r.type === 'HELPFUL' && r.isMyReaction
  )

  return (
    <div>
      {/* 戻るボタン */}
      <button
        onClick={() => router.back()}
        className="text-purple-600 hover:text-purple-700 mb-6"
      >
        ← 戻る
      </button>

      {/* メインコンテンツ */}
      <div className="max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* カテゴリとタイトル */}
          <div className="mb-6">
            <span className="inline-block px-3 py-1 text-sm bg-primary-100 text-primary-800 rounded-full mb-4">
              {experience.category}
              {experience.subcategory && ` - ${experience.subcategory}`}
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {experience.title}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{experience.user.name}</span>
              <span>
                {experience.user.age}歳 {experience.user.gender === 'MALE' ? '男性' : '女性'}
              </span>
              {experience.user.jobType && <span>{experience.user.jobType}</span>}
            </div>
          </div>

          {/* 本文 */}
          <div className="prose max-w-none mb-8">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {experience.content}
            </div>
          </div>

          {/* タグ */}
          {experience.tags && experience.tags.length > 0 && (
            <div className="flex gap-2 mb-8">
              {experience.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 統計情報 */}
          <div className="border-t pt-6 mb-6">
            <div className="flex gap-8 text-sm text-gray-600">
              <span>👁 {experience.viewCount} 閲覧</span>
              <span>👍 {experience.helpfulCount} 参考になった</span>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-4">
            <button
              onClick={() => helpfulMutation.mutate()}
              disabled={helpfulMutation.isPending}
              className={`flex-1 px-6 py-3 rounded-md font-medium transition-colors ${
                isHelpful
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isHelpful ? '参考になった ✓' : '参考になった'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

