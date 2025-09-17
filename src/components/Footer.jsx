const Footer = () => {
  return (
    <footer className="bg-white w-full text-center py-2 text-gray-600 shadow-inner fixed bottom-0 left-0 right-0">
      <p>
        Desarrollado por{" "}
        <a
          href="https://www.matiascoder.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500 font-bold"
        >
          @matiascoder
        </a>
        .
      </p>
    </footer>
  );
};

export default Footer;
