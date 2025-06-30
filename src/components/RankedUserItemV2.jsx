import React from 'react';
import { FaStar } from 'react-icons/fa';
import './RankedUserItemV2.css';

const RankedUserItemV2 = ({ user }) => {
  const { name, rank, avatarUrl } = user;

  return (
    <div className="ranked-user-item-v2">
      <img src={avatarUrl} alt={`Avatar de ${name}`} className="ranked-user-avatar" />
      <div className="ranked-user-info">
        <p className="ranked-user-name">{name}</p>
        <p className="ranked-user-rank">{rank}</p>
      </div>
      <FaStar className="ranked-user-star" />
    </div>
  );
};

export default RankedUserItemV2; 