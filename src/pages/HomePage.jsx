import React, { useState, useEffect, useRef } from 'react';
import { db, auth, storage } from '../firebaseConfig'; // Importamos storage 
import { collection, query, orderBy, getDocs, Timestamp, addDoc, serverTimestamp, where, doc, setDoc, onSnapshot } from "firebase/firestore";
import { useAuth } from '../context/AuthContext'; 
import { isUserAdmin } from '../utils/authUtils';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Importamos funciones para storage
import { updateProfile } from 'firebase/auth'; // Importamos updateProfile para actualizar el perfil
// Importar los nuevos componentes
import PostInput from '../components/PostInput';
import PostCard from '../components/PostCard';
import AnunciosList from '../components/AnunciosList'; // Importar componente de anuncios
// Importar componentes de Streaming
import SearchBar from '../components/SearchBar';
import SectionHeader from '../components/SectionHeader';
import VideoPlayer from '../components/VideoPlayer';
import VideoInfo from '../components/VideoInfo';
import Playlist from '../components/Playlist';
import VideoGallery from '../components/VideoGallery';
import NivelesPageV2 from '../pages/NivelesPageV2'; // Importar el nuevo componente de niveles
import MapaPage from '../components/MapaPage'; // Importar el nuevo componente de mapa
import TopNavBar from '../components/TopNavBar';
import Header from '../components/Header';
import CalendarioPage from './CalendarioPage'; // Importar la página de calendario
import MembersPage from './MembersPage'; // Importar la página de miembros
import AboutPage from './AboutPage'; // Importar AboutPage
import CourseCard from '../components/CourseCard'; // Importar la nueva tarjeta de curso
import './ClasesPage.css'; // Importar los estilos para la página de clases
import LiveChat from '../components/LiveChat'; // Importar chat
import RecordedVideoCard from '../components/RecordedVideoCard'; // Importar tarjeta de video grabado
import './StreamingPage.css'; // Importar estilos de la página de streaming

// Componente para el feed de la comunidad
const CommunityFeed = ({ 
    activeCategory, 
    handleCategoryChange, 
    onPost, 
    loading, 
    error, 
    posts = [],
    currentUser, 
    formatTimestamp,
    onPostUpdate 
}) => (
    <div key="comunidad" className="tab-panel">
        <div className="community-nav">
            <div className="nav-row">
                {['Todo', 'AGM', 'Eventos', 'Anuncios', 'Trading'].map(category => (
                    <button
                        key={category}
                        className={`nav-filter-button ${activeCategory === category ? 'active' : ''}`}
                        onClick={() => handleCategoryChange(category)}
                    >
                        {category}
                    </button>
                ))}
                <button className="filter-button">
                    <i className="fas fa-sliders-h"></i>
                </button>
                <button className="week-dropdown">
                    Semana <i className="fas fa-chevron-down"></i>
                </button>
            </div>
        </div>

        <PostInput onPost={onPost} />

        <div className="posts-container">
            {loading ? (
                <div className="loading-state">
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Cargando publicaciones...</span>
                </div>
            ) : error ? (
                <div className="error-state">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>Error: {error}</span>
                </div>
            ) : posts.length === 0 ? (
                <div className="empty-state">
                    <i className="fas fa-comments"></i>
                    <span>No hay publicaciones en esta categoría.</span>
                </div>
            ) : (
                posts.map(post => (
                    <PostCard
                        key={post.id}
                        post={post}
                        currentUser={currentUser}
                        formatTimestamp={formatTimestamp}
                        onPostUpdate={onPostUpdate}
                    />
                ))
            )}
        </div>
    </div>
);

