# Frontend Dockerfile — AgTradeGroup E-Commerce
FROM node:20-alpine AS base

# Build args for public env vars
ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
ARG NEXT_PUBLIC_BASE_URL=http://localhost:3000
ARG UPLOAD_PROXY_URL=http://backend:3001
ARG NEXT_PUBLIC_WHATSAPP_NUMBER=38344123456
ARG NEXT_PUBLIC_FREE_DELIVERY_CITY=Ferizaj
ARG NEXT_PUBLIC_DELIVERY_FEE=2
ARG NEXT_PUBLIC_CURRENCY=EUR

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV UPLOAD_PROXY_URL=$UPLOAD_PROXY_URL
ENV NEXT_PUBLIC_WHATSAPP_NUMBER=$NEXT_PUBLIC_WHATSAPP_NUMBER
ENV NEXT_PUBLIC_FREE_DELIVERY_CITY=$NEXT_PUBLIC_FREE_DELIVERY_CITY
ENV NEXT_PUBLIC_DELIVERY_FEE=$NEXT_PUBLIC_DELIVERY_FEE
ENV NEXT_PUBLIC_CURRENCY=$NEXT_PUBLIC_CURRENCY

WORKDIR /app

# Dependencies
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable && corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile; \
  elif [ -f yarn.lock ]; then \
    yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
    npm ci; \
  else \
    npm install; \
  fi

# Source
COPY . .

# Build
RUN npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy only production files from build
COPY --from=base /app/public ./public
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static

USER nodejs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000 || exit 1

CMD ["node", "server.js"]
