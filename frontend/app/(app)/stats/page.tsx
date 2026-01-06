'use client'

import { useQuery } from '@tanstack/react-query'
import { statsApi } from '@/lib/api'
import { useState } from 'react'
import Link from 'next/link'

export default function StatsPage() {
  const [period, setPeriod] = useState('month')

  const { data: personalStats, isLoading: personalLoading } = useQuery({
    queryKey: ['stats', 'personal', period],
    queryFn: async () => {
      const response = await statsApi.getPersonal(period)
      return response.data
    },
  })

  const { data: departmentStats, isLoading: departmentLoading } = useQuery({
    queryKey: ['stats', 'departments', period],
    queryFn: async () => {
      const response = await statsApi.getDepartments(period)
      return response.data
    },
  })

  const isLoading = personalLoading || departmentLoading

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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">統計情報</h2>
        <p className="text-gray-600">あなたの活動状況と部署の傾向を確認できます</p>
      </div>

      {/* メインコンテンツ */}
      <div>
        {/* 期間選択 */}
        <div className="mb-8 flex gap-4">
          {[
            { value: 'week', label: '今週' },
            { value: 'month', label: '今月' },
            { value: 'quarter', label: '今四半期' },
            { value: 'year', label: '今年' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setPeriod(option.value)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                period === option.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* 個人統計 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📊 あなたの活動統計
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* 閲覧数 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                体験談閲覧数
              </h3>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {personalStats?.current.viewCount || 0}件
              </p>
              {personalStats?.comparison && (
                <p className={`text-sm ${
                  personalStats.comparison.viewCountDiff >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {personalStats.comparison.viewCountDiff >= 0 ? '+' : ''}
                  {personalStats.comparison.viewCountDiff}件 (
                  {personalStats.comparison.viewCountPercent >= 0 ? '+' : ''}
                  {personalStats.comparison.viewCountPercent}%)
                </p>
              )}
            </div>

            {/* 投稿数 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                体験談投稿数
              </h3>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {personalStats?.current.postCount || 0}件
              </p>
              {personalStats?.comparison && (
                <p className={`text-sm ${
                  personalStats.comparison.postCountDiff >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {personalStats.comparison.postCountDiff >= 0 ? '+' : ''}
                  {personalStats.comparison.postCountDiff}件
                </p>
              )}
            </div>

            {/* 参考になった */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                「参考になった」をもらった
              </h3>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {personalStats?.current.helpfulReceived || 0}件
              </p>
              <p className="text-sm text-gray-600">
                あなたの投稿が役に立ちました！
              </p>
            </div>
          </div>

          {/* 累計 */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📈 累計</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">総閲覧数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {personalStats?.total.viewCount || 0}件
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">総投稿数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {personalStats?.total.postCount || 0}件
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">総反応数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {personalStats?.total.helpfulReceived || 0}件
                </p>
              </div>
            </div>
          </div>

          {/* ランキング */}
          {personalStats?.ranking && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 社内ランキング</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">閲覧数</span>
                  <span className="text-lg font-bold text-primary-600">
                    {personalStats.ranking.viewRank || '-'}位 / {personalStats.ranking.totalUsers}人
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">投稿数</span>
                  <span className="text-lg font-bold text-primary-600">
                    {personalStats.ranking.postRank || '-'}位 / {personalStats.ranking.totalUsers}人
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 部署比較 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🏢 部署別ランキング
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 閲覧数ランキング */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                📊 体験談閲覧数（{period === 'month' ? '今月' : '今週'}）
              </h3>
              <div className="space-y-3">
                {departmentStats?.byViewCount.slice(0, 5).map((dept: any, index: number) => (
                  <div
                    key={dept.departmentId}
                    className={`flex items-center justify-between p-3 rounded ${
                      dept.isMyDepartment ? 'bg-primary-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-900">
                        {index + 1}位
                      </span>
                      <span className="font-medium text-gray-700">
                        {dept.departmentName}
                      </span>
                      {dept.isMyDepartment && (
                        <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded">
                          あなた
                        </span>
                      )}
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {dept.viewCount}件
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 投稿数ランキング */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                📝 体験談投稿数（{period === 'month' ? '今月' : '今週'}）
              </h3>
              <div className="space-y-3">
                {departmentStats?.byPostCount.slice(0, 5).map((dept: any, index: number) => (
                  <div
                    key={dept.departmentId}
                    className={`flex items-center justify-between p-3 rounded ${
                      dept.isMyDepartment ? 'bg-primary-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-900">
                        {index + 1}位
                      </span>
                      <span className="font-medium text-gray-700">
                        {dept.departmentName}
                      </span>
                      {dept.isMyDepartment && (
                        <span className="text-xs bg-primary-600 text-white px-2 py-1 rounded">
                          あなた
                        </span>
                      )}
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {dept.postCount}件
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 部署の傾向 */}
          {departmentStats?.byViewCount.find((d: any) => d.isMyDepartment) && (
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                💡 {departmentStats.byViewCount.find((d: any) => d.isMyDepartment).departmentName}の傾向
              </h3>
              <div className="space-y-3">
                {departmentStats.byViewCount.find((d: any) => d.isMyDepartment).topCategory?.category && (
                  <div className="flex items-center gap-4">
                    <span className="text-gray-700">最も関心の高いトピック:</span>
                    <span className="font-medium text-gray-900">
                      「{departmentStats.byViewCount.find((d: any) => d.isMyDepartment).topCategory.category}」
                      ({departmentStats.byViewCount.find((d: any) => d.isMyDepartment).topCategory.percentage}%)
                    </span>
                  </div>
                )}
                {departmentStats.byViewCount.find((d: any) => d.isMyDepartment).activeHours && (
                  <div className="flex items-center gap-4">
                    <span className="text-gray-700">投稿が活発な時間帯:</span>
                    <span className="font-medium text-gray-900">
                      「{departmentStats.byViewCount.find((d: any) => d.isMyDepartment).activeHours}」
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

