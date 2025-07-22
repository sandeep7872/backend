const Product = require("../models/Product");

exports.getPaginatedProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 250;
    const skip = (page - 1) * limit;

    const category = req.query.category;
    const search = req.query.search;

    let filter = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" }; // case-insensitive search
    }

    const products = await Product.find(filter).skip(skip).limit(limit);
    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching paginated products:", err);
    res.status(500).json({ error: "Server error" });
  }
};
