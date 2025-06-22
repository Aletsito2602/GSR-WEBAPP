import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig'; // <<< Importar db y auth
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp, doc, deleteDoc, updateDoc, arrayUnion, arrayRemove, increment } from "firebase/firestore"; // <<< Añadir deleteDoc, updateDoc, arrayUnion, arrayRemove y increment
import { useAuth } from '../context/AuthContext'; // <<< Importar useAuth

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

  // Emojis disponibles para reacciones
  const availableReactions = ['👍', '❤️', '😊', '🔥', '👏', '😮'];

  // useEffect para escuchar comentarios en tiempo real
  useEffect(() => {
    if (!postId) return; // No hacer nada si no hay postId

    setLoadingComments(true);
    setErrorComments(null);
    setIndexBuilding(false);

    const commentsRef = collection(db, "comments");
    // Query para obtener comentarios de este post y sus respuestas
    const q = query(
      commentsRef, 
      where("postId", "==", postId),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedComments = [];
      querySnapshot.forEach((doc) => {
        fetchedComments.push({ id: doc.id, ...doc.data() });
      });
      
      // Separar comentarios principales y respuestas
      const mainComments = fetchedComments.filter(comment => !comment.parentId);
      const replies = fetchedComments.filter(comment => comment.parentId);
      
      // Agrupar respuestas con sus comentarios principales
      const commentsWithReplies = mainComments.map(comment => {
        const commentReplies = replies.filter(reply => reply.parentId === comment.id);
        return {
          ...comment,
          replies: commentReplies.sort((a, b) => 
            a.createdAt && b.createdAt ? a.createdAt.seconds - b.createdAt.seconds : 0
          )
        };
      });
      
      setComments(commentsWithReplies);
      setLoadingComments(false);
    }, (error) => {
      console.error("Error listening to comments: ", error);
      
      if (error.message && error.message.includes("index")) {
        setIndexBuilding(true);
        setErrorComments("Los comentarios están siendo preparados. Por favor, espera unos minutos.");
      } else {
        setErrorComments("No se pudieron cargar los comentarios.");
      }
      
      setLoadingComments(false);
    });

    return () => unsubscribe();
  }, [postId]);

  // <<< Función para enviar nuevo comentario >>>
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return; // No enviar comentarios vacíos
    if (!currentUser) {
        alert("Debes iniciar sesión para comentar."); // O redirigir a login
        return;
    }

    setIsSubmitting(true);
    try {
      // Añadir comentario
      await addDoc(collection(db, "comments"), {
        postId: postId,
        text: newComment,
        authorUid: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email, // Usar displayName o email
        authorAvatarUrl: currentUser.photoURL || '', // Usar photoURL si existe
        createdAt: serverTimestamp(), // Usar timestamp del servidor
        reactions: {}, // Objeto para contabilizar reacciones (emoji: conteo)
        reactedBy: {} // Objeto para saber quién reaccionó (emoji: [uid1, uid2...])
      });
      
      // Incrementar el contador de comentarios en el post
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        commentCount: increment(1)
      });
      
      setNewComment(''); // Limpiar input
    } catch (error) {
      console.error("Error adding comment: ", error);
      alert("Hubo un error al enviar tu comentario.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // <<< Función para enviar respuesta a un comentario >>>
  const handleReplySubmit = async (parentCommentId) => {
    if (!replyText.trim()) return;
    if (!currentUser) {
      alert("Debes iniciar sesión para responder.");
      return;
    }

    try {
      // Añadir respuesta
      await addDoc(collection(db, "comments"), {
        postId: postId,
        parentId: parentCommentId, // ID del comentario al que se responde
        text: replyText,
        authorUid: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email,
        authorAvatarUrl: currentUser.photoURL || '',
        createdAt: serverTimestamp(),
        reactions: {},
        reactedBy: {}
      });
      
      // Incrementar el contador de comentarios en el post (las respuestas también cuentan)
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        commentCount: increment(1)
      });
      
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error("Error adding reply: ", error);
      alert("Hubo un error al enviar tu respuesta.");
    }
  };
  
  // <<< Función para formatear Timestamps (igual que en otras páginas) >>>
  const formatFirestoreTimestamp = (timestamp) => {
    if (!timestamp) return '...';
    try {
      const date = timestamp.toDate();
      const now = new Date();
      const diff = Math.floor((now - date) / 1000); // diferencia en segundos
      
      if (diff < 60) return "justo ahora";
      if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
      if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
      if (diff < 604800) return `hace ${Math.floor(diff / 86400)} días`;
      
      return date.toLocaleDateString();
    } catch (e) {
      return '...';
    }
  };

  const containerStyle = {
    backgroundColor: '#353535', 
    borderRadius: '8px',
    padding: '20px',
    height: '100%', // Intentar ocupar altura disponible
    display: 'flex',
    flexDirection: 'column'
  };

  const titleStyle = {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '1px solid #444'
  };

  const commentListStyle = {
      flexGrow: 1, // Ocupa espacio restante
      overflowY: 'auto', // Scroll si hay muchos comentarios
      marginBottom: '15px'
  };

  const commentItemStyle = {
      display: 'flex',
      marginBottom: '15px',
      paddingBottom: '10px',
      borderBottom: '1px solid #444'
  };

  const commentAvatarStyle = {
      width: '30px',
      height: '30px',
      borderRadius: '50%',
      marginRight: '10px',
      flexShrink: 0
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

  const inputAreaStyle = {
    display: 'flex',
    marginTop: 'auto' // Empujar al fondo
  };

  const textareaStyle = {
    flexGrow: 1,
    backgroundColor: '#444',
    border: '1px solid #555',
    borderRadius: '5px',
    padding: '10px',
    color: 'white',
    marginRight: '10px',
    resize: 'none' // Evitar que se pueda redimensionar
  };

  const buttonStyle = {
    // Hereda estilos de botón de index.css
    alignSelf: 'flex-end' // Alinear con la parte inferior del textarea
  };

  const indexBuildingStyle = {
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    border: '1px solid rgba(255, 165, 0, 0.5)',
    borderRadius: '5px',
    padding: '10px',
    marginBottom: '15px',
    color: 'rgba(255, 165, 0, 0.9)'
  };

  // Función para añadir/quitar reacción a un comentario
  const handleReaction = async (commentId, emoji) => {
    if (!currentUser) {
      alert("Debes iniciar sesión para reaccionar.");
      return;
    }

    try {
      const commentRef = doc(db, "comments", commentId);
      const comment = comments.find(c => c.id === commentId) || 
                     comments.flatMap(c => c.replies || []).find(r => r.id === commentId);
      
      if (!comment) return;

      // Comprobar si el usuario ya ha reaccionado con este emoji
      const reactedByForEmoji = comment.reactedBy?.[emoji] || [];
      const hasReacted = reactedByForEmoji.includes(currentUser.uid);
      
      if (hasReacted) {
        // Si ya reaccionó, quitar la reacción
        await updateDoc(commentRef, {
          [`reactions.${emoji}`]: (comment.reactions?.[emoji] || 1) - 1,
          [`reactedBy.${emoji}`]: arrayRemove(currentUser.uid)
        });
      } else {
        // Si no ha reaccionado, añadir reacción
        await updateDoc(commentRef, {
          [`reactions.${emoji}`]: (comment.reactions?.[emoji] || 0) + 1,
          [`reactedBy.${emoji}`]: arrayUnion(currentUser.uid)
        });
      }
    } catch (error) {
      console.error("Error updating reaction: ", error);
    }
  };

  // Función para eliminar comentario
  const handleDeleteComment = async (commentId) => {
    if (!currentUser) {
      alert("Debes iniciar sesión para eliminar comentarios.");
      return;
    }
    
    if (window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      try {
        // Buscar si el comentario tiene respuestas (solo si es un comentario principal)
        const comment = comments.find(c => c.id === commentId);
        const isMainComment = !comment?.parentId;
        const replyCount = isMainComment ? (comment?.replies?.length || 0) : 0;
        
        // Eliminar el comentario
        await deleteDoc(doc(db, "comments", commentId));
        
        // Si es comentario principal, también hay que eliminar todas sus respuestas
        if (isMainComment && replyCount > 0) {
          const batch = db.batch();
          comment.replies.forEach(reply => {
            const replyRef = doc(db, "comments", reply.id);
            batch.delete(replyRef);
          });
          await batch.commit();
        }
        
        // Decrementar el contador de comentarios en el post
        // Si es comentario principal con respuestas, restar 1 + número de respuestas
        // Si es una respuesta o comentario sin respuestas, restar solo 1
        const postRef = doc(db, "posts", postId);
        await updateDoc(postRef, {
          commentCount: increment(-(isMainComment ? 1 + replyCount : 1))
        });
        
      } catch (error) {
        console.error("Error deleting comment: ", error);
        alert("Hubo un error al eliminar el comentario.");
      }
    }
  };

  // Función para iniciar edición de comentario
  const handleEditClick = (comment) => {
    setEditingComment(comment.id);
    setEditText(comment.text);
  };

  // Función para guardar comentario editado
  const handleSaveEdit = async (commentId) => {
    if (!editText.trim()) {
      alert("El comentario no puede estar vacío.");
      return;
    }

    try {
      await updateDoc(doc(db, "comments", commentId), {
        text: editText,
        updatedAt: serverTimestamp(),
        isEdited: true
      });
      setEditingComment(null);
      setEditText('');
    } catch (error) {
      console.error("Error updating comment: ", error);
      alert("Hubo un error al actualizar el comentario.");
    }
  };

  // Función para cancelar edición
  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText('');
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
      <img 
        src={comment.authorAvatarUrl || 'https://placehold.co/30x30/bbb/FFF?text=A'} 
        alt={comment.authorName} 
        style={commentAvatarStyle} 
      />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={commentAuthorStyle}>{comment.authorName}</span>
            <span style={commentTimeStyle}>
              {formatFirestoreTimestamp(comment.createdAt)}
              {comment.isEdited && <span style={{ marginLeft: '5px', fontStyle: 'italic' }}>(editado)</span>}
            </span>
          </div>
          {currentUser && comment.authorUid === currentUser.uid && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={(e) => { e.preventDefault(); handleEditClick(comment); }}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#D7B615', 
                  cursor: 'pointer', 
                  fontSize: '12px',
                  padding: '2px 5px'
                }}
              >
                Editar
              </button>
              <button 
                onClick={(e) => { e.preventDefault(); handleDeleteComment(comment.id); }}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#ff6b6b', 
                  cursor: 'pointer', 
                  fontSize: '12px',
                  padding: '2px 5px'
                }}
              >
                Eliminar
              </button>
            </div>
          )}
        </div>
        
        {editingComment === comment.id ? (
          <div style={{ marginTop: '5px' }}>
            <textarea 
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#444',
                border: '1px solid #555',
                borderRadius: '5px',
                padding: '8px',
                color: 'white',
                resize: 'none'
              }}
              rows="3"
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
                  background: '#D7B615', 
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
                  placeholder="Escribe tu respuesta..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{
                    backgroundColor: '#444',
                    border: '1px solid #555',
                    borderRadius: '5px',
                    padding: '8px',
                    color: 'white',
                    resize: 'none'
                  }}
                  rows="2"
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleReplySubmit(comment.id)}
                    disabled={!replyText.trim()}
                    style={{
                      background: replyText.trim() ? '#D7B615' : '#555',
                      color: replyText.trim() ? '#232323' : '#aaa',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '5px 10px',
                      cursor: replyText.trim() ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Responder
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
          rows="3" 
          placeholder={currentUser ? "Escribe tu comentario..." : "Inicia sesión para comentar"}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={!currentUser || isSubmitting || indexBuilding} // Deshabilitar si no logueado, enviando o índice en construcción
          style={textareaStyle}
        />
        <button type="submit" disabled={!currentUser || !newComment.trim() || isSubmitting || indexBuilding} style={buttonStyle}>
          {isSubmitting ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}

export default Comments; 