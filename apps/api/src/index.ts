import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import fastifyStatic from "@fastify/static";
import path from "path";
import fs from "fs";
import { env } from "./config/env";
import { tiktokAuthRoutes } from "./routes/auth/tiktok";
import { aiGenerateRoutes } from "./routes/ai/generate";
import { postsRoutes } from "./routes/posts";

export const server = Fastify({
  logger: {
    level: env.NODE_ENV === "production" ? "info" : "debug"
  }
});

async function bootstrap() {
  await server.register(cors, {
    origin: (origin, cb) => {
      // Autoriser requêtes locales, sans origine (serveur-à-serveur / même origine) et domaine configuré
      if (!origin) return cb(null, true);
      if (
        origin === env.FRONTEND_URL ||
        origin === env.API_URL ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1")
      ) {
        return cb(null, true);
      }
      return cb(null, true); // Tolérant pour déploiements hébergés
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  });

  await server.register(cookie, {
    secret: env.JWT_SECRET,
    hook: "onRequest"
  });

  await server.register(tiktokAuthRoutes, {
    prefix: "/api/auth/tiktok"
  });

  await server.register(aiGenerateRoutes, {
    prefix: "/api/ai"
  });

  await server.register(postsRoutes, {
    prefix: "/api/posts"
  });

  server.get("/health", async () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "tiktok-auto-studio-api",
      version: "1.0.0"
    };
  });

  // Détection & Hébergement unifié du Frontend Web (apps/web/dist)
  const candidateWebPaths = [
    process.env.WEB_DIST_PATH,
    path.resolve(__dirname, "../../web/dist"),
    path.resolve(__dirname, "../../../apps/web/dist"),
    path.resolve(__dirname, "../web/dist"),
    path.resolve(process.cwd(), "apps/web/dist"),
    path.resolve(process.cwd(), "../web/dist"),
    path.resolve(process.cwd(), "web/dist")
  ].filter(Boolean) as string[];

  const resolvedWebDist = candidateWebPaths.find(
    (p) => fs.existsSync(p) && fs.existsSync(path.join(p, "index.html"))
  );

  if (resolvedWebDist) {
    server.log.info(`📦 Frontend Web monté depuis : ${resolvedWebDist}`);
    await server.register(fastifyStatic, {
      root: resolvedWebDist,
      prefix: "/",
      wildcard: false
    });

    server.setNotFoundHandler((req, reply) => {
      if (req.raw.url && req.raw.url.startsWith("/api")) {
        return reply.code(404).send({
          statusCode: 404,
          error: "Not Found",
          message: `Route API introuvable : ${req.raw.url}`
        });
      }
      return reply.sendFile("index.html");
    });
  }

  try {
    const address = await server.listen({ port: env.PORT, host: "0.0.0.0" });
    server.log.info(`🚀 TikTok Auto Studio opérationnel sur ${address}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== "test") {
  bootstrap();
}
