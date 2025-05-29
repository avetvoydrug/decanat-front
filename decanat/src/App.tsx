import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import Home from './pages/Home';
import { CircularProgress, Box } from '@mui/material';

export default function App() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
        const token = localStorage.getItem('access_token');
        if (token) {
          setIsAuth(true);
        }
        else {
          setIsAuth(false);
        }
    };
    checkAuth();
  }, []);

  if (isAuth === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/" element={isAuth ? <Home /> : <Auth />} />
      <Route path="/auth" element={<Auth />} />
    </Routes>
  );
}