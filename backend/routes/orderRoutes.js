const express = require("express");
const { placeOrder, listMyOrders, getOrder, listAllOrders, updateOrderStatus, cancelMyOrder, deleteMyCancelledOrder, deleteOrderByAdmin } = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/", protect, placeOrder);
router.get("/mine", protect, listMyOrders);
router.get("/admin/all", protect, adminOnly, listAllOrders);
router.patch("/:id/status", protect, adminOnly, updateOrderStatus);
router.delete("/admin/:id", protect, adminOnly, deleteOrderByAdmin);
router.patch("/:id/cancel", protect, cancelMyOrder);
router.delete("/:id", protect, deleteMyCancelledOrder);
router.get("/:id", protect, getOrder);

module.exports = router;
