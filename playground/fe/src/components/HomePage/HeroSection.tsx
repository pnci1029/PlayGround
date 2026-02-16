export default function HeroSection() {
  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-24">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 tracking-tight font-sans">
            PlayGround
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-sans px-4">
            개발부터 재미까지, 다양한 웹 도구를 한 곳에서
          </p>
          
          {/* 프로젝트 네비게이션 링크 */}
          <div className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-4 sm:gap-6">
            <a 
              href="http://moodbite.localhost" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              🍽️ MoodBite
              <span className="ml-2 text-sm opacity-75">감정 기반 음식 추천</span>
            </a>
            
            <a 
              href="http://trend.localhost" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              📈 Trend
              <span className="ml-2 text-sm opacity-75">실시간 트렌드 분석</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}