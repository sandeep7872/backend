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
    required: true,
    min: 0
  },
  bulkQty: {
    type: Number,
    required: true,
    min: 1
  },
  category: {
    type: String,
    required: true
  },
  inStock: {
    type: Boolean,
    required: true,
    default: true
  },
  image: {  // Array of strings as in your example
    type: [String],
    required: true,
    validate: {
      validator: function(array) {
        return array.length > 0 && array.every(url => typeof url === 'string');
      },
      message: 'At least one valid image URL is required'
    }
  },
  description: {
    type: String,
    default: ""
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Remove MongoDB-specific fields and return clean object
      ret.id = ret.id.toString(); // Ensure ID is string if needed
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Set default bulkPrice if not provided (though it's required in schema)
productSchema.pre("save", function(next) {
  if (!this.bulkPrice && this.price) {
    this.bulkPrice = this.price;
  }
  next();
});

// Ensure image is always an array (backward compatibility)
productSchema.pre("save", function(next) {
  if (this.image && !Array.isArray(this.image)) {
    this.image = [this.image];
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
