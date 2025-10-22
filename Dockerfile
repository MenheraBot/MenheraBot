FROM node:22-alpine AS build
WORKDIR /app
COPY . .
RUN corepack enable

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN apk --no-cache add curl && \
    curl -sL https://sentry.io/get-cli/ | SENTRY_CLI_VERSION="2.21.2" sh && \
    pnpm run -r build && \
    cd /app/packages/events && \
    sentry-cli sourcemaps inject ./dist

RUN pnpm deploy --filter=@menhera-bot/events --prod /prod/events --legacy
RUN pnpm deploy --filter=@menhera-bot/orchestrator --prod /prod/orchestrator --legacy

FROM node:22-alpine AS events
WORKDIR /app
RUN corepack enable
COPY --from=build /prod/events/dist  ./dist/
COPY --from=build /prod/events/locales  ./locales/
COPY --from=build /prod/events/package.json  ./
COPY --from=build /prod/events/node_modules ./node_modules 
CMD ["pnpm", "start"]

FROM gcr.io/distroless/nodejs22-debian12 AS orchestrator
WORKDIR /app
COPY --from=build /prod/orchestrator/dist ./
COPY --from=build /prod/orchestrator/node_modules ./node_modules 
ENV NODE_ENV=production
CMD ["index.js"]
