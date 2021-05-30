FROM node:14.15

RUN mkdir -p /usr/home/main
WORKDIR /usr/home/main

COPY . /usr/home/main/
RUN npm install && npm run build

CMD [ "npm", "run", "dev:builded" ]
