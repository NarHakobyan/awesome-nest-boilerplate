FROM node:25-slim AS base
RUN corepack enable

# --- Build stage: compile TypeScript ---
FROM base AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build:prod

# --- Production dependencies stage ---
FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# --- Final runtime image ---
FROM node:25-slim

ARG PORT=3000
ARG secret_manager_arn

ENV SECRET_MANAGER_ARN=$secret_manager_arn
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=8192"

WORKDIR /usr/src/app

COPY --from=build /app/dist ./dist
COPY --from=prod-deps /app/node_modules ./node_modules
COPY package.json ./

EXPOSE $PORT

CMD ["node", "dist/main.js"]
