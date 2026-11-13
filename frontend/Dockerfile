# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:alpine AS serve

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
