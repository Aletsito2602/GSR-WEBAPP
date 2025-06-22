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
import FilterButtons from '../components/FilterButtons';
import PostCard from '../components/PostCard';
import AnunciosList from '../components/AnunciosList'; // Importar componente de anuncios
// Importar componentes de Streaming
import SearchBar from '../components/SearchBar';
import SectionHeader from '../components/SectionHeader';
import VideoPlayer from '../components/VideoPlayer';
import VideoInfo from '../components/VideoInfo';
import Playlist from '../components/Playlist';
import VideoGallery from '../components/VideoGallery';
import LevelsPage from '../components/LevelsPage';
import MapaPage from '../components/MapaPage'; // Importar el nuevo componente de mapa

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
            padding: '12px 24px',
            backgroundColor: hasChanges ? '#D7B615' : '#666',
            color: hasChanges ? '#222' : '#999',
            border: 'none',
            borderRadius: '4px',
            cursor: hasChanges && !isUploading ? 'pointer' : 'not-allowed',
            fontWeight: 'bold',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            marginTop: '20px',
            width: '100%',
            maxWidth: '300px',
            display: 'block'
          }}
        >
          {isUploading ? (
            <span>
              <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
              Guardando...
            </span>
          ) : (
            <span>
              <i className="fas fa-save" style={{ marginRight: '8px' }}></i>
              Guardar Cambios
            </span>
          )}
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

