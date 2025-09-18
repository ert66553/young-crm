# 📦 專案遷移檢查清單

## 在當前電腦上準備

### ✅ 軟體安裝
- [ ] 安裝 Git
- [ ] 安裝 Node.js 18+
- [ ] 安裝 Cursor IDE

### ✅ 專案準備
- [ ] 建立 `.gitignore` 檔案
- [ ] 檢查所有檔案是否完整
- [ ] 測試專案是否能正常運行

### ✅ 選擇遷移方式
- [ ] **方法 1：Git + GitHub**（推薦）
  - [ ] 建立 GitHub 倉庫
  - [ ] 初始化 Git
  - [ ] 推送代碼到 GitHub
- [ ] **方法 2：檔案複製**
  - [ ] 壓縮專案資料夾
  - [ ] 複製到 USB 或雲端硬碟
- [ ] **方法 3：雲端同步**
  - [ ] 將專案放在雲端硬碟中

## 在新電腦上設定

### ✅ 環境安裝
- [ ] 安裝 Node.js 18+
- [ ] 安裝 Cursor IDE
- [ ] 安裝 Git（如果使用 Git 方法）

### ✅ 專案設定
- [ ] 克隆/複製專案到新電腦
- [ ] 進入專案目錄
- [ ] 執行 `npm run install:all`

### ✅ 環境變數設定
- [ ] 複製 `server/env.example` 到 `server/.env`
- [ ] 複製 `client/env.example` 到 `client/.env`
- [ ] 編輯環境變數檔案

### ✅ 資料庫設定
- [ ] 選擇資料庫方式：
  - [ ] Docker MySQL
  - [ ] XAMPP MySQL
  - [ ] PlanetScale MySQL
- [ ] 執行資料庫遷移：`cd server && npx prisma migrate dev`
- [ ] 生成 Prisma 客戶端：`npx prisma generate`

### ✅ 測試運行
- [ ] 啟動後端：`cd server && npm run dev`
- [ ] 啟動前端：`cd client && npm start`
- [ ] 測試 API 連線
- [ ] 測試資料庫連線

## 🚀 快速開始命令

在新電腦上執行以下命令：

```bash
# 1. 克隆專案（如果使用 Git）
git clone https://github.com/yourusername/young-crm.git
cd young_crm

# 2. 安裝依賴
npm run install:all

# 3. 設定環境變數
cd server && copy env.example .env
cd ../client && copy env.example .env

# 4. 設定資料庫（選擇一種方式）
# 方式 A：Docker
docker run --name mysql-dev -e MYSQL_ROOT_PASSWORD=password123 -e MYSQL_DATABASE=young_massage_crm -p 3306:3306 -d mysql:8.0

# 方式 B：XAMPP（需要先安裝 XAMPP）
# 啟動 XAMPP 中的 MySQL

# 方式 C：PlanetScale（需要先建立資料庫）
# 設定 DATABASE_URL 環境變數

# 5. 執行資料庫遷移
cd server
npx prisma migrate dev --name init
npx prisma generate

# 6. 啟動開發伺服器
npm run dev
```

## 📞 遇到問題時

1. **依賴安裝失敗**：檢查 Node.js 版本是否為 18+
2. **資料庫連線失敗**：檢查環境變數設定
3. **端口被占用**：更改端口或停止占用端口的程序
4. **權限問題**：以管理員身份執行命令提示字元

## 🔄 持續開發

使用 Git 方法可以輕鬆同步代碼：
```bash
# 推送更改
git add .
git commit -m "描述更改內容"
git push origin main

# 拉取最新代碼
git pull origin main
```

