FROM node:10.16.0

ARG NODE_ENV
ARG PORT
ARG API_URL
ARG VAPID_PUBLIC_KEY

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .

RUN npm i -g aurelia-cli@0.35.1
RUN npm i

RUN echo "#!/bin/sh \n\
au build --env prod --api_url $API_URL --vapid_public_key $VAPID_PUBLIC_KEY && \
node ./server.js" > /start.sh && chmod +x /start.sh

EXPOSE 3000

ENTRYPOINT ["/start.sh"]
