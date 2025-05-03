const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// 创建用户
router.post('/', userController.createUser);

// 获取所有用户
router.get('/', userController.getAllUsers);

// 获取指定用户
router.get('/:id', userController.getUserById);

// 删除用户
router.delete('/:id', userController.deleteUser);

// 📌 更新用户信息
router.put('/:id', userController.updateUser);


module.exports = router;  // ← 这行必须有