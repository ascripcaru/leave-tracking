FROM node:10.16.0

ENV NODE_ENV=development
ENV PORT=3000
ENV API_URL=http://localhost:4040/api/

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .

RUN npm i -g aurelia-cli@0.35.1
RUN npm i

EXPOSE 3000

ENTRYPOINT ["npm", "start"]
