export async function getRecipeFromClaude(ingredients) {
  const res = await fetch("/api/generate-recipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredients }),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("El servidor no devolvió un JSON válido");
  }

  if (!res.ok) {
    throw new Error(data.error || "Error desconocido al generar la receta");
  }

  return data.receta;
}
