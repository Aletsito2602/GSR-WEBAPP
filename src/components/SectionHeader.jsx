import React from 'react';

function SectionHeader({ title, children }) {
  const headerStyle = {
    position: 'sticky',
    top: 57,
    zIndex: 100,
    background: '#232323',
    padding: '0',
    borderBottom: 'none',
    display: 'flex',
    alignItems: 'center',
    minHeight: '0'
  };

  const titleStyle = {
    fontSize: '1.1em',
    fontWeight: 'normal',
    color: 'rgba(255, 255, 255, 0.8)'
    // Podríamos añadir el icono de libro aquí
  };

  const filterButtonStyle = {
    backgroundColor: '#353535',
    border: '1px solid #555',
    borderRadius: '50%', // Botón redondo
    color: '#D7B615', // Icono dorado
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  };

  return (
    <div style={headerStyle}>
      {/* Título y botón eliminados */}
    </div>
  );
}

export default SectionHeader; 