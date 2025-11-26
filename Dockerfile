# BUILD FOR LOCAL DEVELOPMENT
FROM node:20-alpine AS development

WORKDIR /app

COPY --chown=node:node package*.json ./

RUN npm ci

COPY --chown=node:node . .

USER node


# Base image for production
FROM node:20-alpine AS build

WORKDIR /app

COPY --chown=node:node package*.json ./

COPY --chown=node:node --from=development /app/node_modules ./node_modules

COPY --chown=node:node . .

ENV DB_FILE_NAME=file:local.db

RUN npx drizzle-kit push

RUN npm run build

ENV NODE_ENV=production

RUN npm ci --only=production && npm cache clean --force

USER node


# Base image for production
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV DB_FILE_NAME=file:local.db

COPY --chown=node:node --from=build /app/package*.json ./
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/.next ./.next
COPY --chown=node:node --from=build /app/public ./public
COPY --chown=node:node --from=build /app/local.db ./

EXPOSE 3000

CMD ["npm", "start"]
