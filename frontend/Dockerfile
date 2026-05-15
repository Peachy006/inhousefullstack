FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

FROM base AS dev
EXPOSE 3000
CMD ["npm", "run", "dev:local"]

FROM base AS prod
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
