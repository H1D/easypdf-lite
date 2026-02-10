FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production
COPY . .
RUN bun run build

FROM joseluisq/static-web-server:2
COPY --from=build /app/public /public
COPY sws.toml /config.toml
ENV SERVER_CONFIG_FILE=/config.toml
EXPOSE 3000
