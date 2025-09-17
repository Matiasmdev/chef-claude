// ai.js

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
  apiKey: import.meta.env.VITE_CLAUDE_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function getRecipeFromClaude(ingredientsArr) {
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

    console.log("🔍 getRecipeFromClaude raw response:", response);

    // Si viene como string puro
    if (typeof response.content === "string") {
      return response.content;
    }

    // Si viene como array de bloques { type, text }
    if (Array.isArray(response.content)) {
      return response.content.map((b) => b.text).join("");
    }

    // Soporte adicional por si cambia la estructura
    if (
      Array.isArray(response.choices) &&
      typeof response.choices[0]?.message?.content === "string"
    ) {
      return response.choices[0].message.content;
    }

    throw new Error(
      "Formato de respuesta inesperado en getRecipeFromClaude: " +
        JSON.stringify(response)
    );
  } catch (err) {
    console.error("Error en getRecipeFromClaude:", err);
    throw err;
  }
}
