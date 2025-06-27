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
    { tab: 'comunidad', label: 'Comunidad', icon: 'fas fa-users' },
    { tab: 'clases', label: 'Clases', icon: 'fas fa-chalkboard-teacher' },
    { tab: 'streaming', label: 'Streaming', icon: 'fas fa-broadcast-tower' },
    { tab: 'calendario', label: 'Calendario', icon: 'fas fa-calendar-alt' },
    { tab: 'miembros', label: 'Miembros', icon: 'fas fa-user-friends' },
    { tab: 'niveles', label: 'Niveles', icon: 'fas fa-medal' },
    { tab: 'acerca', label: 'Acerca De', icon: 'fas fa-info-circle' },
    { tab: 'ajustes', label: 'Ajustes', icon: 'fas fa-cog' },
  ];

  const handleTabClick = (tab) => {
    // Limpiar cualquier parámetro existente y navegar a la nueva pestaña
    navigate(`/?tab=${tab}`, { replace: true });
  };

  return (
    <nav className="top-navbar" role="navigation" aria-label="Navegación principal">
      {navItems.map((item) => (
        <button
          key={item.tab}
          onClick={() => handleTabClick(item.tab)}
          className={`nav-item ${activeTab === item.tab ? 'active' : ''}`}
          aria-pressed={activeTab === item.tab}
          aria-label={`Ir a ${item.label}`}
          type="button"
        >
          <i className={item.icon} aria-hidden="true"></i>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default TopNavBar; 