# client/Dockerfile

# 1) Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy only package manifests, install deps
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of your app and build
COPY . .
RUN npm run build

# 2) Serve with nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
