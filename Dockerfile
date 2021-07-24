FROM node:14.15-alpine

WORKDIR /usr/home/main

COPY . /usr/home/main/
RUN npm install && npm run build

CMD [ "npm", "run", "dev:builded" ]
