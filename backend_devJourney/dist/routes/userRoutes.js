"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Only Admins can see and manage users
router.get('/', authMiddleware_1.protect, authMiddleware_1.adminOnly, userController_1.getUsers);
router.put('/role', authMiddleware_1.protect, authMiddleware_1.adminOnly, userController_1.updateUserRole);
exports.default = router;
