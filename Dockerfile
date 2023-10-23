FROM node:20
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends texlive-latex-recommended texlive-latex-extra texlive-fonts-recommended texlive-fonts-extra texlive-lang-all

COPY package*.json /usr/src/app
COPY tsconfig.json /usr/src/app
COPY ormconfig.json /usr/src/app
COPY tsoa.json /usr/src/app
COPY src /usr/src/app/src
COPY templates /usr/src/app/templates

RUN npm ci
RUN npm install pm2 -g

ENV NODE_ENV production

RUN npm run tsoa && npm run build
EXPOSE 3001

CMD ["pm2-runtime","/usr/src/app/dist/index.js"]
