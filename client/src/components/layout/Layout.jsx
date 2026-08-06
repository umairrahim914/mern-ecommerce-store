import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div>
      <Navbar />
      <main style={{ minHeight: '80vh', padding: '1rem' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;