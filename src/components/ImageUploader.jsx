import React, { useState, useRef } from 'react';
import { storage, auth, db } from '../firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const ImageUploader = ({ onImageUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const { currentUser, refreshUserClaims } = useAuth();

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.match('image.*')) {
      setError('Por favor selecciona una imagen (jpg, png, gif)');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen debe ser menor a 5MB');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      console.log('Iniciando subida de imagen para usuario:', currentUser.uid);
      
      // Crear una referencia en Storage con un nombre único
      const storageRef = ref(storage, `profile_images/${currentUser.uid}/${Date.now()}_${file.name}`);
      console.log('Referencia de storage creada:', storageRef.fullPath);
      
      // Iniciar la subida
      const uploadTask = uploadBytesResumable(storageRef, file);
      console.log('Tarea de subida iniciada');

      // Escuchar eventos de progreso, error y completado
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Actualizar progreso
          const progressValue = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(progressValue);
          console.log(`Progreso de subida: ${progressValue}%`);
        },
        (error) => {
          // Manejar errores
          console.error('Error al subir imagen:', error);
          setError('Error al subir la imagen. Intenta de nuevo.');
          setUploading(false);
        },
        async () => {
          // Subida completada exitosamente
          try {
            console.log('Subida completada, obteniendo URL de descarga...');
            // Obtener URL de descarga
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('URL de descarga obtenida:', downloadURL);
            
            // Actualizar perfil de usuario en Auth
            console.log('Actualizando perfil en Firebase Auth...');
            await updateProfile(auth.currentUser, {
              photoURL: downloadURL
            });
            console.log('Perfil de Auth actualizado correctamente');
            
            // Actualizar también en Firestore
            console.log('Actualizando perfil en Firestore...');
            const userRef = doc(db, "users", currentUser.uid);
            await setDoc(userRef, {
              photoURL: downloadURL,
              updatedAt: serverTimestamp()
            }, { merge: true });
            console.log('Perfil en Firestore actualizado correctamente');
            
            // Notificar al componente padre
            if (onImageUploaded) {
              onImageUploaded(downloadURL);
              console.log('Callback onImageUploaded ejecutado');
            }
            
            // Actualizar claims si es necesario
            console.log('Actualizando claims del usuario...');
            await refreshUserClaims();
            console.log('Claims actualizados');
            
            setUploading(false);
            setProgress(0);
            
            // Actualizar página para reflejar cambios
            window.location.reload();
          } catch (error) {
            console.error('Error al actualizar perfil:', error);
            setError('Error al actualizar tu perfil con la nueva imagen.');
            setUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('Error al iniciar la subida:', error);
      setError('Error al procesar la imagen. Intenta de nuevo.');
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      
      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        style={{
          padding: '8px 15px',
          backgroundColor: uploading ? '#666' : '#D7B615',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: uploading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          display: 'block',
          margin: '10px 0'
        }}
      >
        {uploading ? `Subiendo... ${progress}%` : 'Cambiar foto de perfil'}
      </button>
      
      {uploading && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ 
            width: '100%', 
            backgroundColor: '#444',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${progress}%`, 
              height: '10px',
              backgroundColor: '#D7B615',
              transition: 'width 0.3s ease'
            }} />
          </div>
          <p style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '5px' }}>
            Subiendo: {progress}%
          </p>
        </div>
      )}
      
      {error && (
        <div style={{ 
          color: '#f44336', 
          marginTop: '10px',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 