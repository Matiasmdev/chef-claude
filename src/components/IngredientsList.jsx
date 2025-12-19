import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import ClaudeRecipe from "./ClaudeRecipe";

const IngredientsList = ({ ingredientes, obtenerReceta, loading, errorApi, receta, recetaRef }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  // Scroll y confetti después de renderizar la receta
  useEffect(() => {
    if (receta && recetaRef.current) {
      // Scroll automático
      recetaRef.current.scrollIntoView({ behavior: "smooth", block: "start" });

      // Mostrar confetti
      setShowConfetti(true);
      const timeout = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [receta, recetaRef]);

  return (
    <section className="space-y-8 relative animate-fade-in">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[100]">
          <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={300} gravity={0.15} />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {ingredientes.length > 0 ? (
          ingredientes.map((ing, index) => (
            <div
              key={`${ing}-${index}`}
              className="bg-white/10 hover:bg-white/15 border border-white/10 py-2 px-4 rounded-xl text-sm font-medium text-white transition-all duration-200 cursor-default flex items-center gap-2 group hover:border-amber-500/30"
            >
              <span className="text-amber-500 font-bold opacity-50 group-hover:opacity-100 transition-opacity">#</span>
              {ing}
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic text-sm">No hay ingredientes aún...</p>
        )}
      </div>

      {ingredientes.length > 3 && (
        <div className="pt-6 border-t border-white/5 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-white">¿Todo listo?</h3>
              <p className="text-xs text-gray-400">Nuestro Chef IA está listo para crear magia.</p>
            </div>

            <button
              onClick={() => obtenerReceta(receta ? true : false)}
              disabled={loading}
              className={`relative group overflow-hidden w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${loading
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : receta
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400 glow-amber active:scale-95"
                  : "bg-white text-black hover:bg-amber-500 hover:text-black glow-cyan active:scale-95"
                }`}
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Procesando...
                  </>
                ) : receta ? (
                  <>
                    <span>✨</span>
                    Generar Otra Receta
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    Crear Receta
                  </>
                )}
              </div>
            </button>
          </div>

          {errorApi && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-shake">
              <p className="text-red-400 text-sm font-medium flex items-center gap-2">
                <span>❌</span> {errorApi}
              </p>
            </div>
          )}

          {receta && (
            <div ref={recetaRef} className="mt-8 pt-8 border-t border-white/10 animate-fade-in scroll-mt-24">
              <ClaudeRecipe receta={receta} />
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default IngredientsList;
