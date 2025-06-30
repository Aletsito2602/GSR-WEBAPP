import React from 'react';
import { FaLock } from 'react-icons/fa';
import './LevelProgressionListV2.css';

const LevelProgressionListV2 = ({ levels }) => {
  return (
    <div className="level-progression-list-v2">
      {levels.map((level, index) => (
        <React.Fragment key={index}>
          <div className="level-item">
            <div className="level-info">
              <span className="level-title">Nivel {level.number}</span>
              {level.isLocked && <FaLock className="level-lock-icon" />}
            </div>
            <p className="level-description">{level.description}</p>
          </div>
          {index < levels.length - 1 && <hr className="level-divider" />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default LevelProgressionListV2; 