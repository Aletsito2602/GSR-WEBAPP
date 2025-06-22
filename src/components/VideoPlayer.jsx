import React, { useState, useEffect } from 'react';

// Componente que ahora renderiza el embed de Vimeo o un video seleccionado
function VideoPlayer({ video }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estilos para el contenedor que mantiene el aspect ratio 16:9
  const containerStyle = {
    padding: '56.25% 0 0 0', // Padding-top para 16:9 (9 / 16 * 100)
    position: 'relative',
    backgroundColor: '#000', // Mantener fondo negro por si el iframe tarda en cargar
    borderRadius: '15px', // Añadir borde redondeado
    overflow: 'hidden' // Ocultar lo que sobresale del iframe
  };

  // Estilos para el iframe
  const iframeStyle = {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    border: 'none' // Asegurarse que el iframe no tenga borde propio
  };

  // Estilos para el estado de carga
  const loadingStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#fff',
    textAlign: 'center'
  };

  // Estilos para el mensaje de error
  const errorStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#ff4444',
    textAlign: 'center',
    padding: '20px',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: '8px'
  };

  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [video]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setError('Error al cargar el video');
    setIsLoading(false);
  };

  // Si hay un video seleccionado, mostrar ese video (YouTube)
  if (video && video.id) {
    const youtubeUrl = `https://www.youtube.com/embed/${video.id}?autoplay=0&rel=0&modestbranding=1`;
    return (
      <div style={containerStyle}>
        {isLoading && (
          <div style={loadingStyle}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2em', marginBottom: '10px' }}></i>
            <p>Cargando video...</p>
          </div>
        )}
        {error && (
          <div style={errorStyle}>
            <i className="fas fa-exclamation-circle" style={{ fontSize: '2em', marginBottom: '10px' }}></i>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                backgroundColor: '#D7B615',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reintentar
            </button>
          </div>
        )}
        <iframe 
          src={youtubeUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={iframeStyle}
          title={video.title || 'Video grabado'}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        ></iframe>
      </div>
    );
  }

  // Si no, mostrar el embed de streaming principal (Vimeo)
  return (
    <div style={containerStyle}>
      {isLoading && (
        <div style={loadingStyle}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '2em', marginBottom: '10px' }}></i>
          <p>Cargando streaming...</p>
        </div>
      )}
      {error && (
        <div style={errorStyle}>
          <i className="fas fa-exclamation-circle" style={{ fontSize: '2em', marginBottom: '10px' }}></i>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#D7B615',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reintentar
          </button>
        </div>
      )}
      <iframe 
        src="https://vimeo.com/event/5107021/embed" 
        width="640" 
        height="360" 
        frameBorder="0" 
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" 
        style={iframeStyle}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        title="Streaming en vivo"
      ></iframe>
    </div>
  );
}

export default VideoPlayer; 