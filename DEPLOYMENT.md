# 揚翼運動按摩會員系統 - 部署指南

## 🚀 快速開始

### 1. 環境需求

- Node.js 18+ 
- PostgreSQL 12+
- Redis 6+
- Docker (可選)

### 2. 本地開發環境設定

#### 後端設定

```bash
# 進入後端目錄
cd server

# 安裝依賴
npm install

# 複製環境變數檔案
cp env.example .env

# 編輯環境變數
# 設定資料庫連線、JWT密鑰、LINE API等

# 執行資料庫遷移
npm run migrate

# 啟動開發伺服器
npm run dev
```

#### 前端設定

```bash
# 進入前端目錄
cd client

# 安裝依賴
npm install

# 複製環境變數檔案
cp env.example .env

# 編輯環境變數
# 設定API URL、LINE Channel ID等

# 啟動開發伺服器
npm start
```

### 3. 環境變數設定

#### 後端 (.env)

```env
# 資料庫設定
DATABASE_URL="postgresql://username:password@localhost:5432/young_massage_crm"

# Redis設定
REDIS_URL="redis://localhost:6379"

# JWT設定
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# LINE設定
LINE_CHANNEL_ID="your-line-channel-id"
LINE_CHANNEL_SECRET="your-line-channel-secret"
LINE_ACCESS_TOKEN="your-line-access-token"

# 伺服器設定
PORT=5000
NODE_ENV=production

# 前端URL
FRONTEND_URL="https://yourdomain.com"
```

#### 前端 (.env)

```env
# API設定
REACT_APP_API_URL=https://api.yourdomain.com/api

# LINE設定
REACT_APP_LINE_CHANNEL_ID=your-line-channel-id

# 應用程式設定
REACT_APP_APP_NAME=揚翼運動按摩
REACT_APP_VERSION=1.0.0
```

## 🐳 Docker 部署

### 1. 使用 Docker Compose

```bash
# 啟動所有服務
docker-compose up -d

# 查看日誌
docker-compose logs -f

# 停止服務
docker-compose down
```

### 2. 個別容器部署

#### 後端容器

```bash
# 建置後端映像
cd server
docker build -t young-massage-api .

# 執行後端容器
docker run -d \
  --name young-massage-api \
  -p 5000:5000 \
  -e DATABASE_URL="postgresql://username:password@host:5432/dbname" \
  -e REDIS_URL="redis://host:6379" \
  -e JWT_SECRET="your-jwt-secret" \
  -e LINE_CHANNEL_ID="your-line-channel-id" \
  -e LINE_CHANNEL_SECRET="your-line-channel-secret" \
  -e LINE_ACCESS_TOKEN="your-line-access-token" \
  young-massage-api
```

## ☁️ 雲端部署

### 1. Vercel 部署 (前端)

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入 Vercel
vercel login

# 部署前端
cd client
vercel --prod
```

### 2. Railway 部署 (後端)

```bash
# 安裝 Railway CLI
npm install -g @railway/cli

# 登入 Railway
railway login

# 初始化專案
railway init

# 部署後端
railway up
```

### 3. Heroku 部署

#### 後端部署

```bash
# 安裝 Heroku CLI
# 登入 Heroku
heroku login

# 建立應用程式
heroku create young-massage-api

# 設定環境變數
heroku config:set DATABASE_URL="postgresql://..."
heroku config:set JWT_SECRET="your-jwt-secret"
heroku config:set LINE_CHANNEL_ID="your-line-channel-id"
heroku config:set LINE_CHANNEL_SECRET="your-line-channel-secret"
heroku config:set LINE_ACCESS_TOKEN="your-line-access-token"

# 部署
git push heroku main
```

#### 前端部署

```bash
# 建置前端
cd client
npm run build

# 部署到 Heroku
# 需要建立一個簡單的 Express 伺服器來提供靜態檔案
```

## 🗄️ 資料庫設定

### 1. PostgreSQL 設定

```sql
-- 建立資料庫
CREATE DATABASE young_massage_crm;

