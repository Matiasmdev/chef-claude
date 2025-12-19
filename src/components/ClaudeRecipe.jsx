import React from "react";
import ReactMarkdown from "react-markdown";

const ClaudeRecipe = ({ receta }) => {
  if (typeof receta !== "string") {
    return (
      <section className="p-6 bg-red-50 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-red-700 mb-4">
          Error al mostrar la receta
        </h2>
        <p className="text-red-600">
          Se esperaba un texto en Markdown, pero se recibió un tipo{' '}
          <code className="bg-gray-200 px-1 rounded">{typeof receta}</code>.
          Revisa tu función{' '}
          <code className="bg-gray-200 px-1 rounded">getRecipeFromClaude</code>.
        </p>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden glass-morphism rounded-3xl p-8 sm:p-12 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-fade-in group hover:border-amber-500/20 transition-all duration-500">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-500/30 rounded-tl-3xl"></div>
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-500/30 rounded-br-3xl"></div>

      <div className="flex flex-col items-center mb-10 space-y-4">
        <div className="bg-amber-500/20 text-amber-500 text-[10px] items-center gap-2 flex uppercase tracking-[0.3em] font-black px-4 py-2 rounded-full border border-amber-500/20 animate-pulse-soft">
          <span className="text-sm">⭐</span> Recomendación del Chef
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white text-center leading-tight drop-shadow-md">
          Tu Menú Personalizado
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-cyan-500 rounded-full"></div>
      </div>

      <div className="prose prose-invert max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-3xl font-black mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-bold mt-10 mb-5 text-amber-500 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-500/50"></span>
                {children}
              </h2>
            ),
            p: ({ children }) => <p className="text-gray-300 leading-relaxed mb-6 font-medium text-base">{children}</p>,
            ul: ({ children }) => <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 list-none pl-0">{children}</ul>,
            ol: ({ children }) => <ol className="space-y-6 list-none pl-0">{children}</ol>,
            li: ({ node, ordered, children, ...props }) => {
              if (ordered) {
                return (
                  <li className="flex gap-4 group/item">
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 font-black text-sm group-hover/item:border-cyan-500/50 transition-colors">
                      {node.index + 1}
                    </span>
                    <div className="text-gray-300 pt-1">{children}</div>
                  </li>
                )
              }
              return (
                <li className="bg-white/5 border border-white/5 p-3 px-4 rounded-xl flex items-center gap-3 text-sm text-gray-300 border-l-amber-500/50 border-l-4">
                  <span>◈</span>
                  {children}
                </li>
              )
            },
            strong: ({ children }) => (
              <strong className="text-white font-black px-1 border-b border-amber-500/30">{children}</strong>
            ),
            code: ({ children }) => (
              <code className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-mono text-sm border border-amber-500/20">{children}</code>
            ),
          }}
        >
          {receta}
        </ReactMarkdown>
      </div>

      <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-4 opacity-50">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold italic">
          Buen provecho · Bon Appétit · Enjoy
        </p>
        <div className="text-2xl">👨‍🍳</div>
      </div>
    </section>
  );
};

export default ClaudeRecipe;