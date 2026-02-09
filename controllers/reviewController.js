const Review = require("../models/Review");
const Product = require("../models/Product");

const reviewController = {
  createForProduct: async (req, res) => {
    try {
      const { productId } = req.params;
      const { authorName, rating, text } = req.body;

      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "Product not found" });

      if (!authorName || rating === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const review = await Review.create({
        productId,
        userId: req.user.userId, 
        authorName,
        rating,
        text: text || "",
      });

      res.status(201).json(review);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getForProduct: async (req, res) => {
    try {
      const reviews = await Review.find({ productId: req.params.productId })
        .sort({ createdAt: -1 });

      res.json(reviews);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const { reviewId } = req.params;

      const review = await Review.findById(reviewId);
      if (!review) return res.status(404).json({ message: "Review not found" });

      const isOwner = review.userId.toString() === req.user.userId;
      const isAdmin = req.user.role === "admin";
      if (!isOwner && !isAdmin) return res.status(403).json({ message: "Forbidden" });

      const updated = await Review.findByIdAndUpdate(reviewId, req.body, {
        new: true,
        runValidators: true,
      });

      res.json(updated);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  remove: async (req, res) => {
    try {
      const { reviewId } = req.params;

      const review = await Review.findById(reviewId);
      if (!review) return res.status(404).json({ message: "Review not found" });

      const isOwner = review.userId.toString() === req.user.userId;
      const isAdmin = req.user.role === "admin";
      if (!isOwner && !isAdmin) return res.status(403).json({ message: "Forbidden" });

      await Review.findByIdAndDelete(reviewId);
      res.json({ message: "Review deleted" });
    } catch (err) {
      res.status(400).json({ message: "Invalid ID" });
    }
  },
};

module.exports = reviewController;
