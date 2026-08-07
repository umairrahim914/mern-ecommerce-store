import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axiosInstance.get(`/products/${id}`);
        setProduct(data);
        // Default to the first variant so the price/stock display isn't empty
        setSelectedVariant(data.variants[0]);
      } catch (err) {
        setError('Product not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    setMessage('');
    try {
      await axiosInstance.post('/cart/items', {
        productId: product._id,
        variantId: selectedVariant._id,
        quantity,
      });
      setMessage('Added to cart!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add to cart.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!product) return null;

  // Derive the unique set of sizes and colors available across all variants,
  // so the picker only shows real options, not hardcoded guesses
  const sizes = [...new Set(product.variants.map((v) => v.size).filter(Boolean))];
  const colors = [...new Set(product.variants.map((v) => v.color).filter(Boolean))];

  const handleSizeChange = (size) => {
    // Find a variant matching the new size, keeping the current color if possible
    const match =
      product.variants.find((v) => v.size === size && v.color === selectedVariant.color) ||
      product.variants.find((v) => v.size === size);
    setSelectedVariant(match);
  };

  const handleColorChange = (color) => {
    const match =
      product.variants.find((v) => v.color === color && v.size === selectedVariant.size) ||
      product.variants.find((v) => v.color === color);
    setSelectedVariant(match);
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
      <img
        src={selectedVariant?.images?.[0] || product.images?.[0] || 'https://placehold.co/400'}
        alt={product.name}
        style={{ width: '400px', height: '400px', objectFit: 'cover', borderRadius: '8px' }}
      />

      <div style={{ flex: 1, minWidth: '300px' }}>
        <h1>{product.name}</h1>
        <p style={{ color: '#666' }}>{product.description}</p>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          ${selectedVariant?.price.toFixed(2)}
        </p>

        {sizes.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <label>Size: </label>
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => handleSizeChange(size)}
                style={{
                  margin: '0 0.25rem',
                  fontWeight: selectedVariant?.size === size ? 'bold' : 'normal',
                  border: selectedVariant?.size === size ? '2px solid black' : '1px solid #ccc',
                }}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        {colors.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <label>Color: </label>
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                style={{
                  margin: '0 0.25rem',
                  fontWeight: selectedVariant?.color === color ? 'bold' : 'normal',
                  border: selectedVariant?.color === color ? '2px solid black' : '1px solid #ccc',
                }}
              >
                {color}
              </button>
            ))}
          </div>
        )}

        <p>
          {selectedVariant?.stock > 0
            ? `${selectedVariant.stock} in stock`
            : 'Out of stock'}
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <label>Qty: </label>
          <input
            type="number"
            min="1"
            max={selectedVariant?.stock || 1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            style={{ width: '60px' }}
          />
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!selectedVariant || selectedVariant.stock === 0}
          style={{ padding: '0.75rem 1.5rem' }}
        >
          Add to Cart
        </button>

        {message && <p style={{ marginTop: '0.5rem' }}>{message}</p>}
      </div>
    </div>
  );
};

export default ProductDetails;