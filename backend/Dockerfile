FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
# tsc only compiles .ts -> .js; Prisma's query engine binary is a non-TS asset that must be
# copied in separately so it ends up alongside the compiled client at dist/generated/prisma.
COPY --from=build /app/generated/prisma ./dist/generated/prisma
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
