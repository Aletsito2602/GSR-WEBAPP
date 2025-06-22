import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { doc, getDoc } from "firebase/firestore";

const niveles = [
  { nivel: 1, porcentaje: '90%', desbloqueo: null },
  { nivel: 2, porcentaje: null, desbloqueo: 'Desbloquea "chat con miembros"' },
  { nivel: 3, porcentaje: '1%', desbloqueo: null },
  { nivel: 4, porcentaje: '1%', desbloqueo: null },
  { nivel: 5, porcentaje: '1%', desbloqueo: null },
  { nivel: 6, porcentaje: '1%', desbloqueo: null },
  { nivel: 7, porcentaje: '1%', desbloqueo: null },
  { nivel: 8, porcentaje: '0%', desbloqueo: null },
  { nivel: 9, porcentaje: '0%', desbloqueo: null },
];

const ranking = [
  { nombre: 'Samantha Díaz', puesto: 'Primer lugar', foto: 'https://randomuser.me/api/portraits/women/65.jpg' },
  { nombre: 'José Ramos', puesto: 'Segundo lugar', foto: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { nombre: 'Ana López', puesto: 'Tercer lugar', foto: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { nombre: 'Valería Gómez', puesto: 'Cuarto lugar', foto: 'https://randomuser.me/api/portraits/women/43.jpg' },
  { nombre: 'José Ramos', puesto: 'Quinto lugar', foto: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { nombre: 'Carlos Méndez', puesto: 'Sexto lugar', foto: 'https://randomuser.me/api/portraits/men/45.jpg' },
  { nombre: 'Lucía Torres', puesto: 'Séptimo lugar', foto: 'https://randomuser.me/api/portraits/women/50.jpg' },
  { nombre: 'Miguel Ángel', puesto: 'Octavo lugar', foto: 'https://randomuser.me/api/portraits/men/41.jpg' },
  { nombre: 'Paula Ruiz', puesto: 'Noveno lugar', foto: 'https://randomuser.me/api/portraits/women/51.jpg' },
  { nombre: 'Luis Pérez', puesto: 'Décimo lugar', foto: 'https://randomuser.me/api/portraits/men/36.jpg' },
];

function LevelsPage({ posts = [] }) {
  const { currentUser } = useAuth();
  const [periodo, setPeriodo] = useState('semanal');
  const [top10Users, setTop10Users] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Detectar cambios en el ancho de la pantalla
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Calcular likes dados por el usuario actual
  const likesDados = posts.filter(post => Array.isArray(post.likedBy) && currentUser && post.likedBy.includes(currentUser.uid)).length;

  // Calcular nivel según likes dados (cada 5 likes sube un nivel)
  const nivelCalculado = Math.floor(likesDados / 5) + 1;
  const puntosParaSubir = 5 - (likesDados % 5);

  // Datos del usuario actual
  const usuario = {
    nombre: currentUser?.displayName || 'Usuario',
    nivel: nivelCalculado,
    puntosParaSubir: puntosParaSubir === 5 ? 0 : puntosParaSubir,
    foto: currentUser?.photoURL || '',
    posicion: 1, // Por defecto, se puede ajustar según la lógica de negocio
  };

  // Obtener lista de usuarios con al menos 1 like, ordenados por likes descendente
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoadingUsers(true);
      
      // Recopilamos datos de likes y usuarios
      const likesPorUsuario = {};
      const userInfo = {};
      
      posts.forEach(post => {
        if (Array.isArray(post.likedBy)) {
          post.likedBy.forEach((uid, idx) => {
            if (!likesPorUsuario[uid]) likesPorUsuario[uid] = 0;
            likesPorUsuario[uid] += 1;
            
            // Guardar info básica del usuario si está disponible
            if (post.likedByInfo && Array.isArray(post.likedByInfo)) {
              const info = post.likedByInfo[idx];
              if (info && !userInfo[uid]) {
                userInfo[uid] = info;
              }
            } else if (post.authorUid === uid && post.authorName) {
              userInfo[uid] = { nombre: post.authorName };
            }
          });
        }
      });
      
      // Creamos array inicial ordenado por cantidad de likes
      const topUsers = Object.entries(likesPorUsuario)
        .map(([uid, cantidad]) => ({
          uid,
          cantidad,
          nombre: userInfo[uid]?.nombre || '',
          isLoading: !userInfo[uid]?.nombre // Marcar para cargar si no tenemos el nombre
        }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10);
      
      // Primero establecemos el estado con los datos que ya tenemos
      setTop10Users(topUsers);
      
      // Ahora buscamos los datos faltantes en Firestore
      try {
        const usersWithNames = await Promise.all(
          topUsers.map(async (user) => {
            if (!user.nombre) {
              try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                  return {
                    ...user,
                    nombre: userDoc.data().displayName || `Usuario ${user.uid.slice(0, 4)}`,
                    isLoading: false
                  };
                }
              } catch (error) {
                console.error(`Error al obtener datos del usuario ${user.uid}:`, error);
              }
            }
            // Si ya tenía nombre o falló la consulta, devolvemos el usuario como estaba
            return {
              ...user,
              nombre: user.nombre || `${user.uid.slice(0, 8)}`,
              isLoading: false
            };
          })
        );
        
        // Actualizamos el estado con todos los nombres obtenidos
        setTop10Users(usersWithNames);
      } catch (error) {
        console.error('Error al obtener nombres de usuarios:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    
    if (posts.length > 0) {
      fetchUserData();
    }
  }, [posts]);

  return (
    <div className="levels-container" style={{ 
      maxWidth: 1100, 
      margin: '0 auto', 
      padding: windowWidth < 768 ? '15px 10px' : '30px 0', 
      color: '#fff' 
    }}>
      {/* Cuadro de estadística de likes dados */}
      <div style={{ 
        background: '#232323', 
        borderRadius: 14, 
        padding: windowWidth < 480 ? '12px 20px' : '18px 32px', 
        marginBottom: 24, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 18, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)', 
        maxWidth: windowWidth < 480 ? '100%' : 340 
      }}>
        <span style={{ fontSize: windowWidth < 480 ? 24 : 28, color: '#FFD700', marginRight: 12 }}><i className="fas fa-heart" /></span>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: windowWidth < 480 ? 16 : 18, color: '#FFD700' }}>Likes dados</div>
          <div style={{ fontSize: windowWidth < 480 ? 20 : 22, fontWeight: 'bold', color: '#fff' }}>{likesDados}</div>
        </div>
      </div>

      {/* Encabezado usuario */}
      <div style={{ 
        background: '#232323', 
        borderRadius: 18, 
        padding: windowWidth < 480 ? '20px' : 32, 
        display: 'flex', 
        alignItems: 'center', 
        gap: windowWidth < 480 ? 16 : 28, 
        marginBottom: 32, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)' 
      }}>
        <div style={{ position: 'relative' }}>
          {usuario.foto ? (
            <img src={usuario.foto} alt={usuario.nombre} style={{ 
              width: windowWidth < 480 ? 70 : 90, 
              height: windowWidth < 480 ? 70 : 90, 
              borderRadius: '50%', 
              border: '4px solid #D7B615', 
              objectFit: 'cover' 
            }} />
          ) : (
            <div style={{ 
              width: windowWidth < 480 ? 70 : 90, 
              height: windowWidth < 480 ? 70 : 90, 
              borderRadius: '50%', 
              border: '4px solid #D7B615', 
              background: '#444', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: windowWidth < 480 ? 36 : 44, 
              color: '#FFD700', 
              fontWeight: 'bold' 
            }}>
              {usuario.nombre[0].toUpperCase()}
            </div>
          )}
          <span style={{ 
            position: 'absolute', 
            bottom: 0, 
            right: 0, 
            background: '#D7B615', 
            color: '#232323', 
            borderRadius: '50%', 
            width: windowWidth < 480 ? 28 : 32, 
            height: windowWidth < 480 ? 28 : 32, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 'bold', 
            fontSize: windowWidth < 480 ? 16 : 18, 
            border: '2px solid #232323' 
          }}>{usuario.nivel}</span>
        </div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: windowWidth < 480 ? 18 : 22, color: '#FFD700' }}>{usuario.nombre}</div>
          <div style={{ fontWeight: 600, fontSize: windowWidth < 480 ? 16 : 18, color: '#fff', marginTop: 2 }}>Nivel {usuario.nivel}</div>
          <div style={{ color: '#aaa', fontSize: windowWidth < 480 ? 13 : 15, marginTop: 4 }}>
            {usuario.puntosParaSubir} puntos para subir de nivel 
            <span title="¿Cómo subo de nivel?" style={{ cursor: 'pointer', color: '#FFD700', marginLeft: 6 }}>?</span>
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: windowWidth < 768 ? 'column' : 'row', 
        gap: windowWidth < 768 ? 24 : 32 
      }}>
        {/* Columna de niveles */}
        <div style={{ 
          flex: 1, 
          background: '#191919', 
          borderRadius: 16, 
          padding: windowWidth < 480 ? 18 : 28, 
          minWidth: windowWidth < 768 ? 'auto' : 260, 
          maxWidth: windowWidth < 768 ? 'none' : 320 
        }}>
          <div style={{ fontWeight: 'bold', fontSize: windowWidth < 480 ? 15 : 17, marginBottom: 18, color: '#fff' }}>
            Estás en la posición {usuario.posicion}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: windowWidth < 480 ? 6 : 10 }}>
            {niveles.map((n, idx) => (
              <div 
                key={n.nivel} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  background: '#232323', 
                  borderRadius: 10, 
                  padding: windowWidth < 480 ? '8px 12px' : '12px 16px', 
                  opacity: n.nivel <= usuario.nivel ? 1 : 0.7, 
                  border: n.nivel === usuario.nivel ? '2px solid #D7B615' : '1px solid #333', 
                  marginBottom: 2 
                }}
              >
                <span style={{ 
                  fontWeight: 'bold', 
                  fontSize: windowWidth < 480 ? 14 : 16, 
                  color: n.nivel === usuario.nivel ? '#FFD700' : '#fff', 
                  minWidth: windowWidth < 480 ? 50 : 60 
                }}>
                  Nivel {n.nivel}
                </span>
                <span style={{ 
                  marginLeft: 10, 
                  color: '#aaa', 
                  fontSize: windowWidth < 480 ? 13 : 15, 
                  flex: 1 
                }}>
                  {n.porcentaje ? `${n.porcentaje} de miembros` : n.desbloqueo || ''}
                </span>
                {n.nivel > usuario.nivel && (
                  <span style={{ marginLeft: 10, color: '#FFD700', fontSize: 18 }}>
                    <i className="fas fa-lock" />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Columna ranking */}
        <div style={{ 
          flex: 2, 
          background: '#191919', 
          borderRadius: 16, 
          padding: windowWidth < 480 ? 18 : 28, 
          minWidth: windowWidth < 768 ? 'auto' : 340 
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: windowWidth < 480 ? 'column' : 'row',
            gap: windowWidth < 480 ? 12 : 0,
            justifyContent: 'space-between', 
            alignItems: windowWidth < 480 ? 'flex-start' : 'center', 
            marginBottom: 18 
          }}>
            <div style={{ fontWeight: 'bold', fontSize: windowWidth < 480 ? 16 : 18, color: '#FFD700' }}>
              Primeros <span style={{ color: '#fff' }}>10 Lugares</span>
            </div>
            <div>
              <button 
                onClick={() => setPeriodo('semanal')} 
                style={{ 
                  background: periodo === 'semanal' ? '#D7B615' : '#232323', 
                  color: periodo === 'semanal' ? '#232323' : '#fff', 
                  border: 'none', 
                  borderRadius: 6, 
                  padding: windowWidth < 480 ? '5px 14px' : '7px 18px', 
                  fontWeight: 'bold', 
                  marginRight: 8, 
                  cursor: 'pointer', 
                  fontSize: windowWidth < 480 ? 13 : 15 
                }}
              >
                Semanal
              </button>
              <button 
                onClick={() => setPeriodo('mensual')} 
                style={{ 
                  background: periodo === 'mensual' ? '#D7B615' : '#232323', 
                  color: periodo === 'mensual' ? '#232323' : '#fff', 
                  border: 'none', 
                  borderRadius: 6, 
                  padding: windowWidth < 480 ? '5px 14px' : '7px 18px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer', 
                  fontSize: windowWidth < 480 ? 13 : 15 
                }}
              >
                Mensual
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: windowWidth < 480 ? 6 : 10 }}>
            {isLoadingUsers ? (
              <div style={{ color: '#aaa', padding: 16, textAlign: 'center' }}>Cargando ranking...</div>
            ) : top10Users.length === 0 ? (
              <div style={{ color: '#aaa', padding: 16 }}>Aún no hay usuarios en el ranking.</div>
            ) : (
              top10Users.map((user, idx) => (
                <div 
                  key={user.uid} 
                  className="ranking-item"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    background: '#232323', 
                    borderRadius: 10, 
                    padding: windowWidth < 480 ? '8px 12px' : '12px 16px', 
                    marginBottom: 2, 
                    border: idx === 0 ? '2px solid #FFD700' : '1px solid #333'
                  }}
                >
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ 
                      fontWeight: 'bold', 
                      color: '#FFD700', 
                      fontSize: windowWidth < 480 ? 16 : 18,
                      width: windowWidth < 480 ? 24 : 28,
                      height: windowWidth < 480 ? 24 : 28,
                      borderRadius: '50%',
                      background: '#333',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {user.nombre ? user.nombre[0].toUpperCase() : '?'}
                    </span>
                    <span style={{ 
                      fontWeight: 'bold', 
                      color: '#fff', 
                      fontSize: windowWidth < 480 ? 15 : 18,
                      maxWidth: windowWidth < 480 ? '120px' : 'none',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {user.isLoading ? 'Cargando...' : user.nombre}
                    </span>
                  </div>
                  <div style={{ 
                    color: '#aaa', 
                    fontSize: windowWidth < 480 ? 12 : 14, 
                    minWidth: windowWidth < 480 ? 70 : 90, 
                    textAlign: 'right' 
                  }}>
                    {idx === 0 ? 'Primer lugar' : idx === 1 ? 'Segundo lugar' : idx === 2 ? 'Tercer lugar' : `${idx + 1}º lugar`}
                  </div>
                  <span style={{ color: '#FFD700', fontSize: 18, marginLeft: 10 }}>
                    <i className="fas fa-star" />
                  </span>
                  
                  {/* Tooltip de likes al hacer hover */}
                  <div className="likes-tooltip">
                    {user.cantidad} likes dados
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div style={{ 
        textAlign: 'right', 
        color: '#aaa', 
        fontSize: windowWidth < 480 ? 11 : 13, 
        marginTop: 18 
      }}>
        Última actualización: 6 Ene, 2025, 8 pm
      </div>
    </div>
  );
}

export default LevelsPage; 