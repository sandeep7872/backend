const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
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
  description: {
    type: String,
    default: ""
  },
  inStock: {
    type: Boolean,
    default: true
  },
  images: {
    type: [String],
    default: []
  },
  // Keeping image for backward compatibility
  image: {
    type: String,
    default: ""
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
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
