import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
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
    origin: [env.FRONTEND_URL],
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

  try {
    const address = await server.listen({ port: env.PORT, host: "0.0.0.0" });
    server.log.info(`🚀 API Node.js démarrée avec succès sur ${address}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== "test") {
  bootstrap();
}
