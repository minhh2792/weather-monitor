FROM oven/bun:alpine AS base

WORKDIR /collector
COPY ["package.json", "bun.lockb", "./"]
RUN bun install
COPY . .

CMD ["bun", "run", "start"]
