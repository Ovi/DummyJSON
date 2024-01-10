# Use the official Node.js image as the base image
FROM node:17.9.1-alpine

# Create and set the working directory inside the container
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# copy custom fonts folder for fontconfig
COPY ./fonts /usr/share/fonts
# install fontconfig
RUN apk add --no-cache fontconfig
# clear any font cache for fontconfig
RUN fc-cache -f -v

COPY ./package.json /usr/src/app/
RUN npm install -g yarn --force && yarn install

COPY ./ /usr/src/app
ENV NODE_ENV production
ENV PORT 80
EXPOSE 80
CMD [ "yarn", "start" ]
