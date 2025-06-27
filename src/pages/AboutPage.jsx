import React from 'react';
import { FaGlobe, FaUsers, FaTag, FaUserTie, FaPlay, FaUserPlus } from 'react-icons/fa';

const InfoChip = ({ icon, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc' }}>
    {icon}
    <span>{text}</span>
  </div>
);

function AboutPage() {
  const imageUrl = 'https://images.unsplash.com/photo-1556742044-1a53ff0e3c54?w=800&q=80';
  const slides = [
    'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&q=80',
    'https://images.unsplash.com/photo-1516116216624-53e697320f64?w=400&q=80',
    'https://images.unsplash.com/photo-1542744095-291d1f67b221?w=400&q=80',
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', fontFamily: 'Poppins, sans-serif', color: '#fff' }}>
      <div style={{ background: '#2c2c2c', borderRadius: '24px', padding: '32px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#1a1a1a', borderRadius: '50%', padding: '8px', border: '1px solid #D7B615' }}>
            <FaUserTie size={24} style={{ color: '#D7B615' }} />
          </div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>Golden Suite</h1>
        </div>

        {/* Video Player */}
        <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px' }}>
          <img src={imageUrl} alt="Community" style={{ width: '100%', display: 'block' }} />
          <div style={{ 
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)', border: '1px solid #fff', color: '#fff',
              borderRadius: '50%', width: '60px', height: '60px', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}>
              <FaPlay size={24} />
            </div>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#ccc' }}>
          La mejor comunidad para todo trader que quiere potenciar sus habilidades. 8 cifras USD de experiencia acumuladas en 1 sola comunidad
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginBottom: '24px', cursor: 'pointer' }}>
          <span style={{ color: '#D7B615', fontWeight: 500 }}>Invitar a unirse</span>
          <div style={{ background: '#D7B615', borderRadius: '50%', padding: '8px' }}>
            <FaUserPlus color="#1a1a1a" />
          </div>
        </div>
        
        {/* Slides */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {slides.map((slide, i) => (
            <img key={i} src={slide} alt={`Slide ${i+1}`} style={{ width: '100%', borderRadius: '12px' }} />
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div style={{
        background: '#2c2c2c', borderRadius: '16px', padding: '16px 24px',
        marginTop: '24px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '20px'
      }}>
        <InfoChip icon={<FaGlobe />} text="Público" />
        <InfoChip icon={<FaUsers />} text="7.2 k miembros" />
        <InfoChip icon={<FaTag />} text="Gratis" />
        <InfoChip icon={<FaUserTie />} text="Por Mr. Isaac Ramirez" />
      </div>
    </div>
  );
}

export default AboutPage; 