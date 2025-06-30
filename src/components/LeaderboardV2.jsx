import React, { useState } from 'react';
import { FaTrophy } from 'react-icons/fa';
import RankedUserItemV2 from './RankedUserItemV2';
import './LeaderboardV2.css';

const LeaderboardV2 = ({ users }) => {
  const [filter, setFilter] = useState('total'); // 'total' o 'mensual'

  // Por ahora, solo mostramos el ranking total. La lógica para 'mensual' se puede añadir después.
  const filteredUsers = users;

  return (
    <div className="leaderboard-v2-container">
      <div className="leaderboard-header">
        <FaTrophy className="trophy-icon" />
        <h3 className="leaderboard-title">Primeros 10 Lugares</h3>
      </div>
      <div className="leaderboard-filters">
        <button
          className={`filter-button ${filter === 'total' ? 'active' : ''}`}
          onClick={() => setFilter('total')}
        >
          Total
        </button>
        <button
          className={`filter-button ${filter === 'mensual' ? 'active' : ''}`}
          onClick={() => setFilter('mensual')}
        >
          Mensual
        </button>
      </div>
      <div className="leaderboard-list">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <RankedUserItemV2 key={user.id} user={user} />
          ))
        ) : (
          <p>No hay usuarios en el ranking.</p>
        )}
      </div>
    </div>
  );
};

export default LeaderboardV2; 