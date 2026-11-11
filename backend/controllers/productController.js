const Product = require("../models/Product");
const Cart = require("../models/Cart");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getProducts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.search) {
      filter.name = { $regex: escapeRegex(String(req.query.search)), $options: "i" };
    }
    if (req.query.category) filter.category = req.query.category;

    const products = await Product.find(filter).sort({ createdAt: -1 });
    return res.json({ count: products.length, products });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch products", error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.json({ product });
  } catch (error) {
    return res.status(400).json({ message: "Invalid product ID" });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category, stock } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ message: "Name and price are required" });
    }
    const product = await Product.create({ name, description, price, image, category, stock });
    return res.status(201).json({ message: "Product created", product });
  } catch (error) {
    return res.status(400).json({ message: "Could not create product", error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const allowedFields = ["name", "description", "price", "image", "category", "stock"];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.json({ message: "Product updated", product });
  } catch (error) {
    return res.status(400).json({ message: "Could not update product", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    await Cart.updateMany(
      { "items.product": product._id },
      { $pull: { items: { product: product._id } } }
    );
    return res.json({ message: "Product deleted" });
  } catch (error) {
    return res.status(400).json({ message: "Invalid product ID" });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
