import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// 取得所有服務
router.get('/', async (req, res) => {
  try {
    const { category, isActive = 'true' } = req.query;

    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (isActive !== 'all') {
      where.isActive = isActive === 'true';
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { services }
    });
  } catch (error) {
    console.error('取得服務列表錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取得服務列表失敗'
    });
  }
});

// 取得單一服務詳情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: '找不到服務'
      });
    }

    res.json({
      success: true,
      data: { service }
    });
  } catch (error) {
    console.error('取得服務詳情錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取得服務詳情失敗'
    });
  }
});

// 取得服務分類
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await prisma.service.findMany({
      select: { category: true },
      distinct: ['category'],
      where: { isActive: true }
    });

    res.json({
      success: true,
      data: { categories: categories.map(c => c.category) }
    });
  } catch (error) {
    console.error('取得服務分類錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取得服務分類失敗'
    });
  }
});

// 建立服務（管理員功能）
router.post('/', [
  body('name').notEmpty().withMessage('服務名稱為必填'),
  body('duration').isInt({ min: 1 }).withMessage('時長必須大於0'),
  body('price').isFloat({ min: 0 }).withMessage('價格必須大於等於0'),
  body('category').notEmpty().withMessage('分類為必填')
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

    const { name, description, duration, price, category } = req.body;

    const service = await prisma.service.create({
      data: {
        name,
        description,
        duration,
        price,
        category
      }
    });

    res.status(201).json({
      success: true,
      message: '服務建立成功',
      data: { service }
    });
  } catch (error) {
    console.error('建立服務錯誤:', error);
    res.status(500).json({
      success: false,
      message: '建立服務失敗'
    });
  }
});

// 更新服務（管理員功能）
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('服務名稱不能為空'),
  body('duration').optional().isInt({ min: 1 }).withMessage('時長必須大於0'),
  body('price').optional().isFloat({ min: 0 }).withMessage('價格必須大於等於0')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, duration, price, category, isActive } = req.body;

    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        duration,
        price,
        category,
        isActive
      }
    });

    res.json({
      success: true,
      message: '服務更新成功',
      data: { service }
    });
  } catch (error) {
    console.error('更新服務錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新服務失敗'
    });
  }
});

// 刪除服務（管理員功能）
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 檢查是否有相關預約
    const relatedBookings = await prisma.booking.count({
      where: { serviceId: id }
    });

    if (relatedBookings > 0) {
      return res.status(400).json({
        success: false,
        message: '此服務有相關預約記錄，無法刪除'
      });
    }

    await prisma.service.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: '服務刪除成功'
    });
  } catch (error) {
    console.error('刪除服務錯誤:', error);
    res.status(500).json({
      success: false,
      message: '刪除服務失敗'
    });
  }
});

module.exports = router;
