
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { getAllProducts } = require("../controllers/productController");

router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  try {
    const products = await Product.find().skip(skip).limit(limit).lean();
    res.json(products);
  } catch (err) {
    console.error("Error fetching paginated products:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
