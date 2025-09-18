# 🖥️ 新電腦設定指南

## 在新電腦上設定揚翼運動按摩系統

### ✅ 軟體安裝清單

- [ ] **Node.js 18+** - [下載](https://nodejs.org/)
- [ ] **Cursor IDE** - [下載](https://cursor.sh/)
- [ ] **Git** - [下載](https://git-scm.com/)
- [ ] **資料庫選擇**：
  - [ ] PlanetScale（雲端 MySQL，推薦）
  - [ ] Docker Desktop（本地 MySQL）
  - [ ] XAMPP（本地 MySQL）

### ✅ 專案設定步驟

#### 1. 克隆專案
```bash
git clone https://github.com/ert66553/young-crm.git
cd young-crm
```

#### 2. 安裝依賴
```bash
npm run install:all
```

#### 3. 設定環境變數
```bash
# 後端
cd server
copy env.example .env

# 前端
cd ../client
copy env.example .env
```

#### 4. 設定資料庫

**選項 A：PlanetScale（推薦）**
1. 前往 [PlanetScale](https://planetscale.com/)
2. 建立資料庫：`young-massage-crm`
3. 取得連線字串
4. 更新 `server/.env`：
   ```env
   DATABASE_URL="mysql://username:password@aws.connect.psdb.cloud/young-massage-crm?sslaccept=strict"
   ```

**選項 B：Docker MySQL**
```bash
docker run --name mysql-dev -e MYSQL_ROOT_PASSWORD=password123 -e MYSQL_DATABASE=young_massage_crm -p 3306:3306 -d mysql:8.0
```
更新 `server/.env`：
```env
DATABASE_URL="mysql://root:password123@localhost:3306/young_massage_crm"
```

**選項 C：XAMPP**
1. 下載安裝 [XAMPP](https://www.apachefriends.org/)
2. 啟動 MySQL 服務
3. 建立資料庫：`young_massage_crm`
4. 更新 `server/.env`：
   ```env
   DATABASE_URL="mysql://root:@localhost:3306/young_massage_crm"
   ```

#### 5. 執行資料庫遷移
```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

#### 6. 測試運行
```bash
# 回到專案根目錄
cd ..

# 啟動開發伺服器
npm run dev
```

### ✅ 驗證設定

- [ ] 後端 API 運行在 http://localhost:5000
- [ ] 前端運行在 http://localhost:3000
- [ ] 資料庫連線正常
- [ ] 可以訪問 Prisma Studio：`cd server && npx prisma studio`

### ✅ 開發工作流程

#### 日常開發
```bash
# 啟動開發環境
npm run dev

# 停止開發環境
Ctrl + C
```

#### 提交代碼
```bash
# 添加更改
git add .

# 提交更改
git commit -m "描述更改內容"

# 推送到 GitHub
git push origin main
```

#### 拉取最新代碼
```bash
# 拉取最新代碼
git pull origin main

# 安裝新依賴（如果有）
npm run install:all
```

### 🚨 常見問題解決

#### 1. 依賴安裝失敗
```bash
# 清除快取
npm cache clean --force

# 刪除 node_modules 重新安裝
rm -rf node_modules
npm install
```

#### 2. 資料庫連線失敗
- 檢查 `DATABASE_URL` 是否正確
- 確認資料庫服務是否運行
- 檢查防火牆設定

#### 3. 端口被占用
```bash
# 查看端口使用情況
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# 終止占用端口的程序
taskkill /PID <PID號碼> /F
```

#### 4. Git 認證問題
```bash
# 設定 Git 認證
git config --global user.name "您的姓名"
git config --global user.email "您的email@example.com"
```

### 📞 技術支援

如果遇到問題，請檢查：
- [專案文檔](./README.md)
- [API 文檔](./docs/API.md)
- [部署指南](./VERCEL_DEPLOYMENT.md)

---

🎉 **恭喜！您已成功在新電腦上設定揚翼運動按摩系統！**
