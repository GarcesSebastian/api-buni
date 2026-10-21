# Etapa 1: deps — dependencias completas para compilar TypeScript
FROM node:20.19.1-alpine3.21 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Etapa 2: build — compila src -> dist con tsconfig.build.json
FROM deps AS build
COPY . .
RUN npm run build

# Etapa 3: prod-deps — solo dependencias de producción
FROM node:20.19.1-alpine3.21 AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Etapa 4: runtime — imagen final mínima, no-root
FROM node:20.19.1-alpine3.21 AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN mkdir -p /app/uploads && chown -R node:node /app
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build     --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
USER node
EXPOSE 4000
VOLUME ["/app/uploads"]
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=5 \
  CMD ["node","-e","fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
CMD ["node","dist/index.js"]
