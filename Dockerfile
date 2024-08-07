FROM node

WORKDIR /serverScopeWork

COPY package.json .

RUN npm install

COPY . .

EXPOSE 7000

CMD ["npm", "run","start"]