import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axiosInstance.get(`/orders/${id}`);
        setOrder(data);
      } catch (err) {
        setError('Could not load order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <p>Loading order...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!order) return null;

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h1>Order Confirmed!</h1>
      <p>Thank you for your order. Your order ID is <strong>{order._id}</strong>.</p>

      <h3>Items</h3>
      {order.items.map((item) => (
        <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
          <span>{item.name} {item.size && `(${item.size}${item.color ? ', ' + item.color : ''})`} × {item.quantity}</span>
          <span>${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      ))}

      <hr />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Items</span><span>${order.itemsPrice.toFixed(2)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Shipping</span><span>${order.shippingPrice.toFixed(2)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Tax</span><span>${order.taxPrice.toFixed(2)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem' }}>
        <span>Total</span><span>${order.totalPrice.toFixed(2)}</span>
      </div>

      <h3 style={{ marginTop: '1.5rem' }}>Shipping To</h3>
      <p>
        {order.shippingAddress.fullName}<br />
        {order.shippingAddress.addressLine1}<br />
        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
        {order.shippingAddress.country}
      </p>

      <Link to="/">Continue Shopping</Link>
    </div>
  );
};

export default OrderConfirmation;