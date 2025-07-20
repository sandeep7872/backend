
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  description: String,
  price: Number,
  bulkPrice: Number,
  bulkQty: Number,
  category: String,
  image: String,
  inStock: Boolean
});

module.exports = mongoose.model("Product", productSchema);
