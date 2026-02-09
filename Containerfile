FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

# Copy source and build
COPY . .
RUN bun run build

# Production
EXPOSE 3000
ENV NODE_ENV=production
CMD ["bun", "run", "src/server.ts"]
