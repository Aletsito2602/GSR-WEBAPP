import React from 'react';
import './NivelesPageNuevo.css';
import UserProfileCard from './UserProfileCard';
import LevelProgressionList from './LevelProgressionList';
import Leaderboard from './Leaderboard';

const NivelesPageNuevo = () => {
  const rankingInfo = {
    position: 'Estás en la posición 1',
    lastUpdated: 'Última actualización: 6 Ene, 2025, 8 pm',
};

  return (
    <div className="niveles-page">
      <div className="niveles-page__main-layout">
        <UserProfileCard
          userAvatarUrl="https://i.pravatar.cc/150?u=laura"
          userName="Laura Paz Canto"
          userLevel={1}
          pointsToNextLevel={5}
        />
        <div className="ranking-info">
          <span>{rankingInfo.position}</span>
          <span>{rankingInfo.lastUpdated}</span>
        </div>
        
        <div className="niveles-page__bottom-section">
          <div className="niveles-page__left-column">
            <LevelProgressionList />
        </div>
          <div className="niveles-page__right-column">
            <Leaderboard />
            </div>
        </div>
        </div>
    </div>
);
};

export default NivelesPageNuevo; 