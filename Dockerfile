# ==============================================================================
# TIKTOK AUTO STUDIO — DOCKERFILE PRODUCTION UNIFIÉ (FRONTEND + API FASTIFY)
# ==============================================================================

# Étape 1 : Construction (Builder)
FROM node:20-alpine AS builder

WORKDIR /app

# Outils système requis pour compilation native (sharp, prisma)
RUN apk add --no-cache libc6-compat python3 make g++

# Installation de pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copie des manifestes de dépendances (cache Docker optimisé)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Installation des dépendances complètes
RUN pnpm install --frozen-lockfile

# Copie de tout le code source
COPY . .

# 1. Génération du client Prisma ORM
RUN pnpm --filter @tiktok-studio/api prisma generate

# 2. Compilation de l'interface Web React (Vite -> apps/web/dist)
RUN pnpm --filter @tiktok-studio/web build

# 3. Compilation de l'API Fastify TypeScript (tsc -> apps/api/dist)
RUN pnpm --filter @tiktok-studio/api build

# ==============================================================================
# Étape 2 : Image d'Exécution Minimale (Production Runner)
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Dépendances système d'exécution (OpenSSL pour Prisma, ffmpeg optionnel pour rendu)
RUN apk add --no-cache openssl ffmpeg

RUN corepack enable && corepack prepare pnpm@latest --activate

ENV NODE_ENV=production
ENV PORT=4000

# Copie des fichiers nécessaires depuis le builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/apps/web/dist ./apps/web/dist

# Répertoire de travail sur l'API
WORKDIR /app/apps/api

# Exposition du port
EXPOSE 4000

# Script de démarrage : push du schéma Prisma puis démarrage du serveur Fastify
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/index.js"]