-- 建立使用者
CREATE USER young_massage_user WITH PASSWORD 'your_password';

-- 授權
GRANT ALL PRIVILEGES ON DATABASE young_massage_crm TO young_massage_user;
```

### 2. 執行資料庫遷移

```bash
cd server
npm run migrate
```

### 3. 建立初始資料

```bash
# 執行種子資料腳本
npm run seed
```

## 📱 LINE 官方帳號設定

### 1. 建立 LINE Channel

1. 前往 [LINE Developers Console](https://developers.line.biz/)
2. 建立新的 Provider
3. 建立 Messaging API Channel
4. 記錄 Channel ID 和 Channel Secret

### 2. 設定 Webhook

1. 在 Channel 設定中啟用 Webhook
2. 設定 Webhook URL: `https://yourdomain.com/api/line/webhook`
3. 驗證 Webhook 設定

### 3. 取得 Access Token

1. 在 Channel 設定中生成 Channel Access Token
2. 將 Token 設定到環境變數中

## 🔧 系統設定

### 1. 反向代理設定 (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # 前端靜態檔案
    location / {
        root /var/www/young-massage-crm/client/build;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. SSL 憑證設定

```bash
# 使用 Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 📊 監控和日誌

### 1. 應用程式監控

```bash
# 使用 PM2 管理 Node.js 應用程式
npm install -g pm2

# 啟動應用程式
pm2 start server/dist/index.js --name "young-massage-api"

# 監控
pm2 monit

# 日誌
pm2 logs young-massage-api
```

### 2. 資料庫監控

```bash
# 使用 pgAdmin 或類似工具監控 PostgreSQL
# 設定資料庫備份
pg_dump young_massage_crm > backup.sql
```

## 🔒 安全性設定

### 1. 環境變數安全

- 使用強密碼
- 定期更換 JWT Secret
- 限制資料庫存取權限
- 使用 HTTPS

### 2. 防火牆設定

```bash
# 只開放必要端口
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 3. 資料庫安全

```sql
-- 限制連線數
ALTER SYSTEM SET max_connections = 100;

-- 啟用 SSL
ALTER SYSTEM SET ssl = on;
```

## 🚨 故障排除

### 1. 常見問題

**資料庫連線失敗**
- 檢查 DATABASE_URL 設定
- 確認資料庫服務是否運行
- 檢查防火牆設定

**LINE Webhook 驗證失敗**
- 檢查 LINE_CHANNEL_SECRET 設定
- 確認 Webhook URL 可訪問
- 檢查伺服器 SSL 憑證

**前端無法連接到 API**
- 檢查 REACT_APP_API_URL 設定
- 確認 CORS 設定
- 檢查網路連線

### 2. 日誌檢查

```bash
# 後端日誌
pm2 logs young-massage-api

# Nginx 日誌
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 資料庫日誌
sudo tail -f /var/log/postgresql/postgresql-*.log
```

## 📈 效能優化

### 1. 資料庫優化

```sql
-- 建立索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
```

### 2. 快取設定

```bash
# Redis 設定
redis-cli CONFIG SET maxmemory 256mb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### 3. CDN 設定

- 使用 CloudFlare 或類似服務
- 設定靜態資源快取
- 啟用 Gzip 壓縮

## 🔄 備份和恢復

### 1. 資料庫備份

```bash
# 每日備份腳本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump young_massage_crm > /backup/db_backup_$DATE.sql
```

### 2. 檔案備份

```bash
# 備份上傳檔案
tar -czf /backup/uploads_$(date +%Y%m%d).tar.gz /var/www/uploads/
```

### 3. 恢復程序

```bash
# 恢復資料庫
psql young_massage_crm < db_backup_20231201_120000.sql

# 恢復檔案
tar -xzf uploads_20231201.tar.gz -C /
```

## 📞 技術支援

如有問題，請聯繫技術支援團隊或查看以下資源：

- [專案文檔](./README.md)
- [API 文檔](./docs/API.md)
- [常見問題](./docs/FAQ.md)
- [更新日誌](./CHANGELOG.md)
