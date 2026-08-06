const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Create a new order from the user's cart (checkout)
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  if (!shippingAddress || !paymentMethod) {
    return res.status(400).json({ message: 'Shipping address and payment method are required' });
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: 'Your cart is empty' });
  }

  // Start a MongoDB session — this is what makes the following operations
  // atomic: either ALL of them succeed, or NONE of them do.
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderItems = [];
    let itemsPrice = 0;

    // Re-validate every item against LIVE product data inside the transaction.
    // This closes the gap between "item was in cart" and "item is being purchased" —
    // stock could have changed in between.
    for (const cartItem of cart.items) {
      // .session(session) ties this read to the transaction
      const product = await Product.findById(cartItem.product).session(session);
      const variant = product?.variants.id(cartItem.variantId);

      if (!product || !variant) {
        throw new Error(`Product or variant no longer available: ${cartItem.name}`);
      }
      if (variant.stock < cartItem.quantity) {
        throw new Error(`Insufficient stock for ${cartItem.name} (${variant.stock} left)`);
      }

      // Build the FROZEN snapshot for this order item — price comes from
      // the live variant right now, then never changes again after this point
      orderItems.push({
        product: product._id,
        variantId: variant._id,
        name: product.name,
        size: variant.size,
        color: variant.color,
        image: cartItem.image,
        price: variant.price,
        quantity: cartItem.quantity,
      });

      itemsPrice += variant.price * cartItem.quantity;

      // Atomically decrement stock for this specific variant, using MongoDB's
      // positional operator ($) to target the matching array element
      const updateResult = await Product.updateOne(
        { _id: product._id, 'variants._id': variant._id, 'variants.stock': { $gte: cartItem.quantity } },
        { $inc: { 'variants.$.stock': -cartItem.quantity } },
        { session }
      );

      // If nothing matched, stock was insufficient at the exact moment of update
      // (e.g., someone else bought the last units between our check above and now)
      if (updateResult.modifiedCount === 0) {
        throw new Error(`Stock for ${cartItem.name} changed — please review your cart`);
      }
    }

    const shippingPrice = itemsPrice > 100 ? 0 : 9.99; // simple example rule
    const taxPrice = Number((itemsPrice * 0.08).toFixed(2));
    const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

    const [order] = await Order.create(
      [
        {
          user: req.user._id,
          items: orderItems,
          shippingAddress,
          paymentMethod,
          itemsPrice,
          shippingPrice,
          taxPrice,
          totalPrice,
        },
      ],
      { session }
    );

    // Clear the cart now that checkout succeeded
    cart.items = [];
    await cart.save({ session });

    // Everything above succeeded — make it all permanent at once
    await session.commitTransaction();

    res.status(201).json(order);
  } catch (error) {
    // Anything above throws → undo EVERY change made during this transaction
    // (order creation, stock decrements, cart clearing) as if none of it happened
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching orders', error: error.message });
  }
};

// @desc    Get single order by ID (owner or admin only)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ownership check: only the order's own user OR an admin can view it
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.status(200).json(order);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }
    res.status(500).json({ message: 'Server error fetching order', error: error.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById };