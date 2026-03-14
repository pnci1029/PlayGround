export default function HeroSection() {
  return (
    <>
      {/* Google Fonts 로드 */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link 
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" 
        rel="stylesheet" 
      />
      
      <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 relative">
        {/* 배경 패턴 제거 */}
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-28">
          <div className="text-center">
            <h1 
              className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-800 to-purple-700 mb-6 sm:mb-8 tracking-tight leading-tight"
              style={{
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontWeight: 900,
                letterSpacing: '-0.05em'
              }}
            >
              PlayGround
            </h1>
            <div className="relative inline-block">
              <p 
                className="text-xl sm:text-2xl lg:text-3xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4 font-medium"
                style={{
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  fontWeight: 500
                }}
              >
                개발부터 재미까지, 다양한 웹 도구를 한 곳에서
              </p>
              {/* 하이라이트 언더라인 */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-60"></div>
            </div>
          </div>
        </div>
        
        {/* 하단 구분선 효과 */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>
    </>
  )
}