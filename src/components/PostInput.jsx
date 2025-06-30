import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Para obtener info del usuario

function PostInput({ onSubmitPost, isSubmitting, selectedCategory }) {
  const { currentUser } = useAuth(); // Obtener usuario actual
  const [postContent, setPostContent] = useState(''); // Estado para el input
  const textareaRef = useRef(null); // Referencia para el textarea

  // Función para ajustar automáticamente la altura del textarea
  const adjustTextareaHeight = () => {
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
    adjustTextareaHeight();
  }, [postContent]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!postContent.trim() || !currentUser) return; // No enviar si vacío o no logueado
    onSubmitPost(postContent); // Llamar a la función del padre con el contenido correcto
    setPostContent(''); // Limpiar input después de enviar
  };

  const containerStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '15px 0',
    marginBottom: '20px',
    borderBottom: '1px solid #353535',
    gap: '12px' // Añadir espacio entre elementos
  };

  const inputStyle = {
    backgroundColor: '#353535',
    border: '1px solid #444',
    borderRadius: '20px',
    padding: '12px 15px',
    color: 'rgba(255, 255, 255, 0.7)',
    width: '100%',
    resize: 'none', // Evitar que el usuario pueda redimensionar
    overflow: 'hidden', // Ocultar scrollbar
    minHeight: '40px', // Altura mínima para una línea
    transition: 'height 0.2s ease', // Transición suave al cambiar altura
    lineHeight: '20px', // Altura de línea fija para cálculos consistentes
    fontSize: '14px' // Tamaño de fuente fijo
  };

  const avatarStyle = {
    width: '36px',
    height: '36px',
    borderRadius: '200px',
    overflow: 'hidden',
    backgroundColor: '#444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#D7B615',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    border: '2px solid #555',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
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
    cursor: postContent.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
    opacity: postContent.trim() && !isSubmitting ? 1 : 0.7,
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(215, 182, 21, 0.3)'
  };

  // Estilo para el hover del botón
  const buttonHoverStyle = {
    ...buttonStyle,
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(215, 182, 21, 0.5)'
  };

  // Mostrar la categoría seleccionada junto al input
  const categoryStyle = {
    fontSize: '0.8rem',
    color: selectedCategory === 'Anuncios' ? '#FF9800' : '#D7B615',
    marginLeft: '50px',
    marginBottom: '5px'
  };

  // Si no hay usuario, mostrar un mensaje o deshabilitar
  if (!currentUser) {
    return (
      <div style={containerStyle}>
        <p style={{color: 'rgba(255,255,255,0.6)', width: '100%', textAlign: 'center'}}>
            Inicia sesión para publicar.
        </p>
      </div>
    );
  }

  // Obtener la primera letra del nombre si existe
  const getUserInitial = () => {
    if (currentUser.displayName && currentUser.displayName.trim() !== '') {
      return currentUser.displayName.trim()[0].toUpperCase();
    }
    return currentUser.email ? currentUser.email[0].toUpperCase() : 'U';
  };

  return (
    <div className="post-input-container">
      {selectedCategory && (
        <div style={categoryStyle}>
          Publicando en: {selectedCategory}
        </div>
      )}
      <form onSubmit={handleSubmit} style={containerStyle}>
        {currentUser.photoURL ? (
          <img 
            src={currentUser.photoURL} 
            alt="User Avatar" 
            style={avatarStyle} 
          />
        ) : (
          <div style={avatarStyle}>
            {getUserInitial()}
          </div>
        )}
        <textarea
          ref={textareaRef}
          placeholder={selectedCategory === 'Anuncios' ? "Escribe un anuncio importante..." : "¿Qué estás pensando?"} 
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          style={inputStyle}
          disabled={isSubmitting}
          rows={1} // Iniciar con una sola línea
        />
        
        <button 
          type="submit" 
          style={buttonStyle}
          disabled={!postContent.trim() || isSubmitting}
          onMouseOver={(e) => Object.assign(e.target.style, buttonHoverStyle)}
          onMouseOut={(e) => Object.assign(e.target.style, buttonStyle)}
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
}

export default PostInput;