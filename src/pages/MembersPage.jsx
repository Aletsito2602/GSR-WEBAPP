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
    const bio = member.bio || 'Sin bio';
    const location = member.location || 'Argentina';
    
    return (
        <div 
            style={{ 
                width: '100%',
                maxWidth: '1230px',
                minHeight: '250px',
                background: 'linear-gradient(135deg, #2A2A2A 0%, #3C3C3C 100%)',
                borderRadius: '20px', 
                padding: '30px', 
                color: '#fff', 
                fontFamily: 'Poppins, Inter, SF Pro Display, Nunito Sans, sans-serif',
                border: '1px solid #4A4A4A',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxSizing: 'border-box'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#6A6A6A';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(106, 106, 106, 0.15)';
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
                background: 'linear-gradient(90deg, transparent, rgba(106, 106, 106, 0.05), transparent)',
                transition: 'left 0.6s ease',
                pointerEvents: 'none'
            }} className="shine-effect"></div>
            
            {/* Header con foto y título */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '20px' }}>
                {/* Avatar */}
                <div style={{ flexShrink: 0 }}>
                    {member.photoURL && member.photoURL.trim() !== '' && member.photoURL !== 'undefined' ? (
                        <img 
                            src={member.photoURL} 
                            alt={member.displayName} 
                            style={{ 
                                width: '80px', 
                                height: '80px', 
                                borderRadius: '50%',
                                border: '2px solid #6A6A6A',
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
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '50%',
                        border: '2px solid #6A6A6A',
                        background: 'linear-gradient(135deg, #3C3C3C 0%, #2A2A2A 100%)',
                        display: (!member.photoURL || member.photoURL.trim() === '' || member.photoURL === 'undefined') ? 'flex' : 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        fontSize: '1.8rem',
                        fontWeight: '700'
                    }}>
                        {userInitials}
                    </div>
                </div>
                
                {/* Información del usuario */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Nombre */}
                    <h2 style={{ 
                        margin: '0 0 8px 0', 
                        fontSize: '2rem', 
                        fontWeight: '700',
                        color: '#FFFFFF',
                        lineHeight: '1.2'
                    }}>
                        {member.displayName || 'Usuario'}
                    </h2>
                    
                    {/* Username */}
                    <p style={{ 
                        margin: '0 0 20px 0', 
                        color: '#A0A0A0', 
                        fontSize: '1.2rem',
                        fontWeight: '500'
                    }}>
                        @{member.username || member.displayName?.toLowerCase().replace(/\s+/g, '') || 'usuario'}
                    </p>
                </div>
            </div>
            
            {/* Biografía */}
            <div style={{ 
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                marginBottom: '20px'
            }}>
                <p style={{ 
                    color: '#CCCCCC', 
                    fontSize: '1.1rem',
                    lineHeight: '1.6',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    fontFamily: 'Poppins, sans-serif'
                }}>
                    {bio}
                </p>
            </div>
            
            {/* Footer con estado, ubicación y botón */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                {/* Estado y ubicación */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '30px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <GoDotFill 
                            color={isOnline ? '#32CD32' : '#888'} 
                            size={16}
                        />
                        <span style={{ 
                            color: '#A0A0A0', 
                            fontSize: '1rem',
                            fontWeight: '500'
                        }}>
                            {lastActive}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaMapMarkerAlt color="#A0A0A0" size={16} />
                        <span style={{ 
                            color: '#A0A0A0', 
                            fontSize: '1rem'
                        }}>
                            {location}
                        </span>
                    </div>
                </div>
                
                {/* Botón Ver perfil */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick(member);
                    }}
                    style={{ 
                        background: 'linear-gradient(90deg, #000000 0%, #4A4A4A 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '15px 35px',
                        borderRadius: '30px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1.1rem',
                        transition: 'all 0.3s ease',
                        fontFamily: 'Poppins, sans-serif'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                        e.target.style.background = 'linear-gradient(90deg, #1A1A1A 0%, #5A5A5A 100%)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                        e.target.style.background = 'linear-gradient(90deg, #000000 0%, #4A4A4A 100%)';
                    }}
                >
                    Ver perfil
                </button>
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


            {/* Filtros y búsqueda */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '32px',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                {/* Filtros con diseño de tabbar de comunidad */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {filters.map(filter => (
                        <button
                            key={filter.key}
                            onClick={() => setActiveFilter(filter.key)}
                            style={{
                                background: 'linear-gradient(135deg, #222222, #353535)',
                                color: activeFilter === filter.key ? '#FFFFFF' : '#e0e0e0',
                                border: activeFilter === filter.key ? '2px solid #a18a51' : '1px solid #3c3c3c',
                                padding: '6px 12px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap',
                                minWidth: '70px',
                                boxShadow: 'none'
                            }}
                            onMouseEnter={(e) => {
                                if (activeFilter !== filter.key) {
                                    e.target.style.background = 'linear-gradient(135deg, #252525, #383838)';
                                    e.target.style.borderColor = 'rgba(161, 138, 81, 0.6)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeFilter !== filter.key) {
                                    e.target.style.background = 'linear-gradient(135deg, #222222, #353535)';
                                    e.target.style.borderColor = '#3c3c3c';
                                }
                            }}
                        >
                            {filter.label} ({filter.count})
                        </button>
                    ))}
                </div>
                
                {/* Búsqueda */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <FaSearch style={{ 
                            position: 'absolute', 
                            left: '16px', 
                            color: '#A0A0A0',
                            zIndex: 1
                        }} />
                        <input
                            type="text"
                            placeholder="Buscar miembro..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                background: 'linear-gradient(135deg, #222222, #353535)',
                                border: '1px solid #3c3c3c',
                                borderRadius: '10px',
                                padding: '6px 12px 6px 40px',
                                color: '#e0e0e0',
                                fontSize: '0.9rem',
                                minWidth: '200px',
                                outline: 'none',
                                transition: 'border-color 0.2s ease',
                                boxShadow: 'none'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'rgba(161, 138, 81, 0.6)'}
                            onBlur={(e) => e.target.style.borderColor = '#3c3c3c'}
                        />
                    </div>
                    <button 
                        style={{
                            background: 'linear-gradient(135deg, #222222, #353535)',
                            border: '1px solid #3c3c3c',
                            color: '#e0e0e0',
                            padding: '6px 10px',
                            borderRadius: '10px',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            boxShadow: 'none',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'linear-gradient(135deg, #252525, #383838)';
                            e.target.style.borderColor = 'rgba(161, 138, 81, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'linear-gradient(135deg, #222222, #353535)';
                            e.target.style.borderColor = '#3c3c3c';
                        }}
                    >
                        <FaFilter />
                    </button>
                </div>
            </div>

            {/* Lista de miembros */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(1230px, 100%), 1fr))',
                gap: '24px',
                justifyContent: 'center'
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
                        <FaUser size={48} style={{ marginBottom: '16px', color: '#A0A0A0' }} />
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