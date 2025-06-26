import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';

const CalendarioPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir a la página principal con la pestaña de calendario
    navigate('/?tab=calendario', { replace: true });
  }, [navigate]);

  return (
    <div>
      <TopNavBar />
      <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
        Redirigiendo a calendario...
      </div>
    </div>
  );
};

export default CalendarioPage; 