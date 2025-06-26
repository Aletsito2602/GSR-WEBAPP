import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';

const ClasesPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir a la página principal con la pestaña de clases
    navigate('/?tab=clases', { replace: true });
  }, [navigate]);

  return (
    <div>
      <TopNavBar />
      <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
        Redirigiendo a clases...
      </div>
    </div>
  );
};

export default ClasesPage; 