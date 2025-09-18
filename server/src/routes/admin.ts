import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();

// 中間件：驗證管理員權限
const authenticateAdmin = (req: any, res: any, next: any) => {
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
    
    // 這裡應該檢查使用者是否為管理員
    // 簡化版本，實際應用中需要更嚴格的權限檢查
    req.user = user;
    next();
  });
};

// 取得儀表板統計
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalBookings,
      totalRevenue,
      todayBookings,
      pendingBookings,
      recentBookings
    ] = await Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' }
      }),
      prisma.booking.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }),
      prisma.booking.count({
        where: { status: 'PENDING' }
      }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, phone: true }
          },
          service: {
            select: { name: true }
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalBookings,
        totalRevenue: totalRevenue._sum.amount || 0,
        todayBookings,
        pendingBookings,
        recentBookings
      }
    });
  } catch (error) {
    console.error('取得儀表板統計錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取得儀表板統計失敗'
    });
  }
});

// 取得所有會員
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, memberLevel } = req.query;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { phone: { contains: search as string } },
        { email: { contains: search as string } }
      ];
    }
    if (memberLevel) {
      where.memberLevel = memberLevel;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        memberLevel: true,
        points: true,
        totalSpent: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.user.count({ where });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('取得會員列表錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取得會員列表失敗'
    });
  }
});

// 取得所有預約
router.get('/bookings', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, date } = req.query;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (date) {
      where.date = new Date(date as string);
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: { name: true, phone: true }
        },
        service: {
          select: { name: true, price: true }
        },
        staff: {
          select: { name: true }
        }
      },
      orderBy: { date: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.booking.count({ where });

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('取得預約列表錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取得預約列表失敗'
    });
  }
});

// 更新預約狀態
router.put('/bookings/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '無效的預約狀態'
      });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status: status as any },
      include: {
        user: {
          select: { name: true, phone: true }
        },
        service: {
          select: { name: true }
        }
      }
    });

    res.json({
      success: true,
      message: '預約狀態更新成功',
      data: { booking }
    });
  } catch (error) {
    console.error('更新預約狀態錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新預約狀態失敗'
    });
  }
});

// 取得營收報表
router.get('/revenue', authenticateAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = { status: 'COMPLETED' };
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const revenue = await prisma.payment.aggregate({
      _sum: { amount: true },
      _count: { id: true },
      where
    });

    // 按日期分組的營收
    const dailyRevenue = await prisma.payment.groupBy({
      by: ['createdAt'],
      _sum: { amount: true },
      _count: { id: true },
      where,
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      data: {
        totalRevenue: revenue._sum.amount || 0,
        totalTransactions: revenue._count.id || 0,
        dailyRevenue
      }
    });
  } catch (error) {
    console.error('取得營收報表錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取得營收報表失敗'
    });
  }
});

module.exports = router;
