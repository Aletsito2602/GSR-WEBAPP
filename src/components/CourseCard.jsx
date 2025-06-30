import React, { useState } from 'react';
import './CourseCard.css';
import { FaPlay, FaHeart } from 'react-icons/fa';

const CourseCard = ({
  imageUrl,
  title,
  description,
  progress,
  isFavorite: initialIsFavorite,
  onPress,
  onToggleFavorite,
  onPlayVideo,
  variant = 'default'
}) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    if (onToggleFavorite) {
      onToggleFavorite(newFavoriteState);
    }
  };

  const handlePlayVideo = (e) => {
    e.stopPropagation();
    if (onPlayVideo) {
      onPlayVideo();
    }
  };

  return (
    <div 
      className={`course-card ${variant}`} 
      onClick={onPress}
      style={{
        background: 'linear-gradient(to bottom, #222222 0%, #3C3C3C 100%)',
        borderRadius: '20px',
        fontFamily: 'Poppins, sans-serif'
      }}
    >
      <div className="course-card__image-container">
        <img src={imageUrl} alt={title} className="course-card__image" />
        {variant === 'default' && (
          <div className="course-card__play-button" onClick={handlePlayVideo}>
            <FaPlay />
          </div>
        )}
        <div className="course-card__favorite-button" onClick={handleToggleFavorite}>
          <FaHeart style={{ color: isFavorite ? 'var(--primary-color)' : 'white' }} />
        </div>
      </div>
      <div className="course-card__content">
        <h3 className="course-card__title" style={{ fontSize: '20px', fontFamily: 'Poppins, sans-serif' }}>{title}</h3>
        <p className="course-card__description" style={{ fontSize: '16px', fontFamily: 'Poppins, sans-serif', fontWeight: 'normal' }}>{description}</p>
        <div className="course-card__progress-bar-container">
          <div className="course-card__progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="course-card__progress-text">{progress}% completado</p>
      </div>
    </div>
  );
};

export default CourseCard; 