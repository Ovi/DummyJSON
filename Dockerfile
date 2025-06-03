# Use the official Node.js image as the base image
FROM node:20.13.1-alpine3.18

# Create and set the working directory inside the container
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# copy custom fonts folder for fontconfig
COPY ./fonts /usr/share/fonts
# install fontconfig
RUN apk add --no-cache fontconfig
# clear any font cache for fontconfig
RUN fc-cache -f -v

# Copy package.json and install dependencies
COPY ./package.json /usr/src/app/
RUN npm install -g yarn --force && yarn install

# Copy the rest of the source code
COPY ./ /usr/src/app

# Run the pre-serialization script to generate .v8 cache files
RUN node scripts/prep-data.js

# Environment setup
ENV NODE_ENV production
ENV PORT 80
EXPOSE 80

# Start the app
CMD [ "yarn", "start" ]
