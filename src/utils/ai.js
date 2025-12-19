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
    const resClon = res.clone(); // Clonamos para poder leerlo como JSON o como Texto
    const contentType = res.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      try {
        const errorData = await resClon.json();
        throw new Error(errorData.error || `Error del servidor (${res.status})`);
      } catch (e) {
        // Si no era JSON válido o no tenía el campo error, seguimos al texto
      }
    }

    const errorText = await res.text();
    console.error("Error del servidor (no-JSON):", errorText);
    throw new Error(`Error ${res.status}: ${errorText.substring(0, 100)}...`);
  }

  try {
    return await res.json();
  } catch (e) {
    throw new Error("El servidor devolvió una respuesta inválida (no es JSON)");
  }
}
