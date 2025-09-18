import express from 'express';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const router = express.Router();
const prisma = new PrismaClient();

// LINE Webhook 驗證
const verifyLineSignature = (body: string, signature: string): boolean => {
  const channelSecret = process.env.LINE_CHANNEL_SECRET!;
  const hash = crypto
    .createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64');
  return hash === signature;
};

// LINE Webhook 接收
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-line-signature'] as string;
    const body = req.body;

    // 驗證簽名
    if (!verifyLineSignature(body, signature)) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const events = JSON.parse(body.toString()).events;

    for (const event of events) {
      await handleLineEvent(event);
    }

    res.json({ message: 'OK' });
  } catch (error) {
    console.error('LINE Webhook 錯誤:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 處理 LINE 事件
async function handleLineEvent(event: any) {
  const { type, source, message, replyToken } = event;

  switch (type) {
    case 'message':
      await handleMessageEvent(event);
      break;
    case 'postback':
      await handlePostbackEvent(event);
      break;
    case 'follow':
      await handleFollowEvent(event);
      break;
    case 'unfollow':
      await handleUnfollowEvent(event);
      break;
    default:
      console.log('未處理的事件類型:', type);
  }
}

// 處理訊息事件
async function handleMessageEvent(event: any) {
  const { message, replyToken, source } = event;
  const lineUserId = source.userId;

  if (message.type === 'text') {
    const text = message.text.toLowerCase();

    // 關鍵字回應
    if (text.includes('預約') || text.includes('booking')) {
      await replyMessage(replyToken, {
        type: 'text',
        text: '請點擊下方按鈕開始預約服務：',
        quickReply: {
          items: [
            {
              type: 'action',
              action: {
                type: 'postback',
                label: '立即預約',
                data: 'action=booking'
              }
            },
            {
              type: 'action',
              action: {
                type: 'postback',
                label: '查看預約',
                data: 'action=view_bookings'
              }
            }
          ]
        }
      });
    } else if (text.includes('會員') || text.includes('member')) {
      await replyMessage(replyToken, {
        type: 'text',
        text: '請點擊下方按鈕查看會員資訊：',
        quickReply: {
          items: [
            {
              type: 'action',
              action: {
                type: 'postback',
                label: '會員資料',
                data: 'action=member_info'
              }
            },
            {
              type: 'action',
              action: {
                type: 'postback',
                label: '積分查詢',
                data: 'action=points'
              }
            }
          ]
        }
      });
    } else if (text.includes('服務') || text.includes('service')) {
      await getServicesList(replyToken);
    } else {
      await replyMessage(replyToken, {
        type: 'text',
        text: '您好！我是揚翼運動按摩的客服機器人。\n\n您可以輸入：\n• "預約" - 預約服務\n• "會員" - 查看會員資訊\n• "服務" - 查看服務項目\n• "聯絡" - 聯絡我們'
      });
    }
  }
}

// 處理 Postback 事件
async function handlePostbackEvent(event: any) {
  const { postback, replyToken, source } = event;
  const lineUserId = source.userId;
  const data = postback.data;

  const params = new URLSearchParams(data);
  const action = params.get('action');

  switch (action) {
    case 'booking':
      await showBookingOptions(replyToken);
      break;
    case 'view_bookings':
      await showUserBookings(replyToken, lineUserId);
      break;
    case 'member_info':
      await showMemberInfo(replyToken, lineUserId);
      break;
    case 'points':
      await showPointsInfo(replyToken, lineUserId);
      break;
    case 'services':
      await getServicesList(replyToken);
      break;
  }
}

// 處理追蹤事件
async function handleFollowEvent(event: any) {
  const { replyToken, source } = event;
  const lineUserId = source.userId;

  await replyMessage(replyToken, {
    type: 'text',
    text: '歡迎加入揚翼運動按摩！\n\n我們提供專業的運動按摩服務，幫助您放鬆身心、恢復活力。\n\n請輸入 "預約" 開始預約服務，或輸入 "服務" 查看我們的服務項目。'
  });
}

// 處理取消追蹤事件
async function handleUnfollowEvent(event: any) {
  const { source } = event;
  const lineUserId = source.userId;
  
  // 可以記錄取消追蹤的日誌
  console.log(`使用者 ${lineUserId} 取消追蹤`);
}

// 回覆訊息
async function replyMessage(replyToken: string, message: any) {
  try {
    await axios.post('https://api.line.me/v2/bot/message/reply', {
      replyToken,
      messages: [message]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`
      }
    });
  } catch (error) {
    console.error('回覆訊息錯誤:', error);
  }
}

// 顯示預約選項
async function showBookingOptions(replyToken: string) {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    take: 5
  });

  const quickReplyItems = services.map(service => ({
    type: 'action',
    action: {
      type: 'postback',
      label: service.name,
      data: `action=book_service&serviceId=${service.id}`
    }
  }));

  await replyMessage(replyToken, {
    type: 'text',
    text: '請選擇您想要的服務：',
    quickReply: {
      items: quickReplyItems
    }
  });
}

// 顯示使用者預約
async function showUserBookings(replyToken: string, lineUserId: string) {
  const user = await prisma.user.findUnique({
    where: { lineUserId }
  });

  if (!user) {
    await replyMessage(replyToken, {
      type: 'text',
      text: '請先註冊會員才能查看預約記錄。'
    });
    return;
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: { service: true },
    orderBy: { date: 'desc' },
    take: 5
  });

  if (bookings.length === 0) {
    await replyMessage(replyToken, {
      type: 'text',
      text: '您目前沒有預約記錄。'
    });
    return;
  }

  let message = '您的預約記錄：\n\n';
  bookings.forEach((booking, index) => {
    message += `${index + 1}. ${booking.service.name}\n`;
    message += `   日期：${booking.date.toLocaleDateString('zh-TW')}\n`;
    message += `   時間：${booking.startTime}\n`;
    message += `   狀態：${getBookingStatusText(booking.status)}\n\n`;
  });

  await replyMessage(replyToken, {
    type: 'text',
    text: message
  });
}

// 顯示會員資訊
async function showMemberInfo(replyToken: string, lineUserId: string) {
  const user = await prisma.user.findUnique({
    where: { lineUserId }
  });

  if (!user) {
    await replyMessage(replyToken, {
      type: 'text',
      text: '請先註冊會員。'
    });
    return;
  }

  const message = `會員資訊：\n\n` +
    `姓名：${user.name}\n` +
    `等級：${getMemberLevelText(user.memberLevel)}\n` +
    `積分：${user.points}\n` +
    `總消費：NT$ ${user.totalSpent.toFixed(0)}`;

  await replyMessage(replyToken, {
    type: 'text',
    text: message
  });
}

// 顯示積分資訊
async function showPointsInfo(replyToken: string, lineUserId: string) {
  const user = await prisma.user.findUnique({
    where: { lineUserId }
  });

  if (!user) {
    await replyMessage(replyToken, {
      type: 'text',
      text: '請先註冊會員。'
    });
    return;
  }

  const message = `積分資訊：\n\n` +
    `目前積分：${user.points}\n` +
    `會員等級：${getMemberLevelText(user.memberLevel)}\n\n` +
    `積分使用方式：\n` +
    `• 100積分 = NT$ 10 折扣\n` +
    `• 500積分 = NT$ 50 折扣\n` +
    `• 1000積分 = NT$ 100 折扣`;

  await replyMessage(replyToken, {
    type: 'text',
    text: message
  });
}

// 取得服務列表
async function getServicesList(replyToken: string) {
  const services = await prisma.service.findMany({
    where: { isActive: true }
  });

  let message = '我們的服務項目：\n\n';
  services.forEach((service, index) => {
    message += `${index + 1}. ${service.name}\n`;
    message += `   價格：NT$ ${service.price}\n`;
    message += `   時長：${service.duration}分鐘\n`;
    if (service.description) {
      message += `   說明：${service.description}\n`;
    }
    message += '\n';
  });

  await replyMessage(replyToken, {
    type: 'text',
    text: message
  });
}

// 輔助函數
function getBookingStatusText(status: string): string {
  const statusMap: { [key: string]: string } = {
    PENDING: '待確認',
    CONFIRMED: '已確認',
    IN_PROGRESS: '進行中',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
    NO_SHOW: '未到場'
  };
  return statusMap[status] || status;
}

function getMemberLevelText(level: string): string {
  const levelMap: { [key: string]: string } = {
    BASIC: '一般會員',
    SILVER: '銀級會員',
    GOLD: '金級會員',
    PLATINUM: '白金會員',
    VIP: 'VIP會員'
  };
  return levelMap[level] || level;
}

module.exports = router;
