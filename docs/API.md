# 揚翼運動按摩會員系統 API 文檔

## 概述

本 API 提供揚翼運動按摩會員管理系統的所有後端功能，包括會員管理、預約系統、LINE 整合等。

**Base URL:** `https://api.yourdomain.com/api`

**認證方式:** Bearer Token (JWT)

## 認證

大部分 API 需要認證，請在請求頭中包含 JWT token：

```
Authorization: Bearer <your-jwt-token>
```

## 錯誤處理

所有 API 回應都遵循以下格式：

```json
{
  "success": boolean,
  "message": string,
  "data": object,
  "errors": array
}
```

### 錯誤狀態碼

- `400` - 請求參數錯誤
- `401` - 未認證
- `403` - 權限不足
- `404` - 資源不存在
- `500` - 伺服器內部錯誤

## API 端點

### 認證相關

#### 註冊會員

```http
POST /auth/register
```

**請求參數:**
```json
{
  "name": "string (必填)",
  "phone": "string (必填)",
  "password": "string (必填, 最少6個字符)",
  "email": "string (可選)",
  "gender": "MALE|FEMALE|OTHER (可選)",
  "birthday": "string (可選, ISO 8601格式)"
}
```

**回應:**
```json
{
  "success": true,
  "message": "註冊成功",
  "data": {
    "user": {
      "id": "string",
      "name": "string",
      "phone": "string",
      "email": "string",
      "memberLevel": "BASIC",
      "points": 0
    },
    "token": "jwt-token"
  }
}
```

#### LINE 登入

```http
POST /auth/line-login
```

**請求參數:**
```json
{
  "lineUserId": "string (必填)",
  "displayName": "string (必填)",
  "pictureUrl": "string (可選)",
  "email": "string (可選)"
}
```

**回應:**
```json
{
  "success": true,
  "message": "登入成功",
  "data": {
    "user": {
      "id": "string",
      "name": "string",
      "phone": "string",
      "email": "string",
      "avatar": "string",
      "memberLevel": "BASIC",
      "points": 0
    },
    "token": "jwt-token"
  }
}
```

#### 取得使用者資料

```http
GET /auth/me
```

**回應:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "name": "string",
      "phone": "string",
      "email": "string",
      "avatar": "string",
      "gender": "MALE|FEMALE|OTHER",
      "birthday": "string",
      "address": "string",
      "memberLevel": "BASIC|SILVER|GOLD|PLATINUM|VIP",
      "points": 0,
      "totalSpent": 0,
      "isActive": true,
      "createdAt": "string"
    }
  }
}
```

#### 更新使用者資料

```http
PUT /auth/profile
```

**請求參數:**
```json
{
  "name": "string (可選)",
  "phone": "string (可選)",
  "email": "string (可選)",
  "gender": "MALE|FEMALE|OTHER (可選)",
  "birthday": "string (可選)",
  "address": "string (可選)"
}
```

### 服務相關

#### 取得所有服務

```http
GET /services
```

**查詢參數:**
- `category` - 服務分類篩選
- `isActive` - 是否啟用 (true|false|all)

**回應:**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "string",
        "name": "string",
        "description": "string",
        "duration": 60,
        "price": 1200,
        "category": "string",
        "isActive": true,
        "createdAt": "string",
        "updatedAt": "string"
      }
    ]
  }
}
```

#### 取得服務詳情

```http
GET /services/:id
```

**回應:**
```json
{
  "success": true,
  "data": {
    "service": {
      "id": "string",
      "name": "string",
      "description": "string",
      "duration": 60,
      "price": 1200,
      "category": "string",
      "isActive": true,
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
}
```

#### 取得服務分類

```http
GET /services/categories/list
```

**回應:**
```json
{
  "success": true,
  "data": {
    "categories": ["深層按摩", "運動按摩", "放鬆按摩"]
  }
}
```

### 預約相關

#### 取得可預約時段

```http
GET /bookings/available-slots/:serviceId
```

**查詢參數:**
- `date` - 預約日期 (YYYY-MM-DD)

**回應:**
```json
{
  "success": true,
  "data": {
    "availableSlots": [
      {
        "startTime": "09:00",
        "endTime": "10:00",
        "duration": 60
      }
    ]
  }
}
```

#### 建立預約

```http
POST /bookings
```

**請求參數:**
```json
{
  "serviceId": "string (必填)",
  "date": "string (必填, YYYY-MM-DD)",
  "startTime": "string (必填, HH:MM)",
  "staffId": "string (可選)",
  "notes": "string (可選)"
}
```

**回應:**
```json
{
  "success": true,
  "message": "預約建立成功",
  "data": {
    "booking": {
      "id": "string",
      "userId": "string",
      "serviceId": "string",
      "staffId": "string",
      "date": "string",
      "startTime": "string",
      "endTime": "string",
      "status": "PENDING",
      "notes": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "service": {
        "id": "string",
        "name": "string",
        "price": 1200
      },
      "staff": {
        "id": "string",
        "name": "string"
      }
    }
  }
}
```

#### 取得我的預約

```http
GET /bookings/my-bookings
```

**查詢參數:**
- `page` - 頁碼 (預設: 1)
- `limit` - 每頁數量 (預設: 10)
- `status` - 預約狀態篩選

