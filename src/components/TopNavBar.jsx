import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TopNavBar.css';

const TopNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener la pestaña activa desde la URL
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'comunidad';

  const navItems = [
    { tab: 'clases', label: 'Clases', icon: 'fas fa-chalkboard-teacher' },
    { tab: 'streaming', label: 'Streaming', icon: 'fas fa-broadcast-tower' },
    { tab: 'calendario', label: 'Calendario', icon: 'fas fa-calendar-alt' },
    { tab: 'comunidad', label: 'Miembros', icon: 'fas fa-users' },
    { tab: 'niveles', label: 'Niveles', icon: 'fas fa-medal' },
    { tab: 'mapa', label: 'Info', icon: 'fas fa-info-circle' },
  ];

  const handleTabClick = (tab) => {
    navigate(`/?tab=${tab}`);
  };

  return (
    <nav className="top-navbar">
      {navItems.map((item) => (
        <button
          key={item.tab}
          onClick={() => handleTabClick(item.tab)}
          className={`nav-item ${activeTab === item.tab ? 'active' : ''}`}
        >
          <i className={item.icon}></i>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default TopNavBar; 