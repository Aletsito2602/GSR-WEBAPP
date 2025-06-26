import React from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Header({ isMobile }) { 
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <header style={{ 
      background: '#282828', 
      padding: '10px 20px',
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #353535',
      position: 'sticky',
      top: 0,
      zIndex: 200
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.87)' }}>Mi Legado</span>
      </div>
      
      {/* Mostrar botón de Logout si hay usuario */}
      {currentUser && (
        <button 
          onClick={handleLogout} 
          style={{ 
            marginLeft: 'auto',
            background: 'transparent',
            border: '1px solid #D7B615',
            borderRadius: '5px',
            color: '#D7B615',
            padding: '5px 10px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          <i className="fas fa-sign-out-alt" style={{ marginRight: '5px' }}></i>
          Cerrar Sesión
        </button>
      )}
    </header>
  );
}

export default Header; 