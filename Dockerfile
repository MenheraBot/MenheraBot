FROM node:18-alpine as build
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn rest build
RUN yarn gateway build
RUN yarn events build
RUN rm -rf node_modules
RUN mv docker/.yarnclean .yarnclean
RUN yarn install --production
RUN yarn autoclean --force

FROM node:18-alpine as rest
COPY --from=build /app /app
WORKDIR /app
RUN rm -rf packages/rest/src packages/gateway packages/events packages/eslint-config
CMD ["yarn", "rest", "start"]

FROM node:18-alpine as gateway
COPY --from=build /app /app
WORKDIR /app
RUN rm -rf packages/gateway/src packages/rest packages/events packages/eslint-config
CMD ["yarn", "gateway", "start"]

FROM node:18-alpine as events
COPY --from=build /app /app
WORKDIR /app
RUN rm -rf packages/events/src packages/rest packages/gateway packages/eslint-config
CMD ["yarn", "events", "start"]
