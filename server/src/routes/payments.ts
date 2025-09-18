import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
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

// 建立付款記錄
router.post('/', authenticateToken, [
  body('bookingId').notEmpty().withMessage('預約ID為必填'),
  body('amount').isFloat({ min: 0 }).withMessage('金額必須大於等於0'),
  body('method').isIn(['CASH', 'CARD', 'LINE_PAY', 'TRANSFER']).withMessage('付款方式無效')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '輸入資料有誤',
        errors: errors.array()
      });
    }

    const { bookingId, amount, method, transactionId } = req.body;
    const userId = req.user.userId;

    // 檢查預約是否存在且屬於該使用者
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId
      },
      include: {
        service: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: '找不到預約記錄'
      });
    }

    // 建立付款記錄
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        userId,
        amount,
        method: method as any,
        transactionId,
        status: 'COMPLETED'
      }
    });

    // 更新使用者總消費和積分
    const pointsEarned = Math.floor(amount / 100); // 每100元獲得1積分
    
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          totalSpent: {
            increment: amount
          },
          points: {
            increment: pointsEarned
          }
        }
      }),
      prisma.pointsHistory.create({
        data: {
          userId,
          points: pointsEarned,
          type: 'EARNED',
          description: `消費獲得積分 - ${booking.service.name}`,
          bookingId
        }
      })
    ]);

    res.status(201).json({
      success: true,
      message: '付款記錄建立成功',
      data: { payment }
    });
  } catch (error) {
    console.error('建立付款記錄錯誤:', error);
    res.status(500).json({
      success: false,
      message: '建立付款記錄失敗'
    });
  }
});

// 取得付款記錄
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status } = req.query;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const payments = await prisma.payment.findMany({
      where,
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

    const total = await prisma.payment.count({ where });

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
    console.error('取得付款記錄錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取得付款記錄失敗'
    });
  }
});

// 取得單一付款記錄
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const payment = await prisma.payment.findFirst({
      where: {
        id,
        userId
      },
      include: {
        booking: {
          include: {
            service: true,
            staff: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: '找不到付款記錄'
      });
    }

    res.json({
      success: true,
      data: { payment }
    });
  } catch (error) {
    console.error('取得付款記錄錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取得付款記錄失敗'
    });
  }
});

module.exports = router;
