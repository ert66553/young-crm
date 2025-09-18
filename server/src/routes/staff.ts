import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// 取得所有員工
router.get('/', async (req, res) => {
  try {
    const { isActive = 'true' } = req.query;

    const where: any = {};
    if (isActive !== 'all') {
      where.isActive = isActive === 'true';
    }

    const staff = await prisma.staff.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { staff }
    });
  } catch (error) {
    console.error('取得員工列表錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取得員工列表失敗'
    });
  }
});

// 取得單一員工詳情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await prisma.staff.findUnique({
      where: { id }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: '找不到員工'
      });
    }

    res.json({
      success: true,
      data: { staff }
    });
  } catch (error) {
    console.error('取得員工詳情錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取得員工詳情失敗'
    });
  }
});

// 取得員工專長服務
router.get('/:id/specialties', async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await prisma.staff.findUnique({
      where: { id },
      select: { specialties: true }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: '找不到員工'
      });
    }

    // 根據專長取得服務列表
    const services = await prisma.service.findMany({
      where: {
        category: {
          in: staff.specialties
        },
        isActive: true
      }
    });

    res.json({
      success: true,
      data: { services }
    });
  } catch (error) {
    console.error('取得員工專長服務錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取得員工專長服務失敗'
    });
  }
});

module.exports = router;
