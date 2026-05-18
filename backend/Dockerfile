# Backend Dockerfile — AgTradeGroup E-Commerce
FROM node:20-alpine AS base

WORKDIR /app

# Install build tools needed for native modules (bcrypt, etc.)
RUN apk add --no-cache python3 make g++

# Install dependencies first (layer caching)
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable && corepack prepare pnpm@latest --activate && pnpm install --frozen-lockfile --prod; \
  elif [ -f yarn.lock ]; then \
    yarn install --frozen-lockfile --production; \
  elif [ -f package-lock.json ]; then \
    npm ci; \
  else \
    npm install --omit=dev; \
  fi

# Copy source
COPY . .

# Generate Prisma client before building
RUN npx prisma generate

# Build TypeScript
RUN npx tsc

# Create uploads directory
RUN mkdir -p /app/uploads

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Runtime user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs && \
    chown -R nodejs:nodejs /app/uploads /app/docker-entrypoint.sh

USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3001/api/v1/health || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
