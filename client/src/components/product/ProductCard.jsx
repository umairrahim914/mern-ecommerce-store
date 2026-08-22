import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <Link
      to={`/products/${product._id}`}
      className="card product-card"
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <img
        src={product.images?.[0] || 'https://placehold.co/300'}
        alt={product.name}
      />
      <h3>{product.name}</h3>
      <p className="category">{product.category}</p>
      <p className="price">From ${product.basePrice.toFixed(2)}</p>
    </Link>
  );
};

export default ProductCard;