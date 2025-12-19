// api/generate-recipe.js
import { Anthropic } from "@anthropic-ai/sdk";
import { Redis } from "@upstash/redis";

const SYSTEM_PROMPT = `
Eres un asistente que recibe una lista de ingredientes de un usuario y sugiere una receta que puede preparar  
usando algunos o todos esos ingredientes. No necesitas usar cada ingrediente que mencione,  
pero intenta no añadir demasiados extras. Si el usuario incluye elementos que no sean comestibles  
(por ejemplo: ladrillo, jabón, ropa, mueble, automóvil o herramientas), debes responder exactamente:  
“Por favor ingresa sólo ingredientes de cocina comestibles.” y no generar ninguna receta hasta que la lista sea válida.
- Evita combinaciones de sabores que normalmente no sean agradables o armónicas. Por ejemplo, no mezcles ingredientes como papa con atún, helado con salsas muy ácidas, ni ingredientes que den un sabor desagradable juntos.

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

// Las instancias se inicializarán dentro del handler para evitar errores si faltan las env vars al cargar el módulo
let anthropic;
let redis;

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
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

  try {
    const response = await fetch(url, { method: "POST" });
    const data = await response.json();

    console.log("ReCAPTCHA verification result:", data);

    // Si success es false, o si el score es bajo (threshold 0.3 para desarrollo)
    // Nota: localhost a veces devuelve scores bajos o fallos si no está configurado en el admin console
    return data.success && (data.score === undefined || data.score >= 0.3);
  } catch (err) {
    console.error("Error fetching ReCAPTCHA verification:", err);
    throw err;
  }
}

export default async function handler(req, res) {
  // Configuración de CORS si fuera necesario (opcional)
  // res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verificar variables de entorno críticas
  const requiredEnv = [
    "ANTHROPIC_CLAUDE_API_KEY",
    "RECAPTCHA_SECRET_KEY",
    "SECRET_FRONTEND_KEY",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN"
  ];
  const missingEnv = requiredEnv.filter(env => !process.env[env]);
  if (missingEnv.length > 0) {
    console.error("Faltan variables de entorno:", missingEnv);
    return res.status(500).json({ error: `Configuración de servidor incompleta. Faltan: ${missingEnv.join(", ")}` });
  }

  // Inicializar clientes
  if (!anthropic) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_CLAUDE_API_KEY });
  }
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { ingredients, userId, recaptchaToken } = body;

    // ✅ Validar token secreto
    const secret = req.headers["x-secret-key"];
    if (secret !== process.env.SECRET_FRONTEND_KEY) {
      return res.status(401).json({ error: "No autorizado: x-secret-key inválida" });
    }

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: "Ingredientes inválidos o vacíos" });
    }

    if (!userId) {
      return res.status(400).json({ error: "userId es requerido" });
    }

    if (!recaptchaToken) {
      return res.status(400).json({ error: "recaptchaToken es requerido" });
    }

    // Verificar ReCaptcha (con opción de bypass para desarrollo)
    const host = req.headers.host || "";
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1");

    let isHuman = false;
    if (process.env.BYPASS_RECAPTCHA === "true" || isLocal) {
      console.log(`⚠️ reCAPTCHA bypass activado (Local: ${isLocal}, Env: ${process.env.BYPASS_RECAPTCHA})`);
      isHuman = true;
    } else {
      try {
        isHuman = await verifyRecaptcha(recaptchaToken);
      } catch (err) {
        console.error("Error validando reCAPTCHA:", err);
        return res.status(500).json({ error: "Error de conexión al validar ReCAPTCHA" });
      }
    }

    if (!isHuman) {
      console.log("❌ Validacion de Captcha falló:", { isLocal, host, bypass: process.env.BYPASS_RECAPTCHA });
      return res.status(403).json({ error: "Captcha inválido o insuficiente puntaje" });
    }

    // 🔹 Rate limit: 3 recetas / 24h
    const key = `rate:${userId}`;
    let usage = 0;
    try {
      usage = parseInt(await redis.get(key)) || 0;
    } catch (err) {
      console.error("Error en Redis (rate limit):", err);
      // Continuamos aunque Redis falle? Depende de la política.
    }

    if (usage >= 3) {
      return res.status(429).json({ error: "Has alcanzado el límite de 3 recetas por 24 horas" });
    }

    try {
      if (usage === 0) await redis.set(key, 1, { ex: 86400 }); // 24h
      else await redis.incr(key);
    } catch (err) {
      console.error("Error al actualizar rate limit en Redis:", err);
    }

    // 🔹 Cache de recetas 5 minutos
    const cacheKey = `recipe:${ingredients.join(",").toLowerCase()}`;
    let receta = null;
    try {
      receta = await redis.get(cacheKey);
    } catch (err) {
      console.error("Error en Redis (cache):", err);
    }

    if (!receta) {
      try {
        receta = await getRecipeFromClaude(ingredients);
      } catch (err) {
        console.error("Error al llamar a Anthropic:", err);
        return res.status(502).json({ error: "Error al generar la receta con la IA" });
      }

      try {
        await redis.set(cacheKey, receta, { ex: 300 }); // 5 minutos
      } catch (err) {
        console.error("Error al guardar cache en Redis:", err);
      }
    }

    // 🔹 Log para dashboard
    try {
      const logKey = `log:${userId}`;
      await redis.lpush(logKey, JSON.stringify({ ingredients, timestamp: Date.now() }));
    } catch (err) {
      console.error("Error al guardar log en Redis:", err);
    }

    res.status(200).json({ receta });
  } catch (err) {
    console.error("Error genérico en /api/generate-recipe:", err);
    const message = typeof err === "string" ? err : err?.message || "Error desconocido en el servidor";
    res.status(500).json({ error: message });
  }
}
