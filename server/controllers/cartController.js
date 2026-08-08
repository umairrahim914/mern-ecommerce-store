const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Shared helper: takes a raw Cart document and returns a plain object
// with live price/stock/availability attached to every item, plus itemsTotal.
// Used by every endpoint that returns cart data, so the shape is always consistent.
const enrichCart = async (cart) => {
  if (cart.items.length === 0) {
    return { ...cart.toObject(), items: [], itemsTotal: 0 };
  }

  const uniqueProductIds = [...new Set(cart.items.map((item) => item.product.toString()))];
  const products = await Product.find({ _id: { $in: uniqueProductIds } });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const enrichedItems = cart.items.map((item) => {
    const product = productMap.get(item.product.toString());
    const variant = product?.variants.id(item.variantId);

    return {
      ...item.toObject(),
      price: variant?.price ?? null,
      availableStock: variant?.stock ?? 0,
      isAvailable: Boolean(variant && product.isActive),
    };
  });

  const itemsTotal = enrichedItems.reduce((sum, item) => {
    return item.price ? sum + item.price * item.quantity : sum;
  }, 0);

  return {
    ...cart.toObject(),
    items: enrichedItems,
    itemsTotal: Number(itemsTotal.toFixed(2)),
  };
};

// @desc    Get the logged-in user's cart (enriched with live prices)
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $setOnInsert: { user: req.user._id, items: [] } },
      { returnDocument: 'after', upsert: true }
    );

    res.status(200).json(await enrichCart(cart));
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching cart', error: error.message });
  }
};

// @desc    Add an item to the cart (or increment quantity if it already exists)
// @route   POST /api/cart/items
// @access  Private
const addItemToCart = async (req, res) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;

    if (!productId || !variantId) {
      return res.status(400).json({ message: 'productId and variantId are required' });
    }
    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({ message: 'Product variant not found' });
    }

    if (variant.stock < quantity) {
      return res.status(400).json({ message: `Only ${variant.stock} units available for this variant` });
    }

    let cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $setOnInsert: { user: req.user._id, items: [] } },
      { returnDocument: 'after', upsert: true }
    );

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId && item.variantId.toString() === variantId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: product._id,
        variantId: variant._id,
        name: product.name,
        size: variant.size,
        color: variant.color,
        image: variant.images?.[0] || product.images?.[0] || '',
        quantity,
      });
    }

    await cart.save();

    res.status(200).json(await enrichCart(cart));
  } catch (error) {
    res.status(500).json({ message: 'Server error adding to cart', error: error.message });
  }
};

// @desc    Update quantity of a specific cart item
// @route   PUT /api/cart/items/:itemId
// @access  Private
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    const product = await Product.findById(item.product);
    const variant = product?.variants.id(item.variantId);

    if (!variant || variant.stock < quantity) {
      return res.status(400).json({
        message: `Only ${variant ? variant.stock : 0} units available for this variant`,
      });
    }

    item.quantity = quantity;
    await cart.save();

    res.status(200).json(await enrichCart(cart));
  } catch (error) {
    res.status(500).json({ message: 'Server error updating cart item', error: error.message });
  }
};

// @desc    Remove a specific item from the cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private
const removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { items: { _id: req.params.itemId } } },
      { returnDocument: 'after' }
    );

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.status(200).json(await enrichCart(cart));
  } catch (error) {
    res.status(500).json({ message: 'Server error removing cart item', error: error.message });
  }
};

module.exports = { getCart, addItemToCart, updateCartItem, removeCartItem };