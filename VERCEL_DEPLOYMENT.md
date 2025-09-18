# 🚀 揚翼運動按摩系統 - Vercel 簡易部署指南

## 📋 部署概述

使用 **Vercel + PlanetScale** 組合，這是最簡單的部署方式：
- ✅ 完全免費開始
- ✅ 零伺服器管理
- ✅ 自動擴展
- ✅ 99.9% 正常運行時間
- ✅ 自動備份

## 🛠️ 部署步驟

### 1. 準備 GitHub 倉庫

```bash
# 初始化 Git 倉庫（如果還沒有）
git init
git add .
git commit -m "Initial commit"

# 推送到 GitHub
git remote add origin https://github.com/yourusername/young-crm.git
git push -u origin main
```

### 2. 設定 PlanetScale 資料庫

1. 前往 [PlanetScale](https://planetscale.com/)
2. 註冊/登入帳號
3. 建立新資料庫：
   - 資料庫名稱：`young-massage-crm`
   - 區域：選擇離您最近的區域
4. 取得連線字串：
   - 點擊「Connect」按鈕
   - 選擇「Node.js」
   - 複製連線字串

### 3. 部署到 Vercel

#### 方法一：使用 Vercel CLI（推薦）

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入 Vercel
vercel login

# 在專案根目錄部署
vercel

# 設定環境變數
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add LINE_CHANNEL_ID
vercel env add LINE_CHANNEL_SECRET
vercel env add LINE_ACCESS_TOKEN
vercel env add FRONTEND_URL

# 重新部署
vercel --prod
```

#### 方法二：使用 Vercel 網頁界面

1. 前往 [Vercel](https://vercel.com/)
2. 點擊「New Project」
3. 連接您的 GitHub 倉庫
4. 設定專案：
   - **Framework Preset**: Other
   - **Root Directory**: 留空
   - **Build Command**: `cd client && npm run build`
   - **Output Directory**: `client/build`

### 4. 設定環境變數

在 Vercel 專案設定中添加以下環境變數：

```env
# 資料庫
DATABASE_URL=mysql://username:password@aws.connect.psdb.cloud/young-massage-crm?sslaccept=strict

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# LINE
LINE_CHANNEL_ID=your-line-channel-id
LINE_CHANNEL_SECRET=your-line-channel-secret
LINE_ACCESS_TOKEN=your-line-access-token

# 前端
FRONTEND_URL=https://yourdomain.vercel.app

# 其他
NODE_ENV=production
```

### 5. 執行資料庫遷移

```bash
# 在本地執行遷移（需要先設定 DATABASE_URL）
cd server
npx prisma migrate deploy
npx prisma generate
```

### 6. 設定 LINE Webhook

1. 前往 [LINE Developers Console](https://developers.line.biz/)
2. 選擇您的 Channel
3. 設定 Webhook URL：
   ```
   https://yourdomain.vercel.app/api/line/webhook
   ```
4. 驗證 Webhook 設定

## 🔧 專案結構

```
young_crm/
├── client/                 # React 前端
│   ├── vercel.json        # Vercel 前端配置
│   └── ...
├── server/                # Node.js 後端
│   ├── vercel.json        # Vercel 後端配置
│   ├── prisma/
│   │   └── schema.prisma  # MySQL 資料庫結構
│   └── ...
├── vercel.json            # 根目錄 Vercel 配置
└── ...
```

## 📱 測試部署

1. 訪問您的前端：`https://yourdomain.vercel.app`
2. 測試 API：`https://yourdomain.vercel.app/api/health`
3. 測試 LINE Webhook：`https://yourdomain.vercel.app/api/line/webhook`

## 🔄 更新部署

每次推送代碼到 GitHub 時，Vercel 會自動重新部署：

```bash
git add .
git commit -m "Update features"
git push origin main
```

## 🚨 故障排除

### 常見問題

**1. 資料庫連線失敗**
- 檢查 `DATABASE_URL` 是否正確
- 確認 PlanetScale 資料庫是否已建立
- 檢查 SSL 設定

**2. LINE Webhook 驗證失敗**
- 檢查 `LINE_CHANNEL_SECRET` 設定
- 確認 Webhook URL 可訪問
- 檢查伺服器 SSL 憑證

**3. 前端無法連接到 API**
- 檢查 `REACT_APP_API_URL` 設定
- 確認 CORS 設定
- 檢查網路連線

### 查看日誌

```bash
# 查看 Vercel 日誌
vercel logs

# 查看特定函數日誌
vercel logs --function=api
```

## 💰 費用說明

### Vercel 免費額度
- 100GB 頻寬/月
- 無限制靜態網站
- 100GB 函數執行時間/月

### PlanetScale 免費額度
- 5GB 資料庫儲存
- 10 億行讀取/月
- 1000 萬行寫入/月

## 📞 技術支援

如有問題，請查看：
- [Vercel 文檔](https://vercel.com/docs)
- [PlanetScale 文檔](https://planetscale.com/docs)
- [Prisma 文檔](https://www.prisma.io/docs)

---

🎉 **恭喜！您的揚翼運動按摩系統已成功部署到 Vercel！**
