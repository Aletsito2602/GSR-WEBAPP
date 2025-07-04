import React from 'react';
import { FaPlay } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const RecordedClassCard = ({ video }) => {
  return (
    <Link to={`/clases/${video.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        background: 'linear-gradient(to bottom, #222222 0%, #3C3C3C 100%)',
        borderRadius: '20px',
        overflow: 'hidden',
        fontFamily: 'Poppins, sans-serif'
      }}>
        <div style={{ position: 'relative' }}>
          <img 
            src={video.thumbnail || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=500&q=80'}
            alt={video.title} 
            style={{ 
              width: '100%', 
              height: '180px', 
              objectFit: 'cover', 
              display: 'block',
              filter: 'grayscale(80%)'
            }} 
          />
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.2)'
          }}>
            <div style={{
                background: 'rgba(255,255,255,0.8)',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
            }}>
                <FaPlay style={{color: '#1a1a1a', marginLeft: '3px'}}/>
            </div>
          </div>
        </div>
        <div style={{ padding: '16px' }}>
          <h3 style={{ 
            margin: 0, 
            color: '#fff', 
            fontSize: '20px', 
            fontWeight: '500', 
            textAlign: 'center',
            fontFamily: 'Poppins, sans-serif'
          }}>
            {video.title}
          </h3>
          <p style={{ 
            margin: '8px 0 0 0', 
            color: '#aaa', 
            fontSize: '16px', 
            fontWeight: 'normal', 
            textAlign: 'center',
            fontFamily: 'Poppins, sans-serif'
          }}>
            {video.description && video.description.length > 100 
              ? `${video.description.substring(0, 100)}...` 
              : video.description}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default RecordedClassCard; 