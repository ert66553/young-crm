import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const prisma = new PrismaClient();

// 註冊
router.post('/register', [
  body('name').notEmpty().withMessage('姓名為必填'),
  body('phone').isMobilePhone('zh-TW').withMessage('請輸入有效的手機號碼'),
  body('password').isLength({ min: 6 }).withMessage('密碼至少需要6個字符')
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

    const { name, phone, password, email, gender, birthday } = req.body;

    // 檢查手機號碼是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { phone }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '此手機號碼已被註冊'
      });
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 12);

    // 建立使用者
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        gender,
        birthday: birthday ? new Date(birthday) : null,
        // 注意：這裡我們不直接儲存密碼，而是使用LINE登入
        // 實際應用中可能需要調整
      }
    });

    // 產生JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: '註冊成功',
      data: {
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          memberLevel: user.memberLevel,
          points: user.points
        },
        token
      }
    });
  } catch (error) {
    console.error('註冊錯誤:', error);
    res.status(500).json({
      success: false,
      message: '註冊失敗，請稍後再試'
    });
  }
});

// LINE登入
router.post('/line-login', [
  body('lineUserId').notEmpty().withMessage('LINE User ID為必填'),
  body('displayName').notEmpty().withMessage('顯示名稱為必填')
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

    const { lineUserId, displayName, pictureUrl, email } = req.body;

    // 檢查是否已存在
    let user = await prisma.user.findUnique({
      where: { lineUserId }
    });

    if (!user) {
      // 建立新使用者
      user = await prisma.user.create({
        data: {
          lineUserId,
          name: displayName,
          email,
          avatar: pictureUrl,
          memberLevel: 'BASIC'
        }
      });
    } else {
      // 更新現有使用者資訊
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: displayName,
          email: email || user.email,
          avatar: pictureUrl || user.avatar
        }
      });
    }

    // 產生JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: '登入成功',
      data: {
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          avatar: user.avatar,
          memberLevel: user.memberLevel,
          points: user.points
        },
        token
      }
    });
  } catch (error) {
    console.error('LINE登入錯誤:', error);
    res.status(500).json({
      success: false,
      message: '登入失敗，請稍後再試'
    });
  }
});

// 取得使用者資料
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供認證token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        avatar: true,
        gender: true,
        birthday: true,
        address: true,
        memberLevel: true,
        points: true,
        totalSpent: true,
        isActive: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '找不到使用者'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('取得使用者資料錯誤:', error);
    res.status(401).json({
      success: false,
      message: '認證失敗'
    });
  }
});

// 更新使用者資料
router.put('/profile', [
  body('name').optional().notEmpty().withMessage('姓名不能為空'),
  body('phone').optional().isMobilePhone('zh-TW').withMessage('請輸入有效的手機號碼'),
  body('email').optional().isEmail().withMessage('請輸入有效的電子郵件')
], async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供認證token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { name, phone, email, gender, birthday, address } = req.body;

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        name,
        phone,
        email,
        gender,
        birthday: birthday ? new Date(birthday) : null,
        address
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        avatar: true,
        gender: true,
        birthday: true,
        address: true,
        memberLevel: true,
        points: true,
        totalSpent: true
      }
    });

    res.json({
      success: true,
      message: '資料更新成功',
      data: { user }
    });
  } catch (error) {
    console.error('更新使用者資料錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新失敗，請稍後再試'
    });
  }
});

module.exports = router;
