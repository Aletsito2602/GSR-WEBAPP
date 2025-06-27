import React from 'react';
import RecordedClassCard from './RecordedClassCard';

function VideoGallery({ videos = [] }) {
  // Aquí iría la lógica de búsqueda, por ahora solo mostramos todo
  
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '24px',
      fontFamily: 'Poppins, sans-serif'
    }}>
      {videos.map((videoInfo) => (
        <RecordedClassCard 
          key={videoInfo.id} 
          video={videoInfo}
        />
      ))}
    </div>
  );
}

export default VideoGallery; 