FROM node:lts AS dist
COPY package.json yarn.lock ./

RUN yarn install

COPY . ./

RUN yarn build:prod

FROM node:lts AS node_modules
COPY package.json yarn.lock ./

RUN yarn install --prod

FROM node:lts

ARG PORT=3000
ARG secret_manager_arn

ENV SECRET_MANAGER_ARN=$secret_manager_arn
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=8192"

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY --from=dist dist /usr/src/app/dist
COPY --from=node_modules node_modules /usr/src/app/node_modules

COPY . /usr/src/app

EXPOSE $PORT

CMD [ "yarn", "start:prod" ]
