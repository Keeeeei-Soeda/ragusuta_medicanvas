'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import { useState } from 'react'
import Link from 'next/link'

export default function DepartmentsPage() {
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', displayOrder: 0 })

  const { data: departments, isLoading } = useQuery({
    queryKey: ['admin', 'departments'],
    queryFn: async () => {
      const response = await adminApi.getDepartments()
      return response.data
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: { name: string; displayOrder: number }) => 
      adminApi.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] })
      setIsCreating(false)
      setFormData({ name: '', displayOrder: 0 })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      adminApi.updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] })
      setEditingId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">部署管理</h2>
        <p className="text-gray-600">部署の追加・編集・削除</p>
      </div>
        {/* 新規作成ボタン */}
        {!isCreating && !editingId && (
          <button
            onClick={() => setIsCreating(true)}
            className="mb-6 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            + 新しい部署を追加
          </button>
        )}

        {/* 作成/編集フォーム */}
        {(isCreating || editingId) && (
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4">
              {editingId ? '部署を編集' : '新しい部署を追加'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  部署名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  表示順
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? '保存中...' : '保存'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false)
                    setEditingId(null)
                    setFormData({ name: '', displayOrder: 0 })
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 部署一覧 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  部署名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  表示順
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ユーザー数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  状態
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments?.map((dept: any) => (
                <tr key={dept.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {dept.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dept.displayOrder}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dept._count?.users || 0}人
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        dept.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {dept.isActive ? '有効' : '無効'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingId(dept.id)
                        setFormData({
                          name: dept.name,
                          displayOrder: dept.displayOrder,
                        })
                      }}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('この部署を削除しますか？')) {
                          deleteMutation.mutate(dept.id)
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 hover:text-red-900"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
  )
}

