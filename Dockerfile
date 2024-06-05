
ARG NODE_VERSION=20.12.1

FROM node:${NODE_VERSION}-alpine

FROM node
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]