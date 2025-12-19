const Footer = () => {
  return (
    <footer className="glass-morphism fixed bottom-0 left-0 right-0 py-4 px-6 border-t border-white/5 flex items-center justify-center z-50">
      <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-gray-400">
        Diseñado con precisión por{" "}
        <a
          href="https://www.matiascoder.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-amber-500 font-black hover:text-amber-400 transition-colors duration-300"
        >
          @matiascoder
        </a>
        <span className="mx-3 opacity-20">|</span>
        <span className="text-cyan-400">Chef Claude v3.0</span>
      </p>
    </footer>
  );
};

export default Footer;