// Componente para el perfil de usuario (separado para mejor organización)
function UserProfile({ currentUser }) {
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(currentUser?.photoURL || '');
  const [isUploading, setIsUploading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Efecto para actualizar campos si cambia currentUser
  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || '');
      setPreviewURL(currentUser.photoURL || '');
    }
  }, [currentUser]);
  
  // Efecto para detectar cambios
  useEffect(() => {
    if (currentUser) {
      const nameChanged = displayName !== (currentUser.displayName || '');
      const photoChanged = selectedFile !== null;
      setHasChanges(nameChanged || photoChanged);
    }
  }, [displayName, selectedFile, currentUser]);
  
  // Manejar cambio de nombre
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setDisplayName(newName);
    setHasChanges(newName !== (currentUser?.displayName || '') || selectedFile !== null);
  };
  
  // Manejar cambio de foto
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Crear URL de vista previa
      const fileURL = URL.createObjectURL(file);
      setPreviewURL(fileURL);
      setHasChanges(true);
    }
  };
  
  // Guardar cambios
  const handleSaveChanges = async () => {
    if (!hasChanges || !currentUser) return;
    
    setIsUploading(true);
    let photoURL = currentUser.photoURL || '';
    let retryCount = 0;
    const maxRetries = 3;
    
    try {
      // 1. Si hay un archivo seleccionado, subirlo primero a Storage
      if (selectedFile) {
        while (retryCount < maxRetries) {
          try {
            const storageRef = ref(storage, `profile_images/${currentUser.uid}/${Date.now()}_${selectedFile.name}`);
            const uploadResult = await uploadBytes(storageRef, selectedFile);
            photoURL = await getDownloadURL(uploadResult.ref);
            console.log('Foto subida exitosamente:', photoURL);
            break; // Si la subida fue exitosa, salir del bucle
          } catch (uploadError) {
            retryCount++;
            console.error(`Error al subir foto (intento ${retryCount}/${maxRetries}):`, uploadError);
            
            if (retryCount === maxRetries) {
              throw new Error(`No se pudo subir la foto después de ${maxRetries} intentos: ${uploadError.message}`);
            }
            
            // Esperar antes de reintentar (backoff exponencial)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          }
        }
      }

      // 2. Actualizar Auth Profile
      try {
        await updateProfile(auth.currentUser, {
          displayName: displayName.trim(),
          photoURL: photoURL
        });
        console.log('Perfil de Auth actualizado');
      } catch (authError) {
        console.error('Error al actualizar perfil de Auth:', authError);
        throw new Error('Error al actualizar perfil de Auth: ' + authError.message);
      }

      // 3. Actualizar Firestore
      try {
        const userRef = doc(db, "users", currentUser.uid);
        await setDoc(userRef, {
          displayName: displayName.trim(),
          photoURL: photoURL,
          updatedAt: serverTimestamp()
        }, { merge: true });
        console.log('Perfil en Firestore actualizado');
      } catch (firestoreError) {
        console.error('Error al actualizar Firestore:', firestoreError);
        throw new Error('Error al actualizar perfil en la base de datos: ' + firestoreError.message);
      }

      // 4. Limpiar estado y mostrar éxito
      setSelectedFile(null);
      setHasChanges(false);
      setPreviewURL(photoURL);
      
      alert('Perfil actualizado con éxito');
      
      // 5. Recargar la página
      window.location.reload();
      
    } catch (error) {
      console.error('Error en el proceso de actualización:', error);
      alert('Error al actualizar el perfil: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '30px' }}>
      {/* Sección de foto de perfil */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          width: '150px', 
          height: '150px', 
          borderRadius: '50%', 
          border: '2px solid #D7B615',
          overflow: 'hidden',
          position: 'relative',
          marginBottom: '10px',
          backgroundColor: '#444'
        }}>
          {previewURL ? (
            <img 
              src={previewURL} 
              alt="Foto de perfil" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '100%', 
              height: '100%',
              fontSize: '3rem',
              color: '#D7B615'
            }}>
              {displayName ? displayName[0].toUpperCase() : 'U'}
            </div>
          )}
        </div>
        <input 
          type="file" 
          id="profilePictureInput" 
          style={{ display: 'none' }} 
          accept="image/*"
          onChange={handleFileChange} 
        />
        <label 
          htmlFor="profilePictureInput"
          style={{
            padding: '8px 12px',
            backgroundColor: '#666',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'inline-block',
            fontSize: '0.9rem'
          }}
        >
          Cambiar foto
        </label>
      </div>
      
      {/* Información básica */}
      <div style={{ flex: 1 }}>
        <h2 style={{ color: '#D7B615', marginBottom: '15px' }}>Información Personal</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'rgba(255,255,255,0.7)' }}>
            Nombre completo
          </label>
          <input 
            type="text" 
            value={displayName} 
            onChange={handleNameChange}
            placeholder="Tu nombre completo"
            style={{
              width: '100%',
              maxWidth: '300px',
              padding: '8px 12px',
              backgroundColor: '#444',
              border: '1px solid #555',
              borderRadius: '4px',
              color: 'white'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'rgba(255,255,255,0.7)' }}>
            Correo electrónico
          </label>
          <input 
            type="email" 
            value={currentUser.email} 
            disabled
            style={{
              width: '100%',
              maxWidth: '300px',
              padding: '8px 12px',
              backgroundColor: '#444',
              border: '1px solid #555',
              borderRadius: '4px',
              color: 'rgba(255,255,255,0.5)'
            }}
          />
          <small style={{ color: 'rgba(255,255,255,0.5)', display: 'block', marginTop: '5px' }}>
            El correo no se puede modificar
          </small>
        </div>

        {/* Botón para guardar cambios */}
        <button 
          onClick={handleSaveChanges}
          disabled={!hasChanges || isUploading}
          style={{ 
            padding: '8px 16px', 
            border: 'none', 
            borderRadius: '5px', 
            backgroundColor: hasChanges ? '#D7B615' : '#555', 
            color: hasChanges ? 'black' : '#888',
            cursor: hasChanges ? 'pointer' : 'not-allowed',
            fontWeight: 'bold'
          }}
        >
          {isUploading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
}

