FROM node:20-alpine AS build
ARG NG_CONFIG=production
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn config set network-timeout 300000 && yarn install --frozen-lockfile
COPY . .
RUN yarn build --configuration=${NG_CONFIG}

FROM nginx:alpine
COPY --from=build /app/dist/photocalia/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
