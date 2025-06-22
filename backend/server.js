import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import cors from 'cors';

// Cargar variables de entorno desde .env
dotenv.config({ path: 'backend/.env' });

const app = express();
const port = process.env.PORT || 3001;

// Configuración de CORS más específica
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://golden-suite-room-vgdl8z.web.app',
    'https://golden-suite-room-vgdl8z.firebaseapp.com',
    'https://milegadoisaacramirez.com',
    'https://www.milegadoisaacramirez.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  maxAge: 3600
};

app.use(cors(corsOptions));

// Middleware para parsear JSON
app.use(express.json());

// Middleware para logging de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Helper function para hacer la llamada a Vimeo API
async function fetchVimeoAPI(url, accessToken) {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.vimeo.*+json;version=3.4'
    }
  });
  if (!response.ok) {
    // Manejo de errores mejorado como hicimos para el endpoint de video único
    if (response.status === 404) {
        throw new Error('Recurso no encontrado en Vimeo (404)');
    } else if (response.status === 403) {
        throw new Error('Acceso prohibido por Vimeo (403) - Verifica permisos del token');
    }
    let errorBody = 'Error desconocido';
    try { errorBody = await response.text(); } catch (e) { /* ignore */ }
    throw new Error(`Error de Vimeo (${response.status}): ${errorBody}`);
  }
  return await response.json();
}

// Endpoint para obtener TODOS los videos de una carpeta específica (con paginación)
app.get('/api/vimeo/folder-videos', async (req, res) => {
  const accessToken = process.env.VIMEO_ACCESS_TOKEN;
  const userId = process.env.VIMEO_USER_ID;
  const requestedFolderId = req.query.folderId;
  const fallbackFolderId = process.env.VIMEO_FOLDER_ID;
  const folderId = requestedFolderId || fallbackFolderId;

  if (!accessToken || !userId || !folderId) {
    return res.status(500).json({ message: 'Error de configuración: Faltan variables de entorno de Vimeo o folderId.' });
  }

  let apiUrl = `https://api.vimeo.com/users/${userId}/folders/${folderId}/videos?fields=uri,name,description,duration,pictures,link&per_page=50`;
  let videos = [];

  try {
    while (apiUrl) {
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.vimeo.*+json;version=3.4'
        }
      });
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        videos = videos.concat(data.data);
        apiUrl = data.paging && data.paging.next ? `https://api.vimeo.com${data.paging.next}` : null;
      } else {
        apiUrl = null;
      }
    }
    // Devuelve solo los campos necesarios
    const formatted = videos.map(video => ({
      id: video.uri.split('/').pop(),
      title: video.name,
      description: video.description,
      thumbnail: video.pictures?.base_link,
      link: video.link
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener videos de Vimeo', details: error.message });
  }
});

// Endpoint para obtener detalles de un video específico
app.get('/api/vimeo/video/:videoId', async (req, res) => {
  const accessToken = process.env.VIMEO_ACCESS_TOKEN;
  const videoId = req.params.videoId;
  
  // <<< Log para depuración
  console.log(`Backend: Intentando obtener detalles para video ID: ${videoId}`); 

  if (!accessToken) {
    return res.status(500).json({ message: 'Error de configuración: Falta token de acceso de Vimeo.' });
  }
  if (!videoId) {
    return res.status(400).json({ message: 'Falta el ID del video.' });
  }

  // Quitar embed.html de los fields solicitados
  const url = `https://api.vimeo.com/videos/${videoId}?fields=uri,name,description,duration,pictures.base_link,stats,link,user.name`;

  try {
    const vimeoResponse = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.vimeo.*+json;version=3.4'
      }
    });

    if (!vimeoResponse.ok) {
      if (vimeoResponse.status === 404) {
        console.error(`Video ${videoId} not found on Vimeo.`);
        return res.status(404).json({ message: 'Video no encontrado en Vimeo (404 desde Vimeo)' });
      }
      
      let errorBody = null;
      try {
        errorBody = await vimeoResponse.text();
      } catch (parseError) {
        console.error('Could not parse error body from Vimeo');
      }
      console.error(`Error fetching video ${videoId} from Vimeo. Status: ${vimeoResponse.status}`, errorBody);
      return res.status(vimeoResponse.status).json({ 
        message: `Error al obtener detalles del video de Vimeo (Status: ${vimeoResponse.status})`,
        error: errorBody 
      });
    }

    const data = await vimeoResponse.json();
    res.json(data); // Devolver el objeto completo del video

  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
}); 