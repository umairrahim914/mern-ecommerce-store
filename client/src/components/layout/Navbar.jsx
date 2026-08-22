import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
  <nav className="navbar">
    <Link to="/" className="navbar-brand">E-Commerce Store</Link>
    <div className="navbar-links">
      {user ? (
        <>
          {user.role === 'admin' && <Link to="/admin/products">Admin</Link>}
          <Link to="/cart">Cart ({itemCount})</Link>
          <span className="text-muted">Hi, {user.name}</span>
          <button className="btn-secondary" onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </div>
  </nav>
);

};

export default Navbar;