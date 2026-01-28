# syntax=docker/dockerfile:1

# ============================================
# Builder stage
# ============================================
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Build argument for API URL (required at build time for Vite)
ARG VITE_API_URL
ENV VITE_API_URL=https://api.soundboard.zetsumei.xyz

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application (bypass package.json to avoid symlink issues)
RUN bun ./node_modules/vite/bin/vite.js build

# ============================================
# Production stage
# ============================================
FROM nginx:alpine AS production

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx configuration for SPA with port 3005
RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 3005;
    listen [::]:3005;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/javascript application/javascript application/json image/svg+xml;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

EXPOSE 3005

CMD ["nginx", "-g", "daemon off;"]
