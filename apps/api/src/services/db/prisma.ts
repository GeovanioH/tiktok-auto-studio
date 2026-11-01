import { PrismaClient } from "@prisma/client";

declare global {
  // Déclaration globale pour éviter l'épuisement du pool sous HMR
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  global.prismaGlobal ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}

export * from "@prisma/client";
