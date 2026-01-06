'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { experienceApi } from '@/lib/api'

export default function NewExperiencePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    category: 'PHYSICAL',
    subcategory: '',
    targetPerson: 'SELF',
    title: '',
    content: '',
    tags: '',
    isAnonymous: false,
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => experienceApi.create(data),
    onSuccess: (response) => {
      router.push(`/experiences/${response.data.id}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const tags = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    createMutation.mutate({
      category: formData.category,
      subcategory: formData.subcategory || undefined,
      targetPerson: formData.targetPerson,
      title: formData.title,
      content: formData.content,
      tags: tags.length > 0 ? tags : undefined,
      isAnonymous: formData.isAnonymous,
    })
  }

  return (
    <div>
      {/* ページヘッダー */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-purple-600 hover:text-purple-700 mb-4"
        >
          ← 戻る
        </button>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">体験談を投稿</h2>
        <p className="text-gray-600">あなたの体験を共有しましょう</p>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* 誰の体験談か */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              誰の体験談ですか？
            </label>
            <div className="flex gap-4">
              {[
                { value: 'SELF', label: '自分' },
                { value: 'CHILD', label: '子供' },
                { value: 'SPOUSE', label: '配偶者' },
                { value: 'PARENT', label: '親' },
              ].map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="targetPerson"
                    value={option.value}
                    checked={formData.targetPerson === option.value}
                    onChange={(e) =>
                      setFormData({ ...formData, targetPerson: e.target.value })
                    }
                    className="mr-2"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          {/* カテゴリ */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリを選択 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="PHYSICAL">身体</option>
              <option value="MENTAL">心・精神</option>
              <option value="FAMILY">家族</option>
              <option value="LIFESTYLE">生活習慣</option>
            </select>
          </div>

          {/* サブカテゴリ */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              詳細カテゴリ（任意）
            </label>
            <input
              type="text"
              value={formData.subcategory}
              onChange={(e) =>
                setFormData({ ...formData, subcategory: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="例: 腰痛、アレルギー、ストレス"
            />
          </div>

          {/* タイトル */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="例: デスクワークによる慢性腰痛を改善した方法"
              required
              maxLength={200}
            />
          </div>

          {/* 本文 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              本文 <span className="text-red-500">*</span>
              <span className="text-gray-500 text-xs ml-2">
                (300文字以上推奨)
              </span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={12}
              required
              maxLength={10000}
              placeholder="あなたの体験談を詳しく書いてください。症状、対処法、結果などを具体的に..."
            />
            <p className="text-sm text-gray-500 mt-1">
              残り: {formData.content.length}/10000文字
            </p>
          </div>

          {/* タグ */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タグ（任意）
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="カンマ区切りで入力（例: 腰痛, デスクワーク, ストレッチ）"
            />
          </div>

          {/* 匿名設定 */}
          <div className="mb-8">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={(e) =>
                  setFormData({ ...formData, isAnonymous: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm text-gray-700">匿名で公開する</span>
            </label>
          </div>

          {/* 送信ボタン */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {createMutation.isPending ? '投稿中...' : '投稿する'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              キャンセル
            </button>
          </div>

          {createMutation.isError && (
            <p className="mt-4 text-red-600">
              エラーが発生しました。もう一度お試しください。
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

