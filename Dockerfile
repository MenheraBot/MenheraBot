FROM node:16.6-alpine

WORKDIR /usr/home/main

COPY . /usr/home/main/
RUN npm install && npm run build

CMD [ "npm", "run", "dev" ]
