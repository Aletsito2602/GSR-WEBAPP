import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { validateClientEmail } from '../utils/clientValidation';
import './LoginPage.css';

// Lista completa de países
const countries = [
    { code: 'AF', name: 'Afganistán', phone: '+93' },
    { code: 'AL', name: 'Albania', phone: '+355' },
    { code: 'DE', name: 'Alemania', phone: '+49' },
    { code: 'AD', name: 'Andorra', phone: '+376' },
    { code: 'AO', name: 'Angola', phone: '+244' },
    { code: 'AI', name: 'Anguila', phone: '+1264' },
    { code: 'AQ', name: 'Antártida', phone: '+672' },
    { code: 'AG', name: 'Antigua y Barbuda', phone: '+1268' },
    { code: 'SA', name: 'Arabia Saudí', phone: '+966' },
    { code: 'DZ', name: 'Argelia', phone: '+213' },
    { code: 'AR', name: 'Argentina', phone: '+54' },
    { code: 'AM', name: 'Armenia', phone: '+374' },
    { code: 'AW', name: 'Aruba', phone: '+297' },
    { code: 'AU', name: 'Australia', phone: '+61' },
    { code: 'AT', name: 'Austria', phone: '+43' },
    { code: 'AZ', name: 'Azerbaiyán', phone: '+994' },
    { code: 'BS', name: 'Bahamas', phone: '+1242' },
    { code: 'BH', name: 'Baréin', phone: '+973' },
    { code: 'BD', name: 'Bangladés', phone: '+880' },
    { code: 'BB', name: 'Barbados', phone: '+1246' },
    { code: 'BE', name: 'Bélgica', phone: '+32' },
    { code: 'BZ', name: 'Belice', phone: '+501' },
    { code: 'BJ', name: 'Benín', phone: '+229' },
    { code: 'BM', name: 'Bermudas', phone: '+1441' },
    { code: 'BY', name: 'Bielorrusia', phone: '+375' },
    { code: 'BO', name: 'Bolivia', phone: '+591' },
    { code: 'BA', name: 'Bosnia y Herzegovina', phone: '+387' },
    { code: 'BW', name: 'Botsuana', phone: '+267' },
    { code: 'BR', name: 'Brasil', phone: '+55' },
    { code: 'BN', name: 'Brunéi', phone: '+673' },
    { code: 'BG', name: 'Bulgaria', phone: '+359' },
    { code: 'BF', name: 'Burkina Faso', phone: '+226' },
    { code: 'BI', name: 'Burundi', phone: '+257' },
    { code: 'BT', name: 'Bután', phone: '+975' },
    { code: 'CV', name: 'Cabo Verde', phone: '+238' },
    { code: 'KH', name: 'Camboya', phone: '+855' },
    { code: 'CM', name: 'Camerún', phone: '+237' },
    { code: 'CA', name: 'Canadá', phone: '+1' },
    { code: 'QA', name: 'Catar', phone: '+974' },
    { code: 'TD', name: 'Chad', phone: '+235' },
    { code: 'CL', name: 'Chile', phone: '+56' },
    { code: 'CN', name: 'China', phone: '+86' },
    { code: 'CY', name: 'Chipre', phone: '+357' },
    { code: 'CO', name: 'Colombia', phone: '+57' },
    { code: 'KM', name: 'Comoras', phone: '+269' },
    { code: 'CG', name: 'Congo', phone: '+242' },
    { code: 'KP', name: 'Corea del Norte', phone: '+850' },
    { code: 'KR', name: 'Corea del Sur', phone: '+82' },
    { code: 'CI', name: 'Costa de Marfil', phone: '+225' },
    { code: 'CR', name: 'Costa Rica', phone: '+506' },
    { code: 'HR', name: 'Croacia', phone: '+385' },
    { code: 'CU', name: 'Cuba', phone: '+53' },
    { code: 'CW', name: 'Curazao', phone: '+599' },
    { code: 'DK', name: 'Dinamarca', phone: '+45' },
    { code: 'DM', name: 'Dominica', phone: '+1767' },
    { code: 'EC', name: 'Ecuador', phone: '+593' },
    { code: 'EG', name: 'Egipto', phone: '+20' },
    { code: 'SV', name: 'El Salvador', phone: '+503' },
    { code: 'AE', name: 'Emiratos Árabes Unidos', phone: '+971' },
    { code: 'ER', name: 'Eritrea', phone: '+291' },
    { code: 'SK', name: 'Eslovaquia', phone: '+421' },
    { code: 'SI', name: 'Eslovenia', phone: '+386' },
    { code: 'ES', name: 'España', phone: '+34' },
    { code: 'US', name: 'Estados Unidos', phone: '+1' },
    { code: 'EE', name: 'Estonia', phone: '+372' },
    { code: 'ET', name: 'Etiopía', phone: '+251' },
    { code: 'PH', name: 'Filipinas', phone: '+63' },
    { code: 'FI', name: 'Finlandia', phone: '+358' },
    { code: 'FJ', name: 'Fiyi', phone: '+679' },
    { code: 'FR', name: 'Francia', phone: '+33' },
    { code: 'GA', name: 'Gabón', phone: '+241' },
    { code: 'GM', name: 'Gambia', phone: '+220' },
    { code: 'GE', name: 'Georgia', phone: '+995' },
    { code: 'GH', name: 'Ghana', phone: '+233' },
    { code: 'GI', name: 'Gibraltar', phone: '+350' },
    { code: 'GD', name: 'Granada', phone: '+1473' },
    { code: 'GR', name: 'Grecia', phone: '+30' },
    { code: 'GL', name: 'Groenlandia', phone: '+299' },
    { code: 'GP', name: 'Guadalupe', phone: '+590' },
    { code: 'GU', name: 'Guam', phone: '+1671' },
    { code: 'GT', name: 'Guatemala', phone: '+502' },
    { code: 'GF', name: 'Guayana Francesa', phone: '+594' },
    { code: 'GG', name: 'Guernsey', phone: '+44' },
    { code: 'GN', name: 'Guinea', phone: '+224' },
    { code: 'GQ', name: 'Guinea Ecuatorial', phone: '+240' },
    { code: 'GW', name: 'Guinea-Bisáu', phone: '+245' },
    { code: 'GY', name: 'Guyana', phone: '+592' },
    { code: 'HT', name: 'Haití', phone: '+509' },
    { code: 'HN', name: 'Honduras', phone: '+504' },
    { code: 'HK', name: 'Hong Kong', phone: '+852' },
    { code: 'HU', name: 'Hungría', phone: '+36' },
    { code: 'IN', name: 'India', phone: '+91' },
    { code: 'ID', name: 'Indonesia', phone: '+62' },
    { code: 'IQ', name: 'Irak', phone: '+964' },
    { code: 'IR', name: 'Irán', phone: '+98' },
    { code: 'IE', name: 'Irlanda', phone: '+353' },
    { code: 'BV', name: 'Isla Bouvet', phone: '+47' },
    { code: 'IM', name: 'Isla de Man', phone: '+44' },
    { code: 'CX', name: 'Isla de Navidad', phone: '+61' },
    { code: 'NF', name: 'Isla Norfolk', phone: '+672' },
    { code: 'IS', name: 'Islandia', phone: '+354' },
    { code: 'KY', name: 'Islas Caimán', phone: '+1345' },
    { code: 'CC', name: 'Islas Cocos', phone: '+61' },
    { code: 'CK', name: 'Islas Cook', phone: '+682' },
    { code: 'FO', name: 'Islas Feroe', phone: '+298' },
    { code: 'GS', name: 'Islas Georgias del Sur', phone: '+500' },
    { code: 'HM', name: 'Islas Heard y McDonald', phone: '+672' },
    { code: 'FK', name: 'Islas Malvinas', phone: '+500' },
    { code: 'MP', name: 'Islas Marianas del Norte', phone: '+1670' },
    { code: 'MH', name: 'Islas Marshall', phone: '+692' },
    { code: 'UM', name: 'Islas Menores de EE.UU.', phone: '+1' },
    { code: 'SB', name: 'Islas Salomón', phone: '+677' },
    { code: 'TC', name: 'Islas Turcas y Caicos', phone: '+1649' },
    { code: 'VG', name: 'Islas Vírgenes Británicas', phone: '+1284' },
    { code: 'VI', name: 'Islas Vírgenes de EE.UU.', phone: '+1340' },
    { code: 'IL', name: 'Israel', phone: '+972' },
    { code: 'IT', name: 'Italia', phone: '+39' },
    { code: 'JM', name: 'Jamaica', phone: '+1876' },
    { code: 'JP', name: 'Japón', phone: '+81' },
    { code: 'JE', name: 'Jersey', phone: '+44' },
    { code: 'JO', name: 'Jordania', phone: '+962' },
    { code: 'KZ', name: 'Kazajstán', phone: '+7' },
    { code: 'KE', name: 'Kenia', phone: '+254' },
    { code: 'KG', name: 'Kirguistán', phone: '+996' },
    { code: 'KI', name: 'Kiribati', phone: '+686' },
    { code: 'KW', name: 'Kuwait', phone: '+965' },
    { code: 'LA', name: 'Laos', phone: '+856' },
    { code: 'LS', name: 'Lesoto', phone: '+266' },
    { code: 'LV', name: 'Letonia', phone: '+371' },
    { code: 'LB', name: 'Líbano', phone: '+961' },
    { code: 'LR', name: 'Liberia', phone: '+231' },
    { code: 'LY', name: 'Libia', phone: '+218' },
    { code: 'LI', name: 'Liechtenstein', phone: '+423' },
    { code: 'LT', name: 'Lituania', phone: '+370' },
    { code: 'LU', name: 'Luxemburgo', phone: '+352' },
    { code: 'MO', name: 'Macao', phone: '+853' },
    { code: 'MK', name: 'Macedonia del Norte', phone: '+389' },
    { code: 'MG', name: 'Madagascar', phone: '+261' },
    { code: 'MY', name: 'Malasia', phone: '+60' },
    { code: 'MW', name: 'Malaui', phone: '+265' },
    { code: 'MV', name: 'Maldivas', phone: '+960' },
    { code: 'ML', name: 'Malí', phone: '+223' },
    { code: 'MT', name: 'Malta', phone: '+356' },
    { code: 'MA', name: 'Marruecos', phone: '+212' },
    { code: 'MQ', name: 'Martinica', phone: '+596' },
    { code: 'MU', name: 'Mauricio', phone: '+230' },
    { code: 'MR', name: 'Mauritania', phone: '+222' },
    { code: 'YT', name: 'Mayotte', phone: '+262' },
    { code: 'MX', name: 'México', phone: '+52' },
    { code: 'FM', name: 'Micronesia', phone: '+691' },
    { code: 'MD', name: 'Moldavia', phone: '+373' },
    { code: 'MC', name: 'Mónaco', phone: '+377' },
    { code: 'MN', name: 'Mongolia', phone: '+976' },
    { code: 'ME', name: 'Montenegro', phone: '+382' },
    { code: 'MS', name: 'Montserrat', phone: '+1664' },
    { code: 'MZ', name: 'Mozambique', phone: '+258' },
    { code: 'MM', name: 'Myanmar', phone: '+95' },
    { code: 'NA', name: 'Namibia', phone: '+264' },
    { code: 'NR', name: 'Nauru', phone: '+674' },
    { code: 'NP', name: 'Nepal', phone: '+977' },
    { code: 'NI', name: 'Nicaragua', phone: '+505' },
    { code: 'NE', name: 'Níger', phone: '+227' },
    { code: 'NG', name: 'Nigeria', phone: '+234' },
    { code: 'NU', name: 'Niue', phone: '+683' },
    { code: 'NO', name: 'Noruega', phone: '+47' },
    { code: 'NC', name: 'Nueva Caledonia', phone: '+687' },
    { code: 'NZ', name: 'Nueva Zelanda', phone: '+64' },
    { code: 'OM', name: 'Omán', phone: '+968' },
    { code: 'NL', name: 'Países Bajos', phone: '+31' },
    { code: 'PK', name: 'Pakistán', phone: '+92' },
    { code: 'PW', name: 'Palaos', phone: '+680' },
    { code: 'PA', name: 'Panamá', phone: '+507' },
    { code: 'PG', name: 'Papúa Nueva Guinea', phone: '+675' },
    { code: 'PY', name: 'Paraguay', phone: '+595' },
    { code: 'PE', name: 'Perú', phone: '+51' },
    { code: 'PN', name: 'Pitcairn', phone: '+64' },
    { code: 'PF', name: 'Polinesia Francesa', phone: '+689' },
    { code: 'PL', name: 'Polonia', phone: '+48' },
    { code: 'PT', name: 'Portugal', phone: '+351' },
    { code: 'PR', name: 'Puerto Rico', phone: '+1787' },
    { code: 'GB', name: 'Reino Unido', phone: '+44' },
    { code: 'CF', name: 'República Centroafricana', phone: '+236' },
    { code: 'CZ', name: 'República Checa', phone: '+420' },
    { code: 'CD', name: 'República Democrática del Congo', phone: '+243' },
    { code: 'DO', name: 'República Dominicana', phone: '+1809' },
    { code: 'RE', name: 'Reunión', phone: '+262' },
    { code: 'RW', name: 'Ruanda', phone: '+250' },
    { code: 'RO', name: 'Rumania', phone: '+40' },
    { code: 'RU', name: 'Rusia', phone: '+7' },
    { code: 'EH', name: 'Sahara Occidental', phone: '+212' },
    { code: 'WS', name: 'Samoa', phone: '+685' },
    { code: 'AS', name: 'Samoa Americana', phone: '+1684' },
    { code: 'BL', name: 'San Bartolomé', phone: '+590' },
    { code: 'KN', name: 'San Cristóbal y Nieves', phone: '+1869' },
    { code: 'SM', name: 'San Marino', phone: '+378' },
    { code: 'MF', name: 'San Martín', phone: '+590' },
    { code: 'PM', name: 'San Pedro y Miquelón', phone: '+508' },
    { code: 'VC', name: 'San Vicente y las Granadinas', phone: '+1784' },
    { code: 'SH', name: 'Santa Elena', phone: '+290' },
    { code: 'LC', name: 'Santa Lucía', phone: '+1758' },
    { code: 'ST', name: 'Santo Tomé y Príncipe', phone: '+239' },
    { code: 'SN', name: 'Senegal', phone: '+221' },
    { code: 'RS', name: 'Serbia', phone: '+381' },
    { code: 'SC', name: 'Seychelles', phone: '+248' },
    { code: 'SL', name: 'Sierra Leona', phone: '+232' },
    { code: 'SG', name: 'Singapur', phone: '+65' },
    { code: 'SX', name: 'Sint Maarten', phone: '+1721' },
    { code: 'SY', name: 'Siria', phone: '+963' },
    { code: 'SO', name: 'Somalia', phone: '+252' },
    { code: 'LK', name: 'Sri Lanka', phone: '+94' },
    { code: 'SZ', name: 'Suazilandia', phone: '+268' },
    { code: 'ZA', name: 'Sudáfrica', phone: '+27' },
    { code: 'SD', name: 'Sudán', phone: '+249' },
    { code: 'SS', name: 'Sudán del Sur', phone: '+211' },
    { code: 'SE', name: 'Suecia', phone: '+46' },
    { code: 'CH', name: 'Suiza', phone: '+41' },
    { code: 'SR', name: 'Surinam', phone: '+597' },
    { code: 'SJ', name: 'Svalbard y Jan Mayen', phone: '+47' },
    { code: 'TH', name: 'Tailandia', phone: '+66' },
    { code: 'TW', name: 'Taiwán', phone: '+886' },
    { code: 'TZ', name: 'Tanzania', phone: '+255' },
    { code: 'TJ', name: 'Tayikistán', phone: '+992' },
    { code: 'IO', name: 'Territorio Británico del Océano Índico', phone: '+246' },
    { code: 'TF', name: 'Territorios Australes Franceses', phone: '+262' },
    { code: 'PS', name: 'Territorios Palestinos', phone: '+970' },
    { code: 'TL', name: 'Timor Oriental', phone: '+670' },
    { code: 'TG', name: 'Togo', phone: '+228' },
    { code: 'TK', name: 'Tokelau', phone: '+690' },
    { code: 'TO', name: 'Tonga', phone: '+676' },
    { code: 'TT', name: 'Trinidad y Tobago', phone: '+1868' },
    { code: 'TN', name: 'Túnez', phone: '+216' },
    { code: 'TM', name: 'Turkmenistán', phone: '+993' },
    { code: 'TR', name: 'Turquía', phone: '+90' },
    { code: 'TV', name: 'Tuvalu', phone: '+688' },
    { code: 'UA', name: 'Ucrania', phone: '+380' },
    { code: 'UG', name: 'Uganda', phone: '+256' },
    { code: 'UY', name: 'Uruguay', phone: '+598' },
    { code: 'UZ', name: 'Uzbekistán', phone: '+998' },
    { code: 'VU', name: 'Vanuatu', phone: '+678' },
    { code: 'VA', name: 'Vaticano', phone: '+39' },
    { code: 'VE', name: 'Venezuela', phone: '+58' },
    { code: 'VN', name: 'Vietnam', phone: '+84' },
    { code: 'WF', name: 'Wallis y Futuna', phone: '+681' },
    { code: 'YE', name: 'Yemen', phone: '+967' },
    { code: 'DJ', name: 'Yibuti', phone: '+253' },
    { code: 'ZM', name: 'Zambia', phone: '+260' },
    { code: 'ZW', name: 'Zimbabue', phone: '+263' },
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
    const [country, setCountry] = useState(countries.find(c => c.code === 'AR') || countries[0]);
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

    // Inicializar el teléfono con el prefijo del país por defecto
    useEffect(() => {
        if (phone === '') {
            setPhone(country.phone + ' ');
        }
    }, [country, phone]);

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
        <form onSubmit={handleSignUp} className="auth-form register-form">
            <div className="form-row">
                <div className="input-wrapper">
                    <i className="fas fa-user input-icon"></i>
                    <input type="text" placeholder="Nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={loading} />
                </div>
                <div className="input-wrapper">
                    <i className="fas fa-user input-icon"></i>
                    <input type="text" placeholder="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={loading} />
                </div>
            </div>
            <div className="form-row">
                <div className="input-wrapper">
                     <i className="fas fa-at input-icon"></i>
                    <input type="text" placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={loading} />
                </div>
                <div className="input-wrapper">
                    <i className="fas fa-envelope input-icon"></i>
                    <input type="email" placeholder="Correo electrónico" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required disabled={loading} />
                </div>
            </div>
            <div className="input-wrapper">
                <i className="fas fa-globe input-icon"></i>
                <select className="input-select" value={country.code} onChange={(e) => {
                    const newCountry = countries.find(c => c.code === e.target.value);
                    setCountry(newCountry);
                    // Mejorar el auto-completado del teléfono
                    const phoneWithoutPrefix = phone.replace(/^\+\d+\s*/, '').trim(); // Remover prefijo anterior
                    setPhone(`${newCountry.phone} ${phoneWithoutPrefix}`);
                }} disabled={loading}>
                    {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
            </div>
            <div className="input-wrapper">
                <i className="fas fa-phone input-icon"></i>
                <input 
                    type="tel" 
                    placeholder={`Ej: ${country.phone} 11 1234 5678`}
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    required 
                    disabled={loading} 
                />
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
                <label className="remember-me-label terms-label">
                    <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                    <span></span>
                    Acepto los <a href="#" style={{color: '#a18a51', textDecoration: 'underline'}}>términos y condiciones</a>.
                </label>
                <label className="remember-me-label terms-label">
                    <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                    <span></span>
                    Acepto la <a href="#" style={{color: '#a18a51', textDecoration: 'underline'}}>política de privacidad</a>.
                </label>
            </div>
            <button type="submit" className="submit-button-gold" disabled={loading}>
                {loading ? 'Registrando...' : 'Crear Cuenta'}
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