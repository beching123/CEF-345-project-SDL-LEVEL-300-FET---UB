# Backend Dockerfile - Multi-stage build for Node.js

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app/backend

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY backend/ .

# Run tests (optional - comment out if desired)
RUN npm test -- --passWithNoTests || true

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app/backend

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy only necessary files from builder
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/backend/*.js ./

# Copy data.json if it exists
COPY backend/data.json* ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/reports/count', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
