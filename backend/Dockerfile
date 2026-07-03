# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies (including dev deps needed to compile TypeScript)
COPY package.json package-lock.json ./
RUN npm ci

# Compile TypeScript to dist/
COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from the build stage
COPY --from=build /app/dist ./dist

EXPOSE 5001
CMD ["node", "dist/server.js"]
