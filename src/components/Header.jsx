const Header = () => {
  return (
    <header className="bg-white flex items-center justify-center w-full h-20 rounded-t-xl border border-gray-200 shadow-lg drop-shadow-md backdrop-blur-sm">
        <img className="w-10 h-10 mr-2" src="/chef-claude-icon.png" alt="globe icon" />
        <h1 className="font-bold text-center text-2xl text-black">Chef Claude</h1>
    </header>
  )
}

export default Header;