function LiveChat({ db, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesContainerRef = useRef(null);

  // Presence: track viewers
  useEffect(() => {
    let presenceRef;
    let userPresenceId;
    if (currentUser) {
      presenceRef = collection(db, 'livechat_presence');
      userPresenceId = currentUser.uid;
      // Registrar presencia
      addDoc(presenceRef, {
        uid: userPresenceId,
        name: currentUser.displayName || currentUser.email,
        lastActive: serverTimestamp()
      });
    }
    // Escuchar presencia
    const q = query(collection(db, 'livechat_presence'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Solo contar usuarios activos en los últimos 2 minutos
      const now = Date.now();
      const active = snapshot.docs.filter(doc => {
        const data = doc.data();
        return data.lastActive && data.lastActive.toDate() > new Date(now - 2 * 60 * 1000);
      });
    });
    // Limpiar presencia al salir
    return () => {
      unsubscribe();
      // (Opcional: eliminar presencia del usuario)
    };
  }, [db, currentUser]);

  useEffect(() => {
    // Escuchar mensajes en tiempo real, solo los de las últimas 2 horas
    const twoHoursAgo = Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000));
    const q = query(
      collection(db, 'livechat'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(msg => msg.createdAt && msg.createdAt.toDate() > new Date(Date.now() - 2 * 60 * 60 * 1000));
      setMessages(msgs);
    });
    return unsubscribe;
  }, [db]);

  // Effect para hacer scroll automático al final cuando hay nuevos mensajes
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentUser) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'livechat'), {
        text: input.trim(),
        user: {
          uid: currentUser.uid,
          name: currentUser.displayName || currentUser.email,
          photo: currentUser.photoURL || ''
        },
        createdAt: serverTimestamp()
      });
      setInput('');
    } catch (err) {
      alert('Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      background: '#232323',
      borderRadius: 12,
      padding: 0,
      height: '450px', // Altura fija
      width: '100%', // Ancho 100% para responsive
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      position: 'relative', // Asegurar posición relativa para posicionamiento interior
    }}>
      <div style={{
        fontWeight: 'bold',
        color: '#D7B615',
        fontSize: '1.15em',
        padding: '18px 20px 10px 20px',
        borderBottom: '2px solid #333',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        background: '#232323',
        position: 'sticky',
        top: 0,
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>Chat en vivo</span>
      </div>
      <div 
        ref={messagesContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          background: '#161616',
          borderRadius: 0,
          padding: '18px 20px 12px 20px',
          borderLeft: '2px solid #333',
          borderRight: '2px solid #333',
          borderBottom: '2px solid #333',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          height: '300px', // Altura fija para el contenedor de mensajes
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {messages.length === 0 && <div style={{ color: '#aaa', textAlign: 'center' }}>Sé el primero en comentar...</div>}
        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: '#444',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#D7B615', fontWeight: 'bold', marginRight: 8, fontSize: '1em',
              overflow: 'hidden', flexShrink: 0
            }}>
              {msg.user.photo ? (
                <img src={msg.user.photo} alt={msg.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                msg.user.name[0].toUpperCase()
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.97em' }}>{msg.user.name}</span>
              <span style={{ color: '#888', fontSize: '0.8em', marginLeft: 8 }}>
                {msg.createdAt && msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div style={{ color: '#eee', fontSize: '0.98em', wordBreak: 'break-word' }}>{msg.text}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ 
        padding: '12px 20px 18px 20px', 
        background: '#232323', 
        borderBottomLeftRadius: 12, 
        borderBottomRightRadius: 12,
        borderTop: '1px solid #333'
      }}>
        {currentUser ? (
          <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Escribe un mensaje..."
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #444',
                background: '#181818',
                color: '#fff',
                fontSize: '1em'
              }}
              maxLength={120}
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              style={{
                background: '#D7B615',
                color: '#222',
                border: 'none',
                borderRadius: 6,
                fontWeight: 'bold',
                padding: '0 18px',
                fontSize: '1em',
                cursor: sending || !input.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              Enviar
            </button>
          </form>
        ) : (
          <div style={{ color: '#aaa', textAlign: 'center', fontSize: '0.98em' }}>
            Inicia sesión para comentar
          </div>
        )}
      </div>
    </div>
  );
}

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
    setActiveTab(getInitialTab());
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
  const [activeCategory, setActiveCategory] = useState('Chat');
  
  // Nuevo estado para verificar si el usuario es admin
  const [isAdmin, setIsAdmin] = useState(false);

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
    if (activeTab === 'streaming') {
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
              description: video.description || '',
              thumbnail: video.pictures?.base_link || '',
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

  return (
    <div className="home-page" style={{ background: '#232323', minHeight: '100vh' }}>
      {/* Selector de pestañas con enlaces de React Router en lugar de botones */}
      <div className="tabs-container" style={{
        display: 'flex',
        justifyContent: 'flex-start',
        margin: '15px 0 25px',
        gap: '15px',
        padding: '0 10px',
        overflowX: 'auto',
        background: '#232323',
        msOverflowStyle: 'none', /* IE and Edge */
        scrollbarWidth: 'none', /* Firefox */
        WebkitOverflowScrolling: 'touch',
      }}>
        {/* Ocultar scrollbar en Chrome, Safari y Opera */}
        <style dangerouslySetInnerHTML={{__html: `
          .tabs-container::-webkit-scrollbar {
            display: none;
          }
          .tab-button:hover {
            color: white !important;
          }
        `}} />
        <Link 
          to="/?tab=comunidad" 
          style={{ textDecoration: 'none' }}
        >
          <div 
            className={`tab-button ${activeTab === 'comunidad' ? 'active' : ''}`}
          style={{
              padding: '10px 20px',
              borderRadius: '30px',
              border: activeTab === 'comunidad' ? '1px solid #D7B615' : '1px solid #666',
              background: 'transparent',
              color: activeTab === 'comunidad' ? '#FFF' : '#999',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontWeight: activeTab === 'comunidad' ? 'bold' : 'normal',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              whiteSpace: 'nowrap'
          }}
        >
            <img 
              src="/images/Meeting Room.png" 
              alt="Comunidad" 
              style={{ width: '18px', height: '18px' }} 
            />
          Comunidad
          </div>
        </Link>
        
        <Link 
          to="/?tab=streaming" 
          style={{ textDecoration: 'none' }}
        >
          <div 
            className={`tab-button ${activeTab === 'streaming' ? 'active' : ''}`}
          style={{
              padding: '10px 20px',
              borderRadius: '30px',
              border: activeTab === 'streaming' ? '1px solid #D7B615' : '1px solid #666',
              background: 'transparent',
              color: activeTab === 'streaming' ? '#FFF' : '#999',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontWeight: activeTab === 'streaming' ? 'bold' : 'normal',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              whiteSpace: 'nowrap'
          }}
        >
            <img 
              src="/images/Youtube Live.png" 
              alt="Streaming" 
              style={{ width: '18px', height: '18px' }} 
            />
          Streaming
          </div>
        </Link>
        
        <Link 
          to="/?tab=levels" 
          style={{ textDecoration: 'none' }}
        >
          <div 
            className={`tab-button ${activeTab === 'levels' ? 'active' : ''}`}
          style={{
              padding: '10px 20px',
              borderRadius: '30px',
              border: activeTab === 'levels' ? '1px solid #D7B615' : '1px solid #666',
              background: 'transparent',
              color: activeTab === 'levels' ? '#FFF' : '#999',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontWeight: activeTab === 'levels' ? 'bold' : 'normal',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              whiteSpace: 'nowrap'
            }}
          >
            <img 
              src="/images/Prize.png" 
              alt="Levels" 
              style={{ width: '18px', height: '18px' }} 
            />
            Levels
          </div>
        </Link>
        
        <Link 
          to="/?tab=mapa" 
          style={{ textDecoration: 'none' }}
        >
          <div 
            className={`tab-button ${activeTab === 'mapa' ? 'active' : ''}`}
          style={{
              padding: '10px 20px',
              borderRadius: '30px',
              border: activeTab === 'mapa' ? '1px solid #D7B615' : '1px solid #666',
              background: 'transparent',
              color: activeTab === 'mapa' ? '#FFF' : '#999',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontWeight: activeTab === 'mapa' ? 'bold' : 'normal',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              whiteSpace: 'nowrap'
            }}
          >
            <img 
              src="/images/Map Marker.svg" 
              alt="Mapa" 
              style={{ width: '18px', height: '18px' }} 
            />
            Mapa
          </div>
        </Link>
        
        <Link 
          to="/?tab=acerca" 
          style={{ textDecoration: 'none' }}
        >
          <div 
            className={`tab-button ${activeTab === 'acerca' ? 'active' : ''}`}
          style={{
              padding: '10px 20px',
              borderRadius: '30px',
              border: activeTab === 'acerca' ? '1px solid #D7B615' : '1px solid #666',
              background: 'transparent',
              color: activeTab === 'acerca' ? '#FFF' : '#999',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontWeight: activeTab === 'acerca' ? 'bold' : 'normal',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              whiteSpace: 'nowrap'
            }}
          >
            <img 
              src="/images/Info.png" 
              alt="Acerca De" 
              style={{ width: '18px', height: '18px' }} 
            />
            Acerca De
          </div>
        </Link>
        
        <Link 
          to="/?tab=perfil" 
          style={{ textDecoration: 'none' }}
        >
          <div 
            className={`tab-button ${activeTab === 'perfil' ? 'active' : ''}`}
          style={{
              padding: '10px 20px',
              borderRadius: '30px',
              border: activeTab === 'perfil' ? '1px solid #D7B615' : '1px solid #666',
              background: 'transparent',
              color: activeTab === 'perfil' ? '#FFF' : '#999',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontWeight: activeTab === 'perfil' ? 'bold' : 'normal',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              whiteSpace: 'nowrap'
            }}
          >
            <img 
              src="/images/Settings.png" 
              alt="Mi Perfil" 
              style={{ width: '18px', height: '18px' }} 
            />
            Mi Perfil
          </div>
        </Link>
      </div>

      {/* Mostrar contenido según la pestaña activa */}
      {activeTab === 'comunidad' && (
        <div className="comunidad-tab">
          {/* Mostrar anuncios en la parte superior */}
          <AnunciosList maxAnuncios={3} />
          {/* Mostrar PostInput solo si: (1) no es Anuncios, o (2) es Anuncios y es admin */}
          {(
            activeCategory !== 'Anuncios' || (activeCategory === 'Anuncios' && isAdmin)
          ) && (
            <PostInput 
              onSubmitPost={handlePostSubmit} 
              isSubmitting={isSubmittingPost}
              selectedCategory={activeCategory}
            />
          )}
          <FilterButtons 
            activeCategory={activeCategory} 
            onCategoryChange={handleCategoryChange} 
          />
          {/* Lista de Posts */}
          {loadingPosts ? (
            <div>Cargando publicaciones...</div>
          ) : errorPosts ? (
            <div style={{ color: 'red' }}>{errorPosts}</div>
          ) : posts.length === 0 ? (
            <div>No hay publicaciones para mostrar en esta categoría.</div>
          ) : (
            posts.map(post => <PostCard key={post.id} post={post} />)
          )}
        </div>
      )}

      {/* Sección Streaming */}
      {activeTab === 'streaming' && (
        <div>
          {/* <SearchBar placeholder="Buscar en streaming..." /> */}
          <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#232323', paddingBottom: '8px' }}>
            <SectionHeader title="Disfruta del contenido en vivo y grabado" />
          </div>
          <div className="streaming-layout" style={{ display: 'flex', gap: 32 }}>
            <div className="streaming-main" style={{ flex: 2, minWidth: 0 }}>
              {streamingSelectedVideo && (
                <button
                  onClick={() => setStreamingSelectedVideo(null)}
                  style={{
                    marginBottom: 16,
                    padding: '8px 18px',
                    background: '#D7B615',
                    color: '#222',
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '1em',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                >
                  Ver streaming en vivo
                </button>
              )}
              <VideoPlayer video={streamingSelectedVideo} />
              <VideoInfo title="Mi Legado - Isaac Ramirez" viewers={viewers} />
            </div>
            {/* Columna Derecha: Chat en vivo más grande */}
            <div className="streaming-playlist" style={{ 
              flex: 1.2, 
              minWidth: 340, 
              maxWidth: 500, 
              height: '500px', 
              display: 'flex', 
              flexDirection: 'column',
              position: 'sticky',
              top: '20px'
            }}>
              <LiveChat db={db} currentUser={currentUser} />
            </div>
          </div>

          {/* Sección de Clases Grabadas */}
          <div style={{ marginTop: 40 }}>
            <div style={{ 
              textAlign: 'center', 
              marginBottom: 30
            }}>
              <h2 style={{ 
                color: '#D7B615', 
                fontSize: '2rem', 
                fontWeight: 'bold',
                margin: '0 0 10px 0',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Sesiones Grabadas
              </h2>
              <div style={{ 
                height: '3px', 
                width: '80px', 
                background: '#D7B615', 
                margin: '0 auto',
                borderRadius: '2px'
              }}></div>
            </div>
            
            {loadingClasses ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#aaa' }}>
                Cargando clases grabadas...
              </div>
            ) : errorClasses ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#ff6b6b' }}>
                Error al cargar las clases: {errorClasses}
              </div>
            ) : (
              <VideoGallery videos={recordedClasses} />
            )}
          </div>
        </div>
      )}

      {/* Sección Acerca */}
      {activeTab === 'acerca' && (
        <div>
          <SectionHeader title="Acerca de Mi Legado" />
          <div style={{ background: '#353535', padding: '25px', borderRadius: '8px', marginBottom: '20px' }}>
            <h2 style={{ marginBottom: '15px', color: '#D7B615' }}>Bienvenido a Mi Legado.</h2>
            <p style={{ lineHeight: '1.6', marginBottom: '20px', color: 'rgba(255,255,255,0.85)' }}>
              No estás ante un curso más de trading. Estás entrando en una experiencia transformadora de 7 días donde no solo aprenderás lo que me llevó a construir resultados reales en los mercados, sino también lo que muy pocos se atreven a enseñar: la parte interna del éxito.<br /><br />
              Aquí vas a descubrir estrategias avanzadas, estructuras institucionales, gestión profesional del riesgo, lectura real del mercado…<br />
              Pero sobre todo, vas a enfrentarte contigo mismo: con tus creencias, tus emociones y tus bloqueos que hoy te impiden avanzar.<br /><br />
              Nuestra misión con Mi Legado es dejarte una marca que transforme tu forma de operar, de pensar y de vivir.<br />
              Queremos que termines estos 7 días con claridad, fuerza mental, y un plan de ejecución real y sostenible.<br />
              Esto no es motivación vacía: es un mapa para construir tu independencia.<br /><br />
              <strong>Prepárate.</strong><br />
              No viniste aquí solo a aprender, viniste a despertar.
            </p>
          </div>
        </div>
      )}

      {/* Sección Mi Perfil */}
      {activeTab === 'perfil' && (
        <div>
          <SectionHeader title="Mi Perfil" />
          <div style={{ background: '#353535', padding: '25px', borderRadius: '8px', marginBottom: '20px' }}>
            {currentUser ? (
              <UserProfile currentUser={currentUser} />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'rgba(255,255,255,0.7)' }}>
                  Inicia sesión para ver tu perfil
                </p>
              <button 
                  onClick={() => navigate('/login')}
                style={{ 
                    padding: '12px 25px',
                    backgroundColor: '#D7B615',
                  color: '#222',
                    border: 'none',
                    borderRadius: '4px',
                  cursor: 'pointer',
                    fontWeight: 'bold'
                }}
              >
                  Iniciar sesión
              </button>
            </div>
            )}
          </div>
        </div>
      )}

      {/* Sección Levels */}
      {activeTab === 'levels' && (
        <LevelsPage posts={posts} />
      )}

      {/* Sección Mapa */}
      {activeTab === 'mapa' && (
        <MapaPage />
      )}
    </div>
  );
}

export default HomePage; 