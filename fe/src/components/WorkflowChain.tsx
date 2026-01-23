'use client'

import { useState } from 'react'
import Link from 'next/link'

interface WorkflowStep {
  id: string
  name: string
  description: string
  href: string
  icon: string
  completed: boolean
}

interface Workflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  estimatedTime: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

const workflows: Workflow[] = [
  {
    id: 'api-dev',
    name: 'API 개발 워크플로우',
    description: 'JSON 설계부터 테스트까지 완전 자동화',
    estimatedTime: '15분',
    difficulty: 'intermediate',
    steps: [
      {
        id: '1',
        name: 'JSON 스키마 설계',
        description: 'AI가 API 구조를 최적화',
        href: '/tools/json-formatter',
        icon: '🔧',
        completed: false
      },
      {
        id: '2', 
        name: '변수명 자동 생성',
        description: '일관성 있는 네이밍 컨벤션',
        href: '/tools/variable-generator',
        icon: '🏷️',
        completed: false
      },
      {
        id: '3',
        name: 'API 문서화',
        description: '자동 문서 생성 및 예시',
        href: '/tools/hash',
        icon: '📝',
        completed: false
      }
    ]
  },
  {
    id: 'frontend-setup',
    name: '프론트엔드 셋업',
    description: '컴포넌트 설계부터 배포까지',
    estimatedTime: '25분', 
    difficulty: 'beginner',
    steps: [
      {
        id: '1',
        name: '컴포넌트 구조 설계',
        description: 'React 베스트 프랙티스 적용',
        href: '/tools/variable-generator',
        icon: '⚛️',
        completed: false
      },
      {
        id: '2',
        name: 'QR 코드 생성',
        description: '배포 링크 공유용',
        href: '/tools/qr-generator',
        icon: '📱',
        completed: false
      },
      {
        id: '3',
        name: 'URL 인코딩',
        description: '파라미터 안전 처리',
        href: '/tools/url-encoder',
        icon: '🔗',
        completed: false
      }
    ]
  }
]

export default function WorkflowChain() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-accent-success bg-accent-success/20'
      case 'intermediate': return 'text-accent-warning bg-accent-warning/20'
      case 'advanced': return 'text-accent-error bg-accent-error/20'
      default: return 'text-text-muted bg-surface-elevated'
    }
  }

  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            🔄 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-success">AI 워크플로우 체인</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            복잡한 개발 작업을 연결된 단계로 자동화. AI가 최적의 순서를 제안합니다.
          </p>
        </div>

        {/* Workflow Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="card group cursor-pointer" onClick={() => setSelectedWorkflow(workflow.id)}>
              
              {/* Workflow Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">{workflow.name}</h3>
                  <p className="text-text-secondary text-sm mb-3">{workflow.description}</p>
                  <div className="flex gap-3">
                    <span className="text-xs bg-surface-elevated px-2 py-1 rounded text-text-muted">
                      ⏱️ {workflow.estimatedTime}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${getDifficultyColor(workflow.difficulty)}`}>
                      {workflow.difficulty}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent-success rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
              </div>

              {/* Workflow Steps */}
              <div className="space-y-3">
                {workflow.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-4 p-3 bg-surface-elevated rounded-lg border border-border group-hover:border-primary/30 transition-colors">
                    <div className="text-2xl">{step.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-text-primary font-medium text-sm">{step.name}</h4>
                      <p className="text-text-muted text-xs">{step.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted">{index + 1}</span>
                      {index < workflow.steps.length - 1 && (
                        <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Start Button */}
              <div className="mt-6 pt-4 border-t border-border">
                <Link 
                  href={workflow.steps[0].href}
                  className="w-full bg-gradient-to-r from-primary to-accent-success text-white text-center py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all duration-300 block"
                >
                  워크플로우 시작하기 →
                </Link>
              </div>

            </div>
          ))}
        </div>

        {/* AI Optimization Notice */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-surface-elevated border border-border-bright rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-accent-success rounded-full animate-pulse"></div>
            <span className="text-text-muted text-sm">AI가 사용 패턴을 학습하여 워크플로우를 최적화합니다</span>
          </div>
        </div>

      </div>
    </section>
  )
}