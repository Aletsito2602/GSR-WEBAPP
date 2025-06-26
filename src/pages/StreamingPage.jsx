import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';

const StreamingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir a la página principal con la pestaña de streaming
    navigate('/?tab=streaming', { replace: true });
  }, [navigate]);

  return (
    <div>
      <TopNavBar />
      <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
        Redirigiendo a streaming...
      </div>
    </div>
  );
};

export default StreamingPage; 