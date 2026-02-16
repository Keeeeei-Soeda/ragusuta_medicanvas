'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { classesApi } from '@/lib/api'
import { useState } from 'react'

export default function ClassesPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  // Mockデータ（実際のAPIが未実装の場合）
  const mockClasses = [
    {
      id: '1',
      title: 'オフィスストレッチ教室',
      description: 'デスクワークで凝り固まった体をほぐすストレッチ教室です。',
      date: '2026-01-15',
      time: '18:00-19:00',
      location: 'オンライン',
      capacity: 20,
      reserved: 12,
      instructor: 'ラグスタトレーナー',
    },
    {
      id: '2',
      title: 'マインドフルネス瞑想教室',
      description: 'ストレス軽減に効果的な瞑想の方法を学びます。',
      date: '2026-01-20',
      time: '19:00-20:00',
      location: 'オンライン',
      capacity: 15,
      reserved: 8,
      instructor: 'ラグスタトレーナー',
    },
    {
      id: '3',
      title: '親子で楽しむ運動教室',
      description: '家族で楽しみながら体を動かせる運動教室です。',
      date: '2026-01-25',
      time: '10:00-11:00',
      location: 'オンライン',
      capacity: 10,
      reserved: 5,
      instructor: 'ラグスタトレーナー',
    },
  ]

  const reserveMutation = useMutation({
    mutationFn: (id: string) => classesApi.reserve(id),
    onSuccess: () => {
      alert('予約が完了しました（Mock）')
    },
  })

  return (
    <div>
      {/* ページヘッダー */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">運動教室</h2>
        <p className="text-gray-600">ラグスタの運動教室に参加できます（Mock機能）</p>
      </div>

      {/* 注意書き */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          ⚠️ この機能は現在Mock（モック）です。実際の予約機能は今後実装予定です。
        </p>
      </div>

      {/* 教室一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockClasses.map((classItem) => (
          <div
            key={classItem.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* ヘッダー */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
              <h3 className="text-lg font-bold mb-1">{classItem.title}</h3>
              <p className="text-sm opacity-90">{classItem.instructor}</p>
            </div>

            {/* コンテンツ */}
            <div className="p-6">
              <p className="text-gray-700 mb-4 line-clamp-2">{classItem.description}</p>

              {/* 詳細情報 */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📅</span>
                  <span>{new Date(classItem.date).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">🕐</span>
                  <span>{classItem.time}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📍</span>
                  <span>{classItem.location}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">👥</span>
                  <span>{classItem.reserved} / {classItem.capacity} 人</span>
                </div>
              </div>

              {/* 進捗バー */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${(classItem.reserved / classItem.capacity) * 100}%` }}
                  />
                </div>
              </div>

              {/* 予約ボタン */}
              <button
                onClick={() => reserveMutation.mutate(classItem.id)}
                disabled={classItem.reserved >= classItem.capacity || reserveMutation.isPending}
                className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                  classItem.reserved >= classItem.capacity
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {classItem.reserved >= classItem.capacity
                  ? '満員'
                  : reserveMutation.isPending
                  ? '予約中...'
                  : '予約する（Mock）'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}






