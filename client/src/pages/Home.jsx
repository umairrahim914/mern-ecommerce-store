import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import ProductGrid from '../components/product/ProductGrid';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axiosInstance.get('/products');
        setProducts(data.products);
      } catch (err) {
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Our Products</h1>
      <ProductGrid products={products} />
    </div>
  );
};

export default Home;