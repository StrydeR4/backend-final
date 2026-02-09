const Product = require("../models/Product");

exports.create = async (req, res) => {
  try {
    const { name, brand, price, category, sizeRange } = req.body;
    if (!name || !brand || price === undefined || !category || !sizeRange?.min || !sizeRange?.max) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
};

exports.getOne = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Product not found" });
    res.json(p);
  } catch {
    res.status(400).json({ message: "Invalid ID" });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch {
    res.status(400).json({ message: "Invalid ID" });
  }
};
