// src/utils/ai.js
export async function getRecipeFromClaude({ ingredients, userId, recaptchaToken }) {
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    throw new Error("Se requieren al menos 1 ingrediente");
  }

  if (!userId) {
    throw new Error("userId es requerido");
  }

  if (!recaptchaToken) {
    throw new Error("recaptchaToken es requerido");
  }

  const secretKey = import.meta.env.VITE_SECRET_FRONTEND_KEY;

  const res = await fetch("/api/generate-recipe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-secret-key": secretKey,
    },
    body: JSON.stringify({ ingredients, userId, recaptchaToken }),
  });

  let data;
  try {
    data = await res.json(); // intentar parsear JSON
  } catch {
    throw new Error("El servidor no devolvió un JSON válido");
  }

  if (!res.ok) {
    throw new Error(data.error || "Error desconocido al generar la receta");
  }

  return data;
}
