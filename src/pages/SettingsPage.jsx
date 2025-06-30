import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown, FaPenSquare, FaMapMarkerAlt, FaLock, FaTrophy, FaCamera } from 'react-icons/fa';
import { BsCoin, BsPiggyBank, BsQuestionCircle } from 'react-icons/bs';
import { GiPodium } from 'react-icons/gi';
import { auth, db } from '../firebaseConfig';
import { signOut, updateProfile as updateAuthProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ImageUploader from '../components/ImageUploader';
import '../components/Modal.css';

const TABS = [
  { key: 'cuenta', label: 'Cuenta' },
  { key: 'afiliados', label: 'Afiliados' },
  { key: 'pagos', label: 'Pagos' },
  { key: 'configuracion', label: 'Configuración' },
];

// Componente para una fila de desplegable (acordeón)
const AccordionRow = ({ label, name, isOpen, onClick }) => (
  <div 
    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #2c2c2c', cursor: 'pointer' }}
    onClick={() => onClick(name)}
  >
    <span style={{ fontSize: '16px', color: '#fff' }}>{label}</span>
    <FaChevronDown style={{ color: '#D7B615', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
  </div>
);

// Componente para un campo de entrada (solo visualización)
const ProfileField = ({ label, value, hasDropdown = false }) => (
  <div style={{ flex: '1 1 48%' }}>
    <label style={{ fontSize: '14px', color: '#aaa', display: 'block', marginBottom: '8px' }}>{label}</label>
    <div style={{ background: '#2c2c2c', borderRadius: '20px', padding: '12px 16px', border: '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{value}</span>
      {hasDropdown && <FaChevronDown style={{ color: '#D7B615' }} />}
    </div>
  </div>
);

// --- Componente para la pestaña CUENTA ---
const CuentaTab = ({ user, onLogoutClick, isEditing, onEditToggle, onFormChange, formData, onSave, onCancel }) => {
  const [openAccordion, setOpenAccordion] = useState(null);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Buenos Aires, Argentina');
  
  const handleAccordionClick = (name) => setOpenAccordion(openAccordion === name ? null : name);

  const handleImageUploaded = (imageUrl) => {
    // Actualizar la foto en formData para que se refleje inmediatamente
    onFormChange({ target: { name: 'photoURL', value: imageUrl } });
    setShowImageUploader(false);
  };

  // Opciones para los diferentes accordions
  const myersBriggsOptions = [
    'INTJ - El Arquitecto', 'INTP - El Pensador', 'ENTJ - El Comandante', 'ENTP - El Visionario',
    'INFJ - El Abogado', 'INFP - El Mediador', 'ENFJ - El Protagonista', 'ENFP - El Activista',
    'ISTJ - El Logístico', 'ISFJ - El Protector', 'ESTJ - El Ejecutivo', 'ESFJ - El Cónsul',
    'ISTP - El Virtuoso', 'ISFP - El Aventurero', 'ESTP - El Emprendedor', 'ESFP - El Animador'
  ];

  const locationOptions = [
    'Buenos Aires, Argentina', 'Madrid, España', 'México DF, México', 'Lima, Perú',
    'Bogotá, Colombia', 'Santiago, Chile', 'Caracas, Venezuela', 'San José, Costa Rica',
    'Montevideo, Uruguay', 'Asunción, Paraguay', 'La Paz, Bolivia', 'Quito, Ecuador',
    'Ciudad de Panamá, Panamá', 'San Salvador, El Salvador', 'Tegucigalpa, Honduras',
    'Managua, Nicaragua', 'Guatemala, Guatemala', 'Santo Domingo, República Dominicana'
  ];

  if (!user) {
    return <div>Cargando datos del perfil...</div>;
  }
  
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <div 
          style={{ position: 'relative', cursor: 'pointer' }} 
          onClick={() => setShowImageUploader(true)}
          className="profile-photo-container"
        >
          <img 
            src={formData.photoURL || user.photoURL || 'https://via.placeholder.com/80'} 
            alt="Avatar" 
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              objectFit: 'cover',
              border: '3px solid #D7B615',
              transition: 'opacity 0.3s ease'
            }} 
          />
          <div 
            className="camera-overlay"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.3s ease'
            }}
          >
            <FaCamera style={{ color: '#fff', fontSize: '24px' }} />
          </div>
        </div>
        <div style={{ marginLeft: '20px' }}>
          <h1 style={{ fontSize: '28px', margin: 0, fontWeight: 600 }}>Mi perfil</h1>
          <p style={{ color: '#aaa', fontSize: '14px', margin: '4px 0 0 0' }}>
            Haz clic en tu foto para cambiarla
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={onSave} style={{ background: 'linear-gradient(122deg, #D7B615, #B99C18)', color: '#111', border: 'none', borderRadius: '12px', padding: '12px 24px', fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}>Guardar</button>
              <button onClick={onCancel} style={{ background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '12px', padding: '12px 24px', fontWeight: '600', cursor: 'pointer' }}>Cancelar</button>
            </div>
          ) : (
            <button onClick={onEditToggle} style={{ background: 'linear-gradient(122deg, #D7B615, #B99C18)', color: '#111', border: 'none', borderRadius: '12px', padding: '12px 24px', fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}>Editar</button>
          )}
        </div>
      </div>

      {/* Modal para cambiar foto */}
      {showImageUploader && (
        <Modal onClose={() => setShowImageUploader(false)}>
          <div style={{ padding: '20px' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#fff' }}>Cambiar foto de perfil</h3>
            <ImageUploader onImageUploaded={handleImageUploaded} />
            <button 
              onClick={() => setShowImageUploader(false)}
              style={{ 
                marginTop: '20px',
                background: '#333', 
                color: '#fff', 
                border: '1px solid #444', 
                borderRadius: '8px', 
                padding: '10px 20px', 
                cursor: 'pointer' 
              }}
            >
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {isEditing ? (
            <EditableField name="displayName" label="Nombres y Apellidos" value={formData.displayName} onChange={onFormChange} />
          ) : (
            <ProfileField label="Nombres y Apellidos" value={user.displayName || 'No especificado'} />
          )}
        </div>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <ProfileField label="Correo electrónico" value={user.email || 'No especificado'} />
           {isEditing ? (
            <EditableField name="username" label="Usuario" value={formData.username} onChange={onFormChange} />
          ) : (
            <ProfileField label="Usuario" value={user.username || 'No especificado'} />
          )}
        </div>
        <div>
          <label style={{ fontSize: '14px', color: '#aaa', display: 'block', marginBottom: '8px' }}>Biografía</label>
          {isEditing ? (
             <textarea
                name="bio"
                value={formData.bio}
                onChange={onFormChange}
                style={{ width: '100%', background: '#2c2c2c', color: '#fff', borderRadius: '20px', padding: '12px 16px', border: '1px solid #D7B615', minHeight: '80px', boxSizing: 'border-box' }}
             />
          ) : (
             <div style={{ background: '#2c2c2c', borderRadius: '20px', padding: '12px 16px', border: '1px solid #444', minHeight: '60px' }}>{user.bio || 'No especificado'}</div>
          )}
        </div>
        
        {/* Sección de Ubicación mejorada */}
        <div>
          <label style={{ fontSize: '14px', color: '#aaa', display: 'block', marginBottom: '8px' }}>Ubicación</label>
          <select 
            value={selectedLocation} 
            onChange={(e) => setSelectedLocation(e.target.value)}
            style={{ 
              width: '100%', 
              background: '#2c2c2c', 
              color: '#fff', 
              borderRadius: '20px', 
              padding: '12px 16px', 
              border: '1px solid #444', 
              fontSize: '14px',
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23D7B615' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 12px center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '16px',
              boxSizing: 'border-box'
            }}
          >
            {locationOptions.map(location => (
              <option key={location} value={location} style={{ background: '#2c2c2c', color: '#fff' }}>
                {location}
              </option>
            ))}
          </select>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap', gap: '16px' }}>
            <span style={{ color: '#aaa', fontSize: '12px' }}>
              📍 {selectedLocation}
            </span>
            <button 
              onClick={() => setSelectedLocation('Buenos Aires, Argentina')}
              style={{ color: '#aaa', background: 'none', border: 'none', textDecoration: 'underline', fontSize: '12px', cursor: 'pointer' }}
            >
              Restablecer ubicación
            </button>
          </div>
        </div>
        
        <div>
          <label style={{ fontSize: '14px', color: '#aaa', display: 'block', marginBottom: '8px' }}>URL</label>
          <div style={{ background: '#2c2c2c', borderRadius: '20px', padding: '12px 16px', border: '1px solid #444' }}>{user.url || 'No especificado'}</div>
          <p style={{ fontSize: '12px', color: '#aaa', marginTop: '8px', marginBlock: 0 }}>Podrás cambiar tu URL cuando tengas 90 contribuciones, 30 seguidores y la hayas usado durante 90 días.</p>
        </div>
        
        {/* Accordion Myers Briggs */}
        <AccordionRow label="Myers Briggs" name="myers" isOpen={openAccordion === 'myers'} onClick={handleAccordionClick} />
        {openAccordion === 'myers' && (
          <div style={{ background: '#2c2c2c', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
            <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '16px' }}>
              Selecciona tu tipo de personalidad Myers-Briggs
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
              {myersBriggsOptions.map(option => (
                <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px', borderRadius: '8px', hover: { background: '#333' } }}>
                  <input type="radio" name="myers-briggs" value={option} style={{ accentColor: '#D7B615' }} />
                  <span style={{ fontSize: '14px', color: '#fff' }}>{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        
        {/* Accordion Redes Sociales */}
        <AccordionRow label="Enlaces a redes sociales" name="social" isOpen={openAccordion === 'social'} onClick={handleAccordionClick} />
        {openAccordion === 'social' && (
          <div style={{ background: '#2c2c2c', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '14px', color: '#aaa', display: 'block', marginBottom: '8px' }}>Instagram</label>
                <input 
                  type="text" 
                  placeholder="https://instagram.com/tu_usuario"
                  style={{ width: '100%', background: '#1a1a1a', color: '#fff', borderRadius: '12px', padding: '12px 16px', border: '1px solid #444', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '14px', color: '#aaa', display: 'block', marginBottom: '8px' }}>LinkedIn</label>
                <input 
                  type="text" 
                  placeholder="https://linkedin.com/in/tu_perfil"
                  style={{ width: '100%', background: '#1a1a1a', color: '#fff', borderRadius: '12px', padding: '12px 16px', border: '1px solid #444', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '14px', color: '#aaa', display: 'block', marginBottom: '8px' }}>Twitter/X</label>
                <input 
                  type="text" 
                  placeholder="https://x.com/tu_usuario"
                  style={{ width: '100%', background: '#1a1a1a', color: '#fff', borderRadius: '12px', padding: '12px 16px', border: '1px solid #444', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Accordion Visibilidad */}
        <AccordionRow label="Visibilidad de membresía" name="visibility" isOpen={openAccordion === 'visibility'} onClick={handleAccordionClick} />
        {openAccordion === 'visibility' && (
          <div style={{ background: '#2c2c2c', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', color: '#fff' }}>Mostrar en perfil público</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#aaa' }}>Permite que otros vean tu membresía</p>
                </div>
                <label style={{ cursor: 'pointer' }}>
                  <input type="checkbox" style={{ display: 'none' }} />
                  <div style={{ width: '44px', height: '24px', background: '#D7B615', borderRadius: '12px', position: 'relative' }}>
                    <div style={{ width: '20px', height: '20px', background: '#1a1a1a', borderRadius: '50%', position: 'absolute', top: '2px', right: '2px' }}></div>
                  </div>
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', color: '#fff' }}>Recibir notificaciones</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#aaa' }}>Recibe notificaciones de actividad relacionada</p>
                </div>
                <label style={{ cursor: 'pointer' }}>
                  <input type="checkbox" style={{ display: 'none' }} />
                  <div style={{ width: '44px', height: '24px', background: '#444', borderRadius: '12px', position: 'relative' }}>
                    <div style={{ width: '20px', height: '20px', background: '#1a1a1a', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px' }}></div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}
        
        {/* Accordion Ajustes Avanzados */}
        <AccordionRow label="Ajustes avanzados" name="advanced" isOpen={openAccordion === 'advanced'} onClick={handleAccordionClick} />
        {openAccordion === 'advanced' && (
          <div style={{ background: '#2c2c2c', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#fff' }}>Preferencias de privacidad</h4>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
                  <input type="checkbox" style={{ accentColor: '#D7B615' }} />
                  <span style={{ fontSize: '14px', color: '#aaa' }}>Permitir indexación por motores de búsqueda</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: '#D7B615' }} />
                  <span style={{ fontSize: '14px', color: '#aaa' }}>Mostrar estado de actividad</span>
                </label>
              </div>
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#fff' }}>Configuración de datos</h4>
                <button style={{ background: '#444', color: '#fff', border: '1px solid #666', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', cursor: 'pointer', marginRight: '8px' }}>
                  Exportar datos
                </button>
                <button style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', cursor: 'pointer' }}>
                  Eliminar cuenta
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div style={{ marginTop: '40px', borderTop: '1px solid #2c2c2c', paddingTop: '32px' }}>
        <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: '24px', fontWeight: 600 }}>Mi cuenta</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h4 style={{margin: 0, fontSize: '16px'}}>Cerrar sesión</h4>
              <p style={{ margin: 0, color: '#aaa', fontSize: '14px' }}>Puedes cerrar las sesiones activas en todos los dispositivos.</p>
            </div>
            <button onClick={onLogoutClick} style={{ background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '12px', padding: '12px 20px', fontWeight: '600', cursor: 'pointer' }}>
              Cerrar sesión
            </button>
        </div>
      </div>
      <div style={{ marginTop: '40px', borderTop: '1px solid #2c2c2c', paddingTop: '32px' }}>
        <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: '24px', fontWeight: 600 }}>Estilo visual</h2>
        <AccordionRow label={`Tema`} name="theme" isOpen={openAccordion === 'theme'} onClick={handleAccordionClick} />
        {openAccordion === 'theme' && (
          <div style={{ background: '#2c2c2c', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
            <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '16px' }}>
              Selecciona tu tema preferido para la interfaz
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', borderRadius: '8px', border: '1px solid #444' }}>
                <input type="radio" name="theme" value="dark" defaultChecked style={{ accentColor: '#D7B615' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '24px', height: '24px', background: '#1a1a1a', borderRadius: '4px', border: '1px solid #444' }}></div>
                  <span style={{ fontSize: '16px', color: '#fff' }}>Tema Oscuro</span>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', borderRadius: '8px', border: '1px solid #444' }}>
                <input type="radio" name="theme" value="light" style={{ accentColor: '#D7B615' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '24px', height: '24px', background: '#fff', borderRadius: '4px', border: '1px solid #ddd' }}></div>
                  <span style={{ fontSize: '16px', color: '#fff' }}>Tema Claro</span>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', borderRadius: '8px', border: '1px solid #444' }}>
                <input type="radio" name="theme" value="auto" style={{ accentColor: '#D7B615' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '24px', height: '24px', background: 'linear-gradient(45deg, #1a1a1a 50%, #fff 50%)', borderRadius: '4px', border: '1px solid #444' }}></div>
                  <span style={{ fontSize: '16px', color: '#fff' }}>Automático (Sistema)</span>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const EditableField = ({ label, value, name, onChange }) => (
    <div style={{ flex: '1 1 48%' }}>
      <label style={{ fontSize: '14px', color: '#aaa', display: 'block', marginBottom: '8px' }}>{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        style={{ width: '100%', background: '#2c2c2c', color: '#fff', borderRadius: '20px', padding: '14px 16px', border: '1px solid #D7B615', boxSizing: 'border-box' }}
      />
    </div>
);

// --- Componente para la pestaña AFILIADOS ---
const AfiliadosTab = () => {
  return (
    <div style={{ color: '#fff' }}>
      <h1 style={{ color: '#D7B615', fontSize: '24px', marginBottom: '8px', fontWeight: 600, 
                   background: 'linear-gradient(90.18deg, #D7B615 8.94%, rgba(255, 255, 255, 0.8) 67.3%)',
                   WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
      }}>Mis afiliados</h1>
      <p style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', color: '#ccc', marginBottom: '32px' }}>
        <GiPodium size={24} style={{ color: '#D7B615' }} />
        Gana una comisión de por vida cuando invites a alguien para crear o unirse a una comunidad de la plataforma.
      </p>

      <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Balance</h2>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, background: '#2c2c2c', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', minWidth: '250px' }}>
          <div>
            <span style={{ fontSize: '28px', fontWeight: '600' }}>$1000</span><br/>
            <span style={{ color: '#aaa' }}>Últimos 30 días</span>
          </div>
          <BsCoin size={32} style={{ color: '#aaa' }}/>
        </div>
        <div style={{ flex: 1, background: '#2c2c2c', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', minWidth: '250px' }}>
          <div>
            <span style={{ fontSize: '28px', fontWeight: '600' }}>$200</span><br/>
            <span style={{ color: '#aaa' }}>Todos los días</span>
          </div>
          <BsPiggyBank size={32} style={{ color: '#aaa' }}/>
        </div>
        <div style={{ flex: 1, background: '#2c2c2c', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', minWidth: '250px' }}>
          <div style={{ flexGrow: 1 }}>
            <span style={{ fontSize: '28px', fontWeight: '600' }}>$1000</span><br/>
            <span style={{ color: '#aaa' }}>Saldo de la cuenta</span>
          </div>
          <button style={{ background: 'linear-gradient(122deg, #D7B615, #B99C18)', color: '#111', border: 'none', borderRadius: '12px', padding: '10px', fontWeight: '600', fontSize: '16px', cursor: 'pointer', width: '100%', marginTop: '12px' }}>Realizar pago</button>
          <div style={{ fontSize: '12px', color: '#aaa', marginTop: '8px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            $1000 Disponibles <BsQuestionCircle />
          </div>
        </div>
      </div>

      <div style={{ background: '#2c2c2c', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', marginTop: 0 }}>Enlace de afiliado</h3>
        <p style={{ color: '#aaa', fontSize: '14px' }}>Gana una comisión del 40% cuando invites a alguien a crear una comunidad.</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input type="text" readOnly value="6265beff-588e-416d-83de-748cb4ce" style={{ flexGrow: 1, background: '#1a1a1a', border: '1px solid #444', borderRadius: '12px', color: '#fff', padding: '12px', fontFamily: 'monospace' }} />
          <button style={{ background: 'linear-gradient(122deg, #D7B615, #B99C18)', color: '#111', border: 'none', borderRadius: '12px', padding: '12px 24px', fontWeight: '600', cursor: 'pointer' }}>Copiar</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, background: '#2c2c2c', borderRadius: '16px', padding: '24px', border: '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h4 style={{ marginTop: 0, marginBottom: '4px' }}>Nivel 1</h4>
            <span style={{ color: '#aaa', fontSize: '14px' }}>Comision 10%<br/>Hasta 100 Afiliados</span>
          </div>
          <FaLock style={{ color: '#aaa' }} />
        </div>
        <div style={{ flex: 1, background: '#2c2c2c', borderRadius: '16px', padding: '24px', border: '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h4 style={{ marginTop: 0, marginBottom: '4px' }}>Nivel 2</h4>
            <span style={{ color: '#aaa', fontSize: '14px' }}>Comision 15% + 5% Tier 1<br/>Hasta 200 Afiliados</span>
          </div>
          <FaLock style={{ color: '#aaa' }} />
        </div>
        <div style={{ flex: 1, background: '#2c2c2c', borderRadius: '16px', padding: '24px', border: '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h4 style={{ marginTop: 0, marginBottom: '4px' }}>Nivel 3</h4>
            <span style={{ color: '#aaa', fontSize: '14px' }}>Comision 20% + 5%<br/>Tier 1 + 10% De Pagos<br/>Hasta 300 Afiliados</span>
          </div>
          <FaLock style={{ color: '#aaa' }} />
        </div>
      </div>

      <div style={{ borderBottom: '1px solid #2c2c2c', padding: '16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '16px' }}>Activo</span>
        <FaChevronDown style={{ color: '#D7B615' }} />
      </div>
      <div style={{ background: '#2c2c2c', borderRadius: '16px', padding: '48px', marginTop: '16px', textAlign: 'center', color: '#aaa' }}>
        Tus referencias se mostrarán aquí
      </div>
    </div>
  );
}

// --- Componente para la pestaña PAGOS ---
const PagosTab = () => {
  return (
    <div style={{ color: '#fff' }}>
      <h1 style={{ color: '#D7B615', fontSize: '24px', marginBottom: '32px', fontWeight: 600,
                   background: 'linear-gradient(90.18deg, #D7B615 8.94%, rgba(255, 255, 255, 0.8) 67.3%)',
                   WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
      }}>
        Métodos de pago
      </h1>
      
      {/* Tarjeta de Membresía */}
      <div style={{ background: '#2c2c2c', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', marginTop: 0, fontWeight: 600 }}>Tarjetas de membresía</h2>
        <p style={{ color: '#aaa', fontSize: '14px', marginTop: '4px', marginBottom: '24px' }}>Aquí se muestran las tarjetas de membresías de grupo.</p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontWeight: 600, fontSize: '16px' }}>MASTERCARD **** 9920</span><br/>
            <span style={{ color: '#aaa', fontSize: '14px' }}>Expira: 04/2030</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D7B615', cursor: 'pointer' }}>
            1 afiliado
            <FaChevronDown size={14} />
          </div>
          <button style={{ background: 'linear-gradient(122deg, #D7B615, #B99C18)', color: '#111', border: 'none', borderRadius: '12px', padding: '10px 24px', fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}>
            Agregar
          </button>
        </div>
      </div>

      {/* Historial de Pagos */}
      <div style={{ background: '#2c2c2c', borderRadius: '16px', padding: '24px' }}>
        <h2 style={{ fontSize: '18px', marginTop: 0, fontWeight: 600 }}>Historial de pagos</h2>
        <p style={{ color: '#aaa', fontSize: '14px', marginTop: '4px', marginBottom: '24px' }}>
          Aquí se muestran los recibos de membresías de grupo.<br/>
          ¿Necesitas facturas personalizadas?
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ color: '#aaa' }}>Abril 28, 2025</span>
          <span style={{ color: '#D7B615', fontWeight: 500 }}>12 USD por la membresía SaaS in House</span>
        </div>
      </div>
    </div>
  );
};

// --- Componente para la pestaña CONFIGURACIÓN ---
const ConfiguracionTab = () => {
  const CustomToggle = ({ checked }) => (
    <div style={{ width: '50px', height: '28px', background: checked ? 'linear-gradient(122deg, #D7B615, #B99C18)' : '#444', borderRadius: '14px', position: 'relative', cursor: 'pointer' }}>
      <div style={{ width: '22px', height: '22px', background: '#1a1a1a', borderRadius: '50%', position: 'absolute', top: '3px', left: checked ? '25px' : '3px', transition: 'left 0.2s' }}></div>
    </div>
  );

  return (
    <div style={{ color: '#fff' }}>
       <h1 style={{ color: '#D7B615', fontSize: '24px', marginBottom: '32px', fontWeight: 600,
                    background: 'linear-gradient(90.18deg, #D7B615 8.94%, rgba(255, 255, 255, 0.8) 67.3%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
       }}>
        Notificaciones generales
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Enviar notificación por correo electrónico de nuevos seguidores</span>
          <CustomToggle checked={true} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Enviar notificación por correo electrónico de nueva referencia de afiliado</span>
          <CustomToggle checked={true} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Activar sonido de caja registradora por nuevo cliente</span>
          <CustomToggle checked={false} />
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #2c2c2c', margin: '40px 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#000', borderRadius: '50%', padding: '8px', border: '1px solid #D7B615' }}>
             <FaTrophy size={20} style={{ color: '#D7B615' }} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 600 }}>Notificaciones Golden Suite</span>
        </div>
        <button style={{ background: 'linear-gradient(122deg, #D7B615, #B99C18)', color: '#111', border: 'none', borderRadius: '12px', padding: '10px 24px', fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}>
          Editar
        </button>
      </div>
    </div>
  );
};

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('cuenta');
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  // Agregar estilos CSS para el hover effect
  const styles = `
    .profile-photo-container:hover .camera-overlay {
      opacity: 1 !important;
    }
  `;

  // Inyectar estilos
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const fetchUserData = async () => {
      setLoading(true);
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUser(data);
        setFormData({
            displayName: data.displayName || '',
            username: data.username || '',
            bio: data.bio || '',
            photoURL: data.photoURL || ''
        });
      } else {
        // Usar datos de auth si no hay perfil en Firestore
        const { displayName, email, photoURL } = currentUser;
        setUser({ displayName, email, photoURL });
        setFormData({ displayName: displayName || '', photoURL: photoURL || '', bio: '', username: '' });
      }
      setLoading(false);
    };

    fetchUserData();
  }, [currentUser]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!currentUser) return;
    try {
      // 1. Update Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        displayName: formData.displayName,
        username: formData.username,
        bio: formData.bio,
      });

      // 2. Update Firebase Auth profile
      if (auth.currentUser) {
          await updateAuthProfile(auth.currentUser, {
              displayName: formData.displayName,
              // photoURL: formData.photoURL, // La edición de foto es más compleja, se omite por ahora
          });
      }

      // 3. Update local state and exit editing mode
      setUser(prev => ({ ...prev, ...formData }));
      setIsEditing(false);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Hubo un error al guardar tu perfil.");
    }
  };
  
  const handleCancel = () => {
      // Revertir cambios en el formulario a los datos originales
      setFormData({
        displayName: user.displayName || '',
        username: user.username || '',
        bio: user.bio || '',
        photoURL: user.photoURL || ''
      });
      setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Opcionalmente, mostrar un modal de error
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/login');
  };

  const TABS_CONTENT = {
    cuenta: <CuentaTab 
                user={user} 
                onLogoutClick={handleLogout}
                isEditing={isEditing}
                onEditToggle={handleEditToggle}
                formData={formData}
                onFormChange={handleFormChange}
                onSave={handleSave}
                onCancel={handleCancel}
             />,
    afiliados: <AfiliadosTab />,
    pagos: <PagosTab />,
    configuracion: <ConfiguracionTab />,
  };
  
  if (loading) {
      return <div>Cargando...</div>
  }

  return (
    <div style={{ minHeight: '100vh', width: '100%', fontFamily: 'Poppins, sans-serif'}}>
      <div style={{width: '100%', maxWidth: 1200, margin: '32px auto 40px auto', padding: '24px', boxSizing: 'border-box' }}>
      
        {/* Barra de Pestañas (Estilo Original Restaurado) */}
        <div style={{display: 'flex', gap: 12, marginBottom: 24, marginTop: 0, flexWrap: 'wrap', justifyContent: 'flex-start'}}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: activeTab === tab.key ? '#292929' : 'none',
                border: activeTab === tab.key ? '1px solid #D7B615' : '1px solid #292929',
                color: '#fff',
                fontWeight: 500,
                fontSize: 18,
                borderRadius: 16,
                padding: '10px 32px',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: activeTab === tab.key ? '0 0 0 2px #FFD70033' : 'none',
                marginBottom: 8
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido de la pestaña activa */}
        <div>
          {TABS_CONTENT[activeTab]}
        </div>
      </div>

      <Modal isOpen={showSuccessModal} onClose={handleCloseSuccessModal}>
        <button className="modal-close-button" onClick={handleCloseSuccessModal}>&times;</button>
        <h2>Tus sesiones han sido <span className="highlight">cerradas</span></h2>
        <p>Tus sesiones activas han sido cerradas en todos los navegadores y dispositivos</p>
      </Modal>

      <style>{`
        @media (max-width: 768px) {
          /* Contenedor principal - reducir padding */
          div[style*="padding: 24px"] {
            padding: 15px !important;
          }
          
          /* Contenedor de pestañas - eliminar margin top */
          div[style*="margin: 32px auto 40px auto"] {
            margin: 0 auto 20px auto !important;
          }
          
          /* Barra de pestañas - reducir gap y margin */
          div[style*="gap: 12"] {
            gap: 6px !important;
            margin-bottom: 16px !important;
          }
          
          /* Botones de pestañas */
          div[style*="flex-wrap: wrap"] > div[style*="flex: 1"] { 
            flex-basis: 100% !important; 
          }
          button[style*="fontSize: 18"] {
             padding: 8px 16px !important;
             font-size: 16px !important;
           }
        }
        
        @media (max-width: 480px) {
          /* Contenedor principal - aún más reducido */
          div[style*="padding: 24px"] {
            padding: 6px !important;
          }
          
                     /* Contenedor de pestañas - sin margin top */
           div[style*="margin: 32px auto 40px auto"] {
             margin: 0 auto 16px auto !important;
           }
          
          /* Barra de pestañas - más compacta */
          div[style*="gap: 12"] {
            gap: 4px !important;
            margin-bottom: 12px !important;
          }
          
          /* Botones más pequeños */
          button[style*="fontSize: 18"] {
             padding: 6px 12px !important;
             font-size: 14px !important;
           }
        }
      `}</style>
    </div>
  );
}

export default SettingsPage; 