# 1. Build stage: install deps
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
RUN npm ci

# 2. Final stage: copy code & run
FROM node:18-alpine
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# expose port from your .env (default 4000)
EXPOSE 4000
CMD ["npm", "start"]