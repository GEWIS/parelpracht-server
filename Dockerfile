FROM node:20
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends texlive-latex-recommended texlive-latex-extra texlive-fonts-recommended texlive-fonts-extra texlive-lang-all

COPY package.json /usr/src/app
COPY yarn.lock /usr/src/app
COPY tsconfig.json /usr/src/app
COPY ormconfig.json /usr/src/app
COPY tsoa.json /usr/src/app
COPY .yarnrc.yml /usr/src/app

COPY build /usr/src/app
COPY src /usr/src/app/src
COPY templates /usr/src/app/templates

RUN corepack enable
RUN yarn install --immutable
RUN npm install pm2@latest -g

ENV NODE_ENV=production

RUN yarn build
EXPOSE 3001

CMD ["pm2-runtime", "yarn", "--", "start"]
