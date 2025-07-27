const Product = require("../models/Product");
const asyncHandler = require("express-async-handler");

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
    .limit(limit)
    .lean();
    
  // Ensure all products have images array
  const formattedProducts = products.map(product => ({
    ...product,
    images: product.images || [product.image || ''].filter(Boolean),
    id: product._id.toString()
  }));
  
  res.json(formattedProducts);
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  
  // Format images array
  const formattedProduct = {
    ...product,
    images: product.images || [product.image || ''].filter(Boolean),
    id: product._id.toString()
  };
  
  res.json(formattedProduct);
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { 
    name, 
    price, 
    bulkPrice, 
    bulkQty, 
    category, 
    description, 
    inStock,
    images
  } = req.body;
  
  // Validate required fields
  if (!name || !price || !category) {
    res.status(400);
    throw new Error("Please include name, price and category");
  }
  
  // Create product with images array
  const product = await Product.create({
    name,
    price,
    bulkPrice: bulkPrice || price,
    bulkQty: bulkQty || 1,
    category,
    description: description || "",
    inStock: inStock !== undefined ? inStock : true,
    images: images || []
  });
  
  res.status(201).json({
    ...product._doc,
    images: product.images || [],
    id: product._id.toString()
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
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
  
  // Update images if provided
  if (req.body.images !== undefined) {
    product.images = req.body.images;
  }
  
  const updatedProduct = await product.save();
  
  res.json({
    ...updatedProduct._doc,
    images: updatedProduct.images || [],
    id: updatedProduct._id.toString()
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  
  await product.remove();
  
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
