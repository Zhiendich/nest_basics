FROM node:20-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./


RUN yarn install --frozen-lockfile && yarn cache clean

COPY . .

RUN npx prisma generate

RUN yarn build

FROM node:20-alpine

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY /.env  package.json yarn.lock ./


RUN yarn install --frozen-lockfile -immutable --production && yarn cache clean

EXPOSE 5000

CMD ["yarn", "start:docker"]