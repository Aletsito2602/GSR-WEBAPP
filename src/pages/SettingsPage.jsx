import React, { useState } from 'react';
import { FaChevronDown, FaPenSquare, FaMapMarkerAlt, FaLock, FaTrophy } from 'react-icons/fa';
import { BsCoin, BsPiggyBank, BsQuestionCircle } from 'react-icons/bs';
import { GiPodium } from 'react-icons/gi';

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
    <div style={{ background: '#2c2c2c', borderRadius: '12px', padding: '12px 16px', border: '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>{value}</span>
      {hasDropdown && <FaChevronDown style={{ color: '#D7B615' }} />}
    </div>
  </div>
);

// --- Componente para la pestaña CUENTA (el diseño anterior) ---
const CuentaTab = () => {
  const [openAccordion, setOpenAccordion] = useState(null);
  const handleAccordionClick = (name) => setOpenAccordion(openAccordion === name ? null : name);
  
  const userData = {
    avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
    firstName: 'Laura',
    lastName: 'Paz Rejón',
    phone: '1123456789',
    email: 'laurapaz@gmail.com',
    username: '@laurapaz64',
    location: 'Argentina',
    bio: 'Argentina, esposa y madre. Comerciante y apasionada.',
    url: 'skool.com/@laura-paz-rejon-2277',
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <img src={userData.avatarUrl} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
        <h1 style={{ fontSize: '28px', marginLeft: '20px', flexGrow: 1, fontWeight: 600 }}>Mi perfil</h1>
        <button style={{ background: 'linear-gradient(122deg, #D7B615, #B99C18)', color: '#111', border: 'none', borderRadius: '12px', padding: '12px 24px', fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}>Editar</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <ProfileField label="Nombres" value={userData.firstName} />
          <ProfileField label="Apellidos" value={userData.lastName} />
        </div>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <ProfileField label="Número de teléfono" value={userData.phone} />
          <ProfileField label="Correo electrónico" value={userData.email} />
        </div>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <ProfileField label="Usuario" value={userData.username} />
          <ProfileField label="Locación" value={userData.location} hasDropdown />
        </div>
        <div>
          <label style={{ fontSize: '14px', color: '#aaa', display: 'block', marginBottom: '8px' }}>Biografía</label>
          <div style={{ background: '#2c2c2c', borderRadius: '12px', padding: '12px 16px', border: '1px solid #444', minHeight: '60px' }}>{userData.bio}</div>
          <div style={{ textAlign: 'right', fontSize: '12px', color: '#aaa', marginTop: '4px' }}>16 / 150</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '16px' }}>
          <a href="#" style={{ color: '#D7B615', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}><FaMapMarkerAlt />Cambiar mi ubicación en el mapa</a>
          <a href="#" style={{ color: '#aaa', textDecoration: 'underline', fontSize: '14px' }}>Eliminar mi ubicación</a>
        </div>
        <div>
          <label style={{ fontSize: '14px', color: '#aaa', display: 'block', marginBottom: '8px' }}>URL</label>
          <div style={{ background: '#2c2c2c', borderRadius: '12px', padding: '12px 16px', border: '1px solid #444' }}>{userData.url}</div>
          <p style={{ fontSize: '12px', color: '#aaa', marginTop: '8px', marginBlock: 0 }}>Podrás cambiar tu URL cuando tengas 90 contribuciones, 30 seguidores y la hayas usado durante 90 días.</p>
        </div>
        <AccordionRow label="Myers Briggs" name="myers" isOpen={openAccordion === 'myers'} onClick={handleAccordionClick} />
        <AccordionRow label="Enlaces a redes sociales" name="social" isOpen={openAccordion === 'social'} onClick={handleAccordionClick} />
        <AccordionRow label="Visibilidad de membresía" name="visibility" isOpen={openAccordion === 'visibility'} onClick={handleAccordionClick} />
        <AccordionRow label="Ajustes avanzados" name="advanced" isOpen={openAccordion === 'advanced'} onClick={handleAccordionClick} />
      </div>
      <div style={{ marginTop: '40px', borderTop: '1px solid #2c2c2c', paddingTop: '32px' }}>
        <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: '24px', fontWeight: 600 }}>Mi cuenta</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 48%' }}>
              <label style={{ fontSize: '14px', color: '#aaa', display: 'block', marginBottom: '8px' }}>Correo electrónico</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flexGrow: 1, background: '#2c2c2c', borderRadius: '12px', padding: '12px 16px', border: '1px solid #444' }}>{userData.email}</div>
                <div style={{ background: '#444', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaPenSquare color="#D7B615" /></div>
              </div>
            </div>
            <div style={{ flex: '1 1 48%' }}>
              <label style={{ fontSize: '14px', color: '#aaa', display: 'block', marginBottom: '8px' }}>Contraseña</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flexGrow: 1, background: '#2c2c2c', borderRadius: '12px', padding: '12px 16px', border: '1px solid #444', letterSpacing: '4px' }}>••••••••</div>
                <div style={{ background: '#444', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaPenSquare color="#D7B615" /></div>
              </div>
            </div>
          </div>
          <AccordionRow label={`Zona horaria`} name="timezone" isOpen={openAccordion === 'timezone'} onClick={handleAccordionClick} />
          <AccordionRow label={`Idioma`} name="language" isOpen={openAccordion === 'language'} onClick={handleAccordionClick} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h4 style={{margin: 0, fontSize: '16px'}}>Cerrar sesión</h4>
              <p style={{ margin: 0, color: '#aaa', fontSize: '14px' }}>Puedes cerrar las sesiones activas en todos los dispositivos.</p>
            </div>
            <button style={{ background: '#333', color: '#fff', border: '1px solid #444', borderRadius: '12px', padding: '12px 20px', fontWeight: '600', cursor: 'pointer' }}>Cerrar sesión</button>
          </div>
        </div>
      </div>
      <div style={{ marginTop: '40px', borderTop: '1px solid #2c2c2c', paddingTop: '32px' }}>
        <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: '24px', fontWeight: 600 }}>Estilo visual</h2>
        <AccordionRow label={`Tema`} name="theme" isOpen={openAccordion === 'theme'} onClick={handleAccordionClick} />
      </div>
    </>
  );
};

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

// --- Componente principal con las PESTAÑAS (Estilos originales restaurados) ---
function SettingsPage() {
  const [activeTab, setActiveTab] = useState('afiliados');

  return (
    <div style={{background: '#222', minHeight: '100vh', width: '100%', fontFamily: 'Poppins, sans-serif'}}>
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
          {activeTab === 'cuenta' && <CuentaTab />}
          {activeTab === 'afiliados' && <AfiliadosTab />}
          {activeTab === 'pagos' && <PagosTab />}
          {activeTab === 'configuracion' && <ConfiguracionTab />}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="flex-wrap: wrap"] > div[style*="flex: 1"] { 
            flex-basis: 100% !important; 
          }
          button[style*="fontSize: 18"] {
             padding: 8px 16px;
             font-size: 16px;
           }
        }
      `}</style>
    </div>
  );
}

export default SettingsPage; 