import React from 'react';
import './LevelProgressionList.css';
import { FaLock } from 'react-icons/fa';

const LevelProgressionList = ({ levels }) => {
  const defaultLevels = [
    { level: 1, isLocked: false, description: '90% de miembros' },
    { level: 2, isLocked: true, description: "Desbloquea 'chat con miembros'" },
    { level: 3, isLocked: true, description: '1% de miembros' },
    { level: 4, isLocked: true, description: '0% de miembros' },
  ];

  const displayLevels = levels || defaultLevels;

  return (
    <div className="level-progression-list">
      {displayLevels.map((item) => (
        <div key={item.level} className="level-progression-item">
          <div className="level-progression-item__header">
            <span className="level-progression-item__level-name">Nivel {item.level}</span>
            {item.isLocked && <FaLock className="level-progression-item__lock-icon" />}
          </div>
          <p className="level-progression-item__description">{item.description}</p>
        </div>
      ))}
    </div>
  );
};

export default LevelProgressionList; 