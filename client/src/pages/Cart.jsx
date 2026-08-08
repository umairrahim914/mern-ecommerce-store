import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

const CartPage = () => {
  const { cart, loading, updateCartItem, removeCartItem } = useCart();
  const navigate = useNavigate();

  if (loading) return <p>Loading cart...</p>;

  if (!cart || cart.items.length === 0) {
    return (
      <div>
        <h1>Your Cart</h1>
        <p>Your cart is empty.</p>
        <Link to="/">Continue shopping</Link>
      </div>
    );
  }

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update quantity.');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeCartItem(itemId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove item.');
    }
  };

  return (
    <div>
      <h1>Your Cart</h1>

      {cart.items.map((item) => (
        <div
          key={item._id}
          style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            borderBottom: '1px solid #eee',
            padding: '1rem 0',
            opacity: item.isAvailable ? 1 : 0.5,
          }}
        >
          <img
            src={item.image || 'https://placehold.co/80'}
            alt={item.name}
            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
          />

          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{item.name}</p>
            <p style={{ margin: 0, color: '#666' }}>
              {item.size && `Size: ${item.size}`} {item.color && `· Color: ${item.color}`}
            </p>
            {!item.isAvailable && (
              <p style={{ margin: 0, color: 'red', fontSize: '0.85rem' }}>No longer available</p>
            )}
            {item.isAvailable && (
              <p style={{ margin: '0.25rem 0 0' }}>${item.price.toFixed(2)} each</p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={() => handleQuantityChange(item._id, item.quantity - 1)} disabled={!item.isAvailable}>-</button>
            <span>{item.quantity}</span>
            <button onClick={() => handleQuantityChange(item._id, item.quantity + 1)} disabled={!item.isAvailable}>+</button>
          </div>

          <p style={{ width: '80px', textAlign: 'right', fontWeight: 'bold' }}>
            {item.isAvailable ? `$${(item.price * item.quantity).toFixed(2)}` : '—'}
          </p>

          <button onClick={() => handleRemove(item._id)} style={{ color: 'red' }}>
            Remove
          </button>
        </div>
      ))}

      <div style={{ marginTop: '2rem', textAlign: 'right' }}>
        <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          Subtotal: ${cart.itemsTotal?.toFixed(2) || '0.00'}
        </p>
        <button onClick={() => navigate('/checkout')} style={{ padding: '0.75rem 2rem' }}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartPage;