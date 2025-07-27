const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  bulkPrice: {
    type: Number,
    min: 0
  },
  bulkQty: {
    type: Number,
    default: 1,
    min: 1
  },
  category: {
    type: String,
    required: true
  },
  inStock: {
    type: Boolean,
    default: true
  },
  image: {  // This is your existing array field
    type: [String],
    default: []
  },
  description: {
    type: String,
    default: ""
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Set bulkPrice to price if not provided
productSchema.pre("save", function(next) {
  if (!this.bulkPrice) {
    this.bulkPrice = this.price;
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
