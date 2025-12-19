// api/dashboard.js
import { Redis } from "@upstash/redis";

let redis;

export default async function handler(req, res) {
  // Solo método GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Inicializar Redis
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  // Validar secret key
  const secret = req.headers["x-secret-key"];
  if (!secret || secret !== process.env.SECRET_FRONTEND_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Obtener todos los keys de logs y rate
    const keys = await redis.keys("log:*");
    const dashboard = {};

    for (const key of keys) {
      const userId = key.split(":")[1];
      const logs = await redis.lrange(key, 0, 50); // últimos 50 logs
      const rate = parseInt(await redis.get(`rate:${userId}`)) || 0;

      dashboard[userId] = {
        totalGeneradas: rate,
        ultimasRecetas: logs.map((l) => JSON.parse(l)),
      };
    }

    res.status(200).json(dashboard);
  } catch (err) {
    console.error("Error en dashboard:", err);
    res.status(500).json({ error: "Error desconocido" });
  }
}
