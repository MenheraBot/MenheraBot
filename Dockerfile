FROM node:16.6-alpine

WORKDIR /usr/home/main

COPY . /usr/home/main/
RUN yarn install
RUN yarn build

CMD [ "yarn", "dev" ]
