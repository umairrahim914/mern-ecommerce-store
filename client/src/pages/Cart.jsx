import { useAuth } from '../hooks/useAuth';

const Cart = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1>Your Cart</h1>
      <p>Logged in as: {user?.name}</p>
      <p>Cart UI coming in Milestone 7.</p>
    </div>
  );
};

export default Cart;