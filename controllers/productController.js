const Product = require("../models/Product");
const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");

// @desc    Get paginated products
// @route   GET /api/products
// @access  Public
const getPaginatedProducts = asyncHandler(async (req, res) => {
  // Validate query parameters
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 250;
    const skip = (page - 1) * limit;

    const { category, search } = req.query;

    // Build query object
    const query = {};
    if (category && category !== "all") query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Get products with pagination
    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ id: 1 })
        .lean(),
      Product.countDocuments(query)
    ]);

    // Format products for frontend
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      bulkPrice: product.bulkPrice,
      bulkQty: product.bulkQty,
      category: product.category,
      inStock: product.inStock,
      image: product.image, // Already an array from model
      description: product.description
    }));

    res.json({
      success: true,
      count: formattedProducts.length,
      total: totalCount,
      page,
      pages: Math.ceil(totalCount / limit),
      data: formattedProducts
    });

  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id }).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      data: {
        ...product,
        // Ensure image is always an array
        image: Array.isArray(product.image) ? product.image : [product.image || ""]
      }
    });

  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      id,
      name,
      price,
      bulkPrice,
      bulkQty,
      category,
      inStock,
      image,
      description
    } = req.body;

    // Check if product ID already exists
    const existingProduct = await Product.findOne({ id });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product with this ID already exists"
      });
    }

    const product = await Product.create({
      id,
      name,
      price,
      bulkPrice: bulkPrice || price,
      bulkQty: bulkQty || 1,
      category,
      inStock: inStock !== undefined ? inStock : true,
      image: Array.isArray(image) ? image : [image || ""],
      description: description || ""
    });

    res.status(201).json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      {
        $set: {
          ...req.body,
          // Handle image update
          image: Array.isArray(req.body.image) ? req.body.image : [req.body.image || ""],
          // Ensure these fields remain numbers
          price: parseFloat(req.body.price),
          bulkPrice: parseFloat(req.body.bulkPrice),
          bulkQty: parseInt(req.body.bulkQty)
        }
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: req.params.id });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Product removed successfully"
    });

  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

module.exports = {
  getPaginatedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
