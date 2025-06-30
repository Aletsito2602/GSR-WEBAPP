import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa'; // Importar el ícono
import Comments from '../components/Comments';
import { db, auth } from '../firebaseConfig'; // <<< Importar db
import { doc, getDoc, Timestamp, updateDoc, increment, arrayUnion, arrayRemove } from "firebase/firestore"; // <<< Importar funciones Firestore
import { useAuth } from '../context/AuthContext'; // <<< Importar useAuth
import './PostDetailPage.css'; // Importar el nuevo CSS

// <<< QUITAR samplePosts >>>
// const samplePosts = [/* ... */];

function PostDetailPage() {
  const { postId } = useParams(); 
  const navigate = useNavigate();
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
    e.stopPropagation(); // Evitar que el clic se propague
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

    const authorRef = doc(db, "users", post.authorUid);
    // ... (lógica para actualizar puntos del autor) ...
  };

  // <<< Estilo botón like >>>
  const likeButtonStyle = { background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer', color: isLiked ? '#D7B615' : 'inherit' };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = Math.round((now - date) / 1000); // Diferencia en segundos

    if (diff < 60) return `hace ${diff}s`;
    if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
    return `hace ${Math.floor(diff / 86400)}d`;
  }

  if (loading) return <div className="loading-state">Cargando post...</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!post) return <div className="loading-state">Post no disponible.</div>;

  return (
    <div className="post-detail-container">
      <div className="back-button-wrapper">
        <button onClick={() => navigate(-1)} className="back-button-absolute">
          <img src="/images/left-arrow.svg" alt="Volver" className="back-icon" />
        </button>
        <span className="back-text">Volver</span>
      </div>

      <div className="post-card-detail">
        <div className="post-header-detail">
          <img 
            src={post.authorAvatarUrl || `https://i.pravatar.cc/40?u=${post.authorUid}`} 
            alt="Avatar del autor" 
            className="author-avatar-detail"
          />
          <div className="author-info-detail">
            <span className="author-name-detail">{post.authorName}</span>
            <span className="post-meta-detail">{formatTime(post.createdAt)} | {post.category}</span>
          </div>
              </div>
        <div className="post-content-detail">
          {post.content}
              </div>
        <div className="post-footer-detail">
          <button onClick={handleLike} className="like-button-detail">
            <img src="/images/likes.svg" alt="Like" className="like-icon-detail" />
            <span className="like-count-detail">{likeCount}</span>
          </button>
          <div className="comment-count-detail">
            <img src="/images/comments.svg" alt="Comments" className="comment-icon-detail" />
            <span>{post.commentCount || 0}</span>
            </div>
          </div>
      </div>

      <Comments postId={postId} /> 
    </div>
  );
}

export default PostDetailPage; 