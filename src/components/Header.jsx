const Header = () => {
  return (
    <header className="glass-morphism sticky top-0 z-50 flex items-center justify-between w-full h-20 px-6 sm:px-12 border-b border-white/10 shadow-2xl overflow-hidden">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-500/10 rounded-xl glow-amber border border-amber-500/20">
          <img className="w-8 h-8 animate-float" src="/chef-claude-icon.png" alt="chef icon" />
        </div>
        <div className="flex flex-col">
          <h1 className="font-extrabold text-xl sm:text-2xl tracking-tight text-white">Chef <span className="text-amber-500">Claude</span></h1>
          <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold animate-pulse-soft">AI Assistant</span>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
        <span className="text-xs font-medium text-gray-400">System Ready</span>
      </div>
    </header>
  )
}

export default Header;