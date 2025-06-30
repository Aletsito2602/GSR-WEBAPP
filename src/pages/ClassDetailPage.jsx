import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoArrowBack, IoHeart, IoHeartOutline, IoPlay, IoEyeOutline, IoTimeOutline } from 'react-icons/io5';
import Comments from '../components/Comments';

const ClassDetailPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  // Estados
  const [currentVideo, setCurrentVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('relacionados');

  // Datos simulados de ejemplo (en producción vendrían de la API)
  const sampleVideos = [
    {
      id: '1',
      title: 'Sesión 7: Bitácora del Trading',
      description: 'Aprende los fundamentos esenciales del trading con estrategias probadas.',
      duration: '45:32',
      views: '2.1k',
      date: '2024-01-15',
      progress: 30,
      imageUrl: 'https://placehold.co/600x400/2c2c2c/fff?text=Clase+7',
      videoUrl: 'https://player.vimeo.com/video/sample',
      instructor: 'Mr. Isaac Ramírez',
      level: 'Intermedio'
    },
    {
      id: '2', 
      title: 'Sesión 6: Gestión de Riesgo',
      description: 'Domina las técnicas de gestión de riesgo para proteger tu capital.',
      duration: '38:15',
      views: '1.8k',
      date: '2024-01-12',
      progress: 30,
      imageUrl: 'https://placehold.co/600x400/2c2c2c/fff?text=Clase+6',
      videoUrl: 'https://player.vimeo.com/video/sample2',
      instructor: 'Mr. Isaac Ramírez',
      level: 'Intermedio'
    },
    {
      id: '3',
      title: 'Sesión 5: Análisis Técnico Avanzado', 
      description: 'Profundiza en patrones gráficos y indicadores técnicos avanzados.',
      duration: '52:08',
      views: '2.3k',
      date: '2024-01-10',
      progress: 30,
      imageUrl: 'https://placehold.co/600x400/2c2c2c/fff?text=Clase+5',
      videoUrl: 'https://player.vimeo.com/video/sample3',
      instructor: 'Mr. Isaac Ramírez',
      level: 'Avanzado'
    },
    {
      id: '4',
      title: 'Sesión 4: Riesgo',
      description: 'Estrategias de control de riesgo y money management.',
      duration: '41:22',
      views: '1.9k', 
      date: '2024-01-08',
      progress: 30,
      imageUrl: 'https://placehold.co/600x400/2c2c2c/fff?text=Clase+4',
      videoUrl: 'https://player.vimeo.com/video/sample4',
      instructor: 'Mr. Isaac Ramírez',
      level: 'Intermedio'
    }
  ];

  useEffect(() => {
    // Simular carga de datos
    setLoading(true);
         setTimeout(() => {
       const video = sampleVideos.find(v => v.id === classId) || sampleVideos[0];
       setCurrentVideo(video);
       setRelatedVideos(sampleVideos.filter(v => v.id !== video.id));
       setLoading(false);
     }, 500);
   }, [classId]);

  const handleVideoSelect = (video) => {
    navigate(`/clases/${video.id}`);
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  if (loading) {
    return (
      <div className="class-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando clase...</p>
        </div>
      </div>
    );
  }

  if (!currentVideo) {
    return (
      <div className="class-detail-page">
        <div className="error-container">
          <p>Video no encontrado</p>
          <button onClick={() => navigate('/')}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div className="class-detail-page">
      {/* Header con navegación */}
      <div className="detail-header">
                 <button className="back-button" onClick={() => navigate(-1)}>
           <IoArrowBack />
         </button>
         <h1 className="header-title">{currentVideo.title}</h1>
      </div>

      {/* Video Player */}
      <div className="video-container">
                 <div className="video-player">
           <iframe
             src={`https://player.vimeo.com/video/${currentVideo.id}`}
             title={currentVideo.title}
             frameBorder="0"
             allow="autoplay; fullscreen; picture-in-picture"
             allowFullScreen
           ></iframe>
         </div>
        
        {/* Video Info */}
        <div className="video-info">
          <div className="video-main-info">
            <h2 className="video-title">{currentVideo.title}</h2>
            <div className="video-meta">
              <span className="video-stats">
                <IoEyeOutline /> {currentVideo.views} vistas
              </span>
              <span className="video-stats">
                <IoTimeOutline /> {currentVideo.duration}
              </span>
              <span className="video-level">{currentVideo.level}</span>
            </div>
          </div>

          <div className="video-actions">
            <button 
              className={`like-button ${isLiked ? 'liked' : ''}`}
              onClick={toggleLike}
            >
              {isLiked ? <IoHeart /> : <IoHeartOutline />}
              <span>{isLiked ? 'Te gusta' : 'Me gusta'}</span>
            </button>
          </div>
        </div>

        

        {/* Instructor Info */}
        <div className="instructor-info">
          <div className="instructor-avatar">
            <img src="https://via.placeholder.com/40" alt={currentVideo.instructor} />
          </div>
          <div className="instructor-details">
            <h3 className="instructor-name">{currentVideo.instructor}</h3>
            <p className="instructor-title">Instructor Principal</p>
          </div>
        </div>

        {/* Description */}
        <div className="video-description">
          <p>{currentVideo.description}</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-container">
        <div className="tabs-nav">
          <button 
            className={`tab-button ${activeTab === 'relacionados' ? 'active' : ''}`}
            onClick={() => setActiveTab('relacionados')}
          >
            Videos relacionados
          </button>
          <button 
            className={`tab-button ${activeTab === 'comentarios' ? 'active' : ''}`}
            onClick={() => setActiveTab('comentarios')}
          >
            Comentarios
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'relacionados' && (
            <div className="related-videos">
              <div className="videos-grid">
                {relatedVideos.map(video => (
                  <div 
                    key={video.id} 
                    className="related-video-card"
                    onClick={() => handleVideoSelect(video)}
                  >
                    <div className="video-thumbnail">
                      <img src={video.imageUrl} alt={video.title} />
                      <div className="play-overlay">
                        <IoPlay />
                      </div>
                      <div className="video-duration">{video.duration}</div>
                    </div>
                    <div className="video-card-info">
                      <h4 className="video-card-title">{video.title}</h4>
                      <p className="video-card-meta">
                        {video.views} vistas • {video.level}
                      </p>
                      <div className="video-progress">
                        <div className="progress-bar-small">
                          <div 
                            className="progress-fill-small"
                            style={{ width: `${video.progress}%` }}
                          ></div>
                        </div>
                        <span className="progress-text-small">{video.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

                     {activeTab === 'comentarios' && (
             <div className="comments-section">
               <Comments postId={`clase_${currentVideo.id}`} />
             </div>
           )}
        </div>
      </div>

      <style jsx>{`
        /* BASE MOBILE-FIRST STYLES */
        .class-detail-page {
          min-height: 100vh;
          background: #1a1a1a;
          color: #ffffff;
          font-family: 'Inter', 'SF Pro Display', -apple-system, sans-serif;
        }

        /* Header */
        .detail-header {
          display: none; /* Oculto en móvil */
        }

        .back-button {
          background: #3a3a3a;
          border: none;
          border-radius: 12px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .back-button:hover {
          background: #4a4a4a;
          transform: scale(1.05);
        }

                 .header-title {
           font-size: 18px;
           font-weight: 600;
           margin: 0;
           flex: 1;
           text-align: center;
           overflow: hidden;
           text-overflow: ellipsis;
           white-space: nowrap;
           padding: 0 8px;
         }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          background: #3a3a3a;
          border: none;
          border-radius: 12px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: #4a4a4a;
        }

        /* Video Container */
        .video-container {
          padding: 0 16px 24px 16px;
        }

        .video-player {
          position: relative;
          width: 100%;
          height: 0;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
          margin-bottom: 20px;
          border-radius: 12px;
          overflow: hidden;
          background: #000;
        }

        .video-player iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        /* Video Info */
        .video-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          gap: 16px;
        }

        .video-main-info {
          flex: 1;
          min-width: 0;
        }

        .video-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 8px 0;
          line-height: 1.3;
        }

        .video-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: center;
        }

        .video-stats {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #aaa;
          font-size: 14px;
        }

        .video-level {
          background: linear-gradient(135deg, #F0B90B, #FFD700);
          color: #000;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .video-actions {
          flex-shrink: 0;
        }

        .like-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #3a3a3a;
          border: none;
          border-radius: 25px;
          padding: 10px 16px;
          color: #ffffff;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 100px;
          justify-content: center;
        }

        .like-button:hover {
          background: #4a4a4a;
        }

        .like-button.liked {
          background: linear-gradient(135deg, #F0B90B, #FFD700);
          color: #000;
        }

        

        /* Instructor */
        .instructor-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .instructor-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          overflow: hidden;
          background: #3a3a3a;
        }

        .instructor-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .instructor-name {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
          color: #ffffff;
        }

        .instructor-title {
          font-size: 14px;
          color: #F0B90B;
          margin: 0;
        }

        /* Description */
        .video-description {
          margin-bottom: 24px;
        }

        .video-description p {
          color: #cccccc;
          line-height: 1.5;
          margin: 0;
        }

                 /* Tabs */
         .tabs-container {
           background: transparent;
           border-top: 1px solid #3a3a3a;
         }

         .tabs-nav {
           display: flex;
           border-bottom: 1px solid #3a3a3a;
         }

        .tab-button {
          flex: 1;
          background: none;
          border: none;
          padding: 16px 20px;
          color: #aaa;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 3px solid transparent;
        }

        .tab-button.active {
          color: #F0B90B;
          border-bottom-color: #F0B90B;
        }

        .tab-button:hover {
          color: #ffffff;
        }

                 .tab-content {
           padding: 24px 16px;
           background: transparent;
         }

        /* Related Videos */
        .videos-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

                 .related-video-card {
           display: flex;
           background: transparent;
           border-radius: 12px;
           overflow: hidden;
           cursor: pointer;
           transition: all 0.2s ease;
         }

         .related-video-card:hover {
           background: rgba(255, 255, 255, 0.05);
           transform: translateY(-2px);
         }

        .video-thumbnail {
          position: relative;
          width: 120px;
          height: 68px;
          flex-shrink: 0;
          background: #3a3a3a;
        }

        .video-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .play-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.5);
          color: #ffffff;
          font-size: 20px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .related-video-card:hover .play-overlay {
          opacity: 1;
        }

        .video-duration {
          position: absolute;
          bottom: 4px;
          right: 4px;
          background: rgba(0, 0, 0, 0.8);
          color: #ffffff;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        .video-card-info {
          flex: 1;
          padding: 12px 16px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .video-card-title {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 4px 0;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .video-card-meta {
          font-size: 12px;
          color: #aaa;
          margin: 0 0 8px 0;
        }

        .video-progress {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .progress-bar-small {
          flex: 1;
          height: 3px;
          background: #3a3a3a;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill-small {
          height: 100%;
          background: linear-gradient(90deg, #F0B90B, #FFD700);
          border-radius: 2px;
        }

        .progress-text-small {
          font-size: 11px;
          color: #aaa;
          min-width: 30px;
        }

        /* Comments */
        .comments-section {
          min-height: 400px;
        }

        /* Loading & Error States */
        .loading-container,
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          text-align: center;
          color: #aaa;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #3a3a3a;
          border-top: 3px solid #F0B90B;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* TABLET STYLES */
        @media (min-width: 768px) {
          .detail-header {
            display: flex; /* Mostrar en tablet */
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px;
            background: #2a2a2a;
            border-bottom: 1px solid #3a3a3a;
            position: sticky;
            top: 70px;
            z-index: 100;
          }

                     .header-title {
             font-size: 22px;
             white-space: normal;
             text-overflow: unset;
             overflow: visible;
           }

          .video-container {
            padding: 0 24px 32px 24px;
          }

          .video-title {
            font-size: 24px;
          }

          .video-meta {
            gap: 20px;
          }

          .video-stats {
            font-size: 15px;
          }

          .videos-grid {
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }

          .video-thumbnail {
            width: 160px;
            height: 90px;
          }

          .video-card-title {
            font-size: 15px;
          }

          .tab-content {
            padding: 32px 24px;
          }
        }

        /* DESKTOP STYLES */
        @media (min-width: 1024px) {
          .class-detail-page {
            max-width: 1200px;
            margin: 0 auto;
            background: #222;
            margin-top: 80px;
            margin-bottom: 40px;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }

          .detail-header {
            display: flex; /* Mostrar en desktop */
            align-items: center;
            justify-content: space-between;
            padding: 32px 48px;
            background: #2a2a2a;
            border-bottom: 1px solid #3a3a3a;
            border-radius: 24px 24px 0 0;
            position: sticky;
            top: 70px;
            z-index: 100;
          }

                     .header-title {
             font-size: 24px;
             white-space: normal;
             text-overflow: unset;
             overflow: visible;
           }

          .video-container {
            padding: 0 48px 40px 48px;
          }

          .video-player {
            border-radius: 16px;
            margin-bottom: 32px;
          }

          .video-title {
            font-size: 28px;
          }

          .instructor-info {
            margin-bottom: 32px;
          }

          .instructor-avatar {
            width: 56px;
            height: 56px;
          }

          .instructor-name {
            font-size: 18px;
          }

          .videos-grid {
            grid-template-columns: 1fr 1fr 1fr;
            gap: 24px;
          }

          .video-thumbnail {
            width: 200px;
            height: 112px;
          }

          .video-card-title {
            font-size: 16px;
          }

          .tab-content {
            padding: 40px 48px;
          }
        }
      `}</style>
    </div>
  );
};

export default ClassDetailPage; 