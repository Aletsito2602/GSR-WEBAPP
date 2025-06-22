const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

// Inicializar la aplicación Firebase Admin
initializeApp();

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: [
    'http://localhost:5173',
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
app.use(express.json());

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Función para obtener videos de Vimeo
const getVimeoVideos = async (req, res) => {
  try {
    const response = await fetch('https://api.vimeo.com/me/videos', {
      headers: {
        'Authorization': `Bearer ${process.env.VIMEO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error de Vimeo: ${response.status}`);
    }

    const data = await response.json();
    res.json(data.data);
  } catch (error) {
    console.error('Error al obtener videos:', error);
    res.status(500).json({ error: 'Error al obtener videos de Vimeo' });
  }
};

// Rutas
app.get('/api/videos', getVimeoVideos);

// Exportar la función HTTP
exports.api = onCall({
  cors: corsOptions,
  maxInstances: 10
}, async (request) => {
  try {
    console.log('Recibida solicitud:', request.data);
    const { method, path, body } = request.data;
    
    switch (path) {
      case '/videos':
        if (method === 'GET') {
          console.log('Obteniendo videos de Vimeo...');
          const response = await fetch('https://api.vimeo.com/me/videos', {
            headers: {
              'Authorization': `Bearer ${process.env.VIMEO_ACCESS_TOKEN}`,
              'Accept': 'application/vnd.vimeo.*+json;version=3.4',
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Error de Vimeo:', errorText);
            throw new HttpsError('internal', `Error al obtener videos de Vimeo: ${errorText}`);
          }
          
          const data = await response.json();
          console.log('Videos obtenidos:', data);
          return { data: data.data };
        }
        break;
        
      default:
        console.error('Ruta no encontrada:', path);
        throw new HttpsError('not-found', 'Ruta no encontrada');
    }
  } catch (error) {
    console.error('Error en la función:', error);
    throw new HttpsError('internal', error.message);
  }
});

/**
 * Función HTTPS que puede ser llamada para dar rol de admin a un usuario
 * Requiere autenticación y que el solicitante ya sea admin
 */
exports.setAdminRole = onCall({ enforceAppCheck: true }, async (request) => {
  try {
    // Verificar que el usuario esté autenticado
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Se requiere autenticación para esta operación"
      );
    }

    // Verificar que el solicitante es admin
    const callerUid = request.auth.uid;
    const callerUserRecord = await getAuth().getUser(callerUid);
    const callerClaims = callerUserRecord.customClaims || {};

    if (!callerClaims.admin) {
      throw new HttpsError(
        "permission-denied",
        "Requiere permisos de administrador para asignar roles"
      );
    }

    // Obtener el email del usuario a promover
    const { email } = request.data;
    if (!email) {
      throw new HttpsError("invalid-argument", "Email es requerido");
    }

    // Obtener el usuario por email
    const userRecord = await getAuth().getUserByEmail(email);
    
    // Establecer el claim de admin
    await getAuth().setCustomUserClaims(userRecord.uid, { admin: true });

    // Registrar cambio en Firestore
    await getFirestore().collection("admin_logs").add({
      action: "set_admin_role",
      targetUser: userRecord.uid,
      targetEmail: email,
      performedBy: callerUid,
      timestamp: new Date()
    });

    return {
      success: true,
      message: `Usuario ${email} ahora tiene rol de administrador`
    };
  } catch (error) {
    console.error("Error al establecer rol de administrador:", error);
    throw new HttpsError("internal", error.message);
  }
});

/**
 * Función HTTPS que puede ser llamada para quitar rol de admin a un usuario
 * Requiere autenticación y que el solicitante ya sea admin
 */
exports.removeAdminRole = onCall({ enforceAppCheck: true }, async (request) => {
  try {
    // Verificar que el usuario esté autenticado
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Se requiere autenticación para esta operación"
      );
    }

    // Verificar que el solicitante es admin
    const callerUid = request.auth.uid;
    const callerUserRecord = await getAuth().getUser(callerUid);
    const callerClaims = callerUserRecord.customClaims || {};

    if (!callerClaims.admin) {
      throw new HttpsError(
        "permission-denied",
        "Requiere permisos de administrador para quitar roles"
      );
    }

    // Obtener el email del usuario
    const { email } = request.data;
    if (!email) {
      throw new HttpsError("invalid-argument", "Email es requerido");
    }

    // Obtener el usuario por email
    const userRecord = await getAuth().getUserByEmail(email);
    
    // Quitar el claim de admin
    await getAuth().setCustomUserClaims(userRecord.uid, { admin: false });

    // Registrar cambio en Firestore
    await getFirestore().collection("admin_logs").add({
      action: "remove_admin_role",
      targetUser: userRecord.uid,
      targetEmail: email,
      performedBy: callerUid,
      timestamp: new Date()
    });

    return {
      success: true,
      message: `Usuario ${email} ya no tiene rol de administrador`
    };
  } catch (error) {
    console.error("Error al quitar rol de administrador:", error);
    throw new HttpsError("internal", error.message);
  }
}); 