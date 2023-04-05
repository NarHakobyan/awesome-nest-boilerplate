# Build stage
FROM node:lts-alpine AS build
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . ./
RUN yarn build:prod

# Production dependencies stage
FROM node:lts-alpine AS node_modules
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --prod

# Final production image
FROM node:lts-alpine
ARG PORT=3000

WORKDIR /app

# Copy build output from build stage
COPY --from=build /app/dist ./dist
# Copy production node_modules from node_modules stage
COPY --from=node_modules /app/node_modules ./node_modules

# Remove unnecessary files (e.g., package.json, yarn.lock, and other source files) from the final image
COPY package.json yarn.lock ./

EXPOSE $PORT

CMD [ "yarn", "start:prod" ]