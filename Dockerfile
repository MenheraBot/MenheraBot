FROM node:18-alpine as build
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn build:all
RUN rm -rf node_modules
RUN yarn install --production
RUN mv docker/.yarnclean .yarnclean
RUN yarn autoclean --force

FROM gcr.io/distroless/nodejs18-debian12 as rest
WORKDIR /app
COPY --from=build /app/packages/rest/dist  ./
COPY --from=build /app/packages/rest/node_modules ./node_modules 
ENV NODE_ENV=production
CMD ["index.js"]

FROM node:18-alpine as events
WORKDIR /app
COPY --from=build /app/packages/rest/dist  ./
COPY --from=build /app/packages/rest/node_modules ./node_modules 
CMD ["yarn", "start"]

FROM gcr.io/distroless/nodejs18-debian12 as orchestrator
WORKDIR /app
COPY --from=build /app/packages/orchestrator/dist ./
COPY --from=build /app/packages/orchestrator/node_modules ./node_modules 
ENV NODE_ENV=production
CMD ["index.js"]
