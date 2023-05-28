FROM node:18-alpine as build
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn rest build
RUN yarn events build
RUN yarn orchestrator build
RUN rm -rf node_modules
RUN mv docker/.yarnclean .yarnclean
RUN yarn install --production
RUN yarn autoclean --force

FROM node:18-alpine as rest
COPY --from=build /app /app
WORKDIR /app
RUN rm -rf packages/rest/src packages/events packages/eslint-config packages/orchestrator
CMD ["yarn", "rest", "start"]

FROM node:18-alpine as events
COPY --from=build /app /app
WORKDIR /app
RUN rm -rf packages/events/src packages/rest packages/eslint-config packages/orchestrator
CMD ["yarn", "events", "start"]

FROM node:18-alpine as orchestrator
COPY --from=build /app /app
WORKDIR /app
RUN rm -rf packages/events/src packages/rest packages/eslint-config packages/orchestrator
CMD ["yarn", "orchestrator", "start"]
