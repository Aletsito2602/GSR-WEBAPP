import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoCheckmarkDone, IoEye } from 'react-icons/io5';

function NotificacionesPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      user: "Mr. Isaac Ramírez",
      avatar: "https://via.placeholder.com/40",
      badge: "AGM",
      action: "Nueva publicación",
      content: "Video en vivo 😀",
      time: "Ayer",
      unread: true
    },
    {
      id: 2,
      user: "Mr. Isaac Ramírez", 
      avatar: "https://via.placeholder.com/40",
      badge: "AGM",
      action: "Nueva publicación",
      content: "Video en vivo en 1 hora",
      time: "Ayer",
      unread: true
    },
    {
      id: 3,
      user: "Mr. Isaac Ramírez",
      avatar: "https://via.placeholder.com/40", 
      badge: "AGM",
      action: "Nueva publicación",
      content: "¿Cuál es el verdadero LUJO para ti? 💎",
      time: "Ayer",
      unread: true
    },
    {
      id: 4,
      user: "Mr. Isaac Ramírez",
      avatar: "https://via.placeholder.com/40",
      badge: "AGM", 
      action: "Nueva publicación",
      content: "¡Video en vivo hoy! 🚨",
      time: "1 d",
      unread: true
    },
    {
      id: 5,
      user: "Mr. Isaac Ramírez",
      avatar: "https://via.placeholder.com/40",
      badge: "AGM",
      action: "Nueva publicación", 
      content: "¿De verdad no quieren $30,000? 💵💵💵",
      time: "1 d",
      unread: true
    },
    {
      id: 6,
      user: "Golden Suite",
      avatar: "https://via.placeholder.com/40",
      badge: "🏆",
      action: "Membresía aprobada",
      content: "Bienvenida a la mejor comunidad para traders",
      time: "1 d", 
      unread: true
    }
  ]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, unread: false } : n
    ));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="notifications-page">
             {/* Header Mobile-First */}
       <div className="notifications-header">
         <h1 className="page-title">Notificaciones</h1>
       </div>

      {/* Actions Bar */}
      <div className="actions-bar">
        <button 
          className="action-btn primary" 
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
        >
          <IoCheckmarkDone />
          Marcar todas leídas
        </button>
        <button className="action-btn secondary">
          <IoEye />
          Ver todas
        </button>
      </div>

      {/* Notifications List */}
      <div className="notifications-container">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`notification-card ${notification.unread ? 'unread' : 'read'}`}
            onClick={() => handleMarkAsRead(notification.id)}
          >
            {/* Avatar */}
            <div className="notification-avatar">
              {notification.user === 'Golden Suite' ? (
                <div className="golden-avatar">
                  <span className="golden-icon">🏆</span>
                </div>
              ) : (
                <div className="user-avatar">
                  <img 
                    src={notification.avatar} 
                    alt={notification.user}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="avatar-fallback" style={{display: 'none'}}>
                    {notification.user.charAt(0)}
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="notification-content">
                             <div className="notification-header">
                 <span className={`user-name ${notification.user === 'Golden Suite' ? 'golden' : ''}`}>
                   {notification.user}
                 </span>
                 <div className="time-with-indicator">
                   <span className="notification-time">{notification.time}</span>
                   {notification.unread && (
                     <div className="unread-indicator"></div>
                   )}
                 </div>
               </div>
              
              <div className="notification-action">
                {notification.action}
              </div>
              
              <div className="notification-text">
                {notification.content}
              </div>
            </div>

            
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <p>No tienes notificaciones</p>
          </div>
        )}
      </div>

      <style jsx>{`
        /* BASE MOBILE-FIRST STYLES */
        .notifications-page {
          min-height: 100vh;
          background: #1a1a1a;
          color: #ffffff;
          font-family: 'Inter', 'SF Pro Display', -apple-system, sans-serif;
        }

        /* Header */
                 .notifications-header {
           display: flex;
           align-items: center;
           padding: 16px;
           background: #2a2a2a;
           border-bottom: 1px solid #3a3a3a;
           margin-top: 70px;
         }

        

                 .page-title {
           font-size: 20px;
           font-weight: 600;
           margin: 0;
           color: #ffffff;
         }

        .unread-badge {
          background: linear-gradient(135deg, #F0B90B, #FFD700);
          color: #000;
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 14px;
          font-weight: 600;
          min-width: 24px;
          text-align: center;
        }

        /* Actions Bar */
        .actions-bar {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: #2a2a2a;
          border-bottom: 1px solid #3a3a3a;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border: none;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
          justify-content: center;
          min-height: 44px;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #F0B90B, #FFD700);
          color: #000;
        }

        .action-btn.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(240, 185, 11, 0.3);
        }

        .action-btn.primary:disabled {
          background: #3a3a3a;
          color: #666;
          cursor: not-allowed;
        }

        .action-btn.secondary {
          background: #3a3a3a;
          color: #ffffff;
          border: 1px solid #4a4a4a;
        }

        .action-btn.secondary:hover {
          background: #4a4a4a;
        }

        /* Notifications Container */
        .notifications-container {
          padding: 0;
        }

        .notification-card {
          display: flex;
          align-items: flex-start;
          padding: 16px;
          border-bottom: 1px solid #2a2a2a;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          background: transparent;
        }

        .notification-card:hover {
          background: #252525;
        }

        .notification-card.unread {
          background: rgba(240, 185, 11, 0.05);
          border-left: 3px solid #F0B90B;
        }

        .notification-card.unread:hover {
          background: rgba(240, 185, 11, 0.1);
        }

        /* Avatar */
        .notification-avatar {
          margin-right: 12px;
          flex-shrink: 0;
        }

        .golden-avatar {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #F0B90B, #FFD700);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .golden-icon {
          font-size: 24px;
        }

        .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          overflow: hidden;
          background: #3a3a3a;
          position: relative;
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-fallback {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #4a4a4a;
          color: #ffffff;
          font-weight: 600;
          font-size: 18px;
        }

        /* Content */
        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .user-name {
          font-weight: 600;
          font-size: 16px;
          color: #ffffff;
        }

        .user-name.golden {
          background: linear-gradient(135deg, #F0B90B, #FFD700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

                 .time-with-indicator {
           display: flex;
           align-items: center;
           gap: 8px;
         }

         .notification-time {
           font-size: 12px;
           color: #888;
           flex-shrink: 0;
         }

        .notification-action {
          font-size: 14px;
          color: #F0B90B;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .notification-text {
          font-size: 15px;
          color: #cccccc;
          line-height: 1.4;
          word-wrap: break-word;
        }

                 .unread-indicator {
           width: 8px;
           height: 8px;
           background: #F0B90B;
           border-radius: 50%;
           margin-left: 8px;
           flex-shrink: 0;
         }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        /* TABLET STYLES */
        @media (min-width: 768px) {
          .notifications-header {
            padding: 20px 24px;
          }

          .page-title {
            font-size: 24px;
          }

          .back-btn {
            width: 48px;
            height: 48px;
            font-size: 22px;
          }

          .actions-bar {
            padding: 20px 24px;
          }

          .action-btn {
            flex: none;
            min-width: 180px;
          }

          .notification-card {
            padding: 20px 24px;
          }

          .notification-avatar {
            margin-right: 16px;
          }

          .golden-avatar,
          .user-avatar {
            width: 56px;
            height: 56px;
          }

          .golden-icon {
            font-size: 28px;
          }

          .user-name {
            font-size: 18px;
          }

          .notification-text {
            font-size: 16px;
          }
        }

        /* DESKTOP STYLES */
        @media (min-width: 1024px) {
          .notifications-page {
            max-width: 1200px;
            margin: 0 auto;
            background: #222;
            border-radius: 24px;
            margin-top: 80px;
            margin-bottom: 40px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }

          .notifications-header {
            padding: 32px 48px;
            border-radius: 24px 24px 0 0;
          }

          .page-title {
            font-size: 28px;
          }

          .actions-bar {
            padding: 24px 48px;
            justify-content: flex-start;
          }

          .action-btn {
            font-size: 16px;
            padding: 14px 24px;
          }

          .notification-card {
            padding: 24px 48px;
          }

          .notification-avatar {
            margin-right: 24px;
          }

          .golden-avatar,
          .user-avatar {
            width: 64px;
            height: 64px;
          }

          .golden-icon {
            font-size: 32px;
          }

          .user-name {
            font-size: 20px;
          }

          .notification-action {
            font-size: 15px;
          }

          .notification-text {
            font-size: 18px;
          }

          .unread-indicator {
            width: 12px;
            height: 12px;
            top: 32px;
            right: 48px;
          }
        }
      `}</style>
    </div>
  );
}

export default NotificacionesPage; 