'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi, experienceApi, statsApi } from '@/lib/api'
import Link from 'next/link'
import { useState } from 'react'

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'experiences' | 'stats' | 'settings'>('profile')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const queryClient = useQueryClient()

  // ユーザー情報取得
  const { data: user } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response = await authApi.getMe()
      return response.data
    },
  })

  // プロフィール更新
  const updateProfileMutation = useMutation({
    mutationFn: (data: {
      hasChildren: boolean
      childrenAges?: number[]
      isMarried: boolean
      interestedCategories?: string[]
    }) => authApi.registerProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      setIsEditModalOpen(false)
    },
  })

  // 投稿履歴
  const { data: myExperiences } = useQuery({
    queryKey: ['my', 'experiences'],
    queryFn: async () => {
      const response = await experienceApi.getAll()
      // 自分の投稿のみフィルター（実際のAPIではuserフィルターが必要）
      return response.data.experiences || []
    },
    enabled: activeTab === 'experiences',
  })

  // 個人統計
  const { data: personalStats } = useQuery({
    queryKey: ['my', 'stats'],
    queryFn: async () => {
      const response = await statsApi.getPersonal('month')
      return response.data
    },
    enabled: activeTab === 'stats',
  })

  const tabs = [
    { id: 'profile' as const, name: 'プロフィール', icon: '👤' },
    { id: 'experiences' as const, name: '投稿履歴', icon: '📝' },
    { id: 'stats' as const, name: '統計', icon: '📊' },
    { id: 'settings' as const, name: '設定', icon: '⚙️' },
  ]

  return (
    <div>
      {/* ページヘッダー */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">マイページ</h2>
        <p className="text-gray-600">プロフィール、投稿履歴、統計情報を管理できます</p>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* タブコンテンツ */}
      <div>
        {/* プロフィールタブ */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">プロフィール情報</h3>

            {user ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">氏名</label>
                    <p className="text-gray-900">{user.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">社員番号</label>
                    <p className="text-gray-900">{user.employeeNumber}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">生年月日</label>
                    <p className="text-gray-900">
                      {new Date(user.birthDate).toLocaleDateString('ja-JP')}
                      <span className="ml-2 text-gray-500">
                        ({new Date().getFullYear() - new Date(user.birthDate).getFullYear()}歳)
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">性別</label>
                    <p className="text-gray-900">
                      {user.gender === 'MALE' ? '男性' : user.gender === 'FEMALE' ? '女性' : 'その他'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">部署</label>
                    <p className="text-gray-900">{user.department?.name || '-'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">職種</label>
                    <p className="text-gray-900">{user.jobType || '-'}</p>
                  </div>
                </div>

                {/* 家族情報 */}
                {user.profile && (
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">家族情報</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">お子さん</label>
                        <p className="text-gray-900">
                          {user.profile.hasChildren ? 'はい' : 'いいえ'}
                          {user.profile.hasChildren && user.profile.childrenAges && user.profile.childrenAges.length > 0 && (
                            <span className="ml-2 text-gray-600">
                              ({user.profile.childrenAges.map((age: number) => `${age}歳`).join(', ')})
                            </span>
                          )}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">結婚状況</label>
                        <p className="text-gray-900">{user.profile.isMarried ? '既婚' : '未婚'}</p>
                      </div>

                      {user.profile.interestedCategories && user.profile.interestedCategories.length > 0 && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">関心のあるカテゴリ</label>
                          <div className="flex flex-wrap gap-2">
                            {user.profile.interestedCategories.map((cat: string) => (
                              <span key={cat} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-6 mt-6">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    プロフィールを編集
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">読み込み中...</p>
            )}
          </div>
        )}

        {/* 投稿履歴タブ */}
        {activeTab === 'experiences' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">投稿履歴</h3>
              <Link
                href="/experiences/new"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                + 新しい体験談を投稿
              </Link>
            </div>

            <div className="space-y-4">
              {myExperiences?.map((experience: any) => (
                <Link
                  key={experience.id}
                  href={`/experiences/${experience.id}`}
                  className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <span className="inline-block px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full mb-2">
                        {experience.category}
                      </span>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">{experience.title}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(experience.createdAt).toLocaleDateString('ja-JP')} 投稿
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 line-clamp-2 mb-3">{experience.content}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span>👁 {experience.viewCount} 閲覧</span>
                    <span>👍 {experience.helpfulCount} 参考になった</span>
                  </div>
                </Link>
              ))}

              {(!myExperiences || myExperiences.length === 0) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <p className="text-gray-500 mb-4">まだ体験談を投稿していません</p>
                  <Link
                    href="/experiences/new"
                    className="inline-block px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    最初の体験談を投稿する
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 統計タブ */}
        {activeTab === 'stats' && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">個人統計</h3>

            {personalStats ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">体験談閲覧数</h4>
                  <p className="text-3xl font-bold text-gray-900">{personalStats.current?.viewCount || 0}</p>
                  <p className="text-sm text-gray-500 mt-2">今月</p>
                  {personalStats.comparison?.viewCountDiff !== undefined && (
                    <p className={`text-sm mt-1 ${personalStats.comparison.viewCountDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {personalStats.comparison.viewCountDiff >= 0 ? '↑' : '↓'} {Math.abs(personalStats.comparison.viewCountDiff)} 前月比
                    </p>
                  )}
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">体験談投稿数</h4>
                  <p className="text-3xl font-bold text-gray-900">{personalStats.current?.postCount || 0}</p>
                  <p className="text-sm text-gray-500 mt-2">今月</p>
                  {personalStats.comparison?.postCountDiff !== undefined && (
                    <p className={`text-sm mt-1 ${personalStats.comparison.postCountDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {personalStats.comparison.postCountDiff >= 0 ? '↑' : '↓'} {Math.abs(personalStats.comparison.postCountDiff)} 前月比
                    </p>
                  )}
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">参考になった</h4>
                  <p className="text-3xl font-bold text-gray-900">{personalStats.current?.helpfulReceived || 0}</p>
                  <p className="text-sm text-gray-500 mt-2">もらった数</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">読み込み中...</p>
            )}

            <div className="mt-6">
              <Link
                href="/stats"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                詳細な統計を見る →
              </Link>
            </div>
          </div>
        )}

        {/* 設定タブ */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">設定</h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4">通知設定</h4>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-purple-600" defaultChecked />
                    <span className="ml-3 text-gray-700">新しい体験談が投稿されたら通知</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-purple-600" defaultChecked />
                    <span className="ml-3 text-gray-700">お知らせが配信されたら通知</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-purple-600" />
                    <span className="ml-3 text-gray-700">健康コンテンツが追加されたら通知</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">プライバシー設定</h4>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-purple-600" defaultChecked />
                    <span className="ml-3 text-gray-700">体験談を匿名で投稿する（デフォルト）</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-purple-600" />
                    <span className="ml-3 text-gray-700">統計情報を部署内で公開する</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                  設定を保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* プロフィール編集モーダル */}
      {isEditModalOpen && (
        <ProfileEditModal
          user={user}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(data) => updateProfileMutation.mutate(data)}
          isLoading={updateProfileMutation.isPending}
        />
      )}
    </div>
  )
}

// プロフィール編集モーダルコンポーネント
function ProfileEditModal({
  user,
  onClose,
  onSave,
  isLoading,
}: {
  user: any
  onClose: () => void
  onSave: (data: {
    hasChildren: boolean
    childrenAges?: number[]
    isMarried: boolean
    interestedCategories?: string[]
  }) => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState({
    hasChildren: user?.profile?.hasChildren || false,
    childrenAges: user?.profile?.childrenAges || [] as number[],
    isMarried: user?.profile?.isMarried || false,
    interestedCategories: user?.profile?.interestedCategories || [] as string[],
  })

  const [newChildAge, setNewChildAge] = useState('')
  const [newCategory, setNewCategory] = useState('')

  const categoryOptions = [
    { value: 'PHYSICAL', label: '身体' },
    { value: 'MENTAL', label: '心・精神' },
    { value: 'FAMILY', label: '家族' },
    { value: 'LIFESTYLE', label: '生活習慣' },
    { value: 'SENIOR', label: '高齢者' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      hasChildren: formData.hasChildren,
      childrenAges: formData.childrenAges.length > 0 ? formData.childrenAges : undefined,
      isMarried: formData.isMarried,
      interestedCategories: formData.interestedCategories.length > 0 ? formData.interestedCategories : undefined,
    })
  }

  const addChildAge = () => {
    const age = parseInt(newChildAge)
    if (!isNaN(age) && age >= 0 && age <= 30) {
      setFormData({
        ...formData,
        childrenAges: [...formData.childrenAges, age],
      })
      setNewChildAge('')
    }
  }

  const removeChildAge = (index: number) => {
    setFormData({
      ...formData,
      childrenAges: formData.childrenAges.filter((_: number, i: number) => i !== index),
    })
  }

  const addCategory = () => {
    if (newCategory && !formData.interestedCategories.includes(newCategory)) {
      setFormData({
        ...formData,
        interestedCategories: [...formData.interestedCategories, newCategory],
      })
      setNewCategory('')
    }
  }

  const removeCategory = (category: string) => {
    setFormData({
      ...formData,
      interestedCategories: formData.interestedCategories.filter((c: string) => c !== category),
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">プロフィールを編集</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* お子さん */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              お子さんはいますか？
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasChildren"
                  checked={formData.hasChildren === true}
                  onChange={() => setFormData({ ...formData, hasChildren: true })}
                  className="mr-2"
                />
                はい
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasChildren"
                  checked={formData.hasChildren === false}
                  onChange={() => setFormData({ ...formData, hasChildren: false, childrenAges: [] })}
                  className="mr-2"
                />
                いいえ
              </label>
            </div>

            {formData.hasChildren && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  お子さんの年齢
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={newChildAge}
                    onChange={(e) => setNewChildAge(e.target.value)}
                    placeholder="年齢を入力"
                    className="px-3 py-2 border border-gray-300 rounded-md w-32"
                  />
                  <button
                    type="button"
                    onClick={addChildAge}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    追加
                  </button>
                </div>
                {formData.childrenAges.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.childrenAges.map((age: number, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2"
                      >
                        {age}歳
                        <button
                          type="button"
                          onClick={() => removeChildAge(index)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 結婚状況 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              結婚状況
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isMarried"
                  checked={formData.isMarried === true}
                  onChange={() => setFormData({ ...formData, isMarried: true })}
                  className="mr-2"
                />
                既婚
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isMarried"
                  checked={formData.isMarried === false}
                  onChange={() => setFormData({ ...formData, isMarried: false })}
                  className="mr-2"
                />
                未婚
              </label>
            </div>
          </div>

          {/* 関心のあるカテゴリ */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              関心のあるカテゴリ
            </label>
            <div className="flex gap-2 mb-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">カテゴリを選択</option>
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addCategory}
                disabled={!newCategory}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                追加
              </button>
            </div>
            {formData.interestedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.interestedCategories.map((cat: string) => {
                  const option = categoryOptions.find((opt) => opt.value === cat)
                  return (
                    <span
                      key={cat}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2"
                    >
                      {option?.label || cat}
                      <button
                        type="button"
                        onClick={() => removeCategory(cat)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {/* ボタン */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}






