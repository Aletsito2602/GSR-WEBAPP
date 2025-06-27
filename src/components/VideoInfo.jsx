import React from 'react';
import { FaPlay } from 'react-icons/fa';

function VideoInfo({ title }) {
  // Simulación de un logo
  const logoUrl = '/public/images/logo.png';

  return (
    <div style={{
      background: '#2c2c2c',
      borderRadius: '16px',
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    }}>
      <div style={{
        background: '#1a1a1a',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img src={logoUrl} alt="Logo" style={{ width: '30px', filter: 'brightness(0) invert(1)' }} />
      </div>
      <h2 style={{
        margin: 0,
        color: '#fff',
        fontSize: '1.4rem',
        fontWeight: '500'
      }}>
        {title}
      </h2>
    </div>
  );
}

export default VideoInfo; 