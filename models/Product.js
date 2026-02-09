const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },

    category: {
      type: String,
      required: true,
      enum: ["running", "lifestyle", "basketball", "training", "other"],
      default: "other",
    },

    sizeRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },

    description: { type: String, default: "" },
    inStock: { type: Boolean, default: true },
    colors: { type: [String], default: [] },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
