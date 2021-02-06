FROM node:14.15

RUN apt-get update && \
    apt-get upgrade -y

RUN apt-get install -y --no-install-recommends texlive-latex-recommended texlive-latex-extra texlive-fonts-recommended texlive-fonts-extra texlive-lang-all

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN npm install

COPY . /usr/src/app
RUN npm run build

ENV NODE_ENV docker

EXPOSE 3001

CMD [ "npm", "run", "start" ]
