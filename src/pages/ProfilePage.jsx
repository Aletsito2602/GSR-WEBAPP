import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { FaLink, FaLinkedinIn, FaCalendarAlt, FaMapMarkerAlt, FaEye, FaComment, FaCog } from 'react-icons/fa';
import { GoDotFill } from "react-icons/go";
import { HiOutlineAdjustments } from "react-icons/hi";
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

// Función para obtener las iniciales del nombre
const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
};

// Función para formatear fecha de creación
const formatJoinDate = (createdAt) => {
    if (!createdAt) return '19 de Mayo de 2024';
    
    try {
        const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric', 
            month: 'long', 
            year: 'numeric'
        });
    } catch (error) {
        return '19 de Mayo de 2024';
    }
};

// Función para formatear tiempo de actividad
const getLastActiveTime = (lastSeen) => {
    if (!lastSeen) return 'Activo ahora';
    
    try {
        const now = new Date();
        const lastSeenDate = lastSeen.toDate ? lastSeen.toDate() : new Date(lastSeen);
        const diff = Math.round((now - lastSeenDate) / 1000); // segundos
        
        if (diff < 60) return 'Activo ahora';
        if (diff < 3600) return `Activo hace ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `Activo hace ${Math.floor(diff / 3600)} h`;
        return `Activo hace ${Math.floor(diff / 86400)} días`;
    } catch (error) {
        return 'Activo ahora';
    }
};

// Card de contribución rediseñada
const MyContributionCard = ({ post, onClick }) => {
    const { currentUser } = useAuth();
    const initials = getInitials(post.authorName || currentUser?.displayName);
    
    // Función para formatear tiempo del post
    const getPostTime = () => {
        if (!post.createdAt) return '2 h';
        
        try {
            const date = post.createdAt.toDate();
            const now = new Date();
            const diff = Math.round((now - date) / 1000);
            
            if (diff < 60) return 'ahora';
            if (diff < 3600) return `${Math.floor(diff / 60)}m`;
            if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
            return `${Math.floor(diff / 86400)}d`;
        } catch (e) {
            return '2 h';
        }
    };
    
    return (
        <div className="my-contribution-card" onClick={() => onClick && onClick(post)}>
            <div className="card-header">
                {post.authorAvatarUrl || currentUser?.photoURL ? (
                    <img 
                        src={post.authorAvatarUrl || currentUser?.photoURL} 
                        alt="Avatar" 
                        className="author-avatar" 
                    />
                ) : (
                    <div className="author-avatar">
                        {initials}
                    </div>
                )}
                <div className="author-details">
                    <span className="author-name">{post.authorName || currentUser?.displayName || 'Mi publicación'}</span>
                    <span className="post-meta">{getPostTime()} | {post.category || 'General'}</span>
                </div>
            </div>
            <p className="card-content">
                {post.content}
                {post.content && post.content.length > 150 && (
                    <span className="ver-mas"> Ver más</span>
                )}
            </p>
            <div className="card-footer">
                <span><FaEye /> {post.likes || post.views || 0}</span>
                <span><FaComment /> {post.commentCount || post.comments || 0}</span>
            </div>
        </div>
    );
};

function ProfilePage() {
    const navigate = useNavigate();
    const { currentUser, loadingAuth } = useAuth();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (loadingAuth) return;

        if (!currentUser) {
            setError('Debes iniciar sesión para ver tu perfil');
            setLoading(false);
            return;
        }

        const fetchUserData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                console.log('Cargando mi perfil para:', currentUser.uid);
                
                // Fetch user data from Firestore
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = { id: userDoc.id, ...userDoc.data() };
                    console.log('Mis datos encontrados:', userData);
                    setUser(userData);
                } else {
                    console.log('Perfil no encontrado, usando datos de Auth');
                    // Si no existe en Firestore, usar datos de Auth
                    setUser({
                        id: currentUser.uid,
                        displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Mi perfil',
                        email: currentUser.email,
                        photoURL: currentUser.photoURL,
                        username: (currentUser.displayName || currentUser.email?.split('@')[0] || 'usuario').toLowerCase().replace(/\s+/g, ''),
                        bio: 'Miembro de la comunidad Golden Suite',
                        level: 1,
                        points: 0,
                        followers: 0,
                        following: 0
                    });
                }

                // Fetch my posts
                // NOTA: Si aparece error de índice requerido, crear índice compuesto en:
                // Firebase Console > Firestore > Indexes
                // Campos: authorUid (Ascending), createdAt (Descending)
                const postsRef = collection(db, 'posts');
                const q = query(postsRef, where('authorUid', '==', currentUser.uid));
                const querySnapshot = await getDocs(q);
                let myPosts = querySnapshot.docs.map(doc => ({ 
                    id: doc.id, 
                    ...doc.data() 
                }));
                
                // Sort posts manually by createdAt descending
                myPosts = myPosts.sort((a, b) => {
                    if (a.createdAt && b.createdAt) {
                        return b.createdAt.toDate() - a.createdAt.toDate();
                    }
                    return 0;
                });
                
                console.log(`Mis posts encontrados: ${myPosts.length}`);
                setPosts(myPosts);

            } catch (error) {
                console.error("Error al cargar mi perfil:", error);
                setError('Error al cargar tu perfil');
                
                // En caso de error, usar datos básicos de Auth
                if (currentUser) {
                    setUser({
                        id: currentUser.uid,
                        displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Mi perfil',
                        email: currentUser.email,
                        photoURL: currentUser.photoURL,
                        username: (currentUser.displayName || 'usuario').toLowerCase().replace(/\s+/g, ''),
                        bio: 'Miembro de la comunidad Golden Suite',
                        level: 1,
                        points: 0,
                        followers: 0,
                        following: 0
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [currentUser, loadingAuth]);

    const handlePostClick = (post) => {
        if (post.id) {
            navigate(`/post/${post.id}`);
        }
    };

    const handleSettingsClick = () => {
        navigate('/ajustes');
    };

    if (loadingAuth) {
        return (
            <div className="my-profile-container">
                <div className="my-profile-loading">
                    <div style={{ marginBottom: '16px' }}>Verificando autenticación...</div>
                    <div style={{ color: '#A0A0A0', fontSize: '0.9rem' }}>
                        Cargando datos de usuario
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="my-profile-container">
                <div className="my-profile-loading">
                    <div style={{ marginBottom: '16px' }}>Cargando mi perfil...</div>
                    <div style={{ color: '#A0A0A0', fontSize: '0.9rem' }}>
                        Obteniendo mi información
                    </div>
                </div>
            </div>
        );
    }

    if (!currentUser || error) {
        return (
            <div className="my-profile-container">
                <div className="my-profile-loading">
                    <div style={{ marginBottom: '16px' }}>⚠️ Error</div>
                    <div style={{ color: '#A0A0A0', fontSize: '0.9rem' }}>
                        {error || 'Debes iniciar sesión para ver tu perfil'}
                    </div>
                    <button 
                        onClick={() => navigate('/login')}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            background: '#F0B90B',
                            color: '#000',
                            border: 'none',
                            borderRadius: '25px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Iniciar Sesión
                    </button>
                </div>
            </div>
        );
    }
    
    // Datos del usuario con fallbacks
    const displayName = user?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Mi perfil';
    const username = user?.username || (displayName.toLowerCase().replace(/\s+/g, ''));
    const bio = user?.bio || 'Miembro de la comunidad Golden Suite';
    const location = user?.location || 'Buenos Aires, Argentina';
    const level = user?.level || 1;
    const points = user?.points || 0;
    const followers = user?.followers || 0;
    const following = user?.following || 0;
    const contributionsCount = posts.length;
    
    // Obtener iniciales para el avatar principal
    const userInitials = getInitials(displayName);
    const joinDate = formatJoinDate(user?.createdAt || currentUser?.metadata?.creationTime);
    const lastActive = getLastActiveTime(user?.lastSeen);
    
    return (
        <div className="my-profile-container">
            {/* Header */}
            <header className="page-header">
                <h1>Mi perfil</h1>
                <button className="settings-button" onClick={handleSettingsClick} aria-label="Configuración">
                    <FaCog />
                </button>
            </header>

            {/* Sección de Perfil Principal */}
            <section className="profile-details-card">
                <div className="profile-main-section">
                    {/* Avatar con fallback de iniciales */}
                    {user?.photoURL || currentUser?.photoURL ? (
                        <img 
                            src={user?.photoURL || currentUser?.photoURL} 
                            alt="Mi avatar" 
                            className="profile-avatar-large" 
                        />
                    ) : (
                        <div 
                            className="profile-avatar-large"
                            data-initials={userInitials}
                        >
                            {userInitials}
                        </div>
                    )}
                    
                    <div className="profile-content">
                        {/* Bloque de Nombre y Botón */}
                        <div className="profile-summary">
                            <div className="user-info">
                                <h2 className="user-name">{displayName}</h2>
                                <p className="user-level">Nivel {level} • {points} puntos</p>
                            </div>
                            <button className="edit-profile-button" onClick={handleSettingsClick}>
                                Editar perfil
                            </button>
                        </div>

                        {/* Barra de Estadísticas */}
                        <div className="profile-stats">
                            <button>Contribuciones ({contributionsCount})</button>
                            <button>Seguidores ({followers})</button>
                            <button>Seguidos ({following})</button>
                        </div>

                        {/* Biografía y Enlaces */}
                        <div className="user-bio">
                            <p className="user-handle">@{username}</p>
                            <p>{bio}</p>
                        </div>

                        <div className="user-links">
                            <a href="#" aria-label="Website"><FaLink /></a>
                            <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
                        </div>

                        {/* Metadatos del Perfil */}
                        <div className="user-metadata">
                            <span><FaCalendarAlt /> Te uniste el {joinDate}</span>
                            <span><GoDotFill color="#8cff98" /> {lastActive}</span>
                            <span><FaMapMarkerAlt /> {location}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sección de Contribuciones */}
            <section className="user-contributions">
                <header className="contributions-header">
                    <h3>Mis contribuciones</h3>
                    <button className="filter-button" aria-label="Filtros">
                        <HiOutlineAdjustments />
                    </button>
                </header>
                
                <div className="contributions-list">
                    {posts.length > 0 ? (
                        posts.map(post => (
                            <MyContributionCard 
                                key={post.id} 
                                post={post} 
                                onClick={handlePostClick}
                            />
                        ))
                    ) : (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '60px 20px', 
                            color: '#A0A0A0',
                            background: '#1a1a1a',
                            borderRadius: '20px',
                            border: '1px solid #2c2c2c'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📝</div>
                            <h3 style={{ color: '#EAEAEA', marginBottom: '8px' }}>¡Aún no tienes publicaciones!</h3>
                            <p style={{ marginBottom: '24px' }}>Comparte tu primera contribución con la comunidad Golden Suite.</p>
                            <button 
                                onClick={() => navigate('/')}
                                style={{
                                    padding: '12px 24px',
                                    background: 'linear-gradient(135deg, #F0B90B, #E5A500)',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '25px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '1rem',
                                    transition: 'transform 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                            >
                                Crear primera publicación
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default ProfilePage; 