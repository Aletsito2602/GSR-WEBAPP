import React from 'react';

// Estilos básicos en línea, se pueden mover a CSS si se prefiere
const buttonContainerStyle = {
  marginBottom: '20px',
  display: 'flex',
  flexWrap: 'wrap', // Permite que los botones pasen a la siguiente línea si no caben
  gap: '10px' // Espacio entre botones
};

const buttonStyle = {
  padding: '8px 16px',
  borderRadius: '20px', // Bordes redondeados
  border: '1px solid #555', // Borde sutil
  backgroundColor: '#333', // Fondo oscuro
  color: '#eee', // Texto claro
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const activeButtonStyle = {
  ...buttonStyle,
  borderColor: '#D7B615', // Borde dorado para el activo
  color: '#D7B615'
  // backgroundColor: '#444' // Opcional: ligero cambio de fondo para activo
};

// TODO: Implementar lógica de filtrado real si es necesario
function FilterButtons({ activeCategory, onCategoryChange }) { 
  // Definir los filtros disponibles aquí
  const filters = [
    { label: 'Chat', value: 'General' },
    { label: 'Anuncios', value: 'Anuncios' }
  ];

  return (
    <div style={buttonContainerStyle}>
      {filters.map(filter => (
        <button 
          key={filter.value}
          style={activeCategory === filter.value ? activeButtonStyle : buttonStyle}
          onClick={() => onCategoryChange ? onCategoryChange(filter.value) : console.log(`Filter selected: ${filter.value}`)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export default FilterButtons; 