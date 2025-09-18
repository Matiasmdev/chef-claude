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
  const [showDashboard, setShowDashboard] = useState(false);
  const titleRef = useRef(null);
  const secretBtnRef = useRef(null);

  useEffect(() => {
    let storedId = localStorage.getItem("userId");
    if (!storedId) {
      storedId = uuidv4();
      localStorage.setItem("userId", storedId);
    }
    setUserId(storedId);
  }, []);

  const abrirDashboard = () => setShowDashboard(true);
  const cerrarDashboard = () => setShowDashboard(false);

  useEffect(() => {
    // Colocar el botón justo debajo de la letra Q
    if (titleRef.current && secretBtnRef.current) {
      const range = document.createRange();
      const textNode = titleRef.current.firstChild;
      range.setStart(textNode, 2); // la Q es la segunda letra (índice 2)
      range.setEnd(textNode, 3);
      const rect = range.getBoundingClientRect();
      secretBtnRef.current.style.position = "absolute";
      secretBtnRef.current.style.left = `${rect.left + window.scrollX}px`;
      secretBtnRef.current.style.top = `${rect.bottom + window.scrollY}px`;
      secretBtnRef.current.style.width = "16px";
      secretBtnRef.current.style.height = "16px";
      secretBtnRef.current.style.opacity = 0;
    }
  }, [titleRef.current]);

  const obtenerReceta = async () => {
    if (!userId) return;
    setLoading(true);
    setError("");

    try {
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

      const firstRecipeKey = `firstRecipeDone:${userId}`;
      const isFirst = !localStorage.getItem(firstRecipeKey);
      if (isFirst) {
        setShowConfetti(true);
        localStorage.setItem(firstRecipeKey, "true");
        setTimeout(() => setShowConfetti(false), 5000);
      }

      sectionRef?.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Error desconocido al generar la receta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4 relative">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

      <h2
        ref={titleRef}
        className="text-2xl font-bold text-gray-800"
      >
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

      {/* Botón secreto */}
      <button
        ref={secretBtnRef}
        onClick={abrirDashboard}
        title="Botón secreto"
      />

      {/* Modal del dashboard */}
      {showDashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-11/12 max-w-xl relative">
            <button
              onClick={cerrarDashboard}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-4">Dashboard Secreto</h2>
            <p>Recetas generadas hoy: 10</p>
            <p>Usuarios activos: 3</p>
            <p>Uso total: 42 recetas</p>
            {/* Aquí podés mostrar datos dinámicos desde Redis o API */}
          </div>
        </div>
      )}
    </section>
  );
};

export default IngredientsList;
