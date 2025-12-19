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
    <section className="space-y-4 relative">
      <h2 className="text-2xl font-bold text-gray-800">
        ¿Qué tienes en la cocina hoy?
      </h2>

      <ul className="list-disc pl-5 space-y-1">
        {ingredientes.length > 0 ? (
          ingredientes.map((ing) => (
            <li
              key={ing}
              className="text-black py-2 px-4 rounded-md mb-1 hover:bg-gray-100 transition duration-200"
            >
              {ing}
            </li>
          ))
        ) : (
          <p className="text-gray-500 italic">No hay ingredientes aún...</p>
        )}
      </ul>

      {ingredientes.length > 3 && (
        <div className="space-y-2 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-700">
            ¿Listo para una nueva receta?
          </h3>
          <button
            onClick={obtenerReceta}
            disabled={loading}
            className={`mt-2 w-full sm:w-auto bg-amber-600 text-white py-3 px-6 rounded-lg hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 transition duration-300 font-medium ${loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generando...
              </span>
            ) : (
              "Crear Receta"
            )}
          </button>

          {errorApi && <p className="text-red-600 mt-2 font-medium">{errorApi}</p>}

          {receta && (
            <div ref={recetaRef} className="mt-4 relative">
              <ClaudeRecipe receta={receta} />
            </div>
          )}
        </div>
      )}

      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={200}
          recycle={false}
          gravity={0.3}
        />
      )}
    </section>
  );
};

export default IngredientsList;
