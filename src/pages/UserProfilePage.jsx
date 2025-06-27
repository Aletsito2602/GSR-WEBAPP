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
    <div style={{background: '#222', minHeight: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', fontFamily: 'Poppins, sans-serif'}}>
      <div style={{width: '100%', maxWidth: 1200, background: '#222', borderRadius: 30, margin: '32px auto 40px auto', padding: '32px 32px 48px 32px', boxSizing: 'border-box', boxShadow: '0 0 0 4px #222'}}>
        {/* Header y avatar */}
        <div style={{display: 'flex', alignItems: 'center', marginBottom: 24}}>
          <button style={{background: 'linear-gradient(122.63deg, rgba(34,34,34,0.75) 0%, rgba(215,182,21,0.75) 100%)', border: '1px solid #3C3C3C', borderRadius: 50, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 24}} onClick={handleGoBack}>
            <i className="fas fa-arrow-left" style={{fontSize: 20, color: '#fff'}}></i>
          </button>
          <div style={{fontWeight: 600, fontSize: 22, color: '#fff'}}>Mi perfil</div>
        </div>
        <div style={{display: 'flex', alignItems: 'flex-start', gap: 28, marginBottom: 28}}>
          <div style={{width: 100, height: 100, borderRadius: 300, border: '1px solid #3C3C3C', overflow: 'hidden', marginRight: 20}}>
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Avatar" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            ) : (
              <div className="avatar-placeholder" style={{fontSize: 40, color: '#FFD700', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div style={{flex: 1}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 0}}>
              <span style={{fontWeight: 600, fontSize: 20, color: '#FFD700'}}>Laura</span>
              <span style={{fontWeight: 500, fontSize: 20, color: '#fff'}}>Paz Canto</span>
            </div>
            <div style={{fontWeight: 500, fontSize: 16, color: '#fff', marginBottom: 8}}>Nivel 1</div>
            <div style={{display: 'flex', gap: 10, marginBottom: 12}}>
              <div style={{background: '#292929', borderRadius: 14, padding: '7px 18px', color: '#fff', fontWeight: 500, fontSize: 15}}>Contribuciones (121)</div>
              <div style={{background: '#292929', borderRadius: 14, padding: '7px 18px', color: '#fff', fontWeight: 500, fontSize: 15}}>Seguidores (53)</div>
              <div style={{background: '#292929', borderRadius: 14, padding: '7px 18px', color: '#fff', fontWeight: 500, fontSize: 15}}>Seguidos (39)</div>
            </div>
            <div style={{fontWeight: 400, fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 2}}>@laurapaz64</div>
            <div style={{fontWeight: 400, fontSize: 15, color: '#fff', marginBottom: 2}}>Argentina, esposa y madre. Comerciante y apasionada.</div>
            <div style={{display: 'flex', gap: 12, marginBottom: 4}}>
              <a href="#" style={{color: '#fff', fontSize: 18}}><i className="fab fa-instagram"></i></a>
              <a href="#" style={{color: '#fff', fontSize: 18}}><i className="fab fa-linkedin"></i></a>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4}}>
              <span style={{display: 'flex', alignItems: 'center', gap: 4}}><i className="fas fa-calendar-alt"></i> Se unió el 19 de Mayo de 2024</span>
              <span style={{display: 'flex', alignItems: 'center', gap: 4}}><i className="fas fa-circle" style={{fontSize: 8, color: '#FFD700'}}></i> Activo hace 10 min</span>
              <span style={{display: 'flex', alignItems: 'center', gap: 4}}><i className="fas fa-map-marker-alt"></i> Argentina</span>
            </div>
          </div>
        </div>
        {/* Contribuciones */}
        <div style={{display: 'flex', alignItems: 'center', marginBottom: 12}}>
          <div style={{fontWeight: 600, fontSize: 18, color: '#fff', marginRight: 10}}>Contribuciones</div>
          <div style={{marginLeft: 'auto'}}>
            <button style={{background: 'linear-gradient(122.63deg, rgba(34,34,34,0.65) 0%, rgba(215,182,21,0.65) 100%)', border: '1px solid #3C3C3C', borderRadius: 50, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <i className="fas fa-sliders-h" style={{color: '#FFD700', fontSize: 16}}></i>
            </button>
          </div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
          {[1,2].map((i) => (
            <div key={i} style={{background: 'linear-gradient(166.89deg, #222 0%, #3C3C3C 100%)', border: '1px solid #3C3C3C', borderRadius: 18, padding: 24, color: '#fff', boxShadow: '0 2px 12px #0002', maxWidth: 900, margin: '0 auto'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4}}>
                <img src={currentUser?.photoURL || 'https://randomuser.me/api/portraits/women/44.jpg'} alt="avatar" style={{width: 40, height: 40, borderRadius: 300, border: '1px solid #3C3C3C'}} />
                <div>
                  <span style={{fontWeight: 600, fontSize: 16, color: '#fff'}}>Laura Paz</span>
                  <span style={{color: 'rgba(255,255,255,0.6)', fontWeight: 400, fontSize: 13, marginLeft: 8}}>@laurapaz64</span>
                </div>
              </div>
              <div style={{fontSize: 15, color: '#fff', marginBottom: 6, fontWeight: 400, fontFamily: 'Poppins'}}>“Nunca juzgamos nuestro presente cuando comprendemos que debemos transitarlo para llegar a donde esperamos”</div>
              <div style={{display: 'flex', alignItems: 'center', gap: 18, color: 'rgba(255,255,255,0.6)', fontSize: 14}}>
                <span style={{display: 'flex', alignItems: 'center', gap: 6}}><i className="far fa-heart" style={{fontSize: 15}}></i> 132</span>
                <span style={{display: 'flex', alignItems: 'center', gap: 6}}><i className="far fa-comment" style={{fontSize: 15}}></i> 0</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage; 