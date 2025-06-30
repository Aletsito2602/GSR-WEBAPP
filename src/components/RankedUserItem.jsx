import React, { useState } from 'react';
import './RankedUserItem.css';
import { FaStar } from 'react-icons/fa';

const RankedUserItem = ({ user }) => {
  const { avatarUrl, name, rankDescription, isFavorite: initialFavorite } = user;
  const [isFavorite, setIsFavorite] = useState(initialFavorite);

  return (
    <div className="ranked-user-item">
      <div className="ranked-user-item__main">
        <img src={avatarUrl} alt={name} className="ranked-user-item__avatar" />
        <div className="ranked-user-item__info">
          <span className="ranked-user-item__name">{name}</span>
          <span className="ranked-user-item__rank">{rankDescription}</span>
        </div>
      </div>
      <button 
        className="ranked-user-item__favorite-btn"
        onClick={() => setIsFavorite(!isFavorite)}
      >
        <FaStar style={{ color: isFavorite ? 'var(--accent-yellow)' : 'var(--text-white)' }} />
      </button>
    </div>
  );
};

export default RankedUserItem; 