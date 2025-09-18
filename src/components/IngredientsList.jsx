import React, { useState, useEffect, useRef } from "react";
import { getRecipeFromClaude } from "../utils/ai";
import { v4 as uuidv4 } from "uuid";
import Confetti from "react-confetti";
import ClaudeRecipe from "./ClaudeRecipe";

const IngredientsList = ({ ingredientes, sectionRef }) => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [receta, setReceta] = useState("");
  const [error, setError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPos, setConfettiPos] = useState({ x: 0, y: 0 });

  const recetaRef = useRef(null);

  useEffect(() => {
    let storedId = localStorage.getItem("userId");
    if (!storedId) {
      storedId = uuidv4();
      localStorage.setItem("userId", storedId);
    }
    setUserId(storedId);
  }, []);

  const obtenerReceta = async () => {
    if (!userId) return;
    setLoading(true);
    setError("");

    try {
      // Ejecutar ReCaptcha
      const recaptchaToken = await window.grecaptcha.execute(
        import.meta.env.VITE_RECAPTCHA_SITE_KEY,
        { action: "generate_recipe" }
      );

      const data = await getRecipeFromClaude({
        ingredients: ingredientes,
        userId,
        recaptchaToken,
      });

      setReceta(data.receta);
    } catch (err) {
      setError(err.message || "Error desconocido al generar la receta");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (receta && recetaRef.current) {
      // Scroll automático
      recetaRef.current.scrollIntoView({ behavior: "smooth", block: "start" });

      // Esperar un pequeño delay para que el scroll termine antes de mostrar confetti
      const timeout = setTimeout(() => {
        const rect = recetaRef.current.getBoundingClientRect();
        setConfettiPos({
          x: rect.left + rect.width / 2 + window.scrollX,
          y: rect.top + rect.height / 2 + window.scrollY,
        });
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }, 300); // 300ms de espera para scroll

      return () => clearTimeout(timeout);
    }
  }, [receta]);

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
            className={`mt-2 w-full sm:w-auto bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 focus:ring-2 focus:ring-amber-500 transition duration-300 font-medium ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Generando..." : "Crear Receta"}
          </button>

          {error && <p className="text-red-600 mt-2 font-medium">{error}</p>}

          {receta && (
            <div ref={recetaRef} className="mt-4">
              <ClaudeRecipe receta={receta} />
            </div>
          )}
        </div>
      )}

      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={200}
          recycle={false}
          gravity={0.3}
          confettiSource={{
            x: confettiPos.x,
            y: confettiPos.y,
            w: 10,
            h: 10,
          }}
        />
      )}
    </section>
  );
};

export default IngredientsList;
