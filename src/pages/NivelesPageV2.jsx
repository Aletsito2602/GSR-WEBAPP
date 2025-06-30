import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig'; // Import db
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'; // Import firestore functions
import UserProfileCardV2 from '../components/UserProfileCardV2';
import LevelProgressionListV2 from '../components/LevelProgressionListV2';
import LeaderboardV2 from '../components/LeaderboardV2';
import Modal from '../components/Modal';
import { FaInfoCircle } from 'react-icons/fa';
import './NivelesPageV2.css';

// --- Mock Data ---
const mockUser = {
  name: 'Laura Paz Canto',
  level: 1,
  pointsToNextLevel: 5,
  avatarUrl: 'https://i.pravatar.cc/150?u=laura',
  position: 1,
};

const mockLevels = [
  { number: 1, description: '90% de miembros', isLocked: false },
  { number: 2, description: 'Desbloquea "chat con miembros"', isLocked: true },
  { number: 3, description: '1% de miembros', isLocked: true },
  { number: 4, description: '1% de miembros', isLocked: true },
  { number: 5, description: '1% de miembros', isLocked: true },
  { number: 6, description: '1% de miembros', isLocked: true },
  { number: 7, description: '1% de miembros', isLocked: true },
  { number: 8, description: '0% de miembros', isLocked: true },
  { number: 9, description: '0% de miembros', isLocked: true },
];

const mockLeaderboardUsers = [
  { id: 1, name: 'Samantha Díaz', rank: 'Primer lugar', avatarUrl: 'https://i.pravatar.cc/150?u=samantha' },
  { id: 2, name: 'José Ramos', rank: 'Segundo lugar', avatarUrl: 'https://i.pravatar.cc/150?u=jose' },
  { id: 3, name: 'Ana López', rank: 'Tercer lugar', avatarUrl: 'https://i.pravatar.cc/150?u=ana' },
  { id: 4, name: 'Valeria Gómez', rank: 'Cuarto lugar', avatarUrl: 'https://i.pravatar.cc/150?u=valeria' },
  { id: 5, name: 'José Ramos', rank: 'Quinto lugar', avatarUrl: 'https://i.pravatar.cc/150?u=jose2' },
];
// --- End Mock Data ---

const NivelesPageV2 = () => {
  const [isScoreModalOpen, setScoreModalOpen] = useState(false);
  const [leaderboardUsers, setLeaderboardUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos del leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('points', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        
        const users = querySnapshot.docs.map((doc, index) => ({
          id: doc.id,
          name: doc.data().displayName || 'Usuario Anónimo',
          rank: `${index + 1}º lugar`, // Generar el rango dinámicamente
          avatarUrl: doc.data().photoURL || `https://i.pravatar.cc/150?u=${doc.id}`,
          ...doc.data(),
        }));
        
        setLeaderboardUsers(users);
      } catch (error) {
        console.error("Error fetching leaderboard: ", error);
        // Opcional: manejar estado de error
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="niveles-page-v2">
      <UserProfileCardV2 user={mockUser} onInfoClick={() => setScoreModalOpen(true)} />
      
      <div className="niveles-header">
        <span className="position-info">Estás en la posición {mockUser.position}</span>
        <span className="last-updated">Última actualización: 6 Ene, 2025, 8 pm</span>
      </div>

      <div className="niveles-content-grid">
        <div className="niveles-progression-column">
          <LevelProgressionListV2 levels={mockLevels} />
        </div>
        <div className="niveles-leaderboard-column">
          {loading ? (
            <div>Cargando Top 10...</div>
          ) : (
            <LeaderboardV2 users={leaderboardUsers} />
          )}
        </div>
      </div>

      <Modal isOpen={isScoreModalOpen} onClose={() => setScoreModalOpen(false)}>
        <div className="score-modal-content">
          <button className="modal-close-button" onClick={() => setScoreModalOpen(false)}>&times;</button>
          <h2>Puntaje</h2>
          
          <div className="score-section">
            <h3>Puntos</h3>
            <p>
              Ganas puntos cuando otros miembros dan "me gusta" a tus publicaciones o comentarios. 1 me gusta = 1 punto. Esto motiva a los usuarios a crear contenido de calidad e interactuar con otros miembros de su comunidad.
            </p>
          </div>

          <div className="score-section">
            <h3>Niveles</h3>
            <p>
              A medida que ganes puntos, subes de nivel. Tu nivel se muestra en la esquina inferior derecha de tu foto, en la sección de niveles. En esta sección también se muestra la cantidad de puntos necesarios para alcanzar el siguiente nivel.
            </p>
          </div>

          <div className="levels-grid">
            <span>Nivel 1: 0 puntos</span>
            <span>Nivel 6: 515 puntos</span>
            <span>Nivel 2: 5 puntos</span>
            <span>Nivel 7: 2015 puntos</span>
            <span>Nivel 3: 20 puntos</span>
            <span>Nivel 8: 8015 puntos</span>
            <span>Nivel 4: 65 puntos</span>
            <span>Nivel 9: 33015 puntos</span>
            <span>Nivel 5: 155 puntos</span>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NivelesPageV2; 