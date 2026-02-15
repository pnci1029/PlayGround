'use client'

import React, { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import PremiumToolCard from '@/components/ui/PremiumToolCard'
import { toolCategories } from '@/lib/tools-data'

// 드래그 가능한 카테고리 컴포넌트
function SortableCategory({ 
  categoryName, 
  tools, 
  isOpen, 
  onToggle 
}: {
  categoryName: string
  tools: any[]
  isOpen: boolean
  onToggle: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: categoryName })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <section 
      ref={setNodeRef} 
      style={style}
      className={`bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:border-gray-200 hover:shadow-md ${
        isDragging ? 'shadow-2xl z-10' : ''
      }`}
    >
      {/* 아코디언 헤더 - 드래그 핸들 포함 */}
      <div className="flex">
        {/* 드래그 핸들 */}
        <div 
          {...attributes}
          {...listeners}
          className="flex items-center justify-center w-8 bg-gray-50 hover:bg-gray-100 cursor-move transition-colors duration-200"
          title="드래그해서 순서 변경"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400">
            <circle cx="9" cy="12" r="1"/>
            <circle cx="9" cy="5" r="1"/>
            <circle cx="9" cy="19" r="1"/>
            <circle cx="15" cy="12" r="1"/>
            <circle cx="15" cy="5" r="1"/>
            <circle cx="15" cy="19" r="1"/>
          </svg>
        </div>
        
        {/* 클릭 가능한 영역 */}
        <div 
          onClick={onToggle}
          className="flex-1 p-4 sm:p-6 cursor-pointer select-none transition-all duration-200 hover:bg-gray-50 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-sans group-hover:text-blue-600 transition-colors duration-200">
                {categoryName}
              </h2>
              <span className="bg-blue-50 text-blue-600 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full border border-blue-100">
                {tools.length}개
              </span>
            </div>
            
            {/* 화살표 아이콘 */}
            <div className={`transform transition-transform duration-300 ${
              isOpen ? 'rotate-90' : 'rotate-0'
            }`}>
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                className="text-gray-400 group-hover:text-blue-600 transition-colors duration-200"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 아코디언 컨텐츠 - 애니메이션 포함 */}
      <div className={`transition-all duration-500 ease-out overflow-hidden ${
        isOpen 
          ? 'max-h-[2000px] opacity-100' 
          : 'max-h-0 opacity-0'
      }`}>
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 ml-8">
          <div className="h-px bg-gray-100 mb-4 sm:mb-6"></div>
          
          {/* 도구 카드 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {tools.map((tool, index) => (
              <PremiumToolCard
                key={`${categoryName}-${index}`}
                title={tool.title}
                href={tool.href}
                category={tool.category}
                icon={tool.icon}
                status={tool.status}
                isExternal={tool.isExternal || false}
                description={tool.description}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function ToolCategoryGrid() {
  // 아코디언 상태 관리
  const [openCategories, setOpenCategories] = useState<string[]>(['개발 도구'])
  
  // 카테고리 순서 상태 관리
  const [categoryOrder, setCategoryOrder] = useState<string[]>(() => 
    Object.keys(toolCategories)
  )
  
  // 드래그앤드랍 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
  // localStorage에서 상태 복원
  useEffect(() => {
    const savedOpen = localStorage.getItem('openCategories')
    const savedOrder = localStorage.getItem('categoryOrder')
    
    if (savedOpen) {
      setOpenCategories(JSON.parse(savedOpen))
    }
    if (savedOrder) {
      setCategoryOrder(JSON.parse(savedOrder))
    }
  }, [])
  
  // 상태 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('openCategories', JSON.stringify(openCategories))
  }, [openCategories])
  
  useEffect(() => {
    localStorage.setItem('categoryOrder', JSON.stringify(categoryOrder))
  }, [categoryOrder])
  
  const toggleCategory = (categoryName: string) => {
    setOpenCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    )
  }
  
  // 드래그 완료 시 호출
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setCategoryOrder((items) => {
        const oldIndex = items.indexOf(active.id as string)
        const newIndex = items.indexOf(over.id as string)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={categoryOrder}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-6 sm:space-y-8 lg:space-y-10">
          {categoryOrder.map((categoryName) => {
            const tools = toolCategories[categoryName]
            const isOpen = openCategories.includes(categoryName)
            
            if (!tools) return null // 카테고리가 없는 경우 스킵
            
            return (
              <SortableCategory
                key={categoryName}
                categoryName={categoryName}
                tools={tools}
                isOpen={isOpen}
                onToggle={() => toggleCategory(categoryName)}
              />
            )
          })}
        </div>
      </SortableContext>
    </DndContext>
  )
}