# client/Dockerfile

# 1) Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2) Runtime stage
FROM nginx:alpine

# Copy *your* nginx.conf over the default
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built files
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
