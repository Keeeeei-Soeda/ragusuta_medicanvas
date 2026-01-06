'use client'

import { useQuery } from '@tanstack/react-query'
import { authApi, experienceApi, statsApi } from '@/lib/api'
import Link from 'next/link'
import { useState } from 'react'

export default function MyPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'experiences' | 'stats' | 'settings'>('profile')

  // ユーザー情報取得
  const { data: user } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const response = await authApi.getMe()
      return response.data
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
                ${
                  activeTab === tab.id
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
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
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
    </div>
  )
}

