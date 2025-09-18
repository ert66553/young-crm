# 揚翼運動按摩會員管理系統

一個整合LINE官方帳號的現代化會員管理系統，專為按摩服務業設計。

## 🚀 功能特色

### 會員功能
- ✅ LINE一鍵登入
- ✅ 個人資料管理
- ✅ 會員等級制度
- ✅ 積分系統
- ✅ 消費記錄查詢

### 預約系統
- ✅ 線上預約服務
- ✅ 時段管理
- ✅ 預約確認/取消
- ✅ 預約歷史查詢

### LINE整合
- ✅ LINE登入授權
- ✅ 推播通知
- ✅ 客服機器人
- ✅ 快速預約
- ✅ 會員卡展示

### 管理後台
- ✅ 會員資料管理
- ✅ 預約管理
- ✅ 服務項目管理
- ✅ 報表統計

## 🛠 技術棧

- **前端**: React 18 + TypeScript + Tailwind CSS
- **後端**: Node.js + Express + TypeScript
- **資料庫**: PostgreSQL
- **LINE整合**: LINE Messaging API + LINE Login API
- **部署**: Docker + Vercel

## 📦 安裝與運行

### 1. 安裝依賴
```bash
npm run install:all
```

### 2. 環境設定
複製並設定環境變數：
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3. 啟動開發環境
```bash
npm run dev
```

- 前端: http://localhost:3000
- 後端: http://localhost:5000

## 🔧 LINE設定

1. 前往 [LINE Developers Console](https://developers.line.biz/)
2. 建立新的Provider和Channel
3. 設定Webhook URL: `https://yourdomain.com/api/line/webhook`
4. 將Channel ID和Channel Secret填入環境變數

## 📁 專案結構

```
young-massage-crm/
├── client/                 # React前端
│   ├── src/
│   │   ├── components/    # 共用組件
│   │   ├── pages/         # 頁面組件
│   │   ├── hooks/         # 自定義Hooks
│   │   ├── services/      # API服務
│   │   └── types/         # TypeScript類型
├── server/                # Node.js後端
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── models/        # 資料模型
│   │   ├── routes/        # 路由
│   │   ├── services/      # 業務邏輯
│   │   └── middleware/    # 中間件
└── docs/                  # 文件
```

## 🚀 部署

### 使用Docker
```bash
docker-compose up -d
```

### 手動部署
1. 建置前端: `npm run build`
2. 部署後端到您的伺服器
3. 設定資料庫連線
4. 設定LINE Webhook URL

## 📞 支援

如有問題，請聯繫技術支援團隊。
