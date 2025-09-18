// src/components/IngredientsList.jsx
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
  const [dashboardData, setDashboardData] = useState(null);

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
      // Ejecutar ReCaptcha v3
      const recaptchaToken = await window.grecaptcha.execute(
        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
        { action: "generate_recipe" }
      );

      const data = await getRecipeFromClaude({
        ingredients,
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
        setTimeout(() => setShowConfetti(false), 5000);
        setTimeout(() => alert("Tu primera receta está lista 🎉"), 5000);
      }

      // Scroll automático hacia la receta
      sectionRef?.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Error desconocido al generar la receta");
    } finally {
      setLoading(false);
    }
  };

  // Función para abrir el dashboard secreto
  const abrirDashboard = async () => {
    const secretKey = prompt(
      "Ingrese su SECRET_FRONTEND_KEY para acceder al dashboard:"
    );
    if (!secretKey) return alert("No se ingresó clave");

    try {
      const res = await fetch("/api/dashboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-secret-key": secretKey,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cargar dashboard");
      setDashboardData(data);
      setShowDashboard(true);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section className="space-y-4 relative">
      {showConfetti && (
        <Confetti width={window.innerWidth} height={window.innerHeight} />
      )}

      {/* Botón secreto invisible en esquina superior izquierda */}
      <button
        onClick={abrirDashboard}
        className="absolute top-2 left-2 w-4 h-4 opacity-0"
        title="Botón secreto"
      ></button>

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

      {/* Modal secreto */}
      {showDashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-2xl p-6 relative">
            <h2 className="text-xl font-bold mb-4">Dashboard Secreto</h2>
            <button
              onClick={() => setShowDashboard(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 font-bold"
            >
              ✖
            </button>

            {dashboardData ? (
              <div className="overflow-auto max-h-96">
                {dashboardData.logs.map((log, idx) => (
                  <div
                    key={idx}
                    className="mb-2 p-2 border border-gray-200 rounded"
                  >
                    <p>
                      <strong>UserID:</strong> {log.userId}
                    </p>
                    <p>
                      <strong>Ingredientes:</strong>{" "}
                      {log.ingredients.join(", ")}
                    </p>
                    <p>
                      <strong>Fecha:</strong>{" "}
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>Cargando datos...</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default IngredientsList;
