# 🎯 Cursor 開發指南 - 揚翼運動按摩系統

## 在新電腦上使用 Cursor 開始開發

### 步驟 1：安裝必要軟體

#### 1.1 安裝 Cursor IDE
1. 前往 [Cursor 官網](https://cursor.sh/)
2. 下載並安裝 Cursor
3. 啟動 Cursor

#### 1.2 安裝 Node.js
1. 前往 [Node.js 官網](https://nodejs.org/)
2. 下載 LTS 版本（18+）
3. 安裝並重啟電腦

#### 1.3 安裝 Git
1. 前往 [Git 官網](https://git-scm.com/)
2. 下載並安裝 Git
3. 重啟命令提示字元

### 步驟 2：在 Cursor 中開啟專案

#### 2.1 克隆專案
在 Cursor 中：
1. 按 `Ctrl + Shift + P` 開啟命令面板
2. 輸入 `Git: Clone`
3. 輸入倉庫 URL：`https://github.com/ert66553/young-crm.git`
4. 選擇本地資料夾位置
5. 等待克隆完成

#### 2.2 開啟專案
1. 在 Cursor 中選擇 `File` → `Open Folder`
2. 選擇 `young-crm` 資料夾
3. 等待 Cursor 載入專案

### 步驟 3：設定開發環境

#### 3.1 開啟 Cursor 終端
1. 按 `Ctrl + `` (反引號) 開啟終端
2. 或選擇 `Terminal` → `New Terminal`

#### 3.2 安裝依賴
在 Cursor 終端中執行：
```bash
# 安裝所有依賴
npm run install:all
```

#### 3.3 設定環境變數
```bash
# 設定後端環境變數
cd server
copy env.example .env

# 設定前端環境變數
cd ../client
copy env.example .env
```

### 步驟 4：設定資料庫

#### 選項 A：PlanetScale（推薦）

1. **建立 PlanetScale 帳號**
   - 前往 [PlanetScale](https://planetscale.com/)
   - 註冊免費帳號

2. **建立資料庫**
   - 點擊 "Create database"
   - 名稱：`young-massage-crm`
   - 區域：選擇 Asia Pacific

3. **取得連線字串**
   - 點擊 "Connect" 按鈕
   - 選擇 "Node.js"
   - 複製連線字串

4. **更新環境變數**
   - 在 Cursor 中開啟 `server/.env`
   - 更新 `DATABASE_URL`：
   ```env
   DATABASE_URL="mysql://username:password@aws.connect.psdb.cloud/young-massage-crm?sslaccept=strict"
   ```

#### 選項 B：Docker MySQL

1. **安裝 Docker Desktop**
   - 前往 [Docker 官網](https://www.docker.com/products/docker-desktop/)
   - 下載並安裝 Docker Desktop

2. **啟動 MySQL 容器**
   ```bash
   docker run --name mysql-dev -e MYSQL_ROOT_PASSWORD=password123 -e MYSQL_DATABASE=young_massage_crm -p 3306:3306 -d mysql:8.0
   ```

3. **更新環境變數**
   ```env
   DATABASE_URL="mysql://root:password123@localhost:3306/young_massage_crm"
   ```

### 步驟 5：執行資料庫遷移

在 Cursor 終端中：
```bash
# 進入 server 目錄
cd server

# 執行資料庫遷移
npx prisma migrate dev --name init

# 生成 Prisma 客戶端
npx prisma generate
```

### 步驟 6：啟動開發伺服器

在 Cursor 終端中：
```bash
# 回到專案根目錄
cd ..

# 啟動開發伺服器（同時啟動前端和後端）
npm run dev
```

### 步驟 7：驗證設定

1. **檢查後端 API**
   - 開啟瀏覽器前往 http://localhost:5000/health
   - 應該看到 JSON 回應

2. **檢查前端**
   - 開啟瀏覽器前往 http://localhost:3000
   - 應該看到揚翼運動按摩系統首頁

3. **檢查資料庫**
   - 在 Cursor 終端執行：`cd server && npx prisma studio`
   - 應該開啟 Prisma Studio 網頁界面

## 🛠️ Cursor 開發技巧

### 使用 Cursor AI 功能

1. **AI 聊天**
   - 按 `Ctrl + L` 開啟 AI 聊天
   - 可以詢問代碼問題或請求幫助

2. **AI 代碼生成**
   - 在代碼中輸入註解描述功能
   - Cursor 會自動生成代碼

3. **AI 代碼解釋**
   - 選取代碼後按 `Ctrl + K`
   - Cursor 會解釋代碼功能

### 專案結構導航

```
young-crm/
├── client/                 # React 前端
│   ├── src/
│   │   ├── components/     # React 組件
│   │   ├── pages/         # 頁面組件
│   │   ├── services/      # API 服務
│   │   └── types/         # TypeScript 類型
│   └── package.json
├── server/                # Node.js 後端
│   ├── src/
│   │   ├── routes/        # API 路由
│   │   └── index.ts       # 主入口檔案
│   ├── prisma/
│   │   └── schema.prisma  # 資料庫結構
│   └── package.json
└── package.json           # 根目錄配置
```

### 常用命令

```bash
# 開發相關
npm run dev              # 啟動開發伺服器
npm run build            # 建置專案
npm run install:all      # 安裝所有依賴

# 資料庫相關
cd server
npx prisma migrate dev   # 執行資料庫遷移
npx prisma generate      # 生成 Prisma 客戶端
npx prisma studio        # 開啟資料庫管理界面

# Git 相關
git status               # 查看檔案狀態
git add .                # 添加所有檔案
git commit -m "訊息"      # 提交更改
git push origin main     # 推送到 GitHub
git pull origin main     # 拉取最新代碼
```

## 🚨 常見問題解決

### 1. 依賴安裝失敗
```bash
# 清除快取
npm cache clean --force

# 刪除 node_modules 重新安裝
rm -rf node_modules
npm install
```

### 2. 端口被占用
```bash
# 查看端口使用情況
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# 終止占用端口的程序
taskkill /PID <PID號碼> /F
```

### 3. 資料庫連線失敗
- 檢查 `DATABASE_URL` 是否正確
- 確認資料庫服務是否運行
- 檢查防火牆設定

### 4. Cursor 無法識別 TypeScript
- 重啟 Cursor
- 檢查 `tsconfig.json` 設定
- 確保已安裝 TypeScript 依賴

## 📞 技術支援

如果遇到問題：
1. 檢查 [專案文檔](./README.md)
2. 查看 [API 文檔](./docs/API.md)
3. 參考 [部署指南](./VERCEL_DEPLOYMENT.md)
4. 使用 Cursor AI 聊天功能

---

🎉 **恭喜！您已成功在 Cursor 中設定揚翼運動按摩系統！**

現在您可以開始開發了！建議先從修改首頁內容開始，熟悉專案結構。
