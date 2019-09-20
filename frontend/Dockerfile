FROM node:10.16.0

ENV NODE_ENV=development
ENV PORT=3000
ENV API_URL=http://localhost:4040/api/
ENV VAPID_PUBLIC_KEY=""

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
