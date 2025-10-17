FROM node:22-trixie-slim as builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json .
COPY src ./src
RUN npm run build

# Runtime stage
FROM node:22-trixie-slim

WORKDIR /app

# Copier les dépendances de production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copier les artefacts du build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Utilisateur non-root pour la sécurité
USER node

CMD ["node", "dist/index.js"]