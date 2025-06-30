import React from 'react';
import RoadmapNodeCard from './RoadmapNodeCard';
import './Roadmap.css';

const Roadmap = ({ title, nodes }) => {
  return (
    <div className="roadmap-container">
      <h1 className="roadmap-title">{title}</h1>
      <div className="roadmap-nodes-list">
        {nodes.map((node, index) => (
          <RoadmapNodeCard 
            key={node.id} 
            node={node}
            isLast={index === nodes.length - 1} 
          />
        ))}
      </div>
    </div>
  );
};

export default Roadmap; 