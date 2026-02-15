export default function FooterSection() {
  return (
    <div className="mt-16 sm:mt-24 lg:mt-32 pt-8 sm:pt-12 lg:pt-16 border-t border-gray-200">
      <div className="text-center space-y-3 sm:space-y-4">
        <p className="text-gray-500 text-sm sm:text-base font-sans px-4">
          개인 프로젝트 · 지속적인 개선 중
        </p>
        <div className="flex justify-center space-x-2 text-xs sm:text-sm text-gray-600 font-sans">
          <span>Made with</span>
          <span className="text-red-500">♥</span>
          <span>by Developer</span>
        </div>
      </div>
    </div>
  )
}