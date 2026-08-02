import { useEffect, useState } from 'react';
import axiosInstance from './api/axiosInstance';

function App() {
  const [status, setStatus] = useState('Checking...');

  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await axiosInstance.get('/health');
        setStatus(response.data.message);
      } catch (error) {
        setStatus('Failed to connect to server');
        console.error(error);
      }
    };
    checkServer();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>MERN E-Commerce Setup Check</h1>
      <p>Server status: <strong>{status}</strong></p>
    </div>
  );
}

export default App;