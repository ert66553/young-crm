import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();

// 中間件：驗證JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '需要認證token'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: '無效的token'
      });
    }
    req.user = user;
    next();
  });
};

// 取得使用者積分記錄
router.get('/points-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, type } = req.query;

    const where: any = { userId };
    if (type) {
      where.type = type;
    }

    const pointsHistory = await prisma.pointsHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.pointsHistory.count({ where });

    res.json({
      success: true,
      data: {
        pointsHistory,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('取得積分記錄錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取得積分記錄失敗'
    });
  }
});

// 取得使用者消費記錄
router.get('/payment-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const payments = await prisma.payment.findMany({
      where: { userId },
      include: {
        booking: {
          include: {
            service: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.payment.count({ where: { userId } });

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('取得消費記錄錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取得消費記錄失敗'
    });
  }
});

// 更新會員等級
router.put('/update-level', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { totalSpent } = req.body;

    let newLevel = 'BASIC';
    if (totalSpent >= 50000) {
      newLevel = 'VIP';
    } else if (totalSpent >= 30000) {
      newLevel = 'PLATINUM';
    } else if (totalSpent >= 20000) {
      newLevel = 'GOLD';
    } else if (totalSpent >= 10000) {
      newLevel = 'SILVER';
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { memberLevel: newLevel as any },
      select: {
        id: true,
        name: true,
        memberLevel: true,
        totalSpent: true,
        points: true
      }
    });

    res.json({
      success: true,
      message: '會員等級更新成功',
      data: { user }
    });
  } catch (error) {
    console.error('更新會員等級錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新會員等級失敗'
    });
  }
});

// 取得會員統計
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const [
      totalBookings,
      completedBookings,
      totalSpent,
      currentPoints,
      memberSince
    ] = await Promise.all([
      prisma.booking.count({ where: { userId } }),
      prisma.booking.count({ 
        where: { 
          userId, 
          status: 'COMPLETED' 
        } 
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { totalSpent: true }
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { points: true }
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalBookings,
        completedBookings,
        totalSpent: totalSpent?.totalSpent || 0,
        currentPoints: currentPoints?.points || 0,
        memberSince: memberSince?.createdAt
      }
    });
  } catch (error) {
    console.error('取得會員統計錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取得會員統計失敗'
    });
  }
});

module.exports = router;
