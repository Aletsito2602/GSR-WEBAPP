import React from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import './UserProfileCardV2.css';

const UserProfileCardV2 = ({ user, onInfoClick }) => {
  if (!user) {
    return null;
  }

  const { name, level, pointsToNextLevel, avatarUrl, position } = user;

  return (
    <div className="user-profile-card-v2">
      <div className="profile-avatar-container">
        <img src={avatarUrl} alt={`Avatar de ${name}`} className="profile-avatar" />
        <span className="profile-level-badge">{level}</span>
      </div>
      <div className="profile-info">
        <h2 className="profile-name">{name}</h2>
        <p className="profile-level">Nivel {level}</p>
        <p className="profile-points">
          {pointsToNextLevel} puntos para subir de nivel
          <button onClick={onInfoClick} className="points-info-button">
            <FaQuestionCircle />
          </button>
        </p>
      </div>
    </div>
  );
};

export default UserProfileCardV2; 