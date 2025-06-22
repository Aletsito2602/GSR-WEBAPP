import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    email: '',
    displayName: '',
    role: 'user'
  });

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.email || !newUser.displayName) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }

    try {
      // Crear el usuario sin contraseña
      const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, 'temporaryPassword123');
      const user = userCredential.user;

      // Actualizar el perfil del usuario con el nombre
      await updateProfile(user, {
        displayName: newUser.displayName
      });

      // Guardar información adicional en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role || 'user',
        createdAt: serverTimestamp()
      });

      // Actualizar la lista de usuarios para que el nuevo usuario aparezca en la lista normal
      const updatedUsers = [...users, {
        uid: user.uid,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role || 'user'
      }];
      setUsers(updatedUsers);

      // Limpiar el formulario
      setNewUser({
        email: '',
        displayName: '',
        role: 'user'
      });

      alert('Usuario creado exitosamente.');
    } catch (error) {
      console.error('Error al crear usuario:', error);
      alert('Error al crear usuario: ' + error.message);
    }
  };

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default AdminUsersPage; 