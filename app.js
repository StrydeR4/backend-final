console.log("APP FILE:", __filename);


const express = require("express");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => res.send("Sneaker Store API is running"));

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/products/:productId/reviews", reviewRoutes);

console.log("AUTH ROUTES MOUNTED");

module.exports = app;
