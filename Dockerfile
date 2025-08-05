FROM node:lts AS dist
WORKDIR /app
COPY package.json yarn.lock ./
COPY .yarn/ .yarn/
COPY .yarnrc.yml ./

RUN yarn install --immutable

COPY . ./

RUN yarn build:prod

FROM node:lts AS node_modules
WORKDIR /app
COPY package.json yarn.lock ./
COPY .yarn/ .yarn/
COPY .yarnrc.yml ./

RUN yarn workspaces focus --production --all

FROM node:lts

ARG PORT=3000

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY --from=dist /app/dist ./dist
COPY --from=node_modules /app/node_modules ./node_modules

COPY package.json yarn.lock ./
COPY .yarn/ .yarn/
COPY .yarnrc.yml ./

EXPOSE $PORT

CMD ["yarn", "start:prod"]
