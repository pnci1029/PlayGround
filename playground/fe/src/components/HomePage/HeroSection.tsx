export default function HeroSection() {
  return (
    <>
      {/* Google Fonts 로드 - Sophisticated Typography */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link 
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" 
        rel="stylesheet" 
      />
      
      <div className="bg-gradient-to-br from-slate-50 via-white to-gray-50 relative overflow-hidden">
        {/* Sophisticated Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #6366f1 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%),
                             radial-gradient(circle at 50% 50%, #06b6d4 0%, transparent 50%)`
          }}></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32 lg:py-40">
          <div className="text-center">
            {/* Typography matching header style with sophisticated enhancement */}
            <h1 
              className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold text-gray-900 mb-8 sm:mb-12 tracking-tight leading-none"
              style={{
                fontFamily: '"Space Grotesk", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontWeight: 700,
                letterSpacing: '-0.02em'
              }}
            >
              PlayGround
            </h1>
            
          </div>
        </div>
        
        {/* Enhanced section separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          <div className="h-12 bg-gradient-to-t from-gray-50/50 to-transparent"></div>
        </div>
      </div>
    </>
  )
}