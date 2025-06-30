import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { FaMapMarkerAlt, FaSearch, FaFilter, FaUser, FaCog } from 'react-icons/fa';
import { GoDotFill } from "react-icons/go";
import { BiPlanet } from "react-icons/bi";

// Función para obtener iniciales del nombre
const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
};

// Función para formatear tiempo de actividad
const getLastActiveTime = (lastSeen) => {
    if (!lastSeen) return 'Activo hace 10 min';
    
    try {
        const now = new Date();
        const lastSeenDate = lastSeen.toDate ? lastSeen.toDate() : new Date(lastSeen);
        const diff = Math.round((now - lastSeenDate) / 1000);
        
        if (diff < 60) return 'En línea';
        if (diff < 3600) return `Activo hace ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `Activo hace ${Math.floor(diff / 3600)} h`;
        return `Activo hace ${Math.floor(diff / 86400)} días`;
    } catch (error) {
        return 'Activo hace 10 min';
    }
};

// Card horizontal para cada miembro
const MemberCard = ({ member, onClick }) => {
    const userInitials = getInitials(member.displayName);
    const lastActive = getLastActiveTime(member.lastSeen);
    const isOnline = lastActive === 'En línea';
    const bio = member.bio || 'Sin biografía';
    const location = member.location || 'Argentina';
    
    return (
        <div 
            style={{ 
                background: 'linear-gradient(135deg, #2A2A2A 0%, #3C3C3C 100%)',
                borderRadius: '20px', 
                padding: '24px', 
                color: '#fff', 
                fontFamily: 'Inter, SF Pro Display, Nunito Sans, sans-serif',
                border: '1px solid #4A4A4A',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#F0B90B';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(240, 185, 11, 0.15)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#4A4A4A';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* Efecto de brillo en hover */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(240, 185, 11, 0.05), transparent)',
                transition: 'left 0.6s ease',
                pointerEvents: 'none'
            }} className="shine-effect"></div>
            
            {/* Layout horizontal */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* Avatar */}
                <div style={{ flexShrink: 0 }}>
                    {member.photoURL && member.photoURL.trim() !== '' ? (
                        <img 
                            src={member.photoURL} 
                            alt={member.displayName} 
                            style={{ 
                                width: '64px', 
                                height: '64px', 
                                borderRadius: '50%',
                                border: '1px solid #F0B90B',
                                objectFit: 'cover'
                            }}
                            onError={(e) => {
                                // Si la imagen falla al cargar, mostrar iniciales
                                console.log(`Error cargando foto de ${member.displayName}:`, member.photoURL);
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                            onLoad={(e) => {
                                // Si la imagen carga exitosamente, asegurar que esté visible
                                e.target.style.display = 'block';
                                if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = 'none';
                                }
                            }}
                        />
                    ) : null}
                    
                    {/* Contenedor de iniciales - mostrar si no hay foto o si falla la carga */}
                    <div style={{ 
                        width: '64px', 
                        height: '64px', 
                        borderRadius: '50%',
                        border: '1px solid #F0B90B',
                        background: 'linear-gradient(135deg, #3C3C3C 0%, #2A2A2A 100%)',
                        display: member.photoURL && member.photoURL.trim() !== '' ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#F0B90B',
                        fontSize: '1.5rem',
                        fontWeight: '700'
                    }}>
                        {userInitials}
                    </div>
                </div>
                
                {/* Contenido principal */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Nombre y username */}
                    <div style={{ marginBottom: '8px' }}>
                        <h3 style={{ 
                            margin: 0, 
                            fontSize: '1.3rem', 
                            fontWeight: '600',
                            color: '#EAEAEA',
                            marginBottom: '4px'
                        }}>
                            {member.displayName || 'Usuario'}
                        </h3>
                        <p style={{ 
                            margin: 0, 
                            color: '#F0B90B', 
                            fontSize: '1rem',
                            fontWeight: '500'
                        }}>
                            @{member.username || member.displayName?.toLowerCase().replace(/\s+/g, '') || 'usuario'}
                        </p>
                    </div>
                    
                    {/* Biografía */}
                    <p style={{ 
                        color: '#CCCCCC', 
                        fontSize: '1rem',
                        lineHeight: '1.5',
                        margin: '12px 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                    }}>
                        "{bio}"
                    </p>
                    
                    {/* Estado y ubicación */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '24px',
                        marginTop: '16px',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <GoDotFill 
                                color={isOnline ? '#32CD32' : '#888'} 
                                size={12}
                            />
                            <span style={{ 
                                color: '#A0A0A0', 
                                fontSize: '0.9rem',
                                fontWeight: '500'
                            }}>
                                {lastActive}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FaMapMarkerAlt color="#F0B90B" size={14} />
                            <span style={{ 
                                color: '#A0A0A0', 
                                fontSize: '0.9rem'
                            }}>
                                {location}
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Botón Ver perfil */}
                <div style={{ flexShrink: 0 }}>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick(member);
                        }}
                        style={{ 
                            background: 'transparent',
                            color: '#FFFFFF',
                            border: '2px solid #F0B90B',
                            padding: '12px 24px',
                            borderRadius: '25px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 8px 25px rgba(240, 185, 11, 0.3)';
                            e.target.style.backgroundColor = 'rgba(240, 185, 11, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                            e.target.style.backgroundColor = 'transparent';
                        }}
                    >
                        Ver perfil
                    </button>
                </div>
            </div>
        </div>
    );
};

function MembersPage() {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('Todos');

    const filters = [
        { key: 'Todos', label: 'Todos', count: members.length },
        { key: 'Miembros', label: 'Miembros', count: members.filter(m => !m.admin).length },
        { key: 'Moderadores', label: 'Moderadores', count: members.filter(m => m.admin).length },
        { key: 'En línea', label: 'En línea', count: 5 }
    ];

    useEffect(() => {
        const fetchMembers = async () => {
            setLoading(true);
            try {
                console.log('Cargando miembros de la comunidad...');
                
                const usersRef = collection(db, 'users');
                const q = query(usersRef);
                const querySnapshot = await getDocs(q);
                
                const membersList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                console.log(`Miembros encontrados: ${membersList.length}`);
                
                // Log temporal para debugging de fotos
                console.log('Datos de usuarios con/sin fotos:');
                membersList.forEach(member => {
                    if (member.displayName) {
                        console.log(`${member.displayName}: photoURL = "${member.photoURL || 'NO PHOTO'}"`);
                    }
                });
                
                setMembers(membersList);
                
            } catch (error) {
                console.error('Error al cargar miembros:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, []);

    const handleMemberClick = (member) => {
        navigate(`/user/${member.id}`);
    };

    // Filtrar usuarios por búsqueda y tipo de miembro
    const filteredMembers = useMemo(() => {
        let filtered = members
            .filter(user => user.displayName) // Filtrar usuarios sin nombre
            .filter(user => {
                // Filtro por búsqueda
                const searchLower = searchTerm.toLowerCase();
                const displayName = user.displayName?.toLowerCase() || '';
                const username = user.username?.toLowerCase() || '';
                return displayName.includes(searchLower) || username.includes(searchLower);
            });

        // Filtro por tipo de miembro
        if (activeFilter !== 'Todos') {
            filtered = filtered.filter(user => {
                switch (activeFilter) {
                    case 'Miembros':
                        return !user.admin;
                    case 'Moderadores':
                        return user.admin;
                    case 'En línea':
                        // Simulamos usuarios online (puedes implementar lógica real)
                        return Math.random() > 0.6;
                    default:
                        return true;
                }
            });
        }

        return filtered;
    }, [members, searchTerm, activeFilter]);

    if (loading) {
        return (
            <div style={{ 
                maxWidth: '1200px', 
                margin: '0 auto', 
                padding: '40px 20px',
                textAlign: 'center',
                color: '#EAEAEA',
                fontFamily: 'Inter, sans-serif'
            }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '16px' }}>
                    Cargando miembros de la comunidad...
                </div>
                <div style={{ color: '#A0A0A0', fontSize: '1rem' }}>
                    Obteniendo información de usuarios
                </div>
            </div>
        );
    }

    return (
        <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            padding: '20px',
            fontFamily: 'Inter, SF Pro Display, Nunito Sans, sans-serif'
        }}>
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '32px',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    margin: 0,
                    color: '#EAEAEA',
                    background: 'linear-gradient(135deg, #F0B90B 0%, #E5A500 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    Miembros de la Comunidad
                </h1>
            </div>

            {/* Filtros y búsqueda */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '32px',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                {/* Filtros */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {filters.map(filter => (
                        <button
                            key={filter.key}
                            onClick={() => setActiveFilter(filter.key)}
                            style={{
                                background: activeFilter === filter.key 
                                    ? 'linear-gradient(135deg, #F0B90B 0%, #E5A500 100%)' 
                                    : 'linear-gradient(135deg, #2A2A2A 0%, #1F1F1F 100%)',
                                color: activeFilter === filter.key ? '#000' : '#EAEAEA',
                                border: activeFilter === filter.key ? 'none' : '1px solid #3C3C3C',
                                padding: '10px 20px',
                                borderRadius: '25px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => {
                                if (activeFilter !== filter.key) {
                                    e.target.style.borderColor = '#F0B90B';
                                    e.target.style.color = '#F0B90B';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeFilter !== filter.key) {
                                    e.target.style.borderColor = '#3C3C3C';
                                    e.target.style.color = '#EAEAEA';
                                }
                            }}
                        >
                            {filter.label} ({filter.count})
                        </button>
                    ))}
                </div>
                
                {/* Búsqueda */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <FaSearch style={{ 
                            position: 'absolute', 
                            left: '16px', 
                            color: '#F0B90B',
                            zIndex: 1
                        }} />
                        <input
                            type="text"
                            placeholder="Buscar miembro..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                background: '#2C2C2C',
                                border: '1px solid #3C3C3C',
                                borderRadius: '25px',
                                padding: '12px 20px 12px 48px',
                                color: '#EAEAEA',
                                fontSize: '1rem',
                                minWidth: '250px',
                                outline: 'none',
                                transition: 'border-color 0.2s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#F0B90B'}
                            onBlur={(e) => e.target.style.borderColor = '#3C3C3C'}
                        />
                    </div>
                </div>
            </div>

            {/* Lista de miembros */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                {filteredMembers.length > 0 ? (
                    filteredMembers.map(member => (
                        <MemberCard 
                            key={member.id} 
                            member={member} 
                            onClick={handleMemberClick}
                        />
                    ))
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: '#A0A0A0',
                        background: 'linear-gradient(135deg, #1A1A1A 0%, #2C2C2C 100%)',
                        borderRadius: '20px',
                        border: '1px solid #3C3C3C'
                    }}>
                        <FaUser size={48} style={{ marginBottom: '16px', color: '#F0B90B' }} />
                        <h3 style={{ color: '#EAEAEA', marginBottom: '8px' }}>
                            No se encontraron miembros
                        </h3>
                        <p>Intenta ajustar los filtros o términos de búsqueda.</p>
                    </div>
                )}
            </div>

            {/* Contador de resultados */}
            {!loading && (
                <div style={{
                    textAlign: 'center',
                    marginTop: '32px',
                    color: '#A0A0A0',
                    fontSize: '0.9rem'
                }}>
                    Mostrando {filteredMembers.length} de {members.length} miembros
                </div>
            )}
        </div>
    );
}

export default MembersPage; 