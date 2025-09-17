// api/generate-recipe.js
import { Anthropic } from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `
Eres un asistente que recibe una lista de ingredientes de un usuario y sugiere una receta que puede preparar  
usando algunos o todos esos ingredientes. No necesitas usar cada ingrediente que mencione,  
pero intenta no añadir demasiados extras. Si el usuario incluye elementos que no sean comestibles  
(por ejemplo: ladrillo, jabón, ropa, mueble, automóvil o herramientas), debes responder exactamente:  
“Por favor ingresa sólo ingredientes de cocina comestibles.” y no generar ninguna receta hasta que la lista sea válida.

Las recetas deben ser coherentes, con pasos lógicos que correspondan a los ingredientes.

Responde en español latinoamericano e incluye expresiones porteñas como "esto está para chuparse los dedos",  
"una pinturita" o "más rico que el asado del domingo".

**Formato de salida (en Markdown)**  
Cuando respondas, sigue exactamente esta estructura:

# Título de la receta  
## Descripción breve (subtítulo)  

**Ingredientes:**  
- ingrediente 1  
- ingrediente 2  
- ingrediente 3  

## Pasos:  
1. Primer paso de la preparación  
2. Segundo paso  
3. Tercer paso  

Al final de tu respuesta, incluye exactamente **una** frase de cierre, elegida **aleatoriamente** de esta lista:  
- ¡Que lo disfrutes!  
- Bon appétit!  
- ¡Buen provecho!  
- Disfrútalo.
`;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_CLAUDE_API_KEY,
});

async function getRecipeFromClaude(ingredientsArr) {
  const ingredientsString = ingredientsArr.join(", ");

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      system: SYSTEM_PROMPT,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Tengo: ${ingredientsString}. ¡Dame la receta formateada como indiqué!`,
        },
      ],
    });

    // Procesar respuesta
    if (typeof response.content === "string") return response.content;
    if (Array.isArray(response.content))
      return response.content.map((b) => b.text).join("");
    if (
      Array.isArray(response.choices) &&
      typeof response.choices[0]?.message?.content === "string"
    )
      return response.choices[0].message.content;

    throw new Error("Formato de respuesta inesperado: " + JSON.stringify(response));
  } catch (err) {
    console.error("Error en getRecipeFromClaude:", err);
    throw err;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { ingredients } = JSON.parse(req.body);

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: "Ingredientes inválidos" });
    }

    const receta = await getRecipeFromClaude(ingredients);

    // Siempre devolver JSON
    res.status(200).json({ receta });
  } catch (err) {
    console.error("Error en /api/generate-recipe:", err);

    const message =
      typeof err === "string"
        ? err
        : err?.message || "Error desconocido en serverless";

    // Devolver JSON aunque haya error
    res.status(500).json({ error: message });
  }
}