**回應:**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "string",
        "serviceId": "string",
        "staffId": "string",
        "date": "string",
        "startTime": "string",
        "endTime": "string",
        "status": "PENDING",
        "notes": "string",
        "createdAt": "string",
        "service": {
          "id": "string",
          "name": "string",
          "price": 1200
        },
        "staff": {
          "id": "string",
          "name": "string"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### 取得預約詳情

```http
GET /bookings/:id
```

**回應:**
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "string",
      "userId": "string",
      "serviceId": "string",
      "staffId": "string",
      "date": "string",
      "startTime": "string",
      "endTime": "string",
      "status": "PENDING",
      "notes": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "service": {
        "id": "string",
        "name": "string",
        "price": 1200
      },
      "staff": {
        "id": "string",
        "name": "string"
      },
      "payments": []
    }
  }
}
```

#### 取消預約

```http
PUT /bookings/:id/cancel
```

**回應:**
```json
{
  "success": true,
  "message": "預約已取消",
  "data": {
    "booking": {
      "id": "string",
      "status": "CANCELLED",
      "service": {
        "id": "string",
        "name": "string"
      },
      "staff": {
        "id": "string",
        "name": "string"
      }
    }
  }
}
```

### 使用者相關

#### 取得積分記錄

```http
GET /users/points-history
```

**查詢參數:**
- `page` - 頁碼 (預設: 1)
- `limit` - 每頁數量 (預設: 10)
- `type` - 積分類型篩選

**回應:**
```json
{
  "success": true,
  "data": {
    "pointsHistory": [
      {
        "id": "string",
        "userId": "string",
        "points": 10,
        "type": "EARNED",
        "description": "消費獲得積分",
        "bookingId": "string",
        "createdAt": "string"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

#### 取得消費記錄

```http
GET /users/payment-history
```

**查詢參數:**
- `page` - 頁碼 (預設: 1)
- `limit` - 每頁數量 (預設: 10)

**回應:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "string",
        "bookingId": "string",
        "userId": "string",
        "amount": 1200,
        "method": "CASH",
        "status": "COMPLETED",
        "transactionId": "string",
        "createdAt": "string",
        "booking": {
          "id": "string",
          "service": {
            "id": "string",
            "name": "string"
          }
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 30,
      "pages": 3
    }
  }
}
```

#### 取得會員統計

```http
GET /users/stats
```

**回應:**
```json
{
  "success": true,
  "data": {
    "totalBookings": 15,
    "completedBookings": 12,
    "totalSpent": 15000,
    "currentPoints": 150,
    "memberSince": "2023-01-01T00:00:00.000Z"
  }
}
```

### 管理員相關

#### 取得儀表板統計

```http
GET /admin/dashboard
```

**回應:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalBookings": 500,
    "totalRevenue": 600000,
    "todayBookings": 8,
    "pendingBookings": 3,
    "recentBookings": [
      {
        "id": "string",
        "user": {
          "name": "string",
          "phone": "string"
        },
        "service": {
          "name": "string"
        },
        "date": "string",
        "startTime": "string",
        "status": "PENDING"
      }
    ]
  }
}
```

#### 取得會員列表

```http
GET /admin/users
```

**查詢參數:**
- `page` - 頁碼 (預設: 1)
- `limit` - 每頁數量 (預設: 10)
- `search` - 搜尋關鍵字
- `memberLevel` - 會員等級篩選

#### 取得預約列表

```http
GET /admin/bookings
```

**查詢參數:**
- `page` - 頁碼 (預設: 1)
- `limit` - 每頁數量 (預設: 10)
- `status` - 預約狀態篩選
- `date` - 日期篩選

#### 更新預約狀態

```http
PUT /admin/bookings/:id/status
```

**請求參數:**
```json
{
  "status": "PENDING|CONFIRMED|IN_PROGRESS|COMPLETED|CANCELLED|NO_SHOW"
}
```

### LINE 相關

#### LINE Webhook

```http
POST /line/webhook
```

**請求頭:**
```
Content-Type: application/json
X-Line-Signature: <signature>
```

**請求體:**
```json
{
  "events": [
    {
      "type": "message",
      "replyToken": "string",
      "source": {
        "userId": "string",
        "type": "user"
      },
      "message": {
        "type": "text",
        "text": "string"
      }
    }
  ]
}
```

## 資料模型

### User (使用者)

```typescript
interface User {
  id: string;
  lineUserId?: string;
  email?: string;
  phone?: string;
  name: string;
  avatar?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  birthday?: Date;
  address?: string;
  memberLevel: 'BASIC' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'VIP';
  points: number;
  totalSpent: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Service (服務)

```typescript
interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // 分鐘
  price: number;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Booking (預約)

```typescript
interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  staffId?: string;
  date: Date;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Payment (付款)

```typescript
interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  method: 'CASH' | 'CARD' | 'LINE_PAY' | 'TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 速率限制

- 一般 API: 100 請求/15分鐘
- 認證 API: 10 請求/15分鐘
- LINE Webhook: 無限制

## 版本控制

API 版本通過 URL 路徑控制，目前版本為 v1：

```
https://api.yourdomain.com/api/v1/...
```

## 支援

如有問題，請聯繫技術支援團隊或查看：

- [部署指南](../DEPLOYMENT.md)
- [常見問題](./FAQ.md)
- [更新日誌](./CHANGELOG.md)
