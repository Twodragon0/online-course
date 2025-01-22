FROM node:18-alpine AS base

# 필수 패키지만 설치
RUN apk add --no-cache libc6-compat

FROM base AS deps
WORKDIR /app

# npm 설치 최적화를 위한 환경 변수 설정
ENV NODE_ENV=production
ENV PRISMA_CLI_BINARY_TARGETS=linux-musl
ENV PRISMA_CLIENT_ENGINE_TYPE=binary
ENV npm_config_registry=https://registry.npmjs.org/
ENV npm_config_fetch_retry_maxtimeout=60000
ENV npm_config_fetch_timeout=60000

# package.json과 lock 파일 복사
COPY package*.json ./

# 빠른 설치를 위한 npm 설정
RUN npm set progress=false && \
    npm config set depth 0 && \
    npm install --prefer-offline --no-audit

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=1

RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]