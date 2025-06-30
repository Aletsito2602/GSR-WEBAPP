import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { FaLink, FaLinkedinIn, FaCalendarAlt, FaMapMarkerAlt, FaEye, FaComment } from 'react-icons/fa';
import { GoDotFill } from "react-icons/go";
import { HiOutlineAdjustments } from "react-icons/hi";
import { useAuth } from '../context/AuthContext';
import './UserProfilePage.css';

// Datos de ejemplo para las contribuciones (si no hay posts reales)
const sampleContributions = [
    {
        id: 1,
        authorName: "Mr. Isaac Ramirez",
        authorAvatarUrl: null,
        timestamp: "2 h",
        category: "AGM",
        content: "#GSR100 ⚡️ Bienvenidos al #programa #GSR100 que transformará tu trading, mentalidad y vida. 👉 Únete al #GSR100 hoy y da el primer paso para invertir como un experto en finan...",
        views: 132,
        comments: 0
    },
    {
        id: 2,
        authorName: "Mr. Isaac Ramirez", 
        authorAvatarUrl: null,
        timestamp: "2 h",
        category: "AGM",
        content: "REGALO 30.000$$ 💸💸💸 😊 Hoy te doy la oportunidad de ganar 30.000 dólares en cuentas de fondeo con AGM, mi broker. Este domingo día 30 haré un Live donde entregaré 3 cuentas para comen...",
        views: 100,
        comments: 2
    }
];

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
    if (!lastSeen) return 'Activo hace 10 min';
    
    try {
        const now = new Date();
        const lastSeenDate = lastSeen.toDate ? lastSeen.toDate() : new Date(lastSeen);
        const diff = Math.round((now - lastSeenDate) / 1000); // segundos
        
        if (diff < 60) return 'Activo ahora';
        if (diff < 3600) return `Activo hace ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `Activo hace ${Math.floor(diff / 3600)} h`;
        return `Activo hace ${Math.floor(diff / 86400)} días`;
    } catch (error) {
        return 'Activo hace 10 min';
    }
};

// Card de contribución rediseñada
const UserContributionCard = ({ post, user, onClick }) => {
    // Usar datos del usuario específico, no del post
    const displayName = user?.displayName || 'Usuario';
    const photoURL = user?.photoURL;
    const initials = getInitials(displayName);
    
    // Función para formatear tiempo del post
    const getPostTime = () => {
        if (!post.createdAt) return post.timestamp || '2 h';
        
        try {
            const date = post.createdAt.toDate();
            const now = new Date();
            const diff = Math.round((now - date) / 1000);
            
            if (diff < 60) return 'ahora';
            if (diff < 3600) return `${Math.floor(diff / 60)}m`;
            if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
            return `${Math.floor(diff / 86400)}d`;
        } catch (e) {
            return post.timestamp || '2 h';
        }
    };
    
    return (
        <div className="user-contribution-card" onClick={() => onClick && onClick(post)}>
            <div className="card-header">
                {photoURL ? (
                    <img 
                        src={photoURL} 
                        alt="Avatar" 
                        className="author-avatar" 
                    />
                ) : (
                    <div className="author-avatar">
                        {initials}
                    </div>
                )}
                <div className="author-details">
                    <span className="author-name">{displayName}</span>
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

function UserProfilePage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) {
            setError('ID de usuario no válido');
            setLoading(false);
            return;
        }

        const fetchUserData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                console.log('Cargando perfil para userId:', userId);
                console.log('Usuario actual (currentUser):', currentUser?.uid);
                console.log('¿Es mi propio perfil?:', currentUser?.uid === userId);
                
                // Fetch user data
                const userDocRef = doc(db, 'users', userId);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = { id: userDoc.id, ...userDoc.data() };
                    console.log('Usuario encontrado:', {
                        id: userData.id,
                        displayName: userData.displayName,
                        photoURL: userData.photoURL || 'NO PHOTO',
                        username: userData.username,
                        bio: userData.bio
                    });
                    setUser(userData);
                } else {
                    console.log('Usuario no encontrado en Firestore');
                    // Si no existe el usuario, usar datos por defecto
                    setUser({
                        id: userId,
                        displayName: 'Usuario',
                        username: 'usuario',
                        bio: 'Miembro de la comunidad Golden Suite',
                        level: 1,
                        points: 0
                    });
                }

                // Fetch user posts
                const postsRef = collection(db, 'posts');
                const q = query(postsRef, where('authorUid', '==', userId));
                const querySnapshot = await getDocs(q);
                const userPosts = querySnapshot.docs.map(doc => ({ 
                    id: doc.id, 
                    ...doc.data() 
                }));
                
                // Ordenar manualmente por fecha de creación (más recientes primero)
                userPosts.sort((a, b) => {
                    const dateA = a.createdAt?.toDate?.() || new Date(0);
                    const dateB = b.createdAt?.toDate?.() || new Date(0);
                    return dateB - dateA;
                });
                
                console.log(`Posts encontrados para ${userData?.displayName || 'usuario'}: ${userPosts.length}`);
                setPosts(userPosts);

            } catch (error) {
                console.error("Error al cargar datos del usuario:", error);
                setError('Error al cargar el perfil del usuario');
                
                // En caso de error, mostrar datos por defecto
                setUser({
                    id: userId,
                    displayName: 'Usuario',
                    username: 'usuario',
                    bio: 'Miembro de la comunidad Golden Suite',
                    level: 1,
                    points: 0
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    const handlePostClick = (post) => {
        if (post.id) {
            navigate(`/post/${post.id}`);
        }
    };

    if (loading) {
        return (
            <div className="user-profile-container">
                <div className="user-profile-loading">
                    <div style={{ marginBottom: '16px' }}>Cargando perfil...</div>
                    <div style={{ color: '#A0A0A0', fontSize: '0.9rem' }}>
                        Obteniendo información del usuario
                    </div>
                </div>
            </div>
        );
    }

    if (error && !user) {
        return (
            <div className="user-profile-container">
                <div className="user-profile-loading">
                    <div style={{ marginBottom: '16px' }}>⚠️ Error</div>
                    <div style={{ color: '#A0A0A0', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                    <button 
                        onClick={() => navigate(-1)}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            background: '#F0B90B',
                            color: '#000',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }
    
    // Datos del usuario con fallbacks
    const displayName = user?.displayName || user?.email?.split('@')[0] || 'Usuario';
    const username = user?.username || displayName.toLowerCase().replace(/\s+/g, '');
    const bio = user?.bio || 'Miembro de la comunidad Golden Suite';
    const location = user?.location || 'Ubicación no especificada';
    const level = user?.level || 1;
    const points = user?.points || 0;
    const followers = user?.followers || 0;
    const following = user?.following || 0;
    const contributionsCount = posts.length;
    
    // Obtener iniciales para el avatar principal
    const userInitials = getInitials(displayName);
    const joinDate = formatJoinDate(user?.createdAt);
    const lastActive = getLastActiveTime(user?.lastSeen);
    
    // Determinar si es el perfil del usuario actual
    const isOwnProfile = currentUser && currentUser.uid === userId;

    return (
        <div className="user-profile-container">
            {/* Header */}
            <header className="page-header">
                <h1>{isOwnProfile ? 'Mi perfil' : 'Perfil de miembro'}</h1>
            </header>

            {/* Sección de Perfil Principal */}
            <section className="profile-details-card">
                <div className="profile-main-section">
                    {/* Avatar con fallback de iniciales */}
                    {user?.photoURL && user.photoURL.trim() !== '' ? (
                        <img 
                            src={user.photoURL} 
                            alt="Avatar" 
                            className="profile-avatar-large" 
                            onError={(e) => {
                                console.log(`Error cargando foto de perfil de ${displayName}:`, user.photoURL);
                                e.target.style.display = 'none';
                                // Mostrar el div de iniciales
                                const initialsDiv = e.target.nextSibling;
                                if (initialsDiv) {
                                    initialsDiv.style.display = 'flex';
                                }
                            }}
                            onLoad={(e) => {
                                // Ocultar el div de iniciales si la imagen carga
                                const initialsDiv = e.target.nextSibling;
                                if (initialsDiv) {
                                    initialsDiv.style.display = 'none';
                                }
                            }}
                        />
                    ) : null}
                    
                    <div 
                        className="profile-avatar-large"
                        data-initials={userInitials}
                        style={{ 
                            display: user?.photoURL && user.photoURL.trim() !== '' ? 'none' : 'flex' 
                        }}
                    >
                        {userInitials}
                    </div>
                    
                    <div className="profile-content">
                        {/* Bloque de Nombre y Botón */}
                        <div className="profile-summary">
                            <div className="user-info">
                                <h2 className="user-name">{displayName}</h2>
                                <p className="user-level">Nivel {level}</p>
                            </div>
                            {!isOwnProfile && (
                                <button className="follow-button">Seguir</button>
                            )}
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
                            <span><FaCalendarAlt /> Se unió el {joinDate}</span>
                            <span><GoDotFill color="#8cff98" /> {lastActive}</span>
                            <span><FaMapMarkerAlt /> {location}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sección de Contribuciones */}
            <section className="user-contributions">
                <header className="contributions-header">
                    <h3>Contribuciones</h3>
                    <button className="filter-button" aria-label="Filtros">
                        <HiOutlineAdjustments />
                    </button>
                </header>
                
                <div className="contributions-list">
                    {posts.length > 0 ? (
                        posts.map(post => (
                            <UserContributionCard 
                                key={post.id} 
                                post={post} 
                                user={user}
                                onClick={handlePostClick}
                            />
                        ))
                    ) : (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '40px 20px', 
                            color: '#A0A0A0' 
                        }}>
                            <p>Este usuario aún no ha publicado contenido.</p>
                            {isOwnProfile && (
                                <button 
                                    onClick={() => navigate('/')}
                                    style={{
                                        marginTop: '16px',
                                        padding: '10px 20px',
                                        background: '#F0B90B',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Crear primera publicación
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default UserProfilePage; 