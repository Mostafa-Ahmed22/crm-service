FROM node:20-alpine AS development

RUN apk add --no-cache python3 make g++

RUN apk add --no-cache openssl


WORKDIR /app

COPY package*.json ./

RUN npm ci

CMD ["sh", "-c", "npm run generate-postgres && npm run start:dev"]