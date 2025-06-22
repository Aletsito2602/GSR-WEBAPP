import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Comments from '../components/Comments';
import { db, auth } from '../firebaseConfig'; // <<< Importar db
import { doc, getDoc, Timestamp, updateDoc, increment, arrayUnion, arrayRemove } from "firebase/firestore"; // <<< Importar funciones Firestore
import { useAuth } from '../context/AuthContext'; // <<< Importar useAuth

// <<< QUITAR samplePosts >>>
// const samplePosts = [/* ... */];

function PostDetailPage() {
  const { postId } = useParams(); 
  const { currentUser } = useAuth(); // <<< Obtener usuario
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // <<< Estados para Likes >>>
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const postRef = doc(db, "posts", postId); // <<< Referencia al documento específico
        const docSnap = await getDoc(postRef); // <<< Obtener el documento

        if (docSnap.exists()) {
          // Añadir ID y formatear timestamp
          const postData = { id: docSnap.id, ...docSnap.data() };
          setPost({ 
              ...postData,
              time: formatFirestoreTimestamp(postData.createdAt) // Reusar o definir formatFirestoreTimestamp
          });
          // <<< Inicializar estado de like aquí >>>
          setLikeCount(postData.likes || 0);
          if (currentUser && postData.likedBy?.includes(currentUser.uid)) {
              setIsLiked(true);
          } else {
              setIsLiked(false);
          }
        } else {
          console.log("No such document!");
          setError('Post no encontrado.');
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError('Error al cargar el post.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [postId, currentUser]);

  // <<< Función para formatear Timestamps (igual que en HomePage) >>>
  const formatFirestoreTimestamp = (timestamp) => {
      if (!timestamp) return 'Hace un momento';
      const date = timestamp.toDate(); 
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

  // Estilos
  const postContainerStyle = { backgroundColor: '#353535', borderRadius: '8px', padding: '20px', marginBottom: '20px' };
  const headerStyle = { display: 'flex', alignItems: 'center', marginBottom: '15px' };
  const avatarStyle = { width: '45px', height: '45px', borderRadius: '50%', marginRight: '15px' };
  const authorNameStyle = { fontWeight: 'bold', color: 'white', fontSize: '1em' };
  const authorInfoStyle = { fontSize: '0.9em', color: 'rgba(255, 255, 255, 0.7)' };
  const contentStyle = { lineHeight: '1.6', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '15px', whiteSpace: 'pre-wrap' }; // pre-wrap para saltos de línea
  const footerStyle = { display: 'flex', alignItems: 'center', fontSize: '0.9em', color: 'rgba(255, 255, 255, 0.6)' };
  const engagementStyle = { marginRight: '20px', cursor: 'pointer' };
  const iconStyle = { marginRight: '5px' };

  // <<< Función handleLike (similar a PostCard) >>>
  const handleLike = async (e) => {
    if (!currentUser) return alert("Debes iniciar sesión para dar Me Gusta.");
    if (!post) return; // Asegurarse que el post ha cargado
    
    const postRef = doc(db, "posts", post.id);
    try {
        if (isLiked) {
            await updateDoc(postRef, { likes: increment(-1), likedBy: arrayRemove(currentUser.uid) });
            setLikeCount(prev => prev - 1); setIsLiked(false);
        } else {
            await updateDoc(postRef, { likes: increment(1), likedBy: arrayUnion(currentUser.uid) });
            setLikeCount(prev => prev + 1); setIsLiked(true);
        }
    } catch (error) { console.error("Error liking post:", error); }
  };

  // <<< Estilo botón like >>>
  const likeButtonStyle = { background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer', color: isLiked ? '#D7B615' : 'inherit' };

  if (loading) return <div>Cargando post...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!post) return <div>Post no disponible.</div>;

  return (
    <div>
      <Link to="/" style={{ color: '#D7B615', marginBottom: '20px', display: 'inline-block' }}>
        &larr; Volver a Comunidad
      </Link>

      {/* Contenedor del Post */}
      <div style={postContainerStyle}>
          <div style={headerStyle}>
            <img src={post.author?.avatarUrl || 'https://placehold.co/45x45/777/FFF?text=A'} alt={`${post.author?.name || 'Autor'} avatar`} style={avatarStyle} />
            <div>
              <div style={authorNameStyle}>{post.authorName || 'Usuario Desconocido'}</div>
              <div style={authorInfoStyle}>{post.time} | {post.category}</div>
            </div>
          </div>
          <div style={contentStyle}>{post.content}</div> {/* Mostrar contenido completo */} 
          <div style={footerStyle}>
            {/* <<< Botón Like interactivo >>> */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#333', borderRadius: '12px', padding: '4px 10px' }}>
                <button onClick={handleLike} style={likeButtonStyle}>
                  <i className="fas fa-heart" style={{ color: isLiked ? '#D7B615' : '#aaa', fontSize: '16px' }} />
                </button>
                <span style={{ color: '#FFD700', fontWeight: 600, marginLeft: 8 }}>{likeCount}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#333', borderRadius: '12px', padding: '4px 10px' }}>
                <i className="fas fa-comment-alt" style={{ color: '#aaa', fontSize: '16px' }} />
                <span style={{ color: '#aaa', marginLeft: 8 }}>{post.commentCount || 0}</span>
              </div>
            </div>
          </div>
      </div>

      {/* Sección de Comentarios */}
      <Comments postId={postId} /> 
    </div>
  );
}

export default PostDetailPage; 