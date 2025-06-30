import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebaseConfig'; // <<< Importar db y auth
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp, doc, deleteDoc, updateDoc, arrayUnion, arrayRemove, increment } from "firebase/firestore"; // <<< Añadir deleteDoc, updateDoc, arrayUnion, arrayRemove y increment
import { useAuth } from '../context/AuthContext'; // <<< Importar useAuth
import './Comments.css'; // Importar nuevo CSS

// Recibir postId como prop
function Comments({ postId }) { 
  const { currentUser } = useAuth(); // Obtener usuario logueado
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [errorComments, setErrorComments] = useState(null);
  const [indexBuilding, setIndexBuilding] = useState(false); // Estado para índice en construcción
  const [newComment, setNewComment] = useState(''); // Estado para el input
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState(null); // Estado para comentario en edición
  const [editText, setEditText] = useState(''); // Texto editado
  const [replyingTo, setReplyingTo] = useState(null); // Para identificar a qué comentario se responde
  const [replyText, setReplyText] = useState(''); // Texto de la respuesta
  
  // Referencias para los textareas
  const commentTextareaRef = useRef(null);
  const replyTextareaRef = useRef(null);
  const editTextareaRef = useRef(null);

  // Emojis disponibles para reacciones
  const availableReactions = ['👍', '❤️', '😊', '🔥', '👏', '😮'];

  // useEffect para escuchar comentarios en tiempo real
  useEffect(() => {
    if (!postId) return; // No hacer nada si no hay postId

    setLoadingComments(true);
    setErrorComments(null);
    setIndexBuilding(false);
    
    try {
      // Crear consulta para obtener comentarios de este post
      const q = query(
        collection(db, "comments"),
        where("postId", "==", postId),
        orderBy("createdAt", "desc")
      );
      
      // Suscribirse a cambios en tiempo real
      const unsubscribe = onSnapshot(q, (snapshot) => {
        try {
          // Procesar los documentos y agrupar respuestas
          const commentsData = [];
          const repliesMap = {};
          
          snapshot.forEach((doc) => {
            const commentData = { id: doc.id, ...doc.data() };
            
            // Si es una respuesta, agregarla al mapa de respuestas
            if (commentData.parentCommentId) {
              if (!repliesMap[commentData.parentCommentId]) {
                repliesMap[commentData.parentCommentId] = [];
              }
              repliesMap[commentData.parentCommentId].push(commentData);
            } else {
              // Si es un comentario principal, agregarlo a la lista
              commentsData.push(commentData);
            }
          });
          
          // Agregar las respuestas a sus comentarios padre
          commentsData.forEach(comment => {
            if (repliesMap[comment.id]) {
              comment.replies = repliesMap[comment.id].sort((a, b) => 
                a.createdAt?.seconds - b.createdAt?.seconds
              );
            }
          });
          
          setComments(commentsData);
          setLoadingComments(false);
        } catch (error) {
          console.error("Error procesando comentarios:", error);
          setErrorComments("Error al procesar comentarios.");
          setLoadingComments(false);
        }
      }, (error) => {
        // Manejar errores de la consulta
        console.error("Error en consulta de comentarios:", error);
        
        // Detectar si es un problema de índice
        if (error.code === 'failed-precondition' && error.message.includes('index')) {
          setIndexBuilding(true);
        } else {
          setErrorComments(`Error: ${error.message}`);
        }
        setLoadingComments(false);
      });
      
      // Limpiar suscripción al desmontar
      return () => unsubscribe();
    } catch (error) {
      console.error("Error al configurar consulta:", error);
      setErrorComments(`Error: ${error.message}`);
      setLoadingComments(false);
    }
  }, [postId]);

  // Función para ajustar automáticamente la altura del textarea
  const adjustTextareaHeight = (textareaRef) => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Resetear la altura para calcular correctamente
      textarea.style.height = 'auto';
      // Establecer la altura basada en el contenido (scrollHeight)
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };

  // Ajustar altura cuando cambia el contenido
  useEffect(() => {
    if (commentTextareaRef.current) {
      adjustTextareaHeight(commentTextareaRef);
    }
  }, [newComment]);

  useEffect(() => {
    if (replyTextareaRef.current) {
      adjustTextareaHeight(replyTextareaRef);
    }
  }, [replyText]);

  useEffect(() => {
    if (editTextareaRef.current) {
      adjustTextareaHeight(editTextareaRef);
    }
  }, [editText]);

  // Función para enviar nuevo comentario
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;
    setIsSubmitting(true);
    try {
      // Añadir comentario
      await addDoc(collection(db, "comments"), {
        postId: postId,
        text: newComment,
        authorUid: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email,
        authorAvatarUrl: currentUser.photoURL || '',
        createdAt: serverTimestamp(),
        reactions: {},
        reactedBy: {}
      });
      
      // Incrementar el contador de comentarios en el post
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        commentCount: increment(1)
      });
      
      setNewComment('');
    } catch (error) {
      console.error("Error adding comment: ", error);
      alert("Hubo un error al enviar tu comentario.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Función para enviar respuesta a un comentario
  const handleReplySubmit = async (parentCommentId) => {
    if (!replyText.trim()) return;
    if (!currentUser) {
      alert("Debes iniciar sesión para responder.");
      return;
    }
    
    try {
      // Añadir respuesta como un nuevo documento en la colección comments
      await addDoc(collection(db, "comments"), {
        postId: postId,
        parentCommentId: parentCommentId, // Referencia al comentario padre
        text: replyText,
        authorUid: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email,
        authorAvatarUrl: currentUser.photoURL || '',
        createdAt: serverTimestamp(),
        reactions: {},
        reactedBy: {}
      });
      
      // Incrementar el contador de comentarios en el post
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        commentCount: increment(1)
      });
      
      // Limpiar y cerrar el formulario de respuesta
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error("Error adding reply: ", error);
      alert("Hubo un error al enviar tu respuesta.");
    }
  };
  
  // Formatear timestamp de Firestore
  const formatFirestoreTimestamp = (timestamp) => {
    if (!timestamp) return 'Hace un momento';
    
    try {
      // Convertir timestamp de Firestore a Date
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      
      // Calcular diferencia de tiempo
      const now = new Date();
      const diffMs = now - date;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      // Formatear según la diferencia
      if (diffSecs < 60) return 'Hace un momento';
      if (diffMins < 60) return `Hace ${diffMins} min`;
      if (diffHours < 24) return `Hace ${diffHours} h`;
      if (diffDays < 7) return `Hace ${diffDays} días`;
      
      // Para fechas más antiguas, mostrar fecha completa
      return date.toLocaleDateString();
    } catch (error) {
      console.error("Error formateando timestamp:", error);
      return 'Fecha desconocida';
    }
  };
  
  // Manejar reacciones a comentarios
  const handleReaction = async (commentId, emoji) => {
    if (!currentUser) {
      alert("Debes iniciar sesión para reaccionar.");
      return;
    }
    
    try {
      const commentRef = doc(db, "comments", commentId);
      const commentSnap = await getDoc(commentRef);
      
      if (commentSnap.exists()) {
        const commentData = commentSnap.data();
        const reactedBy = commentData.reactedBy || {};
        const reactions = commentData.reactions || {};
        
        // Verificar si el usuario ya reaccionó con este emoji
        const hasReacted = reactedBy[emoji]?.includes(currentUser.uid);
        
        if (hasReacted) {
          // Quitar reacción
          await updateDoc(commentRef, {
            [`reactedBy.${emoji}`]: arrayRemove(currentUser.uid),
            [`reactions.${emoji}`]: increment(-1)
          });
        } else {
          // Añadir reacción
          await updateDoc(commentRef, {
            [`reactedBy.${emoji}`]: arrayUnion(currentUser.uid),
            [`reactions.${emoji}`]: increment(1)
          });
        }
      }
    } catch (error) {
      console.error("Error al manejar reacción:", error);
      alert("Hubo un error al procesar tu reacción.");
    }
  };
  
  // Manejar eliminación de comentarios
  const handleDeleteComment = async (commentId) => {
    if (!currentUser) return;
    
    if (window.confirm("¿Estás seguro de que quieres eliminar este comentario?")) {
      try {
        // Eliminar el comentario
        await deleteDoc(doc(db, "comments", commentId));
        
        // Decrementar el contador de comentarios en el post
        const postRef = doc(db, "posts", postId);
        await updateDoc(postRef, {
          commentCount: increment(-1)
        });
        
        // Si estamos editando este comentario, cancelar edición
        if (editingComment === commentId) {
          setEditingComment(null);
          setEditText('');
        }
      } catch (error) {
        console.error("Error al eliminar comentario:", error);
        alert("Hubo un error al eliminar el comentario.");
      }
    }
  };
  
  // Manejar clic en editar comentario
  const handleEditClick = (comment) => {
    setEditingComment(comment.id);
    setEditText(comment.text);
  };
  
  // Manejar guardar edición
  const handleSaveEdit = async (commentId) => {
    if (!editText.trim()) return;
    
    try {
      const commentRef = doc(db, "comments", commentId);
      await updateDoc(commentRef, {
        text: editText,
        isEdited: true,
        editedAt: serverTimestamp()
      });
      
      // Limpiar estado de edición
      setEditingComment(null);
      setEditText('');
    } catch (error) {
      console.error("Error al editar comentario:", error);
      alert("Hubo un error al guardar los cambios.");
    }
  };
  
  // Manejar cancelar edición
  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText('');
  };
  
  // Estilos para el componente
  const containerStyle = {
    backgroundColor: '#2a2a2a',
    borderRadius: '15px',
    padding: '20px',
    marginTop: '20px',
    border: '1px solid #3c3c3c'
  };
  
  const titleStyle = {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #3c3c3c'
  };
  
  const commentListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '20px'
  };
  
  const inputAreaStyle = {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start'
  };
  
  const indexBuildingStyle = {
    padding: '15px',
    backgroundColor: 'rgba(255, 150, 0, 0.1)',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid rgba(255, 150, 0, 0.3)',
    color: '#ffa500'
  };
  
  // Estilos para los comentarios
  const commentItemStyle = {
    display: 'flex',
    gap: '12px',
    paddingBottom: '15px',
    marginBottom: '15px',
    borderBottom: '1px solid #3c3c3c'
  };
  
  const commentAvatarStyle = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover'
  };
  
  const avatarPlaceholderStyle = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#D7B615',
    fontWeight: 'bold'
  };
  
  const commentTextStyle = {
    fontSize: '0.9em',
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 1.4,
    marginTop: '5px'
  };
  
  const commentAuthorStyle = {
    fontWeight: 'bold',
    color: 'white',
    fontSize: '0.95em',
    marginRight: '8px'
  };
  
  const commentTimeStyle = {
    fontSize: '0.8em',
    color: 'rgba(255, 255, 255, 0.6)'
  };
  
  // Estilos para el textarea de comentarios
  const textareaStyle = {
    backgroundColor: '#353535',
    border: '1px solid #444',
    borderRadius: '20px',
    padding: '12px 15px',
    color: 'rgba(255, 255, 255, 0.7)',
    width: '100%',
    resize: 'none',
    overflow: 'hidden',
    minHeight: '40px',
    transition: 'height 0.2s ease',
    lineHeight: '20px',
    fontSize: '14px'
  };

  // Nuevo estilo para el botón de enviar
  const buttonStyle = {
    marginLeft: '10px',
    alignSelf: 'flex-end',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #D7B615, #f0d700)',
    color: '#1a1a1a',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: newComment.trim() && !isSubmitting && !indexBuilding && currentUser ? 'pointer' : 'not-allowed',
    opacity: newComment.trim() && !isSubmitting && !indexBuilding && currentUser ? 1 : 0.7,
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(215, 182, 21, 0.3)'
  };
  
  // Renderizar comentario individual (usado para comentarios principales y respuestas)
  const renderComment = (comment, isReply = false) => (
    <div key={comment.id} style={{
      ...commentItemStyle,
      marginLeft: isReply ? '30px' : '0',
      backgroundColor: isReply ? '#2c2c2c' : 'transparent',
      padding: isReply ? '10px' : '0',
      borderRadius: isReply ? '8px' : '0'
    }}>
      {comment.authorAvatarUrl ? (
        <img 
          src={comment.authorAvatarUrl} 
          alt={`${comment.authorName}'s avatar`} 
          style={commentAvatarStyle} 
        />
      ) : (
        <div style={avatarPlaceholderStyle}>
          {comment.authorName ? comment.authorName[0].toUpperCase() : '?'}
        </div>
      )}
      
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={commentAuthorStyle}>{comment.authorName}</span>
            <span style={commentTimeStyle}>
              {formatFirestoreTimestamp(comment.createdAt)}
              {comment.isEdited && <span style={{ marginLeft: '5px', fontStyle: 'italic' }}>(editado)</span>}
            </span>
          </div>
          
          {/* Mostrar opciones de edición/eliminación si es el autor */}
          {currentUser && comment.authorUid === currentUser.uid && (
            <div style={{ display: 'flex', gap: '10px' }}>
              {!isReply && !editingComment && (
                <button 
                  onClick={() => handleEditClick(comment)}
                  style={{ 
                    background: 'none', 
                    border: 'none',
                    color: '#aaa',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  <i className="fas fa-edit"></i>
                </button>
              )}
              <button 
                onClick={() => handleDeleteComment(comment.id)}
                style={{ 
                  background: 'none', 
                  border: 'none',
                  color: '#aaa',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          )}
        </div>
        
        {editingComment === comment.id ? (
          <div style={{ marginTop: '5px' }}>
            <textarea 
              ref={editTextareaRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              style={{
                ...textareaStyle,
                minHeight: '60px'
              }}
              rows={1}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px', gap: '8px' }}>
              <button 
                onClick={() => handleCancelEdit()}
                style={{ 
                  background: '#555', 
                  color: 'white', 
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleSaveEdit(comment.id)}
                style={{ 
                  background: 'linear-gradient(135deg, #D7B615, #f0d700)', 
                  color: '#232323', 
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  cursor: 'pointer'
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        ) : (
          <>
            <p style={commentTextStyle}>{comment.text}</p>
            
            {/* Barra de reacciones y respuestas */}
            <div style={{ display: 'flex', marginTop: '8px', gap: '5px', alignItems: 'center' }}>
              {/* Emojis de reacción */}
              <div style={{ display: 'flex', gap: '5px' }}>
                {availableReactions.map(emoji => {
                  const hasReacted = comment.reactedBy?.[emoji]?.includes(currentUser?.uid);
                  const reactionCount = comment.reactions?.[emoji] || 0;
                  
                  return reactionCount > 0 || !isReply ? (
                    <button
                      key={emoji}
                      onClick={(e) => { e.preventDefault(); handleReaction(comment.id, emoji); }}
                      style={{
                        border: hasReacted ? '1px solid #D7B615' : '1px solid #555',
                        borderRadius: '12px',
                        padding: '2px 8px',
                        background: hasReacted ? 'rgba(215, 182, 21, 0.15)' : '#333',
                        color: 'white',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <span>{emoji}</span>
                      {reactionCount > 0 && <span>{reactionCount}</span>}
                    </button>
                  ) : null;
                })}
              </div>
              
              {/* Botón de responder (solo en comentarios principales) */}
              {!isReply && (
                <button
                  onClick={(e) => { 
                    e.preventDefault(); 
                    setReplyingTo(replyingTo === comment.id ? null : comment.id);
                    setReplyText('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#aaa',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: '2px 5px',
                    marginLeft: 'auto'
                  }}
                >
                  {replyingTo === comment.id ? 'Cancelar respuesta' : 'Responder'}
                </button>
              )}
            </div>
            
            {/* Input para responder */}
            {replyingTo === comment.id && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <textarea
                  ref={replyTextareaRef}
                  placeholder="Escribe tu respuesta..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{
                    ...textareaStyle,
                    minHeight: '36px'
                  }}
                  rows={1}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleReplySubmit(comment.id)}
                    disabled={!replyText.trim()}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: replyText.trim() ? 'linear-gradient(135deg, #D7B615, #f0d700)' : '#555',
                      color: replyText.trim() ? '#232323' : '#aaa',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: replyText.trim() ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  // Contar todos los comentarios incluyendo respuestas
  const totalCommentCount = comments.reduce((total, comment) => 
    total + 1 + (comment.replies?.length || 0), 0);

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>Comentarios ({totalCommentCount})</div>
      
      {indexBuilding && (
        <div style={indexBuildingStyle}>
          <p>⚠️ Estamos preparando el sistema de comentarios. Esta operación puede tardar unos minutos.</p>
          <p>Por favor, vuelve a intentarlo más tarde.</p>
        </div>
      )}
      
      <div style={commentListStyle}>
        {loadingComments && <p>Cargando comentarios...</p>}
        {errorComments && !indexBuilding && <p style={{ color: 'red' }}>{errorComments}</p>}
        {!loadingComments && !errorComments && comments.length === 0 && <p style={{color: 'rgba(255,255,255,0.6)'}}>Sé el primero en comentar.</p>}
        
        {!loadingComments && !errorComments && comments.map(comment => (
          <div key={comment.id}>
            {/* Comentario principal */}
            {renderComment(comment)}
            
            {/* Respuestas al comentario, si las hay */}
            {comment.replies && comment.replies.length > 0 && (
              <div style={{ marginLeft: '20px', marginTop: '5px' }}>
                {comment.replies.map(reply => renderComment(reply, true))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Formulario para nuevo comentario */}
      <form onSubmit={handleCommentSubmit} style={inputAreaStyle}>
        <textarea 
          ref={commentTextareaRef}
          placeholder={currentUser ? "Escribe tu comentario..." : "Inicia sesión para comentar"}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={!currentUser || isSubmitting || indexBuilding}
          style={textareaStyle}
          rows={1}
        />
        <button 
          type="submit" 
          disabled={!currentUser || !newComment.trim() || isSubmitting || indexBuilding} 
          style={buttonStyle}
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
}

export default Comments; 