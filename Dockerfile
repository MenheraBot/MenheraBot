FROM node:18-alpine as build
WORKDIR /app
COPY . .
RUN apk --no-cache add curl && \
    curl -sL https://sentry.io/get-cli/ | SENTRY_CLI_VERSION="2.21.2" sh && \
    yarn install && \ 
    yarn build:all && \
    rm -rf node_modules && \
    yarn install --production && \
    mv docker/.yarnclean .yarnclean && \
    yarn autoclean --force && \
    cd /app/packages/events && \
    sentry-cli sourcemaps inject ./dist

FROM gcr.io/distroless/nodejs18-debian12 as rest
WORKDIR /app
COPY --from=build /app/packages/rest/dist  ./
COPY --from=build /app/packages/rest/node_modules ./node_modules 
ENV NODE_ENV=production
CMD ["index.js"]

FROM node:18-alpine as events
WORKDIR /app
COPY --from=build /app/packages/events/dist  ./dist/
COPY --from=build /app/packages/events/locales  ./locales/
COPY --from=build /app/packages/events/package.json  ./
COPY --from=build /app/packages/events/node_modules ./node_modules 
CMD ["yarn", "start"]

FROM gcr.io/distroless/nodejs18-debian12 as orchestrator
WORKDIR /app
COPY --from=build /app/packages/orchestrator/dist ./
COPY --from=build /app/packages/orchestrator/node_modules ./node_modules 
ENV NODE_ENV=production
CMD ["index.js"]
