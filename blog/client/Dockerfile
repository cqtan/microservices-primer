FROM node:16-alpine

# Due to issue https://github.com/facebook/create-react-app/issues/8688, add this line
ENV CI=true

WORKDIR /app
COPY package.json ./
RUN npm install
COPY ./ ./

CMD ["npm", "start"]