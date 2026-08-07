import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import ProductDetails from './pages/ProductDetails';
import PrivateRoute from './routes/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products/:id" element={<ProductDetails />} />

          {/* Protected routes — must be logged in */}
          <Route element={<PrivateRoute />}>
            <Route path="/cart" element={<Cart />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;