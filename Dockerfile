FROM node:20-alpine AS development

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

RUN npm ci

CMD ["sh", "-c", "npx prisma generate && npm run start:dev"]