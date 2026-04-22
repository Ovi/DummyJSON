FROM node:24.14.1-alpine3.23

WORKDIR /usr/src/app

### Font Config ###
# Install runtime OS dependencies
RUN apk add --no-cache fontconfig
COPY ./fonts /usr/share/fonts
# Rebuild the font cache
RUN fc-cache -f

COPY ./package.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

COPY ./ ./

ENV NODE_ENV production
ENV PORT 80
EXPOSE 80

CMD ["node", "index.js"]
