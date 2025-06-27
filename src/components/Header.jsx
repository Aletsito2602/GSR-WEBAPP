import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './TopNavBar.css';

function Header({ onTabClick, currentTab }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    navigate('/ajustes');
  };

  const handleNotificationsClick = () => {
    console.log('Notificaciones clickeadas');
    navigate('/notificaciones');
  };

  const handleAvatarClick = () => {
    console.log('Avatar clickeado');
    navigate('/perfil');
  };

  return (
    <header className="header">
      <div className="logo-container">
        <div className="logo-text">Golden Suite</div>
      </div>
      
      <div className="header-actions">
        <button 
          className="header-icon-btn"
          onClick={handleNotificationsClick}
          title="Notificaciones"
        >
          🔔
        </button>
        
        <button 
          className="header-icon-btn"
          onClick={handleSettingsClick}
          title="Configuración"
        >
          ⚙️
        </button>
        
        <button 
          className="header-avatar-btn"
          onClick={handleAvatarClick}
          title="Mi Perfil"
        >
          {currentUser?.photoURL ? (
            <img src={currentUser.photoURL} alt="Avatar" className="avatar-image" />
          ) : (
            <div className="avatar-placeholder">
              {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || '👤'}
            </div>
          )}
        </button>
      </div>
    </header>
  );
}

export default Header; 