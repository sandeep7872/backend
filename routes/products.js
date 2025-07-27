const express = require("express");
const router = express.Router();
const { 
  getPaginatedProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

// GET paginated products
router.get("/", getPaginatedProducts);

// GET single product
router.get("/:id", getProductById);

// POST create new product with multiple images
router.post("/", createProduct);

// PUT update product (including images)
router.put("/:id", updateProduct);

// DELETE product
router.delete("/:id", deleteProduct);

module.exports = router;
