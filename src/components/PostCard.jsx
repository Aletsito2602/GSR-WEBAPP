import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, updateDoc, increment, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { useAuth } from '../context/AuthContext';
import './PostCard.css'; // Import the new CSS file

// Función para obtener las iniciales del nombre
const getInitials = (name) => {
  if (!name) return 'U';
  const names = name.split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

// Recibe los datos del post como props
function PostCard({ post }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  // Protección contra post mal formados
  const safePost = {
    id: post?.id || 'unknown',
    content: post?.content || '',
    authorName: post?.authorName || 'Usuario Desconocido',
    authorAvatarUrl: post?.authorAvatarUrl || '',
    authorUid: post?.authorUid || null,
    category: post?.category || 'General',
    likes: post?.likes || 0,
    comments: post?.commentCount || 0,
    likedBy: post?.likedBy || [],
    createdAt: post?.createdAt || null
  };
  
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(safePost.likes);

  useEffect(() => {
    if (currentUser && safePost.likedBy.includes(currentUser.uid)) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }
    setLikeCount(safePost.likes);
  }, [safePost.likedBy, currentUser, safePost.likes]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser || !safePost.authorUid) {
      alert("Debes iniciar sesión para dar Me Gusta o el autor del post no es válido.");
      return;
    }

    if (!post.id) {
      console.error("Post ID missing");
      return;
    }

    const postRef = doc(db, "posts", post.id);
    const authorRef = doc(db, "users", safePost.authorUid);
    
    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likes: increment(-1),
          likedBy: arrayRemove(currentUser.uid)
        });
        if (authorRef) {
          await updateDoc(authorRef, {
              points: increment(-1)
          });
        }
        setLikeCount(prev => prev - 1);
        setIsLiked(false);
      } else {
        await updateDoc(postRef, {
          likes: increment(1),
          likedBy: arrayUnion(currentUser.uid)
        });
        if (authorRef) {
          await updateDoc(authorRef, {
              points: increment(1)
          });
        }
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error("Error updating like: ", error);
    }
  };

  const handleCardClick = () => {
    navigate(`/post/${safePost.id}`);
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (safePost.authorUid) {
      navigate(`/user/${safePost.authorUid}`);
    }
  };

  const getTimeString = () => {
    if (!safePost.createdAt) return 'Fecha desconocida';
    try {
      const date = safePost.createdAt.toDate();
      const now = new Date();
      const diff = Math.round((now - date) / 1000); // Segundos

      if (diff < 60) return `hace un momento`;
      if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
      if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
      return `hace ${Math.floor(diff / 86400)}d`;

    } catch (e) {
      return 'Fecha desconocida';
    }
  };

  // Obtener iniciales para el avatar fallback
  const authorInitials = getInitials(safePost.authorName);

  return (
    <div className="post-card-container post-card" onClick={handleCardClick} role="link" tabIndex="0">
        <div className="post-header">
          <div 
            className="post-author-link"
            onClick={handleProfileClick}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            {safePost.authorAvatarUrl ? (
              <img
                src={safePost.authorAvatarUrl}
                alt={safePost.authorName}
                className="post-avatar"
              />
            ) : (
              <div 
                className="post-avatar post-avatar-fallback"
                style={{
                  background: 'linear-gradient(135deg, #3C3C3C 0%, #2A2A2A 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#EAEAEA',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                {authorInitials}
              </div>
            )}
            <div className="post-author-info">
              <div className="author-name">{safePost.authorName}</div>
              <div className="author-meta">{getTimeString()} | {safePost.category}</div>
            </div>
          </div>
        </div>

        <div className="post-content">
          {safePost.content ? (
            <>
              {safePost.content.substring(0, 200)}
              {safePost.content.length > 200 && '...'}
            </>
          ) : (
            <i>Sin contenido</i>
          )}
        </div>

        <div className="post-footer">
            <button onClick={handleLike} className="like-button">
              <i className={`fa-heart ${isLiked ? 'fas liked' : 'far'}`}></i> {likeCount}
            </button>
            <div className="post-footer-action">
                <i className="far fa-comment"></i>
                <span>{safePost.comments}</span>
            </div>
        </div>
    </div>
  );
}

export default PostCard; 