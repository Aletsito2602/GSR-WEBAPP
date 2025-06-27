import React, { useState } from 'react';
import { FaMapMarkerAlt, FaUserCircle, FaSearch, FaFilter } from 'react-icons/fa';

const mockMembers = [
  {
    id: 1,
    name: 'Laura Paz',
    username: '@laurapaz64',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    quote: '“Nunca juzgamos nuestro presente cuando comprendemos que debemos transitarlo para llegar a donde esperamos”',
    status: 'online',
    lastActive: 'En línea',
    location: 'Argentina',
  },
  {
    id: 2,
    name: 'Samantha Díaz',
    username: '@samdiaz',
    avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
    quote: 'Apasionada por la superación personal y comprometida con transformar mis finanzas. Cada operación es un paso más hacia la libertad financiera',
    status: 'away',
    lastActive: 'Activo hace 10 min',
    location: 'Argentina',
  },
  // Agrega más miembros aquí
];

const MemberCard = ({ member }) => (
  <div style={{ background: '#2c2c2c', borderRadius: '16px', padding: '24px', color: '#fff', fontFamily: 'Poppins, sans-serif' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
      <img src={member.avatar} alt={member.name} style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
      <div>
        <h3 style={{ margin: 0 }}>{member.name}</h3>
        <p style={{ margin: 0, color: '#aaa', fontSize: '14px' }}>{member.username}</p>
      </div>
    </div>
    <p style={{ fontStyle: 'italic', color: '#ccc', minHeight: '60px' }}>{member.quote}</p>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: member.status === 'online' ? '#32CD32' : '#777' }}></div>
        <span style={{ color: '#aaa', fontSize: '14px' }}>{member.lastActive}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', fontSize: '14px' }}>
        <FaMapMarkerAlt /> {member.location}
      </div>
    </div>
    <button style={{ width: '100%', background: '#444', border: '1px solid #555', color: '#fff', padding: '12px', borderRadius: '12px', marginTop: '24px', cursor: 'pointer', fontWeight: '600' }}>
      Ver perfil
    </button>
  </div>
);

function MembersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');

  const filters = ['Todos', 'Nuevos', 'Populares', 'Activos'];

  const filteredMembers = mockMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
    // Lógica de filtro (por ahora solo busca)
    return matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                background: activeFilter === filter ? '#D7B615' : '#3c3c3c',
                color: activeFilter === filter ? '#1a1a1a' : '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              {filter}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FaSearch style={{ position: 'absolute', left: '12px', color: '#888' }} />
            <input
              type="text"
              placeholder="Buscar miembro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: '#2c2c2c',
                border: '1px solid #444',
                borderRadius: '20px',
                padding: '8px 16px 8px 36px',
                color: '#fff'
              }}
            />
          </div>
          <button style={{
            background: '#3c3c3c',
            border: 'none',
            color: '#fff',
            padding: '10px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
            <FaFilter />
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px'
      }}>
        {filteredMembers.map(member => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}

export default MembersPage; 