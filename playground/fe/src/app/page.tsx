import HeroSection from '@/components/HomePage/HeroSection'
import ToolCategoryGrid from '@/components/HomePage/ToolCategoryGrid'
import FooterSection from '@/components/HomePage/FooterSection'

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafbfc' }}>
      <HeroSection />
      
      {/* 메인 컨텐츠 영역 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16 lg:pb-20">
        <ToolCategoryGrid />
        <FooterSection />
      </div>
    </div>
  )
}