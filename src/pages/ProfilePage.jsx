import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaEdit, FaMapMarkerAlt, FaPenSquare } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

function SettingsPage() { // Renombrado para mayor claridad
  
  // Simulación de datos estáticos para el diseño
  const profileData = {
    firstName: 'Laura',
    lastName: 'Paz Rejón',
    phone: '1123456789',
    email: 'laurapaz@gmail.com',
    username: '@laurapaz64',
    location: 'Argentina',
    bio: 'Argentina, esposa y madre. Comerciante y apasionada.',
    url: 'skool.com/@laura-paz-rejon-2277',
    myersBriggs: 'No mostrar',
    timezone: '(GMT -05:00) America/Cancun',
    language: 'Español',
    theme: 'Predeterminado (Negro)',
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg'
  };

  const [openAccordion, setOpenAccordion] = useState({
    social: false,
    visibility: false,
    advanced: false,
  });

  const AccordionRow = ({ label, name }) => (
    <div 
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #2c2c2c', cursor: 'pointer' }}
      onClick={() => setOpenAccordion(prev => ({ ...prev, [name]: !prev[name] }))}
    >
      <span style={{ fontSize: '16px', color: '#fff' }}>{label}</span>
      <FaChevronDown style={{ color: '#D7B615', transform: openAccordion[name] ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
    </div>
  );

  return (
    <div style={{ 
      maxWidth: '860px', 
      margin: '40px auto', 
      padding: '24px', 
      fontFamily: 'Poppins, sans-serif',
      color: '#fff',
      background: '#1a1a1a',
      borderRadius: '24px',
    }}>

      {/* --- Cabecera --- */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <img 
          src={profileData.avatarUrl} 
          alt="Avatar" 
          style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} 
        />
        <h1 style={{ 
          color: '#D7B615', 
          fontSize: '28px', 
          marginLeft: '20px', 
          flexGrow: 1,
          background: 'linear-gradient(90.18deg, #D7B615 8.94%, rgba(255, 255, 255, 0.8) 67.3%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Mi perfil
        </h1>
        <button style={{
          background: 'linear-gradient(122deg, #D7B615, #B99C18)',
          color: '#111',
          border: 'none',
          borderRadius: '12px',
          padding: '12px 24px',
          fontWeight: '600',
          fontSize: '16px',
          cursor: 'pointer'
        }}>
          Editar
        </button>
      </div>

      {/* --- Sección Perfil --- */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* ... (campos de perfil como antes) ... */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 48%' }}>
            <label style={{ fontSize: '14px', color: '#aaa', display: 'block', marginBottom: '8px' }}>Nombres</label>
            <div style={{ background: '#2c2c2c', borderRadius: '12px', padding: '12px 16px', border: '1px solid #444' }}>
              {profileData.firstName}
            </div>
          </div>
          <div style={{ flex: '1 1 48%' }}>
            <label style={{ fontSize: '14px', color: '#aaa', display: 'block', marginBottom: '8px' }}>Apellidos</label>
            <div style={{ background: '#2c2c2c', borderRadius: '12px', padding: '12px 16px', border: '1px solid #444' }}>
              {profileData.lastName}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 48%' }}>
            <label style={{ fontSize: '14px', color: '#aaa', display: 'block', marginBottom: '8px' }}>Número de teléfono</label>
            <div style={{ background: '#2c2c2c', borderRadius: '12px', padding: '12px 16px', border: '1px solid #444' }}>
              {profileData.phone}
            </div>
          </div>
          <div style={{ flex: '1 1 48%' }}>
            <label style={{ fontSize: '14px', color: '#aaa', display: 'block', marginBottom: '8px' }}>Correo electrónico</label>
            <div style={{ background: '#2c2c2c', borderRadius: '12px', padding: '12px 16px', border: '1px solid #444' }}>
              {profileData.email}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 48%' }}>
            <label style={{ fontSize: '14px', color: '#aaa', display: 'block', marginBottom: '8px' }}>Usuario</label>
            <div style={{ background: '#2c2c2c', borderRadius: '12px', padding: '12px 16px', border: '1px solid #444' }}>
              {profileData.username}
            </div>
          </div>
          <div style={{ flex: '1 1 48%' }}>
            <label style={{ fontSize: '14px', color: '#aaa', display: 'block', marginBottom: '8px' }}>Locación</label>
            <div style={{ background: '#2c2c2c', borderRadius: '12px', padding: '12px 16px', border: '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{profileData.location}</span>
              <FaChevronDown style={{ color: '#D7B615' }} />
            </div>
          </div>
        </div>
        <div>
          <label style={{ fontSize: '14px', color: '#aaa', display: 'block', marginBottom: '8px' }}>Biografía</label>
          <div style={{ background: '#2c2c2c', borderRadius: '12px', padding: '12px 16px', border: '1px solid #444', minHeight: '60px' }}>
            {profileData.bio}
          </div>
          <div style={{ textAlign: 'right', fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
            16 / 150
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '16px' }}>
          <a href="#" style={{ color: '#D7B615', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <FaMapMarkerAlt />
            Cambiar mi ubicación en el mapa
          </a>
          <a href="#" style={{ color: '#aaa', textDecoration: 'underline', fontSize: '14px' }}>
            Eliminar mi ubicación
          </a>
        </div>
        <div>
          <label style={{ fontSize: '14px', color: '#aaa', display: 'block', marginBottom: '8px' }}>URL</label>
          <div style={{ background: '#2c2c2c', borderRadius: '12px', padding: '12px 16px', border: '1px solid #444' }}>
            {profileData.url}
          </div>
          <p style={{ fontSize: '12px', color: '#aaa', marginTop: '8px', marginBlock: 0 }}>
            Podrás cambiar tu URL cuando tengas 90 contribuciones, 30 seguidores y la hayas usado durante 90 días.
          </p>
        </div>
        <AccordionRow label="Myers Briggs" name="myers" />
        <AccordionRow label="Enlaces a redes sociales" name="social" />
        <AccordionRow label="Visibilidad de membresía" name="visibility" />
        <AccordionRow label="Ajustes avanzados" name="advanced" />
      </div>

      {/* --- Sección Mi cuenta --- */}
      <div style={{ marginTop: '40px', borderTop: '1px solid #2c2c2c', paddingTop: '32px' }}>
        <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: '24px' }}>Mi cuenta</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 48%' }}>
              <label style={{ fontSize: '14px', color: '#aaa', display: 'block', marginBottom: '8px' }}>Correo electrónico</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flexGrow: 1, background: '#2c2c2c', borderRadius: '12px', padding: '12px 16px', border: '1px solid #444' }}>{profileData.email}</div>
                <div style={{ background: '#D7B615', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><FaPenSquare color="#111" /></div>
              </div>
            </div>
            <div style={{ flex: '1 1 48%' }}>
              <label style={{ fontSize: '14px', color: '#aaa', display: 'block', marginBottom: '8px' }}>Contraseña</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flexGrow: 1, background: '#2c2c2c', borderRadius: '12px', padding: '12px 16px', border: '1px solid #444', letterSpacing: '4px' }}>••••••••</div>
                <div style={{ background: '#D7B615', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}><FaPenSquare color="#111" /></div>
              </div>
            </div>
          </div>
          <AccordionRow label={`Zona horaria: ${profileData.timezone}`} name="timezone" />
          <AccordionRow label={`Idioma: ${profileData.language}`} name="language" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <p style={{ margin: 0, color: '#aaa' }}>Puedes cerrar las sesiones activas en todos los dispositivos.</p>
            <button style={{ background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '12px', padding: '12px 20px', fontWeight: '600' }}>Cerrar sesión</button>
          </div>
        </div>
      </div>
      
      {/* --- Sección Estilo visual --- */}
      <div style={{ marginTop: '40px', borderTop: '1px solid #2c2c2c', paddingTop: '32px' }}>
        <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: '24px' }}>Estilo visual</h2>
        <AccordionRow label={`Tema: ${profileData.theme}`} name="theme" />
      </div>

      <style>{`
        @media (max-width: 600px) {
          div[style*="flex-wrap: wrap"] > div { flex-basis: 100% !important; }
        }
      `}</style>
    </div>
  );
}

const ContributionCard = ({ post }) => (
    <div style={{
        background: '#2c2c2c',
        borderRadius: '12px',
        padding: '16px',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
    }}>
        <p style={{ margin: 0, color: '#ccc', fontSize: '14px', lineHeight: '1.5', flexGrow: 1 }}>{post.content}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', color: '#888', fontSize: '12px' }}>
            <span>{post.likes || 0} Likes</span>
            <span>{new Date(post.createdAt?.toDate()).toLocaleDateString()}</span>
        </div>
    </div>
);

function ProfilePage() {
    const { currentUser, userProfile } = useAuth();
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser?.uid) {
            const fetchUserPosts = async () => {
                setLoading(true);
                const postsRef = collection(db, 'posts');
                const q = query(postsRef, where('authorUid', '==', currentUser.uid), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUserPosts(posts);
                setLoading(false);
            };
            fetchUserPosts();
        }
    }, [currentUser]);

    if (!currentUser || !userProfile) {
        return <div style={{ textAlign: 'center', padding: '50px', color: '#fff' }}>Cargando perfil...</div>;
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            
            {/* Encabezado del Perfil */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                marginBottom: '40px'
            }}>
                <img
                    src={userProfile.photoURL || 'https://via.placeholder.com/150'}
                    alt="Foto de perfil"
                    style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #D7B615' }}
                />
                <div>
                    <h1 style={{ margin: 0, color: '#fff', fontSize: '2.5rem', fontWeight: 600 }}>{userProfile.displayName}</h1>
                    <p style={{ margin: '4px 0 0', color: '#aaa' }}>{currentUser.email}</p>
                </div>
            </div>

            {/* Contribuciones */}
            <div style={{ padding: '0 20px' }}>
              <h2 style={{ color: '#fff', borderBottom: '1px solid #444', paddingBottom: '12px', marginBottom: '24px' }}>
                  Mis Contribuciones ({userPosts.length})
              </h2>
            
              {loading ? (
                  <p style={{ color: '#888' }}>Cargando contribuciones...</p>
              ) : userPosts.length > 0 ? (
                  <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                      gap: '20px'
                  }}>
                      {userPosts.map(post => (
                          <ContributionCard key={post.id} post={post} />
                      ))}
                  </div>
              ) : (
                  <div style={{ color: '#888', background: '#2c2c2c', padding: '30px', borderRadius: '12px', textAlign: 'center' }}>
                      <p style={{margin: 0}}>Aún no has realizado ninguna contribución.</p>
                  </div>
              )}
            </div>
        </div>
    );
}

export default ProfilePage; 