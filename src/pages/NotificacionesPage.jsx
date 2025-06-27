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
    <div style={{background: '#222', minHeight: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', fontFamily: 'Poppins, sans-serif'}}>
      <div style={{width: '100%', maxWidth: 1200, background: '#222', borderRadius: 30, margin: '80px auto 40px auto', padding: '48px 48px 64px 48px', boxSizing: 'border-box', boxShadow: '0 0 0 4px #222'}}>
        {/* Header */}
        <div style={{display: 'flex', alignItems: 'center', marginBottom: 32}}>
          <button style={{background: 'linear-gradient(122.63deg, rgba(34,34,34,0.75) 0%, rgba(215,182,21,0.75) 100%)', border: '1px solid #3C3C3C', borderRadius: 50, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 24}} onClick={handleGoBack}>
            <i className="fas fa-arrow-left" style={{fontSize: 22, color: '#fff'}}></i>
          </button>
          <div style={{fontWeight: 700, fontSize: 28, color: '#fff'}}>Notificaciones</div>
        </div>
        {/* Acciones */}
        <div style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32}}>
          <button style={{background: 'none', border: 'none', color: '#FFD700', fontWeight: 500, fontSize: 18, display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 6}}>
            Marcar todo como leído <i className="fas fa-chevron-down" style={{fontSize: 16}}></i>
          </button>
          <button style={{background: 'none', border: 'none', color: '#FFD700', fontWeight: 500, fontSize: 18, display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 6}}>
            Ver todas <i className="fas fa-chevron-up" style={{fontSize: 16}}></i>
          </button>
        </div>
        {/* Lista de notificaciones */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 0}}>
          {notifications.map((n, idx) => (
            <div key={n.id} style={{display: 'flex', alignItems: 'flex-start', padding: '24px 0', borderBottom: idx !== notifications.length-1 ? '1px solid #393939' : 'none', position: 'relative'}}>
              {/* Avatar */}
              <div style={{width: 56, height: 56, borderRadius: 50, background: n.user === 'Golden Suite' ? 'linear-gradient(90deg, #FFD700 60%, #fff 100%)' : '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 24, fontSize: 28, fontWeight: 700, color: n.user === 'Golden Suite' ? '#222' : '#fff'}}>
                {n.user === 'Golden Suite' ? '🏆' : <img src={n.avatar} alt="avatar" style={{width: 40, height: 40, borderRadius: 50}} />}
              </div>
              {/* Info */}
              <div style={{flex: 1}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                  <span style={{fontWeight: 700, fontSize: 20, color: n.user === 'Golden Suite' ? 'linear-gradient(90deg, #FFD700 60%, #fff 100%)' : '#fff'}}>{n.user}</span>
                  <span style={{color: '#aaa', fontWeight: 400, fontSize: 15}}>{n.action}</span>
                </div>
                <div style={{fontSize: 18, color: '#fff', marginTop: 2}}>{n.content}</div>
              </div>
              {/* Punto dorado si está no leída */}
              {n.unread && <div style={{width: 16, height: 16, borderRadius: 50, background: 'linear-gradient(90deg, #FFD700 60%, #fff 100%)', position: 'absolute', right: 0, top: 32}}></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NotificacionesPage; 