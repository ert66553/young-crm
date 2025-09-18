FROM node:18-alpine

WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm ci --only=production

# 複製原始碼
COPY . .

# 建置 TypeScript
RUN npm run build

# 暴露端口
EXPOSE 5000

# 啟動應用程式
CMD ["npm", "start"]
