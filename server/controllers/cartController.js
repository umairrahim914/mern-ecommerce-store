const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get the logged-in user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    // findOneAndUpdate + upsert: atomically get the cart if it exists,
    // or create an empty one if this is the user's first-ever cart access
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $setOnInsert: { user: req.user._id, items: [] } },
      { new: true, upsert: true }
    );

    res.status(200).json(cart);
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

    // Fetch the LIVE product — never trust name/price from the client.
    // This is the source-of-truth boundary we designed into the Cart schema.
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const variant = product.variants.id(variantId); // Mongoose subdocument lookup by _id
    if (!variant) {
      return res.status(404).json({ message: 'Product variant not found' });
    }

    if (variant.stock < quantity) {
      return res.status(400).json({ message: `Only ${variant.stock} units available for this variant` });
    }

    // Get or create the cart (same upsert pattern as getCart)
    let cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $setOnInsert: { user: req.user._id, items: [] } },
      { new: true, upsert: true }
    );

    // Check if this exact product+variant combo is already in the cart
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId && item.variantId.toString() === variantId
    );

    if (existingItem) {
      // Increment quantity on the existing line item, don't duplicate it
      existingItem.quantity += quantity;
    } else {
      // Push a new line item with a display snapshot (not price — see Cart schema notes)
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

    res.status(200).json(cart);
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

    // Re-validate stock against the LIVE product before allowing the update —
    // stock may have changed since this item was first added
    const product = await Product.findById(item.product);
    const variant = product?.variants.id(item.variantId);

    if (!variant || variant.stock < quantity) {
      return res.status(400).json({
        message: `Only ${variant ? variant.stock : 0} units available for this variant`,
      });
    }

    item.quantity = quantity;
    await cart.save();

    res.status(200).json(cart);
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
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error removing cart item', error: error.message });
  }
};

module.exports = { getCart, addItemToCart, updateCartItem, removeCartItem };