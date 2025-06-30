import React, { useState, useRef, useEffect } from 'react';
import './LiveChat.css';
import { FaRegSmile, FaPaperPlane, FaUserCircle } from 'react-icons/fa';
import { BsThreeDots } from 'react-icons/bs';
import { IoClose } from 'react-icons/io5';
import { db } from '../firebaseConfig'; // Importar db
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

const LiveChat = ({ currentUser, onCloseChat, onOptionsClick }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Listen for new messages
  useEffect(() => {
    if (!db) return;
    const twoHoursAgo = Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000));
    const q = query(
      collection(db, 'livechat'), 
      orderBy('createdAt', 'asc'),
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(msg => msg.createdAt && msg.createdAt.toDate() > new Date(Date.now() - 2 * 60 * 60 * 1000));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [db]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentUser) return;
    
    try {
      await addDoc(collection(db, 'livechat'), {
        text: newMessage.trim(),
        user: {
          uid: currentUser.uid,
          name: currentUser.displayName || 'Anónimo',
          photo: currentUser.photoURL || null,
        },
        createdAt: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="live-chat">
      <div className="live-chat__header">
        <h3 className="live-chat__title">Chat en vivo</h3>
        <div className="live-chat__header-icons">
          <button onClick={onOptionsClick}><BsThreeDots /></button>
          <button onClick={onCloseChat}><IoClose /></button>
        </div>
      </div>

      <div className="live-chat__messages-container">
        {messages.map((msg) => (
          <div key={msg.id} className="live-chat__message">
            <div className="live-chat__avatar">
              {msg.user?.photo ? (
                <img src={msg.user.photo} alt={msg.user.name} />
              ) : (
                <FaUserCircle />
              )}
            </div>
            <div className="live-chat__message-content">
              <span className="live-chat__username">{msg.user?.name || 'Usuario'}</span>
              <p className="live-chat__message-text">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {currentUser ? (
        <form className="live-chat__input-area" onSubmit={handleSendMessage}>
          <div className="live-chat__input-wrapper">
            <input
              type="text"
              placeholder="Chatear"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="button" className="input-icon-button"><FaRegSmile /></button>
          </div>
          <button type="submit" className="send-button"><FaPaperPlane /></button>
        </form>
      ) : (
        <div className="live-chat__login-prompt">
          Inicia sesión para chatear
        </div>
      )}
    </div>
  );
};

export default LiveChat; 