const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

const restoreOrderStock = (order) => Promise.all(order.items.map((item) =>
  Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })
));

const listMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({ orders });
  } catch (error) {
    return res.status(500).json({ message: "Could not load orders" });
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (req.user.role !== "admin" && order.user?._id?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You cannot view this order" });
    }
    return res.json({ order });
  } catch (error) {
    return res.status(400).json({ message: "Invalid order ID" });
  }
};

const listAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    return res.json({ orders });
  } catch (error) {
    return res.status(500).json({ message: "Could not load orders" });
  }
};

const updateOrderStatus = async (req, res) => {
  const transitions = {
    placed: ["processing", "shipped", "delivered", "cancelled"],
    processing: ["processing", "shipped", "delivered", "cancelled"],
    shipped: ["processing", "shipped", "delivered", "cancelled"],
    delivered: [],
    cancelled: []
  };
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    const { status } = req.body;
    if (!transitions[order.status]?.includes(status)) {
      return res.status(400).json({ message: `Cannot change order from ${order.status} to ${status}` });
    }
    const updated = await Order.findOneAndUpdate(
      { _id: order._id, status: order.status },
      { status },
      { new: true }
    );
    if (!updated) return res.status(409).json({ message: "Order status changed. Refresh and try again." });
    if (status === "cancelled") {
      await restoreOrderStock(order);
    }
    return res.json({ message: "Order status updated", order: updated });
  } catch (error) {
    return res.status(400).json({ message: "Could not update order status" });
  }
};

const cancelMyOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, status: { $in: ["placed", "processing"] } },
      { status: "cancelled" },
      { new: true }
    );
    if (!order) {
      const existingOrder = await Order.findOne({ _id: req.params.id, user: req.user._id }).select("status");
      if (!existingOrder) return res.status(404).json({ message: "Order not found" });
      return res.status(409).json({ message: "This order can no longer be cancelled" });
    }
    await restoreOrderStock(order);
    return res.json({ message: "Order cancelled successfully", order });
  } catch (error) {
    return res.status(400).json({ message: "Could not cancel order" });
  }
};

const deleteMyCancelledOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
      status: "cancelled"
    });
    if (order) return res.json({ message: "Cancelled order deleted" });

    const existingOrder = await Order.findOne({ _id: req.params.id, user: req.user._id }).select("status");
    if (!existingOrder) return res.status(404).json({ message: "Order not found" });
    return res.status(409).json({ message: "Only cancelled orders can be deleted" });
  } catch (error) {
    return res.status(400).json({ message: "Could not delete order" });
  }
};

const deleteOrderByAdmin = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.json({ message: "Order deleted successfully" });
  } catch (error) {
    return res.status(400).json({ message: "Could not delete order" });
  }
};

const placeOrder = async (req, res) => {
  let order;
  const stockChanges = [];
  try {
    const requiredAddressFields = ["fullName", "phone", "addressLine", "city", "state", "postalCode"];
    const shippingAddress = {};
    for (const field of requiredAddressFields) {
      const value = req.body.shippingAddress?.[field];
      if (typeof value !== "string" || !value.trim()) {
        return res.status(400).json({ message: "Please provide all delivery details" });
      }
      shippingAddress[field] = value.trim();
    }
    if (shippingAddress.phone.replace(/\D/g, "").length < 10) {
      return res.status(400).json({ message: "Enter a valid phone number" });
    }
    if (shippingAddress.postalCode.trim().length < 5) {
      return res.status(400).json({ message: "Enter a valid postal code" });
    }
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    const invalidItem = cart.items.find((item) => !item.product);
    if (invalidItem) {
      cart.items = cart.items.filter((item) => item.product);
      await cart.save();
      return res.status(400).json({ message: "A product in your cart is no longer available. Please review your cart." });
    }

    const items = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity
    }));

    for (const item of items) {
      const result = await Product.updateOne(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );
      if (result.modifiedCount !== 1) {
        throw new Error(`${item.name} no longer has enough stock. Your cart was not ordered.`);
      }
      stockChanges.push(item);
    }

    order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod: "cash_on_delivery",
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    });

    cart.items = [];
    await cart.save();
    return res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    if (!order && stockChanges.length) {
      await Promise.all(stockChanges.map((item) =>
        Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })
      ));
    }
    return res.status(error.message.includes("no longer has enough stock") ? 409 : 500).json({
      message: error.message || "Could not place order"
    });
  }
};

module.exports = { placeOrder, listMyOrders, getOrder, listAllOrders, updateOrderStatus, cancelMyOrder, deleteMyCancelledOrder, deleteOrderByAdmin };
