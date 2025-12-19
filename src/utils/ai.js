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

  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch (e) {
      throw new Error(`Error del servidor (${res.status}): No se pudo obtener detalle del error.`);
    }
    throw new Error(errorData.error || `Error del servidor (${res.status})`);
  }

  try {
    return await res.json();
  } catch (e) {
    throw new Error("El servidor devolvió una respuesta inválida (no es JSON)");
  }
}
