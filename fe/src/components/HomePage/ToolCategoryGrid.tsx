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
  DragOverEvent,
  DragStartEvent,
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
import { LoadingSkeleton, CardSkeleton } from '@/components/ui/LoadingSpinner'
import { ErrorState, LoadError } from '@/components/ui/ErrorState'

// 드래그 가능한 카테고리 컴포넌트
function SortableCategory({ 
  categoryName, 
  tools, 
  isOpen, 
  onToggle,
  isDraggedOver,
  draggedId 
}: {
  categoryName: string
  tools: any[]
  isOpen: boolean
  onToggle: () => void
  isDraggedOver: boolean
  draggedId: string | null
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
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.6 : 1,
    // 드래그 중일 때 크기 유지
    scale: 1,
  }

  // 화살표 클릭으로만 아코디언 토글
  const handleArrowClick = (e: React.MouseEvent) => {
    e.stopPropagation() // 이벤트 버블링 방지
    onToggle()
  }

  // 제목 영역 클릭 처리 - 마우스 이벤트 기반
  const [mouseDownTime, setMouseDownTime] = useState(0)
  const [mouseDownPosition, setMouseDownPosition] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    setMouseDownTime(Date.now())
    setMouseDownPosition({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    const timeDiff = Date.now() - mouseDownTime
    const distance = Math.sqrt(
      Math.pow(e.clientX - mouseDownPosition.x, 2) + 
      Math.pow(e.clientY - mouseDownPosition.y, 2)
    )
    
    // 빠른 클릭이고 움직임이 적으면 아코디언 토글
    if (timeDiff < 200 && distance < 5) {
      onToggle()
    }
  }

  // 현재 아이템이 드래그되고 있지 않고, 다른 아이템이 이 위치로 드래그될 때만 간격 추가
  const shouldShowGap = isDraggedOver && draggedId !== categoryName && draggedId !== null
  
  return (
    <div className={`transition-all duration-300 ${
      shouldShowGap ? 'mb-12' : ''
    }`}>
      <section 
        ref={setNodeRef} 
        style={style}
        className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 border-gray-100 hover:border-gray-200 hover:shadow-md ${
          isDragging ? 'shadow-2xl z-50 ring-4 ring-blue-300' : ''
        }`}
      >
      {/* 아코디언 헤더 */}
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
        
        {/* 제목 영역 - 클릭과 드래그 모두 지원 */}
        <div 
          {...attributes}
          {...listeners}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className="flex-1 p-4 sm:p-6 select-none transition-all duration-200 group cursor-move hover:bg-gray-50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <h2 className="text-xl sm:text-2xl font-bold font-sans transition-colors duration-200 text-gray-900 group-hover:text-blue-600">
                {categoryName}
              </h2>
              <span className="bg-blue-50 text-blue-600 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full border border-blue-100">
                {tools.length}개
              </span>
            </div>
            
            {/* 화살표 아이콘 - 클릭으로 아코디언 토글 */}
            <div 
              onClick={handleArrowClick}
              className={`transform transition-all duration-300 cursor-pointer p-2 -mr-2 rounded hover:bg-gray-100 ${
                isOpen ? 'rotate-90' : 'rotate-0'
              }`}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 아코디언 컨텐츠 - 드래그 중에는 상태 유지 */}
      <div className={`transition-all duration-500 ease-out overflow-hidden ${
        isOpen && !isDragging
          ? 'max-h-[2000px] opacity-100' 
          : isDragging && isOpen
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
    </div>
  )
}

export default function ToolCategoryGrid() {
  // 하이드레이션 상태 관리
  const [isHydrated, setIsHydrated] = useState(false)
  
  // 로딩 상태 관리
  const [isLoading, setIsLoading] = useState(true)
  
  // 에러 상태 관리
  const [error, setError] = useState<string | null>(null)
  
  // 아코디언 상태 관리
  const [openCategories, setOpenCategories] = useState<string[]>(['개발 도구'])
  
  // 카테고리 순서 상태 관리
  const [categoryOrder, setCategoryOrder] = useState<string[]>(() => 
    Object.keys(toolCategories)
  )
  
  // 드래그 상태 관리
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  
  // 드래그앤드랍 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
  // 하이드레이션 및 localStorage에서 상태 복원
  useEffect(() => {
    // 로딩 시뮬레이션 (실제로는 데이터 페칭)
    const loadData = async () => {
      try {
        // 로딩 시간 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // 에러 시뮬레이션 (10% 확률)
        if (Math.random() < 0.1) {
          throw new Error('데이터 로딩 실패')
        }
        
        // localStorage에서 상태 복원
        const savedOpen = localStorage.getItem('openCategories')
        const savedOrder = localStorage.getItem('categoryOrder')
        
        if (savedOpen) {
          setOpenCategories(JSON.parse(savedOpen))
        }
        if (savedOrder) {
          setCategoryOrder(JSON.parse(savedOrder))
        }
        
        // 로딩 완료
        setIsLoading(false)
        setIsHydrated(true)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])
  
  // 다시 시도 함수
  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    setIsHydrated(false)
    // useEffect가 다시 실행되도록 상태를 초기화
    setTimeout(() => {
      const loadData = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 800))
          
          const savedOpen = localStorage.getItem('openCategories')
          const savedOrder = localStorage.getItem('categoryOrder')
          
          if (savedOpen) {
            setOpenCategories(JSON.parse(savedOpen))
          }
          if (savedOrder) {
            setCategoryOrder(JSON.parse(savedOrder))
          }
          
          setIsLoading(false)
          setIsHydrated(true)
          setError(null)
        } catch (err) {
          setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
          setIsLoading(false)
        }
      }
      loadData()
    }, 100)
  }
  
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
  
  // 드래그 시작
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  // 드래그 중
  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string || null)
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

    // 드래그 상태 초기화
    setActiveId(null)
    setOverId(null)
  }

  // 에러 상태 렌더링
  if (error) {
    return (
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        <LoadError onRetry={handleRetry} />
      </div>
    )
  }

  // 로딩 중이거나 하이드레이션 전에는 로딩 스켈레톤 또는 정적 렌더링
  if (isLoading) {
    return (
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* 스켈레톤 헤더 */}
            <div className="flex">
              <div className="flex items-center justify-center w-8 bg-gray-50">
                <LoadingSkeleton className="w-4 h-4" />
              </div>
              <div className="flex-1 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <LoadingSkeleton className="h-7 w-32" />
                    <LoadingSkeleton className="h-6 w-12 rounded-full" />
                  </div>
                  <LoadingSkeleton className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            {/* 스켈레톤 컨텐츠 (일부만 열린 상태로) */}
            {index === 0 && (
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 ml-8">
                <div className="h-px bg-gray-100 mb-4 sm:mb-6"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {Array.from({ length: 6 }).map((_, cardIndex) => (
                    <CardSkeleton key={cardIndex} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }
  
  if (!isHydrated) {
    return (
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        {Object.entries(toolCategories).map(([categoryName, tools]) => {
          const isOpen = categoryName === '개발 도구' // 기본값
          
          return (
            <section 
              key={categoryName} 
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:border-gray-200 hover:shadow-md"
            >
              <div className="flex">
                <div className="flex items-center justify-center w-8 bg-gray-50 hover:bg-gray-100 cursor-move transition-colors duration-200">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400">
                    <circle cx="9" cy="12" r="1"/>
                    <circle cx="9" cy="5" r="1"/>
                    <circle cx="9" cy="19" r="1"/>
                    <circle cx="15" cy="12" r="1"/>
                    <circle cx="15" cy="5" r="1"/>
                    <circle cx="15" cy="19" r="1"/>
                  </svg>
                </div>
                
                <div className="flex-1 p-4 sm:p-6 cursor-pointer select-none transition-all duration-200 hover:bg-gray-50 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 font-sans group-hover:text-blue-600 transition-colors duration-200">
                        {categoryName}
                      </h2>
                      <span className="bg-blue-50 text-blue-600 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full border border-blue-100">
                        {tools.length}개
                      </span>
                    </div>
                    
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

              <div className={`transition-all duration-500 ease-out overflow-hidden ${
                isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 ml-8">
                  <div className="h-px bg-gray-100 mb-4 sm:mb-6"></div>
                  
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
        })}
      </div>
    )
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
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
                isDraggedOver={overId === categoryName}
                draggedId={activeId}
              />
            )
          })}
        </div>
      </SortableContext>
    </DndContext>
  )
}