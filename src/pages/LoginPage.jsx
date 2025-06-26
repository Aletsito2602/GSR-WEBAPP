import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { validateClientEmail } from '../utils/clientValidation';
import './LoginPage.css';

// Sample data for dropdowns
const countries = [
    { code: 'AR', name: 'Argentina', phone: '+54' },
    { code: 'US', name: 'United States', phone: '+1' },
    { code: 'ES', name: 'España', phone: '+34' },
    { code: 'MX', name: 'Mexico', phone: '+52' },
];

const LoginPage = () => {
    // View State
    const [view, setView] = useState('login'); // 'login', 'register', 'recover'
    
    // Common State
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, syncUserWithFirestore } = useAuth();

    // Login State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    // Register State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [country, setCountry] = useState(countries[0]);
    const [phone, setPhone] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Recover Password State
    const [recoverEmail, setRecoverEmail] = useState('');

    // Language Dropdown State
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const languages = [
        { code: 'EN', name: 'English', flag: 'https://flagcdn.com/gb.svg' },
        { code: 'ES', name: 'Español', flag: 'https://flagcdn.com/es.svg' },
    ];
    const [selectedLang, setSelectedLang] = useState(languages[0]);
    const langSelectorRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (langSelectorRef.current && !langSelectorRef.current.contains(event.target)) {
                setIsLangDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [langSelectorRef]);


    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(loginEmail, loginPassword);
            navigate('/');
        } catch (err) {
            setError('Credenciales incorrectas. Por favor, verifica tu email y contraseña.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        if (registerPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (!termsAccepted) {
            setError('Debes aceptar los términos y condiciones.');
            return;
        }
        setLoading(true);
        try {
            const { isValid, clientInfo } = await validateClientEmail(registerEmail);
            if (!isValid) {
                setError('Email no autorizado. Por favor contacta a soporte.');
                setLoading(false);
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
            const user = userCredential.user;
            await updateProfile(user, { displayName: `${firstName} ${lastName}` });
            await syncUserWithFirestore(user, { ...clientInfo, username, country: country.name, phone });

            alert('¡Registro exitoso! Por favor, inicia sesión.');
            setView('login');
            // Clear register fields after success
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Este correo electrónico ya está en uso.');
            } else {
                setError('Error al registrarse. Por favor, inténtalo de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };
    
    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setError('');
        if (!recoverEmail) {
            setError('Por favor, ingresa tu correo electrónico.');
            return;
        }
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, recoverEmail);
            alert('Se ha enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.');
            setView('login');
        } catch (err) {
            setError('Error al enviar el correo. Asegúrate de que la dirección es correcta.');
        } finally {
            setLoading(false);
        }
    };

    const switchView = (e, targetView) => {
        e.preventDefault();
        setError('');
        setView(targetView);
    };

    const renderLoginForm = () => (
        <form onSubmit={handleLogin} className="auth-form">
            <div className="input-wrapper">
                <i className="fas fa-user input-icon"></i>
                <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Usuario" required disabled={loading}/>
            </div>
            <div className="input-wrapper">
                <i className="fas fa-lock input-icon"></i>
                <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Contraseña" required disabled={loading}/>
            </div>
            <div className="options-wrapper">
                <label className="remember-me-label">
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}/>
                    <span></span>
                    Recuerdame
                </label>
                <a href="#" onClick={(e) => switchView(e, 'recover')} className="forgot-password-link">¿Olvidaste la contraseña?</a>
            </div>
            <button type="submit" className="submit-button-gold" disabled={loading}>
                {loading ? 'Cargando...' : 'Iniciar Sesion'}
            </button>
        </form>
    );

    const renderRegisterForm = () => (
        <form onSubmit={handleSignUp} className="auth-form">
            <div className="form-row">
                <div className="input-wrapper">
                    <input type="text" placeholder="Nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={loading} />
                </div>
                <div className="input-wrapper">
                    <input type="text" placeholder="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={loading} />
                </div>
            </div>
            <div className="form-row">
                <div className="input-wrapper">
                     <i className="fas fa-user input-icon"></i>
                    <input type="text" placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={loading} />
                </div>
                <div className="input-wrapper">
                    <i className="fas fa-envelope input-icon"></i>
                    <input type="email" placeholder="Correo electrónico" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required disabled={loading} />
                </div>
            </div>
            <div className="input-wrapper">
                {/* Custom country dropdown would go here. For now, a simple select. */}
                <select className="input-select" value={country.code} onChange={(e) => setCountry(countries.find(c => c.code === e.target.value))} disabled={loading}>
                    {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
            </div>
            <div className="form-row">
                <div className="input-wrapper phone-code">
                    <select value={country.code} onChange={(e) => setCountry(countries.find(c => c.code === e.target.value))} disabled={loading}>
                        {countries.map(c => <option key={c.code} value={c.code}>{c.code} {c.phone}</option>)}
                    </select>
                </div>
                <div className="input-wrapper phone-number">
                    <input type="tel" placeholder="Número de teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={loading} />
                </div>
            </div>
             <div className="input-wrapper">
                <i className="fas fa-lock input-icon"></i>
                <input type="password" placeholder="Contraseña" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required disabled={loading}/>
            </div>
            <div className="input-wrapper">
                <i className="fas fa-lock input-icon"></i>
                <input type="password" placeholder="Confirmar contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loading}/>
            </div>
            <div className="options-wrapper">
                <label className="remember-me-label">
                    <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                    <span></span>
                    Acepto los términos, condiciones y la política de privacidad.
                </label>
            </div>
            <button type="submit" className="submit-button-gold" disabled={loading}>
                {loading ? 'Registrando...' : 'Continuar'}
            </button>
        </form>
    );

    const renderRecoverForm = () => (
         <form onSubmit={handlePasswordReset} className="auth-form">
            <div className="input-wrapper">
                <i className="fas fa-user input-icon"></i>
                <input type="text" placeholder="Usuario" disabled={loading} />
            </div>
            <div className="input-wrapper">
                <i className="fas fa-envelope input-icon"></i>
                <input type="email" placeholder="Correo electrónico" value={recoverEmail} onChange={(e) => setRecoverEmail(e.target.value)} required disabled={loading} />
            </div>
            <button type="submit" className="submit-button-gold" disabled={loading}>
                {loading ? 'Enviando...' : 'Continuar'}
            </button>
        </form>
    );
    
    const renderContent = () => {
        switch(view) {
            case 'login': return renderLoginForm();
            case 'register': return renderRegisterForm();
            case 'recover': return renderRecoverForm();
            default: return renderLoginForm();
        }
    }

    return (
        <div className={`login-page-split view-${view}`}>
            <div className="login-form-column">
                <div className="form-container">
                    {view === 'recover' ? (
                         <button className="back-button" onClick={(e) => switchView(e, 'login')}>
                            <i className="fas fa-arrow-left"></i>
                        </button>
                    ) : (
                        <div className="language-selector" ref={langSelectorRef} onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}>
                            <img src={selectedLang.flag} width="20" alt={`${selectedLang.name} Flag`}/>
                            <span>{selectedLang.code}</span>
                            <i className={`fas fa-chevron-down ${isLangDropdownOpen ? 'open' : ''}`}></i>
                            {isLangDropdownOpen && (
                                <div className="language-dropdown">
                                    {languages.map(lang => (
                                        <div key={lang.code} className="language-option" onClick={() => setSelectedLang(lang)}>
                                            <img src={lang.flag} width="20" alt={`${lang.name} Flag`}/>
                                            <span>{lang.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="logo-wrapper">
                        <img src="/images/logo.png" alt="GSR Logo" className="form-logo" />
                    </div>

                    {renderContent()}

                    {error && <p className="form-error">{error}</p>}

                    <div className="form-footer-links">
                       {view === 'login' && (
                            <>
                                <a href="#" className="footer-link">Verificar ahora</a>
                                <p className="toggle-mode-text">
                                    ¿No tienes cuenta? <a href="#" onClick={(e) => switchView(e, 'register')}>Registrate</a>
                                </p>
                            </>
                        )}
                        {view === 'register' && (
                            <>
                                <a href="#" className="footer-link">Verificar ahora</a>
                                <p className="toggle-mode-text">
                                    ¿Ya estás registrado? <a href="#" onClick={(e) => switchView(e, 'login')}>Login</a>
                                </p>
                            </>
                        )}
                        {view === 'recover' && (
                             <p className="toggle-mode-text">
                                ¿No tienes cuenta? <a href="#" onClick={(e) => switchView(e, 'register')}>Registrate</a>
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="info-column">
                <img src="/images/Login/cards.svg" alt="Tarjetas de información" className="info-column-svg" />
            </div>
        </div>
    );
};

export default LoginPage; 