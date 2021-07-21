FROM node:12

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

ENV PORT=80

EXPOSE 80

CMD ["npm", "start"]