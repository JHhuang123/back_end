const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const upload = require("../middlewares/uploadAvatar");

// 创建用户
router.post("/", userController.createUser);

// 获取所有用户
router.get("/", userController.getAllUsers);

// 获取单个用户
router.get("/:id", userController.getUserById);

// 更新用户
router.put("/:id", userController.updateUser);

// 删除用户
router.delete("/:id", userController.deleteUser);

// 获取用户资料 profile 接口
router.get("/:id/profile", userController.getUserProfile);

// 更新用户公开资料（简化字段）
router.put("/:id/profile", userController.updateUserProfile);

// 上传头像接口
router.post("/:id/avatar", upload.single("avatar"), userController.uploadAvatar);

// 更新头像接口
router.put("/:id/avatar-url", userController.setAvatarUrl);

// 用户偏好设置
router.get("/:id/settings", userController.getUserSettings);
router.put("/:id/settings", userController.updateUserSettings);

module.exports = router;