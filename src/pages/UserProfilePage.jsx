import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function UserProfilePage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('perfil');

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLogout = async () => {
    try {
      // Importar auth y signOut para hacer logout
      const { auth } = await import('../firebaseConfig');
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleEditProfile = () => {
    // Navegar a página de edición de perfil
    console.log('Editar perfil');
  };

  const userStats = {
    posts: 24,
    followers: 1250,
    following: 189,
    likes: 3420
  };

  const userPosts = [
    {
      id: 1,
      type: 'image',
      content: 'Nuevo análisis técnico del EUR/USD',
      image: 'https://via.placeholder.com/300x200',
      likes: 145,
      comments: 23,
      date: '2 horas'
    },
    {
      id: 2,
      type: 'video',
      content: '¿Cuál es el verdadero LUJO para ti? 💎',
      thumbnail: 'https://via.placeholder.com/300x200',
      likes: 89,
      comments: 12,
      date: '1 día'
    },
    {
      id: 3,
      type: 'text',
      content: 'Los mercados están mostrando señales muy interesantes hoy. ¿Qué opinan sobre el comportamiento del oro?',
      likes: 67,
      comments: 8,
      date: '2 días'
    }
  ];

  return (
    <div className="user-profile-page">
      {/* Header */}
      <div className="profile-header">
        <button className="back-button" onClick={handleGoBack}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <h1>Perfil</h1>
        <button className="settings-button" onClick={handleEditProfile}>
          <i className="fas fa-cog"></i>
        </button>
      </div>

      {/* Información del usuario */}
      <div className="user-info-section">
        <div className="profile-banner">
          <div className="banner-image"></div>
        </div>
        
        <div className="profile-main-info">
          <div className="avatar-section">
            <div className="profile-avatar">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <button className="edit-profile-btn" onClick={handleEditProfile}>
              Editar perfil
            </button>
          </div>

          <div className="profile-details">
            <h2>{currentUser?.displayName || 'Usuario'}</h2>
            <p className="username">@{currentUser?.email?.split('@')[0] || 'usuario'}</p>
            <p className="bio">
              Trader profesional | Mentor | Creador de contenido financiero
              📈 Ayudando a otros a alcanzar la libertad financiera
            </p>
            
            <div className="user-stats">
              <div className="stat-item">
                <span className="stat-number">{userStats.posts}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{userStats.followers}</span>
                <span className="stat-label">Seguidores</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{userStats.following}</span>
                <span className="stat-label">Siguiendo</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{userStats.likes}</span>
                <span className="stat-label">Likes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'perfil' ? 'active' : ''}`}
          onClick={() => setActiveTab('perfil')}
        >
          <i className="fas fa-th-large"></i>
          Posts
        </button>
        <button 
          className={`tab-button ${activeTab === 'media' ? 'active' : ''}`}
          onClick={() => setActiveTab('media')}
        >
          <i className="fas fa-play-circle"></i>
          Media
        </button>
        <button 
          className={`tab-button ${activeTab === 'likes' ? 'active' : ''}`}
          onClick={() => setActiveTab('likes')}
        >
          <i className="fas fa-heart"></i>
          Likes
        </button>
      </div>

      {/* Contenido de las tabs */}
      <div className="profile-content">
        {activeTab === 'perfil' && (
          <div className="posts-grid">
            {userPosts.map((post) => (
              <div key={post.id} className="post-item">
                {post.type === 'image' && (
                  <div className="post-image">
                    <img src={post.image} alt="Post" />
                    <div className="post-overlay">
                      <div className="post-stats">
                        <span><i className="fas fa-heart"></i> {post.likes}</span>
                        <span><i className="fas fa-comment"></i> {post.comments}</span>
                      </div>
                    </div>
                  </div>
                )}
                {post.type === 'video' && (
                  <div className="post-video">
                    <img src={post.thumbnail} alt="Video thumbnail" />
                    <div className="video-indicator">
                      <i className="fas fa-play"></i>
                    </div>
                    <div className="post-overlay">
                      <div className="post-stats">
                        <span><i className="fas fa-heart"></i> {post.likes}</span>
                        <span><i className="fas fa-comment"></i> {post.comments}</span>
                      </div>
                    </div>
                  </div>
                )}
                {post.type === 'text' && (
                  <div className="post-text">
                    <p>{post.content}</p>
                    <div className="post-stats">
                      <span><i className="fas fa-heart"></i> {post.likes}</span>
                      <span><i className="fas fa-comment"></i> {post.comments}</span>
                      <span className="post-date">{post.date}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'media' && (
          <div className="media-grid">
            <p>Contenido multimedia próximamente...</p>
          </div>
        )}

        {activeTab === 'likes' && (
          <div className="likes-grid">
            <p>Posts que te gustaron próximamente...</p>
          </div>
        )}
      </div>

      {/* Botón de logout */}
      <div className="profile-actions">
        <button className="logout-button" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

export default UserProfilePage; 