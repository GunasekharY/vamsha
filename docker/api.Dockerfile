FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
COPY packages/graph-engine/package.json packages/graph-engine/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json

RUN npm install

COPY . .

WORKDIR /app/apps/api

EXPOSE 4000

CMD ["npm", "run", "start:dev"]
