'use client'

import { useQuery } from '@tanstack/react-query'
import { experienceApi } from '@/lib/api'
import Link from 'next/link'
import { useState } from 'react'

export default function ExperiencesPage() {
  const [category, setCategory] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [search, setSearch] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['experiences', category, age, gender, search],
    queryFn: async () => {
      const params: any = {}
      if (category) params.category = category
      if (age) params.age = parseInt(age)
      if (gender) params.gender = gender
      if (search) params.search = search
      params.limit = 100 // 検索結果を多く表示
      
      const response = await experienceApi.getAll(params)
      return response.data
    },
  })

  const handleReset = () => {
    setCategory('')
    setAge('')
    setGender('')
    setSearch('')
  }

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

      {/* 検索フォーム */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">🔍 検索・フィルター</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* キーワード検索 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              キーワード
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="タイトル・本文で検索"
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* カテゴリ（病気の種類） */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              病気の種類
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
            >
              <option value="">すべて</option>
              <option value="PHYSICAL">身体的な症状</option>
              <option value="MENTAL">メンタルヘルス</option>
              <option value="FAMILY">家族・子供</option>
              <option value="LIFESTYLE">生活習慣</option>
            </select>
          </div>

          {/* 年齢 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              年齢（±5歳の範囲）
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="例: 35"
              min="1"
              max="150"
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* 性別 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              性別
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
            >
              <option value="">すべて</option>
              <option value="MALE">男性</option>
              <option value="FEMALE">女性</option>
              <option value="OTHER">その他</option>
            </select>
          </div>
        </div>

        {/* リセットボタン */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            リセット
          </button>
        </div>
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



