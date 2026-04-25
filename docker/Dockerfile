# ─── Estágio 1: Build ──────────────────────────────────────────────────────────
# node:20-slim usa glibc (Debian) — mesmo ABI do host, compatível com
# binários nativos como lightningcss sem precisar baixar pacotes extras.
FROM node:20-slim AS builder

WORKDIR /app

# Copia node_modules do host (já instalado, sem acesso à internet no build)
#COPY node_modules ./node_modules
COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Variáveis disponíveis apenas em build-time (não ficam na imagem final)
ARG NEXT_TELEMETRY_DISABLED=1
ENV NEXT_TELEMETRY_DISABLED=$NEXT_TELEMETRY_DISABLED
ENV NODE_ENV=production

RUN npm run build

# ─── Estágio 2: Runner (imagem mínima) ─────────────────────────────────────────
FROM node:20-slim AS runner

WORKDIR /app

# Desabilita telemetria (não envia dados ao Next.js/Vercel)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Cria usuário e grupo sem privilégios (sintaxe Debian)
RUN groupadd --system --gid 1001 nodejs \
 && useradd  --system --uid 1001 --gid nodejs nextjs

# Copia apenas o output standalone e assets necessários
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static   ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public          ./public

# Remove qualquer referência a secret/env que possa ter ficado no cache de build
RUN find /app -name "*.env*" -delete 2>/dev/null || true

USER nextjs

EXPOSE 3000

# Healthcheck interno
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', r => process.exit(r.statusCode < 500 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "server.js"]
