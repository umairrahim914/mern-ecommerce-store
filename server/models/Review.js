const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,          // we'll constantly query "all reviews for this product"
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

// Prevent the same user from reviewing the same product more than once
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Recalculate the parent Product's average rating whenever a review is saved
reviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        ratingsCount: { $sum: 1 },
        ratingsAverage: { $avg: '$rating' },
      },
    },
  ]);

  const Product = mongoose.model('Product');

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsCount: stats[0].ratingsCount,
      ratingsAverage: stats[0].ratingsAverage,
    });
  } else {
    // no reviews left — reset to defaults
    await Product.findByIdAndUpdate(productId, {
      ratingsCount: 0,
      ratingsAverage: 0,
    });
  }
};

// Hook: recalculate ratings after a review is saved
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.product);
});

// Hook: recalculate ratings after a review is deleted (via findOneAndDelete)
reviewSchema.post(/^findOneAnd/, async function (doc) {
  if (doc) await doc.constructor.calcAverageRatings(doc.product);
});

module.exports = mongoose.model('Review', reviewSchema);