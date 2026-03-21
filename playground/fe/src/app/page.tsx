import HeroSection from '@/components/HomePage/HeroSection'
import SubdomainShowcase from '@/components/HomePage/SubdomainShowcase'
import ToolCategoryGrid from '@/components/HomePage/ToolCategoryGrid'
import FooterSection from '@/components/HomePage/FooterSection'

export default function HomePage() {
    console.log('test')
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Services Showcase Section */}
      <section className="relative py-20 sm:py-28 lg:py-32 bg-gradient-to-br from-gray-50/50 via-white to-slate-50/30">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/20 to-transparent"></div>
        <div className="relative">
          <SubdomainShowcase />
        </div>

        {/* Section divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        </div>
      </section>

      {/* Tools Collection Section */}
      <section className="relative py-24 sm:py-32 lg:py-40 bg-white">
        {/* Background accent */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-50/30 to-purple-50/20 rounded-full blur-3xl opacity-40"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">

          <ToolCategoryGrid />
        </div>
      </section>

      {/* Footer Section */}
      <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900">
        {/* Sophisticated top border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-100/10 to-transparent"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
          <FooterSection />
        </div>
      </footer>
    </div>
  )
}
