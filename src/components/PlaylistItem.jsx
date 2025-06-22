import React from 'react';

function PlaylistItem({ item, onClick }) {
  return (
    <div className="playlist-item" onClick={onClick} style={{ cursor: 'pointer', marginBottom: 16 }}>
      <img
        src={item.thumbnail || 'https://placehold.co/100x60/333/ccc?text=Video'}
        alt={item.title}
        style={{ width: '100%', borderRadius: 8, marginBottom: 8, aspectRatio: '16/9', objectFit: 'cover', background: '#222' }}
      />
      <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '1em', marginBottom: 4 }}>{item.title}</div>
      {item.description && (
        <div style={{ fontSize: '0.9em', color: '#ccc', marginTop: 4, maxHeight: 40, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.description}
        </div>
      )}
    </div>
  );
}

export default PlaylistItem;