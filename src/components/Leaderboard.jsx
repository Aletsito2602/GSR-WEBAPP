import React, { useState } from 'react';
import './Leaderboard.css';
import RankedUserItem from './RankedUserItem';
import { FaTrophy } from 'react-icons/fa';

const Leaderboard = ({ rankedUsers }) => {
  const [activeTab, setActiveTab] = useState('Total');

  const defaultUsers = [
    { id: 1, avatarUrl: 'https://i.pravatar.cc/150?u=samantha', name: 'Samantha Díaz', rankDescription: 'Primer lugar', isFavorite: false },
    { id: 2, avatarUrl: 'https://i.pravatar.cc/150?u=jose', name: 'José Ramos', rankDescription: 'Segundo lugar', isFavorite: true },
    { id: 3, avatarUrl: 'https://i.pravatar.cc/150?u=miguel', name: 'Miguel Ángel', rankDescription: 'Tercer lugar', isFavorite: false },
    { id: 4, avatarUrl: 'https://i.pravatar.cc/150?u=laura', name: 'Laura Paz', rankDescription: 'Cuarto lugar', isFavorite: false },
  ];

  const displayUsers = rankedUsers || defaultUsers;

  return (
    <div className="leaderboard">
      <div className="leaderboard__header">
        <FaTrophy className="leaderboard__trophy-icon" />
        <h2 className="leaderboard__title">Primeros 10 Lugares</h2>
      </div>

      <div className="leaderboard__tabs">
        <button
          className={`leaderboard__tab-btn ${activeTab === 'Total' ? 'active' : ''}`}
          onClick={() => setActiveTab('Total')}
        >
          Total
        </button>
        <button
          className={`leaderboard__tab-btn ${activeTab === 'Mensual' ? 'active' : ''}`}
          onClick={() => setActiveTab('Mensual')}
        >
          Mensual
        </button>
      </div>

      <div className="leaderboard__list">
        {displayUsers.map(user => (
          <RankedUserItem key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
};

export default Leaderboard; 