import React from 'react';
import { FaCheck, FaPlay, FaLock } from 'react-icons/fa';
import './RoadmapNodeCard.css';

const RoadmapNodeCard = ({ node, isLast }) => {
  const { title, description, status, progress, onNodeClick } = node;

  const getIcon = () => {
    switch (status) {
      case 'completed':
        return <FaCheck />;
      case 'active':
        return <FaPlay />;
      case 'locked':
        return <FaLock />;
      default:
        return null;
    }
  };

  return (
    <div className="roadmap-node-container">
      <div className="roadmap-node-icon-wrapper">
        <div className={`roadmap-node-icon status-${status}`} onClick={onNodeClick}>
          {getIcon()}
        </div>
        {!isLast && <div className={`connector-line status-${status}`}></div>}
      </div>
      <div className={`roadmap-node-card status-${status}`} onClick={onNodeClick}>
        <div className="card-content">
          <h3 className="card-title">{title}</h3>
          <p className="card-description">{description}</p>
          {typeof progress === 'number' && (
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoadmapNodeCard; 