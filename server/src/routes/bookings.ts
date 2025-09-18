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

// 建立預約
router.post('/', authenticateToken, [
  body('serviceId').notEmpty().withMessage('服務ID為必填'),
  body('date').isISO8601().withMessage('請輸入有效的日期'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('請輸入有效的時間格式'),
  body('staffId').optional().isString()
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

    const { serviceId, date, startTime, staffId, notes } = req.body;
    const userId = req.user.userId;

    // 檢查服務是否存在
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service || !service.isActive) {
      return res.status(400).json({
        success: false,
        message: '服務不存在或已停用'
      });
    }

    // 計算結束時間
    const startTimeMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const endTimeMinutes = startTimeMinutes + service.duration;
    const endTime = `${Math.floor(endTimeMinutes / 60).toString().padStart(2, '0')}:${(endTimeMinutes % 60).toString().padStart(2, '0')}`;

    // 檢查時間衝突
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        date: new Date(date),
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          }
        ],
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS']
        }
      }
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: '該時段已被預約'
      });
    }

    // 建立預約
    const booking = await prisma.booking.create({
      data: {
        userId,
        serviceId,
        staffId,
        date: new Date(date),
        startTime,
        endTime,
        notes
      },
      include: {
        service: true,
        staff: true
      }
    });

    res.status(201).json({
      success: true,
      message: '預約建立成功',
      data: { booking }
    });
  } catch (error) {
    console.error('建立預約錯誤:', error);
    res.status(500).json({
      success: false,
      message: '建立預約失敗，請稍後再試'
    });
  }
});

// 取得使用者預約列表
router.get('/my-bookings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status } = req.query;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        service: true,
        staff: true
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

// 取得單一預約詳情
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        userId
      },
      include: {
        service: true,
        staff: true,
        payments: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: '找不到預約記錄'
      });
    }

    res.json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    console.error('取得預約詳情錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取得預約詳情失敗'
    });
  }
});

// 取消預約
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        userId,
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: '找不到可取消的預約記錄'
      });
    }

    // 檢查是否可以取消（例如：預約時間前2小時內不能取消）
    const now = new Date();
    const bookingDateTime = new Date(booking.date);
    bookingDateTime.setHours(parseInt(booking.startTime.split(':')[0]), parseInt(booking.startTime.split(':')[1]));
    
    const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilBooking < 2) {
      return res.status(400).json({
        success: false,
        message: '預約時間前2小時內無法取消'
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        service: true,
        staff: true
      }
    });

    res.json({
      success: true,
      message: '預約已取消',
      data: { booking: updatedBooking }
    });
  } catch (error) {
    console.error('取消預約錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取消預約失敗'
    });
  }
});

// 取得可預約時段
router.get('/available-slots/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: '請提供日期參數'
      });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service || !service.isActive) {
      return res.status(400).json({
        success: false,
        message: '服務不存在或已停用'
      });
    }

    // 取得該日期的已預約時段
    const existingBookings = await prisma.booking.findMany({
      where: {
        date: new Date(date as string),
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS']
        }
      },
      select: {
        startTime: true,
        endTime: true
      }
    });

    // 產生可預約時段（假設營業時間為9:00-21:00，每30分鐘一個時段）
    const availableSlots = [];
    const startHour = 9;
    const endHour = 21;
    const slotDuration = 30; // 分鐘

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const startTimeMinutes = hour * 60 + minute;
        const endTimeMinutes = startTimeMinutes + service.duration;
        
        if (endTimeMinutes <= endHour * 60) {
          const endTime = `${Math.floor(endTimeMinutes / 60).toString().padStart(2, '0')}:${(endTimeMinutes % 60).toString().padStart(2, '0')}`;
          
          // 檢查是否與現有預約衝突
          const isConflict = existingBookings.some(booking => {
            const bookingStart = parseInt(booking.startTime.split(':')[0]) * 60 + parseInt(booking.startTime.split(':')[1]);
            const bookingEnd = parseInt(booking.endTime.split(':')[0]) * 60 + parseInt(booking.endTime.split(':')[1]);
            
            return (startTimeMinutes < bookingEnd && endTimeMinutes > bookingStart);
          });

          if (!isConflict) {
            availableSlots.push({
              startTime,
              endTime,
              duration: service.duration
            });
          }
        }
      }
    }

    res.json({
      success: true,
      data: { availableSlots }
    });
  } catch (error) {
    console.error('取得可預約時段錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取得可預約時段失敗'
    });
  }
});

module.exports = router;
