const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    return res.json({ cart });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch cart", error: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = Number(quantity);
    if (!productId || !Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ message: "Valid productId and quantity are required" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stock < qty) return res.status(400).json({ message: "Not enough stock" });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const item = cart.items.find((entry) => entry.product.toString() === productId);
    if (item) {
      if (product.stock < item.quantity + qty) {
        return res.status(400).json({ message: "Not enough stock for requested quantity" });
      }
      item.quantity += qty;
    } else {
      cart.items.push({ product: productId, quantity: qty });
    }

    await cart.save();
    await cart.populate("items.product");
    return res.status(201).json({ message: "Added to cart", cart });
  } catch (error) {
    return res.status(400).json({ message: "Could not add to cart", error: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be a positive integer" });
    }

    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (quantity > product.stock) return res.status(400).json({ message: "Not enough stock" });

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find((entry) => entry.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ message: "Cart item not found" });

    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.product");
    return res.json({ message: "Cart updated", cart });
  } catch (error) {
    return res.status(400).json({ message: "Could not update cart", error: error.message });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (entry) => entry.product.toString() !== req.params.productId
    );
    await cart.save();
    await cart.populate("items.product");
    return res.json({ message: "Item removed", cart });
  } catch (error) {
    return res.status(500).json({ message: "Could not remove item", error: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.json({ message: "Cart is already empty" });
    cart.items = [];
    await cart.save();
    return res.json({ message: "Cart cleared", cart });
  } catch (error) {
    return res.status(500).json({ message: "Could not clear cart", error: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
