const express = require('express');
const router = express.Router();
const { getCart, addItemToCart, updateCartItem, removeCartItem } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// All cart routes require a logged-in user — apply protect to every route at once
router.use(protect);

router.get('/', getCart);
router.post('/items', addItemToCart);
router.put('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeCartItem);

module.exports = router;