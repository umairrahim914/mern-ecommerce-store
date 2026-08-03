const mongoose = require('mongoose');

// Sub-schema for individual variants (size/color combinations)
const variantSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,       // unique across the whole collection, not just within one product
    },
    size: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    images: [String],     // variant-specific images (e.g., different color photos)
  },
  { _id: true }            // each variant gets its own _id — this becomes the "variant ID" we reference in Cart/Order
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,        // used for clean URLs, e.g. /products/mens-cotton-tee
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      index: true,          // we'll filter by category constantly — index speeds that up
    },
    brand: {
      type: String,
      trim: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
      // shown on listing pages before a variant is selected
    },
    images: [String],       // default/primary product images
    variants: {
      type: [variantSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: 'Product must have at least one variant',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,        // soft-delete flag — see note below
    },
  },
  { timestamps: true }
);

// Virtual: total stock across all variants — computed, not stored
productSchema.virtual('totalStock').get(function () {
  return this.variants.reduce((sum, v) => sum + v.stock, 0);
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);