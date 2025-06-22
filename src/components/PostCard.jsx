import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import { doc, updateDoc, increment, arrayUnion, arrayRemove, collection, getDocs, getDoc } from "firebase/firestore";
import { useAuth } from '../context/AuthContext';

// Recibe los datos del post como props
function PostCard({ post }) {
  const { currentUser } = useAuth();
  // Protección contra post mal formados
  const safePost = {
    id: post?.id || 'unknown',
    content: post?.content || '',
    authorName: post?.authorName || 'Usuario Desconocido',
    authorAvatarUrl: post?.authorAvatarUrl || '',
    category: post?.category || 'General',
    likes: post?.likes || 0,
    comments: post?.commentCount || 0,
    likedBy: post?.likedBy || [],
    createdAt: post?.createdAt || null
  };
  
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(safePost.likes);
  const [likedUsers, setLikedUsers] = useState([]);
  const [showLikesList, setShowLikesList] = useState(false);

  // Cerrar popover al hacer click fuera
  useEffect(() => {
    if (!showLikesList) return;
    const handleClick = (e) => {
      setShowLikesList(false);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [showLikesList]);

  // Obtener solo los usuarios necesarios
  useEffect(() => {
    const fetchLikedUsers = async () => {
      if (!safePost.likedBy || safePost.likedBy.length === 0) {
        setLikedUsers([]);
        return;
      }
      try {
        const names = await Promise.all(
          safePost.likedBy.map(async (uid) => {
            try {
              const userDoc = await getDoc(doc(db, 'users', uid));
              if (userDoc.exists()) {
                return userDoc.data().displayName || uid.substring(0, 8);
              }
              return uid.substring(0, 8);
            } catch {
              return uid.substring(0, 8);
            }
          })
        );
        setLikedUsers(names);
      } catch {
        setLikedUsers(safePost.likedBy.map(uid => uid.substring(0, 8)));
      }
    };
    fetchLikedUsers();
    // eslint-disable-next-line
  }, [safePost.likedBy]);

  useEffect(() => {
    if (currentUser && safePost.likedBy.includes(currentUser.uid)) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }
    setLikeCount(safePost.likes);
  }, [safePost.likedBy]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
      alert("Debes iniciar sesión para dar Me Gusta.");
      return;
    }

    if (!post.id) {
      console.error("Post ID missing");
      return;
    }

    const postRef = doc(db, "posts", post.id);
    
    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likes: increment(-1),
          likedBy: arrayRemove(currentUser.uid)
        });
        setLikeCount(prev => prev - 1);
        setIsLiked(false);
      } else {
        await updateDoc(postRef, {
          likes: increment(1),
          likedBy: arrayUnion(currentUser.uid)
        });
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error updating like: ", error);
      alert("Error al actualizar el Me Gusta.");
    }
  };

  // Crear un tiempo para mostrar basado en createdAt
  const getTimeString = () => {
    if (!safePost.createdAt) return 'Fecha desconocida';
    
    try {
      // Verificar si es un objeto Firestore Timestamp
      if (safePost.createdAt.toDate) {
        const date = safePost.createdAt.toDate();
        // Formato simple
        return date.toLocaleDateString();
      } else if (safePost.createdAt.seconds) {
        // Otro formato de timestamp
        const date = new Date(safePost.createdAt.seconds * 1000);
        return date.toLocaleDateString();
      }
      return 'Fecha reciente';
    } catch (e) {
      console.error("Error parsing date:", e);
      return 'Fecha desconocida';
    }
  };

  const cardStyle = {
    background: 'linear-gradient(to bottom, #222222, #3C3C3C)',
    borderRadius: '30px',
    padding: '20px',
    marginBottom: '20px',
    color: 'rgba(255, 255, 255, 0.87)',
    border: '1px solid #3C3C3C'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px'
  };

  const avatarStyle = {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    marginRight: '15px'
  };

  const authorInfoStyle = {
    fontSize: '0.9em',
    color: 'rgba(255, 255, 255, 0.7)'
  };

  const authorNameStyle = {
    fontWeight: 'bold',
    fontSize: '1em',
    background: 'linear-gradient(to right, #FFFFFF, #AAAAAA)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent'
  };
  
  const contentStyle = {
    lineHeight: '1.6',
    marginBottom: '15px',
    overflow: 'hidden',
    maxHeight: '7em'
  };

  const footerStyle = {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.9em',
    color: 'rgba(255, 255, 255, 0.6)'
  };

  const iconStyle = {
    marginRight: '5px'
  };

  const engagementStyle = {
    marginRight: '20px', 
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center'
  };

  const likeButtonStyle = { 
    background: 'none', 
    border: 'none', 
    padding: 0, 
    margin: 0, 
    cursor: 'pointer', 
    color: isLiked ? '#D7B615' : 'inherit'
  };

  return (
    <Link to={`/post/${safePost.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={cardStyle} className="post-card">
        <div style={headerStyle} className="post-header">
          <div 
            style={{
              ...avatarStyle,
              backgroundColor: '#444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5em',
              color: '#D7B615',
              fontWeight: 'bold',
              userSelect: 'none',
            }}
            className="avatar"
          >
            {safePost.authorName ? safePost.authorName[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div style={authorNameStyle} className="author-name">{safePost.authorName}</div>
            <div style={authorInfoStyle} className="author-info">{getTimeString()} | {safePost.category}</div>
          </div>
        </div>

        <div style={contentStyle}>
          {safePost.content ? (
            <>
              {safePost.content.substring(0, 200)}
              {safePost.content.length > 200 && '...'}
            </>
          ) : (
            <i>Sin contenido</i>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: 8, gap: 10, justifyContent: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#333', borderRadius: '12px', padding: '4px 10px' }}>
            <button
              onClick={e => { e.stopPropagation(); e.preventDefault(); handleLike(e); }}
              style={{ background: 'none', border: 'none', color: isLiked ? '#D7B615' : '#aaa', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0, margin: 0, minWidth: 0 }}
              aria-label="Dar like"
            >
              <i className="fas fa-heart" style={{ color: isLiked ? '#D7B615' : '#aaa', fontSize: '16px' }} />
            </button>
            <span
              onClick={e => { e.stopPropagation(); e.preventDefault(); setShowLikesList(v => !v); }}
              style={{ cursor: 'pointer', color: '#FFD700', fontWeight: 600, position: 'relative', display: 'flex', alignItems: 'center', userSelect: 'none', marginLeft: 8 }}
              tabIndex={0}
              aria-label="Ver usuarios que dieron like"
            >
              {likeCount}
            </span>
            
            {/* Popover de usuarios que dieron like */}
                          {showLikesList && likedUsers.length > 0 && (
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: 24,
                  left: 0,
                  background: '#232323',
                  border: '1px solid #FFD700',
                  borderRadius: 10,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                  padding: '10px 18px',
                  zIndex: 10,
                  minWidth: 120,
                  color: '#FFD700',
                  maxHeight: 180,
                  overflowY: 'auto',
                  fontSize: 14
                }}
              >
                <div style={{ fontWeight: 'bold', color: '#FFD700', marginBottom: 6 }}>Likes</div>
                {likedUsers.map((name, idx) => (
                  <div key={idx} style={{ color: '#fff', padding: '2px 0', borderBottom: '1px solid #333', fontWeight: 500 }}>{name}</div>
                ))}
              </div>
              )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#333', borderRadius: '12px', padding: '4px 10px' }}>
            <i className="fas fa-comment-alt" style={{ color: '#aaa', fontSize: '16px' }} />
            <span style={{ color: '#aaa', marginLeft: 8 }}>{post.commentCount || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default PostCard; 