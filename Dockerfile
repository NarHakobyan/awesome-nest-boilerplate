FROM node:dubnium-alpine

ARG PORT=3000
RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json /usr/src/app/


RUN npm install

COPY . /usr/src/app

EXPOSE $PORT

CMD [ "npm", "run", "start:prod" ]
