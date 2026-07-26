# Build Stage
FROM node:22 AS build

WORKDIR /src

COPY package*.json ./

RUN npm install 

COPY . . 

RUN npm run build

# Runtime Stage
FROM nginx:alpine 

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /src/dist/cloud-learning-tracker-ui/browser/. /usr/share/nginx/html