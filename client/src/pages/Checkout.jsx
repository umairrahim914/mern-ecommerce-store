import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import axiosInstance from '../api/axiosInstance';

const Checkout = () => {
  const { cart, clearCartLocally } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');
    setPlacing(true);

    try {
      const { data } = await axiosInstance.post('/orders', {
        shippingAddress: form,
        paymentMethod,
      });

      // We know checkout succeeded and the backend cleared the cart —
      // update local state immediately instead of an extra GET /cart round trip
      clearCartLocally();

      navigate(`/order-confirmation/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return <p>Your cart is empty. Add items before checking out.</p>;
  }

  const unavailableItems = cart.items.filter((item) => !item.isAvailable);

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto' }}>
      <h1>Checkout</h1>

      {unavailableItems.length > 0 && (
        <p style={{ color: 'red' }}>
          Some items in your cart are no longer available. Please remove them before checking out.
        </p>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handlePlaceOrder}>
        <h3>Shipping Address</h3>

        <input
          name="fullName" placeholder="Full Name" value={form.fullName}
          onChange={handleChange} required style={inputStyle}
        />
        <input
          name="addressLine1" placeholder="Address Line 1" value={form.addressLine1}
          onChange={handleChange} required style={inputStyle}
        />
        <input
          name="addressLine2" placeholder="Address Line 2 (optional)" value={form.addressLine2}
          onChange={handleChange} style={inputStyle}
        />
        <input
          name="city" placeholder="City" value={form.city}
          onChange={handleChange} required style={inputStyle}
        />
        <input
          name="state" placeholder="State/Province" value={form.state}
          onChange={handleChange} required style={inputStyle}
        />
        <input
          name="postalCode" placeholder="Postal Code" value={form.postalCode}
          onChange={handleChange} required style={inputStyle}
        />
        <input
          name="country" placeholder="Country" value={form.country}
          onChange={handleChange} required style={inputStyle}
        />
        <input
          name="phone" placeholder="Phone (optional)" value={form.phone}
          onChange={handleChange} style={inputStyle}
        />

        <h3>Payment Method</h3>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={inputStyle}>
          <option value="cod">Cash on Delivery</option>
          <option value="stripe">Credit/Debit Card (coming soon)</option>
        </select>

        <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
          Order Total: ${cart.itemsTotal.toFixed(2)}
        </p>

        <button
          type="submit"
          disabled={placing || unavailableItems.length > 0}
          style={{ width: '100%', padding: '0.75rem' }}
        >
          {placing ? 'Placing order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
};

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '0.5rem',
  marginBottom: '0.75rem',
};

export default Checkout;