import React, { useState } from 'react';

const TABS = [
  { key: 'cuenta', label: 'Cuenta' },
  { key: 'afiliados', label: 'Afiliados' },
  { key: 'pagos', label: 'Pagos' },
  { key: 'configuracion', label: 'Configuración' },
];

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('cuenta');
  const [showPassword, setShowPassword] = useState(false);

  // Simulación de datos
  const user = {
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    nombre: 'Laura',
    apellidos: 'Paz Rejón',
    telefono: '1123456789',
    email: 'laurapaz@gmail.com',
    usuario: '@laurapaz64',
    ubicacion: 'Argentina',
    biografia: 'Argentina, esposa y madre. Comerciante y apasionada.',
    url: 'skool.com/@laura-paz-rejon-2277',
    myers: 'No mostrar',
    idioma: 'Español',
    zona: '(GMT -05:00) America/Cancun',
    tema: 'Predeterminado (Negro)'
  };

  return (
    <div style={{background: '#222', minHeight: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', fontFamily: 'Poppins, sans-serif'}}>
      <div style={{width: '100%', maxWidth: 1200, background: '#222', borderRadius: 30, margin: '32px auto 40px auto', padding: '24px 24px 48px 24px', boxSizing: 'border-box', boxShadow: '0 0 0 4px #222'}}>
        {/* Tab bar */}
        <div style={{display: 'flex', gap: 12, marginBottom: 24, marginTop: 0, flexWrap: 'wrap', justifyContent: 'flex-start'}}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: activeTab === tab.key ? '#292929' : 'none',
                border: activeTab === tab.key ? '1px solid #FFD700' : '1px solid #292929',
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

        {/* Contenido de cada tab */}
        {activeTab === 'cuenta' && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 32,
                marginBottom: 32,
                flexDirection: window.innerWidth < 900 ? 'column' : 'row',
                justifyContent: 'flex-start'
              }}
            >
              <img
                src={user.avatar}
                alt="avatar"
                style={{
                  width: window.innerWidth < 900 ? 90 : 120,
                  height: window.innerWidth < 900 ? 90 : 120,
                  borderRadius: 300,
                  border: '1px solid #3C3C3C',
                  objectFit: 'cover',
                  marginTop: 16,
                  marginBottom: window.innerWidth < 900 ? 12 : 0,
                  alignSelf: window.innerWidth < 900 ? 'center' : 'flex-start'
                }}
              />
              <div style={{flex: 1}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8}}>
                  <span style={{fontWeight: 700, fontSize: 24, color: '#FFD700'}}>Mi perfil</span>
                  <button style={{background: 'linear-gradient(90deg, #FFD700 60%, #fff 100%)', color: '#222', border: 'none', borderRadius: 16, padding: '8px 28px', fontWeight: 600, fontSize: 18, marginLeft: 'auto', cursor: 'pointer'}}>Editar</button>
                </div>
                <div style={{display: 'flex', gap: 16, marginBottom: 12}}>
                  <div style={{flex: 1}}>
                    <div style={{color: '#aaa', fontSize: 15}}>Nombres</div>
                    <input value={user.nombre} readOnly style={{width: '100%', background: '#292929', border: 'none', borderRadius: 12, color: '#fff', fontSize: 18, padding: '8px 16px', marginBottom: 8}} />
                  </div>
                  <div style={{flex: 1}}>
                    <div style={{color: '#aaa', fontSize: 15}}>Apellidos</div>
                    <input value={user.apellidos} readOnly style={{width: '100%', background: '#292929', border: 'none', borderRadius: 12, color: '#fff', fontSize: 18, padding: '8px 16px', marginBottom: 8}} />
                  </div>
                </div>
                <div style={{display: 'flex', gap: 16, marginBottom: 12}}>
                  <div style={{flex: 1}}>
                    <div style={{color: '#aaa', fontSize: 15}}>Número de teléfono</div>
                    <input value={user.telefono} readOnly style={{width: '100%', background: '#292929', border: 'none', borderRadius: 12, color: '#fff', fontSize: 18, padding: '8px 16px', marginBottom: 8}} />
                  </div>
                  <div style={{flex: 1}}>
                    <div style={{color: '#aaa', fontSize: 15}}>Correo electrónico</div>
                    <input value={user.email} readOnly style={{width: '100%', background: '#292929', border: 'none', borderRadius: 12, color: '#fff', fontSize: 18, padding: '8px 16px', marginBottom: 8}} />
                  </div>
                </div>
                <div style={{display: 'flex', gap: 16, marginBottom: 12}}>
                  <div style={{flex: 1}}>
                    <div style={{color: '#aaa', fontSize: 15}}>Usuario</div>
                    <input value={user.usuario} readOnly style={{width: '100%', background: '#292929', border: 'none', borderRadius: 12, color: '#fff', fontSize: 18, padding: '8px 16px', marginBottom: 8}} />
                  </div>
                  <div style={{flex: 1}}>
                    <div style={{color: '#aaa', fontSize: 15}}>Locación</div>
                    <input value={user.ubicacion} readOnly style={{width: '100%', background: '#292929', border: 'none', borderRadius: 12, color: '#fff', fontSize: 18, padding: '8px 16px', marginBottom: 8}} />
                  </div>
                </div>
                <div style={{marginBottom: 12}}>
                  <div style={{color: '#aaa', fontSize: 15}}>Biografía</div>
                  <input value={user.biografia} readOnly style={{width: '100%', background: '#292929', border: 'none', borderRadius: 12, color: '#fff', fontSize: 18, padding: '8px 16px', marginBottom: 8}} />
                </div>
                <div style={{display: 'flex', gap: 16, marginBottom: 12}}>
                  <a href="#" style={{color: '#FFD700', fontWeight: 500, fontSize: 16}}>Cambiar mi ubicación en el mapa</a>
                  <a href="#" style={{color: '#aaa', fontWeight: 500, fontSize: 16, marginLeft: 'auto'}}>Eliminar mi ubicación</a>
                </div>
                <div style={{marginBottom: 12}}>
                  <div style={{color: '#aaa', fontSize: 15}}>URL</div>
                  <input value={user.url} readOnly style={{width: '100%', background: '#292929', border: 'none', borderRadius: 12, color: '#fff', fontSize: 18, padding: '8px 16px', marginBottom: 4}} />
                  <div style={{color: '#888', fontSize: 13, marginTop: 2}}>Podrás cambiar tu URL cuando tengas 90 contribuciones, 30 seguidores y la hayas usado durante 90 días.</div>
                </div>
                <div style={{marginBottom: 12}}>
                  <div style={{color: '#aaa', fontSize: 15}}>Myers Briggs</div>
                  <input value={user.myers} readOnly style={{width: '100%', background: '#292929', border: 'none', borderRadius: 12, color: '#fff', fontSize: 18, padding: '8px 16px', marginBottom: 8}} />
                </div>
                <div style={{marginBottom: 12}}>
                  <div style={{color: '#aaa', fontSize: 15}}>Enlaces a redes sociales</div>
                  <input value="" placeholder="No configurado" readOnly style={{width: '100%', background: '#292929', border: 'none', borderRadius: 12, color: '#fff', fontSize: 18, padding: '8px 16px', marginBottom: 8}} />
                </div>
                <div style={{marginBottom: 12}}>
                  <div style={{color: '#aaa', fontSize: 15}}>Visibilidad de membresía</div>
                  <input value="" placeholder="No configurado" readOnly style={{width: '100%', background: '#292929', border: 'none', borderRadius: 12, color: '#fff', fontSize: 18, padding: '8px 16px', marginBottom: 8}} />
                </div>
                <div style={{marginBottom: 24}}>
                  <div style={{color: '#aaa', fontSize: 15}}>Ajustes avanzados</div>
                  <input value="" placeholder="No configurado" readOnly style={{width: '100%', background: '#292929', border: 'none', borderRadius: 12, color: '#fff', fontSize: 18, padding: '8px 16px', marginBottom: 8}} />
                </div>
                <hr style={{border: 'none', borderTop: '1px solid #393939', margin: '32px 0'}} />
                <div style={{fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 18}}>Mi cuenta</div>
                <div style={{display: 'flex', gap: 16, marginBottom: 12}}>
                  <div style={{flex: 1}}>
                    <div style={{color: '#aaa', fontSize: 15}}>Correo electrónico</div>
                    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                      <input value={user.email} readOnly style={{width: '100%', background: '#292929', border: 'none', borderRadius: 12, color: '#fff', fontSize: 18, padding: '8px 16px'}} />
                      <button style={{background: 'linear-gradient(90deg, #FFD700 60%, #fff 100%)', border: 'none', borderRadius: 12, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#222', fontWeight: 700, fontSize: 18}}><i className="fas fa-pen"></i></button>
                    </div>
                  </div>
                  <div style={{flex: 1}}>
                    <div style={{color: '#aaa', fontSize: 15}}>Contraseña</div>
                    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                      <input type={showPassword ? 'text' : 'password'} value="********" readOnly style={{width: '100%', background: '#292929', border: 'none', borderRadius: 12, color: '#fff', fontSize: 18, padding: '8px 16px'}} />
                      <button style={{background: 'linear-gradient(90deg, #FFD700 60%, #fff 100%)', border: 'none', borderRadius: 12, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#222', fontWeight: 700, fontSize: 18}} onClick={() => setShowPassword(s => !s)}><i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i></button>
                    </div>
                  </div>
                </div>
                <div style={{display: 'flex', gap: 16, marginBottom: 12}}>
                  <div style={{flex: 1}}>
                    <div style={{color: '#aaa', fontSize: 15}}>Zona horaria</div>
                    <input value={user.zona} readOnly style={{width: '100%', background: '#292929', border: 'none', borderRadius: 12, color: '#fff', fontSize: 18, padding: '8px 16px'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <div style={{color: '#aaa', fontSize: 15}}>Idioma</div>
                    <input value={user.idioma} readOnly style={{width: '100%', background: '#292929', border: 'none', borderRadius: 12, color: '#fff', fontSize: 18, padding: '8px 16px'}} />
                  </div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24}}>
                  <span style={{color: '#aaa', fontSize: 15}}>Cerrar sesión</span>
                  <button style={{background: '#888', color: '#fff', border: 'none', borderRadius: 16, padding: '8px 32px', fontWeight: 600, fontSize: 18, marginLeft: 'auto', cursor: 'pointer'}}>Cerrar sesión</button>
                </div>
                <div style={{fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 12}}>Estilo visual</div>
                <div style={{color: '#aaa', fontSize: 15, marginBottom: 8}}>Tema</div>
                <input value={user.tema} readOnly style={{width: '100%', background: '#292929', border: 'none', borderRadius: 12, color: '#fff', fontSize: 18, padding: '8px 16px', marginBottom: 8}} />
              </div>
            </div>
          </>
        )}

        {activeTab === 'afiliados' && (
          <>
            <div style={{fontWeight: 700, fontSize: 22, color: '#FFD700', marginBottom: 8}}>Mis afiliados</div>
            <div style={{color: '#fff', fontSize: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12}}>
              <i className="fas fa-user-friends" style={{fontSize: 22, color: '#FFD700'}}></i>
              Gana una comisión de por vida cuando invites a alguien para crear o unirse a una comunidad de la plataforma.
            </div>
            <div style={{fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 18}}>Balance</div>
            <div style={{display: 'flex', gap: 18, marginBottom: 24}}>
              <div style={{flex: 1, background: 'linear-gradient(135deg, #232323 80%, #232323 100%)', borderRadius: 18, padding: 24, color: '#fff', fontWeight: 700, fontSize: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center'}}>
                $1000 <span style={{fontWeight: 400, fontSize: 15, color: '#aaa'}}>Últimos 30 días</span>
              </div>
              <div style={{flex: 1, background: 'linear-gradient(135deg, #232323 80%, #232323 100%)', borderRadius: 18, padding: 24, color: '#fff', fontWeight: 700, fontSize: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center'}}>
                $200 <span style={{fontWeight: 400, fontSize: 15, color: '#aaa'}}>Todos los días</span>
              </div>
              <div style={{flex: 1, background: 'linear-gradient(135deg, #232323 80%, #232323 100%)', borderRadius: 18, padding: 24, color: '#fff', fontWeight: 700, fontSize: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', position: 'relative'}}>
                $1000 <span style={{fontWeight: 400, fontSize: 15, color: '#aaa'}}>Saldo de la cuenta</span>
                <button style={{position: 'absolute', right: 24, top: 24, background: 'linear-gradient(90deg, #FFD700 60%, #fff 100%)', color: '#222', border: 'none', borderRadius: 12, padding: '8px 18px', fontWeight: 600, fontSize: 16, cursor: 'pointer'}}>Realizar pago</button>
              </div>
            </div>
            <div style={{fontWeight: 700, fontSize: 18, color: '#fff', marginBottom: 8}}>Enlace de afiliado</div>
            <div style={{color: '#aaa', fontSize: 15, marginBottom: 8}}>Gana una comisión del 40% cuando invites a alguien a crear una comunidad.</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24}}>
              <input value="6265beff-588e-416d-83de-748cb4ce" readOnly style={{flex: 1, background: '#292929', border: 'none', borderRadius: 12, color: '#fff', fontSize: 18, padding: '8px 16px'}} />
              <button style={{background: 'linear-gradient(90deg, #FFD700 60%, #fff 100%)', color: '#222', border: 'none', borderRadius: 12, padding: '8px 18px', fontWeight: 600, fontSize: 16, cursor: 'pointer'}}>Copiar</button>
            </div>
            <div style={{display: 'flex', gap: 12, marginBottom: 24}}>
              <div style={{flex: 1, background: '#232323', borderRadius: 18, padding: 18, color: '#fff', fontWeight: 600, fontSize: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', border: '1px solid #393939'}}>
                Nivel 1 <span style={{fontWeight: 400, fontSize: 13, color: '#aaa'}}>Comisión 10%<br/>Hasta 100 Afiliados</span>
              </div>
              <div style={{flex: 1, background: '#232323', borderRadius: 18, padding: 18, color: '#fff', fontWeight: 600, fontSize: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', border: '1px solid #393939', opacity: 0.5}}>
                Nivel 2 <span style={{fontWeight: 400, fontSize: 13, color: '#aaa'}}>Comisión 15% + 5% Tier 1<br/>Hasta 200 Afiliados</span>
              </div>
              <div style={{flex: 1, background: '#232323', borderRadius: 18, padding: 18, color: '#fff', fontWeight: 600, fontSize: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', border: '1px solid #393939', opacity: 0.5}}>
                Nivel 3 <span style={{fontWeight: 400, fontSize: 13, color: '#aaa'}}>Comisión 20% + 5% Tier 1 + 10% De Pagos<br/>Hasta 300 Afiliados</span>
              </div>
            </div>
            <div style={{background: '#232323', borderRadius: 18, padding: 32, color: '#888', fontWeight: 400, fontSize: 18, textAlign: 'center', border: '1px solid #393939'}}>Tus referencias se mostrarán aquí</div>
          </>
        )}

        {activeTab === 'pagos' && (
          <>
            <div style={{fontWeight: 700, fontSize: 22, color: '#FFD700', marginBottom: 8}}>Métodos de pago</div>
            <div style={{background: '#232323', borderRadius: 18, padding: 24, color: '#fff', fontWeight: 600, fontSize: 18, marginBottom: 24, border: '1px solid #393939'}}>
              <div style={{marginBottom: 8}}>Tarjetas de membresía</div>
              <div style={{color: '#aaa', fontWeight: 400, fontSize: 15, marginBottom: 12}}>Aquí se muestran las tarjetas de membresías de grupo.</div>
              <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 12}}>
                <span style={{fontWeight: 700, fontSize: 18, color: '#fff'}}>MASTERCARD **** 9920</span>
                <span style={{color: '#FFD700', fontWeight: 500, fontSize: 15}}>1 afiliado</span>
                <button style={{background: 'linear-gradient(90deg, #FFD700 60%, #fff 100%)', color: '#222', border: 'none', borderRadius: 12, padding: '8px 18px', fontWeight: 600, fontSize: 16, marginLeft: 'auto', cursor: 'pointer'}}>Agregar</button>
              </div>
              <div style={{color: '#aaa', fontWeight: 400, fontSize: 15}}>Expira: 04/2030</div>
            </div>
            <div style={{background: '#232323', borderRadius: 18, padding: 24, color: '#fff', fontWeight: 600, fontSize: 18, marginBottom: 24, border: '1px solid #393939'}}>
              <div style={{marginBottom: 8}}>Historial de pagos</div>
              <div style={{color: '#aaa', fontWeight: 400, fontSize: 15, marginBottom: 12}}>Aquí se muestran los recibos de membresía de grupo. ¿Necesitas facturas personalizadas?</div>
              <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 12}}>
                <span style={{color: '#fff', fontWeight: 400, fontSize: 15}}>Abril 28, 2025</span>
                <span style={{color: '#FFD700', fontWeight: 500, fontSize: 15}}>12 USD por la membresía SaaS in House</span>
              </div>
            </div>
          </>
        )}

        {activeTab === 'configuracion' && (
          <>
            <div style={{fontWeight: 700, fontSize: 22, color: '#FFD700', marginBottom: 18}}>Notificaciones generales</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 32}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
                <span style={{color: '#fff', fontWeight: 400, fontSize: 16}}>Enviar notificación por correo electrónico de nuevos seguidores</span>
                <label style={{marginLeft: 'auto'}}>
                  <input type="checkbox" style={{display: 'none'}} />
                  <span style={{display: 'inline-block', width: 44, height: 24, borderRadius: 24, background: 'linear-gradient(90deg, #FFD700 60%, #fff 100%)', position: 'relative', verticalAlign: 'middle'}}>
                    <span style={{display: 'block', width: 22, height: 22, borderRadius: 22, background: '#222', position: 'absolute', left: 2, top: 1}}></span>
                  </span>
                </label>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
                <span style={{color: '#fff', fontWeight: 400, fontSize: 16}}>Enviar notificación  por correo electrónico de nueva referencia de afiliado</span>
                <label style={{marginLeft: 'auto'}}>
                  <input type="checkbox" style={{display: 'none'}} />
                  <span style={{display: 'inline-block', width: 44, height: 24, borderRadius: 24, background: 'linear-gradient(90deg, #FFD700 60%, #fff 100%)', position: 'relative', verticalAlign: 'middle'}}>
                    <span style={{display: 'block', width: 22, height: 22, borderRadius: 22, background: '#222', position: 'absolute', left: 2, top: 1}}></span>
                  </span>
                </label>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
                <span style={{color: '#fff', fontWeight: 400, fontSize: 16}}>Activar sonido de caja registradora por nuevo cliente</span>
                <label style={{marginLeft: 'auto'}}>
                  <input type="checkbox" style={{display: 'none'}} />
                  <span style={{display: 'inline-block', width: 44, height: 24, borderRadius: 24, background: 'linear-gradient(90deg, #FFD700 60%, #fff 100%)', position: 'relative', verticalAlign: 'middle'}}>
                    <span style={{display: 'block', width: 22, height: 22, borderRadius: 22, background: '#222', position: 'absolute', left: 2, top: 1}}></span>
                  </span>
                </label>
              </div>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24}}>
              <span style={{fontWeight: 700, fontSize: 20, color: '#FFD700', display: 'flex', alignItems: 'center', gap: 10}}><span role="img" aria-label="medalla">🏆</span> Notificaciones Golden Suite</span>
              <button style={{background: 'linear-gradient(90deg, #FFD700 60%, #fff 100%)', color: '#222', border: 'none', borderRadius: 16, padding: '8px 28px', fontWeight: 600, fontSize: 18, marginLeft: 'auto', cursor: 'pointer'}}>Editar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SettingsPage; 