const Product = require("../models/Product");
const asyncHandler = require("express-async-handler");

// Helper to format product data
const formatProduct = (product) => ({
  ...product._doc,
  // Ensure image is always an array
  image: Array.isArray(product.image) ? product.image : [product.image || ''].filter(Boolean)
});

// @desc    Get paginated products
// @route   GET /api/products
// @access  Public
const getPaginatedProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 250;
  const skip = (page - 1) * limit;
  
  const category = req.query.category;
  const search = req.query.search;
  
  let query = {};
  
  if (category && category !== "all") {
    query.category = category;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }
  
  const products = await Product.find(query)
    .skip(skip)
    .limit(limit);
    
  res.json(products.map(formatProduct));
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ id: req.params.id });
  
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  
  res.json(formatProduct(product));
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { 
    id,
    name, 
    price, 
    bulkPrice, 
    bulkQty, 
    category, 
    description, 
    inStock,
    image  // Your existing image array
  } = req.body;
  
  // Validate required fields
  if (!id || !name || !price || !category) {
    res.status(400);
    throw new Error("Please include id, name, price and category");
  }
  
  const product = await Product.create({
    id,
    name,
    price,
    bulkPrice: bulkPrice || price,
    bulkQty: bulkQty || 1,
    category,
    description: description || "",
    inStock: inStock !== undefined ? inStock : true,
    image: Array.isArray(image) ? image : [image || ''].filter(Boolean)
  });
  
  res.status(201).json(formatProduct(product));
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ id: req.params.id });
  
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  
  // Update fields
  product.name = req.body.name || product.name;
  product.price = req.body.price || product.price;
  product.bulkPrice = req.body.bulkPrice || product.bulkPrice;
  product.bulkQty = req.body.bulkQty || product.bulkQty;
  product.category = req.body.category || product.category;
  product.description = req.body.description || product.description;
  product.inStock = req.body.inStock !== undefined ? req.body.inStock : product.inStock;
  
  // Update image array if provided
  if (req.body.image !== undefined) {
    product.image = Array.isArray(req.body.image) ? req.body.image : [req.body.image || ''].filter(Boolean);
  }
  
  const updatedProduct = await product.save();
  
  res.json(formatProduct(updatedProduct));
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndDelete({ id: req.params.id });
  
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  
  res.json({ 
    success: true,
    message: "Product removed"
  });
});

module.exports = {
  getPaginatedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
