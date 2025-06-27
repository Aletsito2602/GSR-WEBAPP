import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function NotificacionesPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  // Datos simulados de notificaciones
  const notifications = [
    {
      id: 1,
      user: "Mr. Isaac Ramírez",
      avatar: "https://via.placeholder.com/40",
      badge: "AGM",
      action: "Seguidor | Nueva publicación | Ayer",
      content: "Video en vivo 😀",
      time: "Ayer",
      unread: true
    },
    {
      id: 2,
      user: "Mr. Isaac Ramírez",
      avatar: "https://via.placeholder.com/40",
      badge: "AGM",
      action: "Seguidor | Nueva publicación | Ayer",
      content: "Video en vivo en 1 hora",
      time: "Ayer",
      unread: true
    },
    {
      id: 3,
      user: "Mr. Isaac Ramírez",
      avatar: "https://via.placeholder.com/40",
      badge: "AGM",
      action: "Seguidor | Nueva publicación | Ayer",
      content: "¿Cuál es el verdadero LUJO para ti? 💎",
      time: "Ayer",
      unread: true
    },
    {
      id: 4,
      user: "Mr. Isaac Ramírez",
      avatar: "https://via.placeholder.com/40",
      badge: "AGM",
      action: "Seguidor | Nueva publicación | 1 d",
      content: "¡Video en vivo hoy! 🚨",
      time: "1 d",
      unread: true
    },
    {
      id: 5,
      user: "Mr. Isaac Ramírez",
      avatar: "https://via.placeholder.com/40",
      badge: "AGM",
      action: "Seguidor | Nueva publicación | 1 d",
      content: "¿De verdad no quieren $30,000? 💵💵💵",
      time: "1 d",
      unread: true
    },
    {
      id: 6,
      user: "Golden Suite",
      avatar: "https://via.placeholder.com/40",
      badge: "🏆",
      action: "Membresía aprobada | 1 d",
      content: "Bienvenida a la mejor comunidad para traders",
      time: "1 d",
      unread: true
    }
  ];

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleMarkAllRead = () => {
    // Lógica para marcar todas como leídas
    console.log("Marcar todas como leídas");
  };

  const handleMarkAsRead = (id) => {
    // Lógica para marcar una notificación específica como leída
    console.log("Marcar como leída:", id);
  };

  return (
    <div className="notifications-page">
      {/* Header */}
      <div className="notifications-header">
        <button className="back-button" onClick={handleGoBack}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <h1>Notificaciones</h1>
      </div>

      {/* Controles */}
      <div className="notifications-controls">
        <button 
          className={`control-btn ${filter === 'read' ? 'active' : ''}`}
          onClick={() => setFilter('read')}
        >
          Marcar todo como leído <i className="fas fa-chevron-down"></i>
        </button>
        <button 
          className={`control-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Ver todas <i className="fas fa-chevron-up"></i>
        </button>
      </div>

      {/* Lista de notificaciones */}
      <div className="notifications-list">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`notification-item ${notification.unread ? 'unread' : ''}`}
            onClick={() => handleMarkAsRead(notification.id)}
          >
            <div className="notification-avatar">
              <div className="avatar-container">
                <div className="avatar-badge">{notification.badge}</div>
              </div>
            </div>
            
            <div className="notification-content">
              <div className="notification-header">
                <span className="user-name">{notification.user}</span>
                {notification.unread && <div className="unread-indicator"></div>}
              </div>
              <div className="notification-action">
                {notification.action}
              </div>
              <div className="notification-message">
                {notification.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotificacionesPage; 