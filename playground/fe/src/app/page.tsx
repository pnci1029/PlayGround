import HeroSection from '@/components/HomePage/HeroSection'
import SubdomainShowcase from '@/components/HomePage/SubdomainShowcase'
import ToolCategoryGrid from '@/components/HomePage/ToolCategoryGrid'
import FooterSection from '@/components/HomePage/FooterSection'

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafbfc' }}>
      <HeroSection />
      
      {/* 서브도메인 쇼케이스 */}
      <SubdomainShowcase />
      
      {/* 메인 컨텐츠 영역 - 도구 카테고리 */}
      <div className="py-16 sm:py-20 lg:py-24" style={{ backgroundColor: '#fafbfc' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight"
              style={{
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontWeight: 800
              }}
            >
              도구 모음
            </h2>
            <p 
              className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto"
              style={{
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontWeight: 500
              }}
            >
              다양한 카테고리의 유용한 도구들을 탐색해보세요
            </p>
          </div>
          <ToolCategoryGrid />
        </div>
      </div>
      
      {/* 푸터 영역 */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <FooterSection />
        </div>
      </div>
    </div>
  )
}