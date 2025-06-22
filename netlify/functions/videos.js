const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Manejar solicitudes OPTIONS para CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Credentials': 'true'
      },
      body: ''
    };
  }

  try {
    console.log('Obteniendo videos de Vimeo...');
    const userId = '217228632';
    const folderId = '25173287';
    
    // Construir la URL con los campos necesarios
    const url = `https://api.vimeo.com/users/${userId}/folders/${folderId}/videos?fields=uri,name,description,duration,pictures,stats,link&per_page=50`;
    
    console.log('URL de Vimeo:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.VIMEO_ACCESS_TOKEN}`,
        'Accept': 'application/vnd.vimeo.*+json;version=3.4',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error de Vimeo:', errorText);
      throw new Error(`Error al obtener videos de Vimeo: ${errorText}`);
    }

    const data = await response.json();
    console.log('Videos obtenidos:', data);

    // Verificar que tenemos datos válidos
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Formato de respuesta inválido de Vimeo');
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data.data)
    };
  } catch (error) {
    console.error('Error en la función:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: error.message || 'Error interno del servidor',
        details: error.stack
      })
    };
  }
}; 