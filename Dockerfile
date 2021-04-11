FROM node:14.15-alpine
WORKDIR /usr
COPY package*.json ./
COPY tsconfig.json ./
COPY tsoa.json ./
COPY src ./src
RUN npm install
RUN npm run tsoa && npm run build

FROM node:14.15
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends texlive-latex-recommended texlive-latex-extra texlive-fonts-recommended texlive-fonts-extra texlive-lang-all && \
	mkdir -p /usr/src/app

WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
ENV NODE_ENV production

RUN npm ci

COPY --from=0 /usr/dist .
RUN npm install pm2 -g
EXPOSE 3001

CMD ["pm2-runtime","index.js"]
