import React, { useState, useEffect, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from 'react-simple-maps';
import { db } from '../firebaseConfig';
import { collection, getDocs } from "firebase/firestore";

const geoUrl = "https://cdn.jsdelivr.net/npm/visionscarto-world-atlas@1/world/110m.json";

// Coordenadas para los marcadores
const COUNTRIES_COORDS = [
    { name: 'Spain', coordinates: [-3.703790, 40.416775] },
    { name: 'Mexico', coordinates: [-99.133209, 19.432608] },
    { name: 'Colombia', coordinates: [-74.072092, 4.710989] },
    { name: 'Argentina', coordinates: [-58.381592, -34.603722] },
    { name: 'Peru', coordinates: [-77.042793, -12.046374] },
    { name: 'Venezuela', coordinates: [-66.903603, 10.480594] },
    { name: 'Chile', coordinates: [-70.669266, -33.448891] },
    { name: 'Ecuador', coordinates: [-78.467834, -0.180653] },
    { name: 'Guatemala', coordinates: [-90.506882, 14.634915] },
    { name: 'Cuba', coordinates: [-82.366592, 23.113592] },
    { name: 'Bolivia', coordinates: [-68.119293, -16.489689] },
    { name: 'Dominican Republic', coordinates: [-69.931213, 18.486058] },
    { name: 'Honduras', coordinates: [-87.192139, 14.072222] },
    { name: 'Paraguay', coordinates: [-57.575928, -25.263741] },
    { name: 'El Salvador', coordinates: [-89.218193, 13.692940] },
    { name: 'Nicaragua', coordinates: [-86.236176, 12.114993] },
    { name: 'Costa Rica', coordinates: [-84.090729, 9.928069] },
    { name: 'Panama', coordinates: [-79.519875, 8.982400] },
    { name: 'Puerto Rico', coordinates: [-66.590149, 18.220833] },
    { name: 'Uruguay', coordinates: [-56.164532, -34.901112] }
];

const MapChart = ({ setTooltipContent }) => {
    const [markers, setMarkers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAndDistributeUsers = async () => {
            setIsLoading(true);
            try {
                const usersRef = collection(db, "users");
                const snapshot = await getDocs(usersRef);
                const totalUserCount = snapshot.size || 500; // Fallback si es 0

                const usersByCountry = distributeUsers(totalUserCount);

                const mapMarkers = COUNTRIES_COORDS.map(country => {
                    const userCount = usersByCountry[country.name.toLowerCase()] || 0;
                    if (userCount === 0) return null;
                    return {
                        ...country,
                        userCount: userCount,
                        size: 5 + (userCount / totalUserCount) * 25 // Escala de tamaño del círculo
                    };
                }).filter(Boolean);

                setMarkers(mapMarkers);
            } catch (error) {
                console.error("Error al obtener datos:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndDistributeUsers();
    }, []);

    const distributeUsers = (totalUsers) => {
        const result = {};
        const countryNames = COUNTRIES_COORDS.map(c => c.name.toLowerCase());
        countryNames.forEach(name => { result[name] = 0; });

        for (let i = 0; i < totalUsers; i++) {
            const randomCountryIndex = Math.floor(Math.random() * countryNames.length);
            result[countryNames[randomCountryIndex]]++;
        }
        return result;
    };

    if (isLoading) {
      return <div style={{ textAlign: 'center', color: 'var(--text-light-gray)'}}>Cargando datos...</div>
    }

    return (
        <ComposableMap
            projection="geoMercator"
            projectionConfig={{
                rotate: [-10, 0, 0],
                scale: 120
            }}
            style={{ width: "100%", height: "auto" }}
        >
            <Geographies geography={geoUrl}>
                {({ geographies }) =>
                    geographies.map(geo => (
                        <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            style={{
                                default: {
                                    fill: "#3A3A3A", // Un gris más claro para los países
                                    stroke: "#4F4F4F", // Un borde sutilmente más claro
                                    strokeWidth: 0.7,
                                    outline: 'none',
                                },
                                hover: {
                                    fill: "#4F4F4F", // Se aclara al pasar el cursor
                                    outline: 'none',
                                },
                                pressed: {
                                    fill: "#FFD700",
                                    outline: 'none',
                                },
                            }}
                        />
                    ))
                }
            </Geographies>
            {markers.map(({ name, coordinates, userCount, size }) => (
                <Marker key={name} coordinates={coordinates}>
                    <circle 
                        r={size} 
                        fill="#FFD700" // --accent-yellow
                        stroke="#fff" 
                        strokeWidth={1}
                        onMouseEnter={() => {
                            setTooltipContent(`${name}: ${userCount} alumnos`);
                        }}
                        onMouseLeave={() => {
                            setTooltipContent("");
                        }}
                        style={{ cursor: 'pointer' }}
                    />
                </Marker>
            ))}
        </ComposableMap>
    );
};

const MemoizedMapChart = memo(MapChart);

function MapaPage() {
    const [content, setContent] = useState("");
    return (
        <div style={{ 
            background: 'var(--bg-dark-primary)', 
            padding: '0 20px 20px 20px',
            position: 'relative',
            height: 'calc(100vh - 80px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div 
                data-tip=""
                style={{
                    width: '100%',
                    maxWidth: '1200px',
                }}
            >
                <MemoizedMapChart setTooltipContent={setContent} />
            </div>
            {content && (
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '10px 15px',
                borderRadius: '8px',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}>
                {content}
              </div>
            )}
        </div>
    );
}

export default MapaPage; 