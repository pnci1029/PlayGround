'use client'

import React, { useState, useEffect } from 'react'
import { getFunToolsCategories } from '@/lib/tools-data'
import PremiumToolCard from '@/components/ui/PremiumToolCard'
import { LoadingSkeleton, CardSkeleton } from '@/components/ui/LoadingSpinner'
import { ErrorState, LoadError } from '@/components/ui/ErrorState'

export default function FunToolsPage() {
  const funToolsCategories = getFunToolsCategories()
  
  const [isHydrated, setIsHydrated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openCategories, setOpenCategories] = useState<string[]>(['재미 도구'])

  useEffect(() => {
    const loadData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const savedOpen = localStorage.getItem('funToolsOpenCategories')
        if (savedOpen) {
          setOpenCategories(JSON.parse(savedOpen))
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
  }, [])

  useEffect(() => {
    localStorage.setItem('funToolsOpenCategories', JSON.stringify(openCategories))
  }, [openCategories])

  const toggleCategory = (categoryName: string) => {
    setOpenCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    )
  }

  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    setIsHydrated(false)
    setTimeout(() => {
      setIsLoading(false)
      setIsHydrated(true)
    }, 300)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8">
          <LoadError onRetry={handleRetry} />
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8">
          <div className="mb-12">
            <LoadingSkeleton className="h-10 w-48 mb-4" />
            <LoadingSkeleton className="h-6 w-96" />
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <LoadingSkeleton className="h-7 w-32" />
                    <LoadingSkeleton className="h-6 w-12 rounded-full" />
                  </div>
                  <LoadingSkeleton className="w-5 h-5" />
                </div>
              </div>
              <div className="px-6 pb-6">
                <div className="h-px bg-gray-100 mb-6"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <CardSkeleton key={index} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            재미 도구
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            일상에 즐거움을 더하는 도구들입니다. 주사위 굴리기, 사다리타기, 룰렛 돌리기 등 다양한 재미 요소들을 제공합니다.
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8 lg:space-y-10">
          {Object.entries(funToolsCategories).map(([categoryName, tools]) => {
            const isOpen = openCategories.includes(categoryName)
            
            return (
              <section 
                key={categoryName} 
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:border-gray-200 hover:shadow-md"
              >
                <div 
                  className="p-4 sm:p-6 cursor-pointer select-none transition-all duration-200 hover:bg-gray-50 active:bg-gray-100"
                  onClick={() => toggleCategory(categoryName)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 font-sans">
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
                        className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={`transition-all duration-500 ease-out overflow-hidden ${
                  isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-3 sm:px-4 md:px-6 pb-4 sm:pb-6">
                    <div className="h-px bg-gray-100 mb-4 sm:mb-6"></div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
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
                          badges={[]}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}