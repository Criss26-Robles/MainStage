# ---- Stage 1: install production dependencies ----
FROM node:22-alpine AS deps

WORKDIR /app

# openssl: Prisma engines on Alpine
RUN apk add --no-cache openssl

COPY package.json package-lock.json ./

RUN npm ci --omit=dev \
  && npm install prisma@6.19.3 --no-save \
  && rm -rf /root/.npm

# ---- Stage 2: build TypeScript + Prisma client ----
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate \
  && npm run build

# ---- Development (hot reload via docker-compose) ----
FROM node:22-alpine AS development

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate

# Fuera de /app para que el bind-mount de compose no lo pise
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
  && chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]

# ---- Stage 3: minimal runtime image ----
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3001

RUN apk add --no-cache openssl tini \
  && addgroup -S mainstage \
  && adduser -S mainstage -G mainstage

COPY --from=deps --chown=mainstage:mainstage /app/node_modules ./node_modules
COPY --from=builder --chown=mainstage:mainstage /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=mainstage:mainstage /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=mainstage:mainstage /app/dist ./dist
COPY --from=builder --chown=mainstage:mainstage /app/prisma ./prisma
COPY --chown=mainstage:mainstage package.json ./
COPY --chown=mainstage:mainstage docker-entrypoint.sh ./docker-entrypoint.sh

RUN sed -i 's/\r$//' /app/docker-entrypoint.sh \
  && chmod +x /app/docker-entrypoint.sh

USER mainstage

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||3001)+'/api/health',(r)=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

ENTRYPOINT ["/sbin/tini", "--", "/app/docker-entrypoint.sh"]
CMD ["node", "dist/src/server.js"]
