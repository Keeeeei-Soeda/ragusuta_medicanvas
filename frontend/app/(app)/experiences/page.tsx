'use client'

import { useQuery } from '@tanstack/react-query'
import { experienceApi } from '@/lib/api'
import Link from 'next/link'

export default function ExperiencesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['experiences'],
    queryFn: async () => {
      const response = await experienceApi.getAll()
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          体験談一覧
        </h2>
        <p className="text-gray-600">
          全 {data?.total || 0} 件の体験談
        </p>
      </div>

      {/* 体験談カード */}
      <div className="grid gap-6">
        {data?.experiences?.map((experience: any) => (
          <div
            key={experience.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="inline-block px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full mb-2">
                  {experience.category}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {experience.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{experience.user.name}</span>
                  <span>
                    {experience.user.age}歳 {experience.user.gender === 'MALE' ? '男性' : '女性'}
                  </span>
                  <span>{experience.user.jobType}</span>
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-4 line-clamp-3">
              {experience.content}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-6 text-sm text-gray-600">
                <span>👁 {experience.viewCount} 閲覧</span>
                <span>👍 {experience.helpfulCount} 参考になった</span>
              </div>
              <Link
                href={`/experiences/${experience.id}`}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                詳細を見る →
              </Link>
            </div>

            {experience.tags && experience.tags.length > 0 && (
              <div className="flex gap-2 mt-4">
                {experience.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

