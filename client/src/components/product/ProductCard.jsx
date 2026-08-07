import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <Link
      to={`/products/${product._id}`}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        border: '1px solid #eee',
        borderRadius: '8px',
        padding: '1rem',
        display: 'block',
      }}
    >
      <img
        src={product.images?.[0] || 'https://via.placeholder.com/300'}
        alt={product.name}
        style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }}
      />
      <h3 style={{ margin: '0.5rem 0 0.25rem' }}>{product.name}</h3>
      <p style={{ color: '#666', margin: 0 }}>{product.category}</p>
      <p style={{ fontWeight: 'bold', marginTop: '0.5rem' }}>
        From ${product.basePrice.toFixed(2)}
      </p>
    </Link>
  );
};

export default ProductCard;