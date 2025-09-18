// api/generate-recipe.js
import { Anthropic } from "@anthropic-ai/sdk";
import { Redis } from "@upstash/redis";
import fetch from "node-fetch"; // necesario si Vercel no tiene fetch global

const SYSTEM_PROMPT = `
Eres un chef virtual especializado en crear recetas deliciosas y prácticas a partir de ingredientes disponibles.

## Tu misión:
Analiza la lista de ingredientes del usuario y sugiere UNA receta que maximice el uso de esos ingredientes, priorizando combinaciones sabrosas y equilibradas.

## Reglas de validación:
- **VALIDACIÓN OBLIGATORIA**: Si detectas elementos no comestibles (objetos, herramientas, productos de limpieza, etc.), responde EXACTAMENTE: "Por favor ingresa sólo ingredientes de cocina comestibles." y detente ahí.
- **ARMONÍA CULINARIA**: Evita combinaciones que resulten desagradables al paladar (ej: chocolate con pescado, frutas cítricas con lácteos en preparaciones calientes, etc.)

## Estilo y personalidad:
- Usa español latinoamericano con expresiones argentinas naturales
- Incorpora frases como: "está para chuparse los dedos", "una pinturita", "más rico que el asado del domingo", "de rechupete"
- Mantén un tono cálido y entusiasta

## Formato de respuesta OBLIGATORIO:

# [Nombre creativo de la receta]

## [Descripción apetitosa en 1-2 líneas]

**Tiempo de preparación:** [X minutos]
**Porciones:** [X personas]

### Ingredientes:
- [cantidad] [ingrediente 1]
- [cantidad] [ingrediente 2]
- [ingrediente opcional - si mejora la receta]

### Preparación:
1. [Paso específico con técnica culinaria]
2. [Paso con tiempos y temperaturas cuando corresponda]
3. [Paso final con tip de presentación]

### Consejo del chef:
[Un tip práctico o variación sugerida]

---
**Frase de cierre:** Selecciona ALEATORIAMENTE una de estas opciones:
- "¡Que lo disfrutes!"
- "¡Buen provecho!"
- "¡A cocinar se ha dicho!"
- "Disfrútalo, que está de lujo."
- "¡Bon appétit, che!"
`;
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_CLAUDE_API_KEY, // backend
});

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
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

    if (typeof response.content === "string") return response.content;
    if (Array.isArray(response.content))
      return response.content.map((b) => b.text).join("");
    if (Array.isArray(response.choices) && typeof response.choices[0]?.message?.content === "string")
      return response.choices[0].message.content;

    throw new Error("Formato de respuesta inesperado: " + JSON.stringify(response));
  } catch (err) {
    console.error("Error en getRecipeFromClaude:", err);
    throw err;
  }
}

// Validar ReCaptcha v3 (solo backend)
async function verifyRecaptcha(token) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY; // backend
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;
  const res = await fetch(url, { method: "POST" });
  const data = await res.json();
  return data.success && data.score && data.score >= 0.5;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { ingredients, userId, recaptchaToken } = body;

    // ✅ Validar token secreto inventado por nosotros
    const secret = req.headers["x-secret-key"];
    if (secret !== process.env.SECRET_FRONTEND_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: "Ingredientes inválidos" });
    }

    if (!userId) {
      return res.status(400).json({ error: "userId es requerido" });
    }

    if (!recaptchaToken || !(await verifyRecaptcha(recaptchaToken))) {
      return res.status(403).json({ error: "Captcha inválido" });
    }

    // 🔹 Rate limit: 3 recetas / 24h
    const key = `rate:${userId}`;
    const usage = parseInt(await redis.get(key)) || 0;
    if (usage >= 3) return res.status(429).json({ error: "Has alcanzado el límite de 3 recetas por 24 horas" });
    if (usage === 0) await redis.set(key, 1, { ex: 86400 }); // 24h
    else await redis.incr(key);

    // 🔹 Cache de recetas 5 minutos
    const cacheKey = `recipe:${ingredients.join(",").toLowerCase()}`;
    let receta = await redis.get(cacheKey);
    if (!receta) {
      receta = await getRecipeFromClaude(ingredients);
      await redis.set(cacheKey, receta, { ex: 300 }); // 5 minutos
    }

    // 🔹 Log para dashboard
    const logKey = `log:${userId}`;
    await redis.lpush(logKey, JSON.stringify({ ingredients, timestamp: Date.now() }));

    res.status(200).json({ receta });
  } catch (err) {
    console.error("Error en /api/generate-recipe:", err);
    const message = typeof err === "string" ? err : err?.message || "Error desconocido en serverless";
    res.status(500).json({ error: message });
  }
}
