'use client'

import { useState, useEffect } from 'react'

interface SaveModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (title: string, description: string, authorName: string) => void
  isLoading: boolean
  isEdit?: boolean
  defaultValues?: {
    title?: string
    description?: string
    authorName?: string
  }
}

export default function SaveModal({ isOpen, onClose, onSave, isLoading, isEdit = false, defaultValues }: SaveModalProps) {
  const [title, setTitle] = useState(defaultValues?.title || '')
  const [description, setDescription] = useState(defaultValues?.description || '')
  const [authorName, setAuthorName] = useState(defaultValues?.authorName || '')

  // 기본값이 변경될 때 상태 업데이트
  useEffect(() => {
    setTitle(defaultValues?.title || '')
    setDescription(defaultValues?.description || '')
    setAuthorName(defaultValues?.authorName || '')
  }, [defaultValues])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && authorName.trim()) {
      onSave(title.trim(), description.trim(), authorName.trim())
    }
  }

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setAuthorName('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white border border-gray-200 rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {isEdit ? '작품 업데이트' : '작품 저장'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              작품 제목 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="작품 제목을 입력하세요"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명 (선택)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="작품에 대한 설명을 입력하세요"
              rows={3}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              작가명 *
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="작가명을 입력하세요"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !title.trim() || !authorName.trim()}
            >
              {isLoading ? (isEdit ? '업데이트 중...' : '저장 중...') : (isEdit ? '업데이트' : '저장')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}