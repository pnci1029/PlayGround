export default function Footer() {
  return (
    <footer className="py-24 border-t border-white/10">
      <div className="container mx-auto px-8 sm:px-10 lg:px-16 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6 mb-8 md:mb-0">
            <div className="text-2xl font-black text-white">DEVFORGE</div>
            <div className="w-px h-6 bg-white/20" />
            <div className="text-white/60 text-base">World-class developer tools</div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="flex items-center gap-3 text-white/50 text-base">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              All systems operational
            </div>
            <div className="text-white/50 text-base text-center">
              Made by developers, for developers
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}