const mongoose = require('mongoose');

// Embedded snapshot of what was actually purchased — frozen at order time
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',        // kept only so admin can still click through to the current product page
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    name: { type: String, required: true },      // frozen product name at purchase time
    size: String,
    color: String,
    image: String,
    price: {
      type: Number,           // frozen price at purchase time — NOT a live reference
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }               // no need for a separate _id per order line item
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,        // e.g., 'stripe', 'cod'
    },
    paymentResult: {
      // populated after payment gateway confirms — details in Milestone 8
      id: String,
      status: String,
      updateTime: String,
      email: String,
    },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);