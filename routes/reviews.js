const express = require("express");
const Review = require("../models/Review");
const Product = require("../models/Product");

const router = express.Router({ mergeParams: true });

router.post("/", async (req, res) => {
  try {
    const { productId } = req.params;
    const { authorName, rating } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (!authorName || rating === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const review = await Review.create({ ...req.body, productId });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
  res.json(reviews);
});

router.delete("/:reviewId", async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.reviewId);
    if (!deleted) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review deleted" });
  } catch {
    res.status(400).json({ message: "Invalid ID" });
  }
});

module.exports = router;
