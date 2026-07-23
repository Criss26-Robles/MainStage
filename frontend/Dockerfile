# ---- Stage 1: install dependencies ----
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci \
  && rm -rf /root/.npm

# ---- Development (Vite HMR) ----
FROM deps AS development

COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

# ---- Stage 2: build static assets ----
FROM deps AS builder

COPY . .
RUN npm run build

# ---- Stage 3: minimal runtime (nginx) ----
FROM nginx:1.27-alpine AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
