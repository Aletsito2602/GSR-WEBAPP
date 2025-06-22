import React, { useState } from 'react';

function VideoGallery({ videos }) {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const loadVideo = (video) => {
    setSelectedVideo(video.id);
  };

  return (
    <div className="video-gallery" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
      gap: '16px',
      padding: '20px',
      marginTop: '20px'
    }}>
      {videos.length > 0 ? (
        videos.map((video) => (
          <div key={video.id} className="video-item-wrapper" style={{
            marginBottom: '20px'
          }}>
            <div className="video-item" style={{
              position: 'relative',
              overflow: 'hidden',
              paddingTop: '56.25%', // Relación de aspecto 16:9
              backgroundColor: '#000',
              borderRadius: '8px'
            }}>
              {selectedVideo === video.id ? (
                <iframe
                  src={`https://player.vimeo.com/video/${video.id}?autoplay=1`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={video.title}
                />
              ) : (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="video-thumbnail"
                  onClick={() => loadVideo(video)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease-in-out'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                />
              )}
            </div>
            <div className="video-title" style={{
              textAlign: 'center',
              fontWeight: 'bold',
              marginTop: '10px',
              fontSize: '1rem',
              color: '#fff'
            }}>
              {video.title}
            </div>
            {video.description && (
              <div className="video-description" style={{
                textAlign: 'center',
                marginTop: '5px',
                fontStyle: 'italic',
                fontSize: '0.9rem',
                color: '#ccc'
              }}>
                {video.description.slice(0, 80)}
                {video.description.length > 80 ? '...' : ''}
              </div>
            )}
          </div>
        ))
      ) : (
        <p style={{ color: '#aaa', gridColumn: '1 / -1', textAlign: 'center' }}>
          No se encontraron videos en la carpeta.
        </p>
      )}
    </div>
  );
}

export default VideoGallery; 