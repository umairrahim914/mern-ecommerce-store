import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

const emptyForm = {
  name: '', slug: '', description: '', category: '', brand: '', basePrice: '',
  images: '', variants: [{ sku: '', size: '', color: '', price: '', stock: '' }],
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/products?limit=100');
      setProducts(data.products);
    } catch (err) {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...form.variants];
    newVariants[index][field] = value;
    setForm({ ...form, variants: newVariants });
  };

  const addVariantRow = () => {
    setForm({ ...form, variants: [...form.variants, { sku: '', size: '', color: '', price: '', stock: '' }] });
  };

  const removeVariantRow = (index) => {
    setForm({ ...form, variants: form.variants.filter((_, i) => i !== index) });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      category: product.category,
      brand: product.brand || '',
      basePrice: product.basePrice,
      images: product.images.join(', '),
      variants: product.variants.map((v) => ({
        sku: v.sku, size: v.size || '', color: v.color || '',
        price: v.price, stock: v.stock,
      })),
    });
    setEditingId(product._id);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this product?')) return;
    try {
      await axiosInstance.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      ...form,
      basePrice: Number(form.basePrice),
      images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
      variants: form.variants.map((v) => ({
        ...v,
        price: Number(v.price),
        stock: Number(v.stock),
      })),
    };

    try {
      if (editingId) {
        await axiosInstance.put(`/products/${editingId}`, payload);
      } else {
        await axiosInstance.post('/products', payload);
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product.');
    }
  };

  return (
    <div>
      <h1>Manage Products</h1>

      <form onSubmit={handleSubmit} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '2rem' }}>
        <h3>{editingId ? 'Edit Product' : 'Create Product'}</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <input name="name" placeholder="Name" value={form.name} onChange={handleFormChange} required style={inputStyle} />
        <input name="slug" placeholder="Slug (url-friendly)" value={form.slug} onChange={handleFormChange} required style={inputStyle} />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleFormChange} required style={inputStyle} />
        <input name="category" placeholder="Category" value={form.category} onChange={handleFormChange} required style={inputStyle} />
        <input name="brand" placeholder="Brand" value={form.brand} onChange={handleFormChange} style={inputStyle} />
        <input name="basePrice" type="number" step="0.01" placeholder="Base Price" value={form.basePrice} onChange={handleFormChange} required style={inputStyle} />
        <input name="images" placeholder="Image URLs (comma-separated)" value={form.images} onChange={handleFormChange} style={inputStyle} />

        <h4>Variants</h4>
        {form.variants.map((v, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input placeholder="SKU" value={v.sku} onChange={(e) => handleVariantChange(i, 'sku', e.target.value)} required />
            <input placeholder="Size" value={v.size} onChange={(e) => handleVariantChange(i, 'size', e.target.value)} />
            <input placeholder="Color" value={v.color} onChange={(e) => handleVariantChange(i, 'color', e.target.value)} />
            <input type="number" step="0.01" placeholder="Price" value={v.price} onChange={(e) => handleVariantChange(i, 'price', e.target.value)} required />
            <input type="number" placeholder="Stock" value={v.stock} onChange={(e) => handleVariantChange(i, 'stock', e.target.value)} required />
            {form.variants.length > 1 && (
              <button type="button" onClick={() => removeVariantRow(i)}>Remove</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addVariantRow}>+ Add Variant</button>

        <div style={{ marginTop: '1rem' }}>
          <button type="submit">{editingId ? 'Update Product' : 'Create Product'}</button>
          {editingId && <button type="button" onClick={resetForm} style={{ marginLeft: '0.5rem' }}>Cancel</button>}
        </div>
      </form>

      <h3>Existing Products</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #ddd' }}>
              <th>Name</th><th>Category</th><th>Base Price</th><th>Total Stock</th><th>Active</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>${p.basePrice.toFixed(2)}</td>
                <td>{p.totalStock}</td>
                <td>{p.isActive ? 'Yes' : 'No'}</td>
                <td>
                  <button onClick={() => handleEdit(p)}>Edit</button>
                  <button onClick={() => handleDelete(p._id)} style={{ marginLeft: '0.5rem', color: 'red' }}>
                    Deactivate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const inputStyle = { display: 'block', width: '100%', padding: '0.5rem', marginBottom: '0.5rem' };

export default AdminProducts;