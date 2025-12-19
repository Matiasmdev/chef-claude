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
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      let errorData;
      try {
        errorData = await res.json();
        throw new Error(errorData.error || `Error del servidor (${res.status})`);
      } catch (e) {
        if (e.message.includes("Error del servidor")) throw e;
      }
    }

    // Si no es JSON o falló el parseo, leemos como texto
    const errorText = await res.text();
    console.error("Error del servidor (no-JSON):", errorText);
    throw new Error(`Error ${res.status}: El servidor no respondió con JSON. Revisa los logs de Vercel. Detalle breve: ${errorText.substring(0, 100)}`);
  }

  try {
    return await res.json();
  } catch (e) {
    throw new Error("El servidor devolvió una respuesta inválida (no es JSON)");
  }
}
