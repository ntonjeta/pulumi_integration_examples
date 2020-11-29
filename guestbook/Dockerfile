FROM node:slim

WORKDIR /app

## Copy package.json and package-lock.json before copy other files for better build caching
COPY ["./package.json", "./package-lock.json", "/app/"]
RUN npm install

COPY [ ".", "/app/" ] 
EXPOSE 3000
CMD ["npm", "start"]

