# 🗄️ MySQL 資料庫設定指南

## 選項 1：使用 PlanetScale（推薦，雲端 MySQL）

### 1. 建立 PlanetScale 帳號
1. 前往 [PlanetScale](https://planetscale.com/)
2. 點擊 "Sign up" 註冊
3. 選擇 "Start with Hobby"（免費方案）

### 2. 建立資料庫
1. 登入後點擊 "Create database"
2. 資料庫名稱：`young-massage-crm`
3. 選擇離您最近的區域（如 Asia Pacific）
4. 點擊 "Create database"

### 3. 取得連線字串
1. 點擊資料庫名稱進入詳情頁
2. 點擊 "Connect" 按鈕
3. 選擇 "Node.js"
4. 複製連線字串，格式如下：
   ```
   mysql://username:password@aws.connect.psdb.cloud/young-massage-crm?sslaccept=strict
   ```

### 4. 設定環境變數
將連線字串貼到 `server/.env` 檔案中：
```env
DATABASE_URL="mysql://username:password@aws.connect.psdb.cloud/young-massage-crm?sslaccept=strict"
```

## 選項 2：使用本地 XAMPP

### 1. 下載安裝 XAMPP
1. 前往 [XAMPP 官網](https://www.apachefriends.org/zh_tw/index.html)
2. 下載 Windows 版本
3. 安裝並啟動 XAMPP Control Panel

### 2. 啟動 MySQL
1. 在 XAMPP Control Panel 中點擊 MySQL 旁邊的 "Start"
2. 確認 MySQL 運行在端口 3306

### 3. 建立資料庫
1. 開啟瀏覽器前往 `http://localhost/phpmyadmin`
2. 點擊 "New" 建立新資料庫
3. 資料庫名稱：`young_massage_crm`
4. 字符集：`utf8mb4_unicode_ci`

### 4. 設定環境變數
在 `server/.env` 檔案中設定：
```env
DATABASE_URL="mysql://root:@localhost:3306/young_massage_crm"
```

## 選項 3：使用 Docker（如果已安裝 Docker）

### 1. 啟動 MySQL 容器
```bash
docker run --name mysql-dev -e MYSQL_ROOT_PASSWORD=password123 -e MYSQL_DATABASE=young_massage_crm -p 3306:3306 -d mysql:8.0
```

### 2. 設定環境變數
```env
DATABASE_URL="mysql://root:password123@localhost:3306/young_massage_crm"
```

## 下一步：執行資料庫遷移

選擇任一方式設定好 MySQL 後，執行以下命令：

```bash
# 進入 server 目錄
cd server

# 執行資料庫遷移
npx prisma migrate dev --name init

# 生成 Prisma 客戶端
npx prisma generate
```

## 驗證設定

執行以下命令測試資料庫連線：
```bash
npx prisma studio
```

這會開啟 Prisma Studio 網頁界面，讓您查看和管理資料庫。