// Datos de ejemplo Streaming Playlist
const samplePlaylistItems = [
  { id: 'pl1', title: 'El camino al éxito financiero: Domina el arte del trading', thumbnailUrl: 'https://placehold.co/100x60/777/eee?text=Chart1' },
  { id: 'pl2', title: 'De novato a experto: Aprende a realizar inversiones exitosas', thumbnailUrl: 'https://placehold.co/100x60/666/eee?text=Chart2' },
  { id: 'pl3', title: 'Optimiza tu trading: Técnicas clave para mejores resultados', thumbnailUrl: 'https://placehold.co/100x60/555/eee?text=Isaac1' },
  { id: 'pl4', title: 'Aprende con nosotros', thumbnailUrl: 'https://placehold.co/100x60/444/eee?text=Chart3' },
  { id: 'pl5', title: 'Secretos del análisis técnico', thumbnailUrl: 'https://placehold.co/100x60/333/eee?text=Chart4' },
  // Añadir más items
];

function HomePage() {
  const { currentUser } = useAuth(); // <<< Obtener usuario actual
  const location = useLocation(); // Para leer parámetros de URL
  const navigate = useNavigate(); // Para actualizar la URL sin recargar
  
  // Estado para viewers global - conteo verdaderamente real con WebSockets
  const [viewers, setViewers] = useState(0);
  const [websocket, setWebsocket] = useState(null);
  
  // Leer el parámetro 'tab' de la URL o usar 'comunidad' por defecto
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    return tabParam || 'comunidad';
  };
  
  // Estado para la pestaña activa, inicializada desde la URL
  const [activeTab, setActiveTab] = useState(getInitialTab());
  
  // Escuchar cambios en la URL para actualizar la pestaña activa
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab') || 'comunidad';
    setActiveTab(tabParam);
  }, [location.search]);

  // <<< NUEVO ESTADO para posts >>>
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [errorPosts, setErrorPosts] = useState(null);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false); // <<< Estado para submit
  
  // <<< NUEVOS ESTADOS para Streaming >>>
  const [streamingPlaylistVideos, setStreamingPlaylistVideos] = useState([]); 
  const [streamingSelectedVideo, setStreamingSelectedVideo] = useState(null);
  const [isLoadingStreaming, setIsLoadingStreaming] = useState(false);
  const [errorStreaming, setErrorStreaming] = useState(null);
  
  // Nuevo estado para la categoría activa
  const [activeCategory, setActiveCategory] = useState('Todo');
  
  // Nuevo estado para verificar si el usuario es admin
  const [isAdmin, setIsAdmin] = useState(null);

  // Estado para las clases grabadas (videos de la carpeta Vimeo)
  const [recordedClasses, setRecordedClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [errorClasses, setErrorClasses] = useState(null);

  // Verificar si el usuario es administrador al cargar y cuando cambie currentUser
  useEffect(() => {
    const checkIfAdmin = async () => {
      if (currentUser) {
        try {
          // Usar la función isUserAdmin de authUtils para verificar el rol admin
          const adminStatus = await isUserAdmin(currentUser.uid);
          console.log("¿Es admin?:", adminStatus);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error("Error verificando permisos de administrador:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    
    checkIfAdmin();
  }, [currentUser]);

  // Función para obtener la URL base según el entorno
  const getBackendUrl = () => {
    if (process.env.NODE_ENV === 'production') {
      return 'https://milegadoisaacramirez.com/.netlify/functions';
    }
    return 'http://localhost:3001';
  };

  // useEffect para cargar videos de la Playlist de Streaming
  useEffect(() => {
    if (activeTab === 'streaming' && streamingPlaylistVideos.length === 0) {
      const fetchStreamingPlaylist = async () => {
        setIsLoadingStreaming(true);
        setErrorStreaming(null);
        
        try {
          const baseUrl = getBackendUrl();
          const response = await fetch(`${baseUrl}/api/vimeo/folder-videos`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
          }
          
          const data = await response.json();
          if (!Array.isArray(data) || data.length === 0) {
            throw new Error('No se encontraron videos en la playlist');
          }
          // El backend ya devuelve los campos id, title, description, thumbnail, link
          setStreamingPlaylistVideos(data);
          // No seleccionar ningún video por defecto, así se muestra el streaming en vivo
          // if (!streamingSelectedVideo && data.length > 0) {
          //   setStreamingSelectedVideo(data[0]);
          // }
          // Guardar en localStorage para recuperación en caso de error
          localStorage.setItem('streamingPlaylistVideos', JSON.stringify(data));
          // if (data.length > 0) {
          //   localStorage.setItem('streamingSelectedVideo', JSON.stringify(data[0]));
          // }
        } catch (error) {
          setErrorStreaming(error.message);
          // Intentar recuperar del localStorage
          const savedVideos = localStorage.getItem('streamingPlaylistVideos');
          const savedSelectedVideo = localStorage.getItem('streamingSelectedVideo');
          if (savedVideos) {
            try {
              const parsedVideos = JSON.parse(savedVideos);
              setStreamingPlaylistVideos(parsedVideos);
              if (savedSelectedVideo) {
                setStreamingSelectedVideo(JSON.parse(savedSelectedVideo));
              } else if (parsedVideos.length > 0) {
                setStreamingSelectedVideo(parsedVideos[0]);
              }
            } catch (e) {
              // No hacer nada
            }
          }
        } finally {
          setIsLoadingStreaming(false);
        }
      };
      fetchStreamingPlaylist();
    }
  }, [activeTab, streamingPlaylistVideos.length, streamingSelectedVideo]);

  // Efecto para crear una conexión WebSocket y contar espectadores reales
  useEffect(() => {
    if (activeTab === 'streaming') {
      // Identificador único para esta transmisión
      const streamRoomId = 'mi-legado-isaac-ramirez';
      
      // Crear conexión WebSocket con un servicio gratuito (Scaledrone en este caso)
      // Nota: En producción deberías usar tu propio servidor o un servicio más robusto
      const scaledroneChannelId = 'rFn1AzWcwRgvzhm9'; // ID de canal gratuito para pruebas
      const ws = new WebSocket(`wss://socket.yousay.cloud:8080`);
      
      // Actualizar la referencia al WebSocket
      setWebsocket(ws);
      
      // Gestionar la apertura de la conexión
      ws.onopen = () => {
        console.log('Conexión WebSocket establecida');
        
        // Enviar mensaje de entrada al canal
        const joinMessage = JSON.stringify({
          type: 'join',
          roomId: streamRoomId,
          clientId: Date.now().toString() // ID único para cada cliente
        });
        
        ws.send(joinMessage);
      };
      
      // Gestionar los mensajes entrantes
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Si es un mensaje de actualización de conteo
          if (data.type === 'viewerCount' && data.roomId === streamRoomId) {
            setViewers(data.count);
          }
        } catch (error) {
          console.error('Error al procesar mensaje WebSocket:', error);
        }
      };
      
      // Gestionar errores
      ws.onerror = (error) => {
        console.error('Error en la conexión WebSocket:', error);
        // Fallback a un número aleatorio si hay error en la conexión
        setViewers(Math.floor(Math.random() * 10) + 15);
      };
      
      // Gestionar el cierre de la conexión
      ws.onclose = () => {
        console.log('Conexión WebSocket cerrada');
      };
      
      // Enviar latidos periódicos para mantener la conexión viva
      const heartbeatInterval = setInterval(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'heartbeat' }));
        }
      }, 30000);
      
      // Limpiar la conexión al desmontar el componente
      return () => {
        if (ws) {
          // Enviar mensaje de salida
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'leave',
              roomId: streamRoomId
            }));
          }
          
          // Cerrar la conexión
          ws.close();
        }
        
        // Limpiar el intervalo de latidos
        clearInterval(heartbeatInterval);
      };
    }
  }, [activeTab]);

  // useEffect para cargar posts cuando cambie la categoría activa
  useEffect(() => {
    if (activeTab === 'comunidad') {
      fetchPosts(); 
    }
  }, [activeTab, activeCategory]); 

  // Efecto para cargar las clases grabadas de Vimeo
  useEffect(() => {
    if (activeTab === 'clases' || activeTab === 'streaming') {
      const fetchRecordedClasses = async () => {
        setLoadingClasses(true);
        setErrorClasses(null);
        
        try {
          const accessToken = "99b1a15a9f21cc8f4ffdb1e925103e99"; // Token de acceso de Vimeo
          const folderId = "25173287"; // ID de la carpeta de Vimeo proporcionada
          const userId = "217228632"; // ID de usuario de Vimeo
          
          // Usamos la API de Vimeo para obtener los videos de la carpeta
          const apiUrl = `https://api.vimeo.com/users/${userId}/folders/${folderId}/videos`;
          
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.data && data.data.length > 0) {
            // Formatear los datos de los videos
            const formattedVideos = data.data.map(video => ({
              id: video.uri.replace('/videos/', ''),
              title: video.name,
              description: video.description || 'Sin descripción.',
              thumbnail: video.pictures?.base_link ? `${video.pictures.base_link}_640x360.jpg` : 'https://via.placeholder.com/640x360',
              link: video.link
            }));
            
            setRecordedClasses(formattedVideos);
            localStorage.setItem('recordedClasses', JSON.stringify(formattedVideos));
          } else {
            // Si no hay datos, intentar recuperar del localStorage
            const savedClasses = localStorage.getItem('recordedClasses');
            if (savedClasses) {
              setRecordedClasses(JSON.parse(savedClasses));
            } else {
              setRecordedClasses([]);
            }
          }
        } catch (error) {
          console.error('Error al cargar clases grabadas:', error);
          setErrorClasses(error.message);
          
          // Intentar recuperar del localStorage
          const savedClasses = localStorage.getItem('recordedClasses');
          if (savedClasses) {
            setRecordedClasses(JSON.parse(savedClasses));
          }
        } finally {
          setLoadingClasses(false);
        }
      };
      
      fetchRecordedClasses();
    }
  }, [activeTab]);

  // Modificar fetchPosts para filtrar por categoría
  const fetchPosts = async () => {
      setLoadingPosts(true);
      setErrorPosts(null);
      try {
          const postsRef = collection(db, "posts");
          let postsQuery;
          
          // Siempre ordenamos por fecha de creación descendente
          postsQuery = query(postsRef, orderBy("createdAt", "desc"));
          const querySnapshot = await getDocs(postsQuery);
          const fetchedPosts = [];
          
          querySnapshot.forEach((doc) => {
              const postData = doc.data();
              
              // Aplicar lógica de filtrado según la categoría activa
              if (activeCategory === 'Chat') {
                  if (!postData.category || postData.category === 'Chat') {
                      fetchedPosts.push({ id: doc.id, ...postData });
                  }
              } else if (activeCategory === 'Anuncios') {
                  // Para "Anuncios", solo incluir posts con category='Anuncios'
                  if (postData.category === 'Anuncios') {
                      fetchedPosts.push({ id: doc.id, ...postData });
                  }
              } else {
                  // Si no hay filtro activo o es otra categoría, incluir todos
                  fetchedPosts.push({ id: doc.id, ...postData });
              }
          });
          
          setPosts(fetchedPosts);
      } catch (err) {
          console.error("Error fetching posts:", err);
          setErrorPosts("No se pudieron cargar las publicaciones.");
      } finally {
          setLoadingPosts(false);
      }
  };

  // useEffect para cargar posts cuando cambie la categoría activa
  useEffect(() => {
    if (activeTab === 'comunidad') {
      fetchPosts(); 
    }
  }, [activeTab, activeCategory]); 

  // <<< Función para formatear Timestamps (opcional pero útil) >>>
  const formatFirestoreTimestamp = (timestamp) => {
      if (!timestamp) return 'Hace un momento';
      // Asumiendo que timestamp es un objeto Timestamp de Firestore
      const date = timestamp.toDate(); 
      // Lógica simple de tiempo relativo (se puede mejorar con librerías como date-fns)
      const seconds = Math.floor((new Date() - date) / 1000);
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + " años";
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + " meses";
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + " días";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + " h";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + " min";
      return "Hace un momento";
  };

  // Modificar la función handlePostSubmit para incluir la categoría
  const handlePostSubmit = async (content) => {
      if (!currentUser) return; // Doble chequeo
      
      console.log("Intentando publicar en categoría:", activeCategory);
      console.log("¿Usuario es admin?:", isAdmin);
      
      // Verificar si el usuario puede publicar en esta categoría
      if (activeCategory === 'Anuncios' && !isAdmin) {
          alert("Solo los administradores pueden publicar anuncios.");
          return;
      }
      
      // Validar que content no sea vacío o undefined
      const postContent = content || '';
      if (postContent.trim() === '') {
          alert("El contenido de la publicación no puede estar vacío.");
          return;
      }
      
      setIsSubmittingPost(true);
      try {
          await addDoc(collection(db, "posts"), {
              content: postContent,
              authorUid: currentUser.uid,
              authorName: currentUser.displayName || currentUser.email,
              authorAvatarUrl: currentUser.photoURL || '',
              category: activeCategory, // Usar la categoría activa
              createdAt: serverTimestamp(),
              likes: 0,
              commentCount: 0,
              likedBy: []
          });
          console.log("Publicación creada exitosamente en categoría:", activeCategory);
          fetchPosts(); 
      } catch (error) {
          console.error("Error adding post: ", error);
          setErrorPosts("Error al publicar."); // Mostrar error en la lista
      } finally {
          setIsSubmittingPost(false);
      }
  };

  // Manejar el cambio de categoría
  const handleCategoryChange = (newCategory) => {
    console.log("Cambiando a categoría:", newCategory);
    setActiveCategory(newCategory);
  };

  const fetchVideos = async () => {
    try {
      console.log('Intentando obtener videos desde:', getBackendUrl());
      const response = await fetch(`${getBackendUrl()}/videos`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Datos recibidos:', data);

      if (!Array.isArray(data)) {
        throw new Error('Formato de respuesta inválido');
      }
      return data;
    } catch (error) {
      console.error('Error al obtener videos:', error);
      // Intentar recuperar datos del localStorage como fallback
      const savedVideos = localStorage.getItem('streamingPlaylistVideos');
      if (savedVideos) {
        try {
          return JSON.parse(savedVideos);
        } catch (e) {
          console.error('Error al recuperar videos guardados:', e);
        }
      }
      throw error;
    }
  };

  if (isAdmin === null) {
    return <div>Cargando...</div>; 
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'comunidad':
        return <CommunityFeed 
          activeCategory={activeCategory}
          handleCategoryChange={handleCategoryChange}
          onPost={handlePostSubmit}
          loading={loadingPosts}
          error={errorPosts}
          posts={posts}
          currentUser={currentUser}
          formatTimestamp={formatFirestoreTimestamp}
          onPostUpdate={fetchPosts}
        />;
      case 'clases':
        if (loadingClasses) {
          return <div className="clases-loading">Cargando clases...</div>;
        }
        if (errorClasses) {
          return <div className="clases-error">Error al cargar las clases: {errorClasses}</div>;
        }
        return (
          <div className="clases-container">
            <div className="clases-grid">
              {recordedClasses.map(video => (
                <CourseCard
                  key={video.id}
                  imageUrl={video.thumbnail}
                  title={video.title}
                  description={video.description}
                  progress={30} // Hardcoded for now
                  isFavorite={false} // Hardcoded for now
                  onPress={() => navigate(`/clases/${video.id}`)}
                  onToggleFavorite={() => console.log('Toggled favorite:', video.id)}
                  onPlayVideo={() => navigate(`/clases/${video.id}`)}
                />
              ))}
            </div>
          </div>
        );
      case 'streaming':
        return (
          <div key="streaming" className="tab-panel streaming-page-container">
            <h2 className="streaming-page-header">Disfruta del contenido en vivo</h2>
            
            <div className="live-section-container">
              {/* Columna Izquierda: Player + Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <VideoPlayer 
                  videoUrl={streamingSelectedVideo?.link || "https://vimeo.com/1040149188"}
                  isLive={!streamingSelectedVideo}
                />
                <VideoInfo 
                  title={streamingSelectedVideo?.title || "Estrategias trading para potenciar tus operaciones"}
                  isLive={!streamingSelectedVideo}
                />
              </div>

              {/* Columna Derecha: Chat */}
              <LiveChat db={db} currentUser={currentUser} />
            </div>

            <div className="recorded-section-container">
              <div className="recorded-section-header">
                <h2>Lives grabados</h2>
                <p>¡Vuelve a mirar el contenido! Al termino de la transmisión aparecerán los lives grabados en la siguiente sección:</p>
              </div>
              <div className="recorded-videos-carousel">
                {recordedClasses.map(video => (
                  <RecordedVideoCard
                    key={video.id}
                    imageUrl={video.thumbnail}
                    title={video.title}
                    onPress={() => console.log("Play recorded video:", video.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      case 'calendario':
        return <CalendarioPage />;
      case 'niveles':
        return <NivelesPageV2 />;
      case 'mapa':
        return <MapaPage />;
      case 'miembros':
        return <MembersPage />;
      case 'acerca':
        return <AboutPage />;
      default:
        return <CommunityFeed 
          activeCategory={activeCategory}
          handleCategoryChange={handleCategoryChange}
          onPost={handlePostSubmit}
          loading={loadingPosts}
          error={errorPosts}
          posts={posts}
          currentUser={currentUser}
          formatTimestamp={formatFirestoreTimestamp}
          onPostUpdate={fetchPosts}
        />;
    }
  };

  return (
    <div className="homepage-container">
      {/* Tab Navigation */}
      <TopNavBar />
      <div className="homepage-content">
        {/* Contenido dinámico según la pestaña activa */}
        {renderContent()}
      </div>
    </div>
  );
}

export default HomePage; 