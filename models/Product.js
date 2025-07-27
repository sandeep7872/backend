const mongoose = require("mongoose");
const validator = require("validator");

const productSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: [true, "Product ID is required"],
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
    maxlength: [100, "Product name cannot exceed 100 characters"]
  },
  price: {
    type: Number,
    required: [true, "Product price is required"],
    min: [0, "Price cannot be negative"],
    set: v => parseFloat(v.toFixed(2)) // Store prices with 2 decimal places
  },
  bulkPrice: {
    type: Number,
    required: [true, "Bulk price is required"],
    min: [0, "Bulk price cannot be negative"],
    set: v => parseFloat(v.toFixed(2))
  },
  bulkQty: {
    type: Number,
    required: [true, "Bulk quantity is required"],
    min: [1, "Bulk quantity must be at least 1"]
  },
  category: {
    type: String,
    required: [true, "Product category is required"],
    trim: true,
    index: true
  },
  inStock: {
    type: Boolean,
    default: true
  },
  image: {
    type: [String],
    required: [true, "At least one product image is required"],
    validate: {
      validator: function(images) {
        // Ensure array has at least one valid URL
        return images.length > 0 && 
               images.every(img => validator.isURL(img, { 
                 protocols: ["http", "https"],
                 require_protocol: true 
               }));
      },
      message: "Please provide valid image URLs with http/https protocol"
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, "Description cannot exceed 1000 characters"]
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Remove internal fields and transform for API responses
      delete ret._id;
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for better query performance
productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1, inStock: 1 });

// Pre-save hook to ensure bulk pricing is set
productSchema.pre("save", function(next) {
  if (!this.bulkPrice || isNaN(this.bulkPrice)) {
    this.bulkPrice = this.price;
  }
  
  if (!this.bulkQty || isNaN(this.bulkQty)) {
    this.bulkQty = 1;
  }
  
  // Ensure image is always an array
  if (!Array.isArray(this.image)) {
    this.image = [this.image];
  }
  
  next();
});

// Static method for pagination
productSchema.statics.paginate = async function(query, options) {
  const { page = 1, limit = 25, sort = { id: 1 } } = options;
  const skip = (page - 1) * limit;

  const [results, total] = await Promise.all([
    this.find(query).sort(sort).skip(skip).limit(limit).lean(),
    this.countDocuments(query)
  ]);

  return {
    results,
    total,
    pages: Math.ceil(total / limit),
    page
  };
};

module.exports = mongoose.model("Product", productSchema);
