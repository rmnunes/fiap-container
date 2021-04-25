FROM node:lts-buster-slim
ENV NODE_ENV=production
RUN export HOST_IP=$(ifconfig | grep -E "([0-9]{1,3}\.){3}[0-9]{1,3}" | grep -v 127.0.0.1 | awk '{ print $2 }' | cut -f2 -d: | head -n1)
WORKDIR /app

COPY ["package.json", "./"]

RUN npm install
COPY . .

RUN npm install -g pm2
RUN npm install -g typescript

RUN npm run build:prod
CMD [ "node", "dist/server.js" ]