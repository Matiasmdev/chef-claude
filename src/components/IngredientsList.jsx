// src/components/IngredientsList.jsx
import React, { useState, useEffect, useRef } from "react";
import { getRecipeFromClaude } from "../utils/ai";
import { v4 as uuidv4 } from "uuid";
import Confetti from "react-confetti";
import ClaudeRecipe from "./ClaudeRecipe";

const RECAPTCHA_SITE_KEY = "6Ld5G80rAAAAAE40vrqO04MPywTELLvUMs6t_SBF"; // tu site key pública

const IngredientsList = ({ ingredientes, sectionRef }) => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [receta, setReceta] = useState("");
  const [error, setError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  // Generar o recuperar userId
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
      // Ejecutar reCAPTCHA v3
      const recaptchaToken = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, {
        action: "generate_recipe",
      });

      const data = await getRecipeFromClaude({
        ingredients: ingredientes,
        userId,
        recaptchaToken,
      });

      setReceta(data.receta);

      // Confetti solo en la primera receta
      const firstRecipeKey = `firstRecipeDone:${userId}`;
      const isFirst = !localStorage.getItem(firstRecipeKey);
      if (isFirst) {
        setShowConfetti(true);
        localStorage.setItem(firstRecipeKey, "true");
        setTimeout(() => setShowConfetti(false), 5000); // dura 5 segundos
      }

      // Scroll automático hacia la receta
      setTimeout(() => {
        sectionRef?.current?.scrollIntoView({ behavior: "smooth" });
      }, 100); // pequeño delay para evitar conflicto con reCAPTCHA
    } catch (err) {
      setError(err.message || "Error desconocido al generar la receta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

      <h2 className="text-2xl font-bold text-gray-800">Ingredientes a mano:</h2>
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
        <div ref={sectionRef} className="space-y-2 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-700">
            ¿Listo para una nueva receta?
          </h3>
          <p className="text-gray-600 text-sm">
            Crea una nueva receta con tu lista de ingredientes.
          </p>
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
            <div className="mt-4">
              <ClaudeRecipe receta={receta} />
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default IngredientsList;
