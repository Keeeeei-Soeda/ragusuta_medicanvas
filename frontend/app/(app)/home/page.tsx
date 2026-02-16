'use client'

import { useQuery } from '@tanstack/react-query'
import { experienceApi, statsApi, contentsApi, announcementsApi } from '@/lib/api'
import Link from 'next/link'

export default function HomePage() {
  // 最近の体験談（TOP3）
  const { data: recentExperiences } = useQuery({
    queryKey: ['experiences', 'recent'],
    queryFn: async () => {
      const response = await experienceApi.getAll()
      return response.data.experiences?.slice(0, 3) || []
    },
  })

  // 個人統計サマリー
  const { data: personalStats } = useQuery({
    queryKey: ['stats', 'personal', 'month'],
    queryFn: async () => {
      const response = await statsApi.getPersonal('month')
      return response.data
    },
  })

  // おすすめ健康コンテンツ（TOP3）
  const { data: recentContents } = useQuery({
    queryKey: ['contents', 'recent'],
    queryFn: async () => {
      const response = await contentsApi.getAll({ limit: 3 })
      return response.data.contents || []
    },
  })

  // お知らせ（最新3件）
  const { data: recentAnnouncements } = useQuery({
    queryKey: ['announcements', 'recent'],
    queryFn: async () => {
      try {
        const response = await announcementsApi.getAll()
        return (response.data || []).slice(0, 3)
      } catch (error) {
        return []
      }
    },
  })

  return (
    <div>
      {/* ウェルカムメッセージ */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">へるこね へようこそ</h2>
        <p className="text-gray-600">健康に関する体験を共有し、つながりましょう</p>
      </div>

      {/* クイックアクションカード */}
      <section className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">📌 クイックアクセス</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/experiences"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <span className="text-2xl">📖</span>
              </div>
              <h4 className="ml-3 text-lg font-bold text-gray-900">体験談を見る</h4>
            </div>
            <p className="text-sm text-gray-600">みんなの健康体験を読んで参考にしましょう</p>
          </Link>

          <Link
            href="/experiences/new"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <span className="text-2xl">✏️</span>
              </div>
              <h4 className="ml-3 text-lg font-bold text-gray-900">体験談を投稿</h4>
            </div>
            <p className="text-sm text-gray-600">あなたの体験を共有して誰かを助けましょう</p>
          </Link>

          <Link
            href="/contents"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-3">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <span className="text-2xl">❤️</span>
              </div>
              <h4 className="ml-3 text-lg font-bold text-gray-900">健康コンテンツ</h4>
            </div>
            <p className="text-sm text-gray-600">専門家による健康情報をチェック</p>
            <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              準備中
            </span>
          </Link>
        </div>
      </section>

      {/* 個人統計サマリー */}
      {personalStats && (
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">📊 あなたの今月の活動</h3>
            <Link href="/stats" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              詳細を見る →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">体験談閲覧</p>
              <p className="text-2xl font-bold text-gray-900">{personalStats.current?.viewCount || 0}件</p>
              {personalStats.comparison?.viewCountDiff !== undefined && (
                <p className={`text-sm mt-1 ${personalStats.comparison.viewCountDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {personalStats.comparison.viewCountDiff >= 0 ? '↑' : '↓'} {Math.abs(personalStats.comparison.viewCountDiff)} 前月比
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">体験談投稿</p>
              <p className="text-2xl font-bold text-gray-900">{personalStats.current?.postCount || 0}件</p>
              {personalStats.comparison?.postCountDiff !== undefined && (
                <p className={`text-sm mt-1 ${personalStats.comparison.postCountDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {personalStats.comparison.postCountDiff >= 0 ? '↑' : '↓'} {Math.abs(personalStats.comparison.postCountDiff)} 前月比
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">参考になった</p>
              <p className="text-2xl font-bold text-gray-900">{personalStats.current?.helpfulReceived || 0}件</p>
              <p className="text-sm text-gray-500 mt-1">もらった数</p>
            </div>
          </div>
        </section>
      )}

      {/* お知らせ */}
      {recentAnnouncements && recentAnnouncements.length > 0 && (
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">📢 お知らせ</h3>
            <Link href="/announcements" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              すべて見る →
            </Link>
          </div>
          <div className="space-y-3">
            {recentAnnouncements.map((announcement: any) => (
              <Link
                key={announcement.id}
                href={`/announcements/${announcement.id}`}
                className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${announcement.type === 'URGENT' ? 'bg-red-100 text-red-800' :
                      announcement.type === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                    }`}>
                    {announcement.type === 'URGENT' ? '🔴' :
                      announcement.type === 'WARNING' ? '⚠️' :
                        'ℹ️'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">{announcement.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-1">{announcement.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(announcement.createdAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* おすすめ健康コンテンツ */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">❤️ おすすめ健康コンテンツ</h3>
          <Link href="/contents" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            すべて見る →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentContents?.map((content: any) => (
            <Link
              key={content.id}
              href={`/contents/${content.id}`}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {content.thumbnailUrl && (
                <div className="aspect-video bg-gray-200">
                  <img src={content.thumbnailUrl} alt={content.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <span className={`text-xs px-2 py-1 rounded-full ${content.type === 'VIDEO' ? 'bg-red-100 text-red-800' :
                    content.type === 'ARTICLE' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                  }`}>
                  {content.type === 'VIDEO' ? '🎥' : content.type === 'ARTICLE' ? '📄' : '📁'} {content.type}
                </span>
                <h4 className="font-bold text-gray-900 mt-2 mb-1 line-clamp-2">{content.title}</h4>
                <p className="text-xs text-gray-600 line-clamp-2">{content.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 最近の体験談 */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">📝 最近の体験談</h3>
          <Link href="/experiences" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            すべて見る →
          </Link>
        </div>
        <div className="space-y-4">
          {recentExperiences?.map((experience: any) => (
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
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{experience.user?.name}</span>
                    <span>{experience.user?.age}歳</span>
                    <span>{experience.user?.jobType}</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 line-clamp-2 mb-3">{experience.content}</p>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span>👁 {experience.viewCount} 閲覧</span>
                <span>👍 {experience.helpfulCount} 参考になった</span>
              </div>
            </Link>
          ))}

          {(!recentExperiences || recentExperiences.length === 0) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500">まだ体験談がありません</p>
              <Link
                href="/experiences/new"
                className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                最初の体験談を投稿する
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
