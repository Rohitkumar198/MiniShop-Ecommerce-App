const express = require("express");
const { getUsers, updateUserRole, deleteUser } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.use(protect, adminOnly);
router.get("/", getUsers);
router.patch("/:id/role", updateUserRole);
router.delete("/:id", deleteUser);

module.exports = router;
