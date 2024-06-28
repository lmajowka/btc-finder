FROM node:14
WORKDIR /usr/src/app
RUN git clone -b main --single-branch --depth=1 https://github.com/lmajowka/btc-finder.git
WORKDIR /usr/src/app/btc-finder
RUN rm -rf .git
RUN npm install
CMD ["npm", "start"]