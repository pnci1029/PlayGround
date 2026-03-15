export default function FooterSection() {
  return (
    <div className="text-center space-y-6">
      {/* Brand Section */}
      <div className="mb-8">
        <h3 
          className="text-3xl font-bold text-white mb-4"
          style={{
            fontFamily: '"Space Grotesk", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 700
          }}
        >
          PlayGround
        </h3>
        <p 
          className="text-gray-300 text-lg max-w-md mx-auto leading-relaxed"
          style={{
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 500
          }}
        >
          개발자를 위한 정교한 도구와 서비스의 플랫폼
        </p>
      </div>

      {/* Separator */}
      <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent mx-auto"></div>

      {/* Footer Info */}
      <div className="space-y-4">
        <p 
          className="text-gray-400 text-sm"
          style={{
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 500
          }}
        >
          지속적인 혁신과 개선을 추구하는 개인 프로젝트
        </p>
        
        <div className="flex justify-center items-center space-x-2 text-sm text-gray-500">
          <span 
            style={{
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontWeight: 500
            }}
          >
            Made with
          </span>
          <span className="text-red-400">♥</span>
          <span 
            style={{
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontWeight: 500
            }}
          >
            by Developer
          </span>
        </div>

        {/* Year */}
        <p 
          className="text-gray-600 text-xs mt-4"
          style={{
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontWeight: 400
          }}
        >
          © 2024 PlayGround. All rights reserved.
        </p>
      </div>
    </div>
  )
}