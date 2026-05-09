# syntax=docker/dockerfile:1.7
# `dev` runs Vite with HMR. `prod` produces a static bundle served by nginx.

FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=development
COPY package.json package-lock.json* ./
RUN npm install

# ---------- dev ----------
FROM base AS dev
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ---------- build ----------
FROM base AS build
ENV NODE_ENV=production
COPY . .
RUN npm run build

# ---------- prod (static site behind nginx) ----------
FROM nginx:1.27-alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
