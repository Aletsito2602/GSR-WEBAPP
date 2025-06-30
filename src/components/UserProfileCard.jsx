import React from 'react';
import './UserProfileCard.css';
import { FaQuestionCircle } from 'react-icons/fa';

const UserProfileCard = ({
  userAvatarUrl,
  userName,
  userLevel,
  pointsToNextLevel,
}) => {
  return (
    <div className="user-profile-card">
      <div className="user-profile-card__avatar-container">
        <img src={userAvatarUrl} alt={userName} className="user-profile-card__avatar" />
        <div className="user-profile-card__level-badge">
          <span>{userLevel}</span>
        </div>
      </div>
      <h1 className="user-profile-card__name">{userName}</h1>
      <p className="user-profile-card__level">Nivel {userLevel}</p>
      <div className="user-profile-card__progress">
        <span>{pointsToNextLevel} puntos para subir de nivel</span>
        <FaQuestionCircle className="user-profile-card__help-icon" />
      </div>
    </div>
  );
};

export default UserProfileCard; 