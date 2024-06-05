
FROM node:18.10.0

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

RUN npm install -g nodemon

# Bundle app source
COPY . .

# Expose port
EXPOSE 3000

# Run app
CMD [ "nodemon", "-L", "server.js" ]