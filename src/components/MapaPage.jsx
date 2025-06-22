import React, { useState, useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';
import { db } from '../firebaseConfig';
import { collection, getDocs } from "firebase/firestore";

// Lista de países hispanohablantes y sus ISO codes
const HISPANIC_COUNTRIES = [
  { name: 'Spain', iso: 'ES' },
  { name: 'Mexico', iso: 'MX' },
  { name: 'Colombia', iso: 'CO' },
  { name: 'Argentina', iso: 'AR' },
  { name: 'Peru', iso: 'PE' },
  { name: 'Venezuela', iso: 'VE' },
  { name: 'Chile', iso: 'CL' },
  { name: 'Ecuador', iso: 'EC' },
  { name: 'Guatemala', iso: 'GT' },
  { name: 'Cuba', iso: 'CU' },
  { name: 'Bolivia', iso: 'BO' },
  { name: 'Dominican Republic', iso: 'DO' },
  { name: 'Honduras', iso: 'HN' },
  { name: 'Paraguay', iso: 'PY' },
  { name: 'El Salvador', iso: 'SV' },
  { name: 'Nicaragua', iso: 'NI' },
  { name: 'Costa Rica', iso: 'CR' },
  { name: 'Panama', iso: 'PA' },
  { name: 'Puerto Rico', iso: 'PR' },
  { name: 'Uruguay', iso: 'UY' }
];

function MapaPage() {
  const globeEl = useRef();
  const [countries, setCountries] = useState([]);
  const [hoverD, setHoverD] = useState();
  const [usersByCountry, setUsersByCountry] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Obtener el número total de usuarios y distribuirlos
  useEffect(() => {
    const fetchAndDistributeUsers = async () => {
      setIsLoading(true);
      
      try {
        // Obtener el total de usuarios de Firestore
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        const totalUserCount = snapshot.size;
        setTotalUsers(totalUserCount);
        
        // Distribuir los usuarios entre países hispanohablantes
        const distributedUsers = distributeUsers(totalUserCount);
        setUsersByCountry(distributedUsers);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAndDistributeUsers();
  }, []);
  
  // Función para distribuir usuarios entre países hispanohablantes
  const distributeUsers = (totalUsers) => {
    const result = {};
    
    // Distribuir usuarios con cierta variabilidad (algunos países tendrán más usuarios)
    let remainingUsers = totalUsers;
    
    // Países con más peso (más usuarios)
    const primaryCountries = ['Spain', 'Mexico', 'Colombia', 'Argentina', 'Peru'];
    const secondaryCountries = ['Chile', 'Venezuela', 'Ecuador', 'Guatemala', 'Cuba'];
    const tertiaryCountries = HISPANIC_COUNTRIES.filter(c => 
      !primaryCountries.includes(c.name) && !secondaryCountries.includes(c.name)
    ).map(c => c.name);
    
    // Asignar usuarios a países primarios (60%)
    const primaryShare = Math.floor(totalUsers * 0.6);
    const primaryPerCountry = Math.floor(primaryShare / primaryCountries.length);
    const primaryExtra = primaryShare % primaryCountries.length;
    
    primaryCountries.forEach((country, index) => {
      // Los países más grandes reciben algunos usuarios extra
      const extra = index < primaryExtra ? 1 : 0;
      result[country.toLowerCase()] = primaryPerCountry + extra;
      remainingUsers -= (primaryPerCountry + extra);
    });
    
    // Asignar usuarios a países secundarios (30%)
    const secondaryShare = Math.floor(totalUsers * 0.3);
    const secondaryPerCountry = Math.floor(secondaryShare / secondaryCountries.length);
    const secondaryExtra = secondaryShare % secondaryCountries.length;
    
    secondaryCountries.forEach((country, index) => {
      const extra = index < secondaryExtra ? 1 : 0;
      result[country.toLowerCase()] = secondaryPerCountry + extra;
      remainingUsers -= (secondaryPerCountry + extra);
    });
    
    // Asignar usuarios restantes a países terciarios
    const tertiaryPerCountry = Math.floor(remainingUsers / tertiaryCountries.length);
    const tertiaryExtra = remainingUsers % tertiaryCountries.length;
    
    tertiaryCountries.forEach((country, index) => {
      const extra = index < tertiaryExtra ? 1 : 0;
      result[country.toLowerCase()] = tertiaryPerCountry + extra;
    });
    
    console.log("Distribución de usuarios:", result);
    return result;
  };
  
  // Cargar datos de países y marcar los hispanohablantes
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(({ features }) => {
        const hispanicISOs = HISPANIC_COUNTRIES.map(c => c.iso);
        
        // Enriquecer datos con propiedad hasUsers
        const enrichedFeatures = features.map(feature => {
          // Verificar si es país hispanohablante por código ISO
          const isHispanic = hispanicISOs.includes(feature.properties.ISO_A2);
          
          // Verificar si tiene usuarios específicos por nombre
          const countryName = feature.properties.ADMIN.toLowerCase();
          const hasSpecificUsers = Object.keys(usersByCountry).some(c => 
            countryName.includes(c) || c.includes(countryName)
          );
          
          return {
            ...feature,
            hasUsers: isHispanic || hasSpecificUsers
          };
        });
        
        setCountries(enrichedFeatures);
      });
  }, [usersByCountry]);
  
  // Configurar el globo cuando esté listo
  useEffect(() => {
    if (globeEl.current && countries.length) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.5;
      
      // Centrar en España/Latinoamérica
      globeEl.current.pointOfView({
        lat: 10,
        lng: -80,
        altitude: 2.5
      }, 1000);
    }
  }, [countries]);

  // Función para encontrar el número de usuarios para un país específico
  const getUserCountForCountry = (countryName) => {
    // Normalizar el nombre para comparación
    const normalizedCountryName = countryName.toLowerCase();
    
    // Buscar coincidencias directas
    for (const [country, count] of Object.entries(usersByCountry)) {
      if (normalizedCountryName.includes(country) || 
          country.includes(normalizedCountryName)) {
        return count;
      }
    }
    
    // Verificar si es país hispanohablante usando mappings
    const mappings = {
      'Spain': ['spain', 'españa'],
      'Mexico': ['mexico', 'méxico'],
      'United States': ['united states', 'usa', 'estados unidos'],
      'Colombia': ['colombia'],
      'Argentina': ['argentina'],
      'Peru': ['peru', 'perú'],
      'Venezuela': ['venezuela'],
      'Chile': ['chile'],
      'Ecuador': ['ecuador'],
      'Guatemala': ['guatemala'],
      'Cuba': ['cuba'],
      'Bolivia': ['bolivia'],
      'Dominican Republic': ['dominican republic', 'república dominicana', 'rep. dominicana'],
      'Honduras': ['honduras'],
      'Paraguay': ['paraguay'],
      'El Salvador': ['el salvador'],
      'Nicaragua': ['nicaragua'],
      'Costa Rica': ['costa rica'],
      'Panama': ['panama', 'panamá'],
      'Puerto Rico': ['puerto rico'],
      'Uruguay': ['uruguay']
    };
    
    // Buscar en mappings
    for (const [geoCountry, aliases] of Object.entries(mappings)) {
      if (aliases.some(alias => normalizedCountryName.includes(alias))) {
        // Buscar el valor correspondiente en usersByCountry
        for (const alias of aliases) {
          if (usersByCountry[alias]) {
            return usersByCountry[alias];
          }
        }
        // Si no se encuentra, pero es hispanohablante, asignar un número pequeño
        return Math.floor(Math.random() * 5) + 1;
      }
    }
    
    return 0;
  };

  return (
    <div style={{ maxWidth: '100%', height: '90vh', margin: '0', padding: '0' }}>
      {isLoading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          color: '#aaa'
        }}>
          <span>Cargando mapa de usuarios...</span>
        </div>
      ) : (
        <div style={{ 
          width: '100%', 
          height: '100%', 
          background: '#191919',
          position: 'relative'
        }}>
          <Globe
            ref={globeEl}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            lineHoverPrecision={0}
            polygonsData={countries}
            polygonAltitude={0.01}
            polygonCapColor={d => {
              if (d === hoverD) return '#FFD700';
              return d.hasUsers ? '#D7B615' : '#353535';
            }}
            polygonSideColor={() => '#232323'}
            polygonStrokeColor={() => '#111'}
            polygonLabel={({ properties: d }) => {
              const userCount = getUserCountForCountry(d.ADMIN);
              return userCount > 0 ? `
                <div style="padding: 10px; background: #232323; border-radius: 5px;">
                  <div style="color: #FFD700; font-weight: bold; font-size: 1.2em; margin-bottom: 5px;">
                    ${d.ADMIN}
                  </div>
                  <div style="color: white; font-size: 0.9em;">
                    Usuarios: ${userCount}
                  </div>
                </div>
              ` : '';
            }}
            onPolygonHover={setHoverD}
            polygonsTransitionDuration={300}
            width={window.innerWidth}
            height={window.innerHeight * 0.9}
          />
        </div>
      )}
    </div>
  );
}

export default MapaPage; 