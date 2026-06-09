FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm config set registry https://registry.npmmirror.com
RUN npm install --omit=dev

# 仅复制必要代码与资源，避免将无关文件打包进镜像
COPY src ./src
COPY database ./database
COPY package*.json ./

RUN mkdir -p uploads

EXPOSE 3000

CMD ["npm", "start"]
