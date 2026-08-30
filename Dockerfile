# 1. Base image for building
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package management files
COPY package*.json bun.lock* ./

# Install all dependencies
RUN npm install

# Copy source files
COPY . .

# Build frontend and server assets
RUN npm run build

# 2. Production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package*.json ./
RUN npm install --only=production

# Copy built assets and server file
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8080

# Run backend application server
CMD ["npx", "tsx", "server.ts"]
