# syntax=docker/dockerfile:1

# ============================================
# Builder stage
# ============================================
FROM oven/bun:1.3.7-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
