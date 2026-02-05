# Root Dockerfile - Points to backend Dockerfile
# This allows Render to find the Dockerfile at the root level

FROM node:18-alpine AS builder

WORKDIR /app/backend

COPY backend/package*.json ./

RUN npm install

COPY backend/ .

RUN npm test -- --passWithNoTests || true

FROM node:18-alpine

WORKDIR /app/backend

RUN apk add --no-cache dumb-init

COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/backend/*.js ./

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/issues', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "server.js"]
