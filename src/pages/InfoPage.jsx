import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';

const InfoPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir a la página principal con la pestaña de mapa (info)
    navigate('/?tab=mapa', { replace: true });
  }, [navigate]);

  return (
    <div>
      <TopNavBar />
      <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
        Redirigiendo a información...
      </div>
    </div>
  );
};

export default InfoPage; 