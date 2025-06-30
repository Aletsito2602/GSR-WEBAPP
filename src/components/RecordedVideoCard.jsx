import React from 'react';
import './RecordedVideoCard.css';
import { FaPlay } from 'react-icons/fa';

const RecordedVideoCard = ({ imageUrl, title, onPress }) => {
  return (
    <div className="recorded-video-card" onClick={onPress}>
      <div className="recorded-video-card__image-container">
        <img src={imageUrl} alt={title} className="recorded-video-card__image" />
        <div className="recorded-video-card__play-overlay">
          <FaPlay className="recorded-video-card__play-icon" />
        </div>
      </div>
      <div className="recorded-video-card__content">
        <h3 className="recorded-video-card__title">{title}</h3>
      </div>
    </div>
  );
};

export default RecordedVideoCard; 