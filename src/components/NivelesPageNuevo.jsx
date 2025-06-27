import React, { useState } from 'react';
import { FaLock, FaTrophy, FaStar, FaQuestionCircle } from 'react-icons/fa';

// --- Mock Data ---
const currentUserData = {
  name: 'Laura Paz Canto',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80',
  level: 1,
  position: 1,
  pointsToNextLevel: 5,
};

const levels = [
  { level: 1, membersPercent: 90, unlocked: true, reward: '' },
  { level: 2, membersPercent: 0, unlocked: false, reward: 'Desbloquea "chat con miembros"' },
  { level: 3, membersPercent: 1, unlocked: false, reward: '' },
  { level: 4, membersPercent: 1, unlocked: false, reward: '' },
  { level: 5, membersPercent: 1, unlocked: false, reward: '' },
  { level: 6, membersPercent: 1, unlocked: false, reward: '' },
  { level: 7, membersPercent: 1, unlocked: false, reward: '' },
  { level: 8, membersPercent: 0, unlocked: false, reward: '' },
  { level: 9, membersPercent: 0, unlocked: false, reward: '' },
];

const leaderboardData = {
  total: [
    { rank: 1, name: 'Samantha Díaz', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
    { rank: 2, name: 'José Ramos', avatar: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=100&q=80' },
    { rank: 3, name: 'Ana López', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80' },
    { rank: 4, name: 'Valeria Gómez', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80' },
  ],
  mensual: [
    { rank: 1, name: 'José Ramos', avatar: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=100&q=80' },
    { rank: 2, name: 'Laura Paz Canto', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80' },
    { rank: 3, name: 'Samantha Díaz', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
  ],
};

const rankSuffix = (rank) => {
    switch(rank) {
        case 1: return 'Primer lugar';
        case 2: return 'Segundo lugar';
        case 3: return 'Tercer lugar';
        default: return `${rank}º lugar`;
    }
}


// --- Sub-components ---
const UserProfileCard = ({ user }) => (
    <div style={{ background: '#2c2c2c', borderRadius: '16px', padding: '24px', position: 'relative', marginBottom: '24px' }}>
        <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)' }}>
            <img src={user.avatar} alt={user.name} style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid #1e1e1e' }} />
            <div style={{
                position: 'absolute', bottom: '0', right: '0', background: '#D7B615', color: '#1a1a1a',
                borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 'bold', border: '2px solid #1e1e1e', fontSize: '14px'
            }}>{user.level}</div>
        </div>
        <div style={{ paddingTop: '40px' }}>
            <h2 style={{ margin: '0 0 4px 0', color: '#D7B615', fontSize: '22px' }}>{user.name}</h2>
            <p style={{ margin: 0, color: '#ccc', fontSize: '16px' }}>Nivel {user.level}</p>
            <p style={{ margin: '8px 0 0', color: '#888', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {user.pointsToNextLevel} puntos para subir de nivel <FaQuestionCircle />
            </p>
        </div>
    </div>
);

const LevelItem = ({ levelInfo }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0' }}>
        <div style={{ color: '#D7B615' }}>
            <FaLock color={levelInfo.unlocked ? '#D7B615' : '#555'} />
        </div>
        <div style={{ flexGrow: 1 }}>
            <p style={{ margin: 0, fontWeight: 600, color: '#fff' }}>Nivel {levelInfo.level}</p>
            {levelInfo.reward ? (
                 <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#888' }}>{levelInfo.reward}</p>
            ) : null}
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>{levelInfo.membersPercent}% de miembros</p>
    </div>
);

const Leaderboard = ({ data, activeTab, onTabChange }) => (
    <div style={{ background: '#2c2c2c', borderRadius: '16px', padding: '24px', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaTrophy color="#D7B615" /> Primeros 10 Lugares
            </h3>
            <div style={{ background: '#1e1e1e', borderRadius: '20px', padding: '4px' }}>
                <button
                    onClick={() => onTabChange('total')}
                    style={{ background: activeTab === 'total' ? '#3c3c3c' : 'transparent', color: '#fff', border: 'none', borderRadius: '18px', padding: '6px 14px', cursor: 'pointer' }}>
                    Total
                </button>
                <button
                    onClick={() => onTabChange('mensual')}
                    style={{ background: activeTab === 'mensual' ? '#3c3c3c' : 'transparent', color: '#fff', border: 'none', borderRadius: '18px', padding: '6px 14px', cursor: 'pointer' }}>
                    Mensual
                </button>
            </div>
        </div>

        <div>
            {data.map((player) => (
                <div key={player.rank} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#3c3c3c', borderRadius: '12px', padding: '12px', marginBottom: '8px' }}>
                    <img src={player.avatar} alt={player.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                    <div style={{ flexGrow: 1 }}>
                        <p style={{ margin: 0, fontWeight: 600, color: '#fff' }}>{player.name}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#aaa' }}>{rankSuffix(player.rank)}</p>
                    </div>
                    <FaStar color="#555" />
                </div>
            ))}
        </div>
    </div>
);


// --- Main Component ---
function NivelesPageNuevo() {
    const [leaderboardTab, setLeaderboardTab] = useState('total');

    return (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '20px', fontFamily: 'Poppins, sans-serif' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '24px', color: '#888', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Estás en la <strong style={{ color: '#fff' }}>posición {currentUserData.position}</strong></span>
                <span>Última actualización: 6 Ene, 2025, 8 pm</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', alignItems: 'start' }}>
                
                {/* Left Column */}
                <div style={{ marginTop: '40px' }}>
                    <UserProfileCard user={currentUserData} />
                    <div style={{ background: '#2c2c2c', borderRadius: '16px', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {levels.map((level) => (
                           <React.Fragment key={level.level}>
                             <LevelItem levelInfo={level} />
                             {level.level < levels.length && <hr style={{ border: 0, borderTop: '1px solid #3c3c3c', margin: '0' }} />}
                           </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Right Column */}
                <div>
                    <Leaderboard
                        data={leaderboardData[leaderboardTab]}
                        activeTab={leaderboardTab}
                        onTabChange={setLeaderboardTab}
                    />
                </div>
            </div>
        </div>
    );
}

export default NivelesPageNuevo; 