/**
 * Utilidades para validar si un usuario está en la lista de clientes autorizados
 */

import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Función para convertir el CSV a un array de objetos
 * @param {string} csvString - Contenido del archivo CSV
 * @returns {Array} - Array de objetos con los datos de los clientes
 */
const parseCSV = (csvString) => {
  const lines = csvString.split('\n');
  
  // Saltar la primera línea (encabezados) y procesar cada línea
  return lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const cols = line.split(',');
      
      // Extraer los datos relevantes usando los índices correctos
      return {
        Name: cols[3] || '', // Nombre
        Email: cols[2] || '', // Email
        Card_Address_Country: cols[12] || '', // País
        'Created (UTC)': cols[4] || '', // Fecha
        TotalSpend: cols[28] || '' // Monto
      };
    });
};

/**
 * Verifica si un correo electrónico está en la lista de clientes autorizados (Firestore)
 * @param {string} email - Correo electrónico a verificar
 * @returns {Promise<{isValid: boolean, clientInfo: Object|null}>} - Resultado de la validación
 */
export const validateClientEmail = async (email) => {
  try {
    const emailLowerCase = email.toLowerCase();
    // 1. Buscar en el CSV
    try {
      const response = await fetch('/clientes.csv');
      if (response.ok) {
        const csvData = await response.text();
        const clients = parseCSV(csvData);
        const client = clients.find(client => client.Email && client.Email.toLowerCase() === emailLowerCase);
        if (client) {
          return { isValid: true, clientInfo: client };
        }
      }
    } catch (csvError) {
      console.warn('No se pudo validar en el CSV:', csvError);
    }
    // 2. Buscar en Firestore (usuarios manuales)
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', emailLowerCase));
    const querySnapshot = await getDocs(q);
    const manualUserDoc = querySnapshot.docs.find(doc => doc.id.startsWith('manual_'));
    if (manualUserDoc) {
      return {
        isValid: true,
        clientInfo: { id: manualUserDoc.id, ...manualUserDoc.data() }
      };
    }
    // Si no está en ninguno
    return { isValid: false, clientInfo: null };
  } catch (error) {
    console.error('Error al validar cliente:', error);
    return { isValid: false, clientInfo: null };
  }
}; 