FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
COPY --from=build /app/dist/frontend ./dist/frontend
COPY --from=build /app/node_modules ./node_modules
EXPOSE 4000
CMD ["node", "dist/frontend/server/server.mjs"]
