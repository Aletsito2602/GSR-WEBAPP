import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaHeart } from 'react-icons/fa';

const ProgressBar = ({ progress }) => (
  <div style={{ width: '100%', background: '#444', borderRadius: '4px', height: '6px', marginTop: 'auto' }}>
    <div style={{ width: `${progress || 0}%`, background: 'linear-gradient(90deg, #D7B615, #F0D042)', height: '100%', borderRadius: '4px' }}></div>
  </div>
);

function ClassCard({ id, title, description, progress, imageUrl }) {
  return (
    <Link to={`/clases/${id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'linear-gradient(to bottom, #222222 0%, #3C3C3C 100%)',
        borderRadius: '20px',
        overflow: 'hidden',
        color: '#fff',
        fontFamily: 'Poppins, sans-serif',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ position: 'relative' }}>
          <img src={imageUrl || 'https://placehold.co/600x400/2c2c2c/fff?text=Clase'} alt={title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.3)'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid #fff',
              color: '#fff',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaPlay size={20} />
            </div>
          </div>
          <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}>
            <FaHeart color="#D7B615" />
          </div>
        </div>
        <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ 
            marginTop: 0, 
            marginBottom: '8px', 
            fontSize: '20px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '500'
          }}>{title}</h3>
          <p style={{ 
            color: '#aaa', 
            fontSize: '16px', 
            marginBottom: '16px', 
            flexGrow: 1,
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 'normal'
          }}>{description}</p>
          <ProgressBar progress={progress} />
          <p style={{ color: '#aaa', fontSize: '12px', marginTop: '8px', textAlign: 'right', marginBlockEnd: 0 }}>{progress || 0}% completado</p>
        </div>
      </div>
    </Link>
  );
};

export default ClassCard; 