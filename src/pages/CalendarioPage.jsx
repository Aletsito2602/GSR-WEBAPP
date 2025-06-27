import React, { useState, useMemo, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek, 
  addMonths, 
  subMonths, 
  isSameMonth, 
  isSameDay, 
  isToday,
  parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';
import { FaChevronLeft, FaChevronRight, FaPlus, FaVideo, FaCalendarAlt } from 'react-icons/fa';
import { BsCardList } from 'react-icons/bs';

// Datos de ejemplo para los eventos
const mockEvents = [
  {
    title: 'Tu mejor versión',
    date: '2025-01-06T12:00:00',
    duration: '12:00pm - 1:00pm',
    description: 'Lanzamiento especial.'
  },
  {
    title: 'Daily Stand-up',
    date: '2025-01-15T09:00:00',
    duration: '9:00am - 9:15am',
    description: 'Reunión diaria del equipo.'
  },
    {
    title: 'Revisión de Sprint',
    date: '2025-01-20T15:00:00',
    duration: '3:00pm - 4:00pm',
    description: 'Revisión de progreso del sprint actual.'
  },
  {
    title: 'Preapertura de Mercado',
    date: '2025-02-02T10:00:00',
    duration: '10am - 11am',
    description: 'Análisis del mercado antes de la apertura.'
  },
  {
    title: 'Todo sobre AGM',
    date: '2025-02-08T10:00:00',
    duration: '10am - 11am',
    description: 'Discusión sobre la próxima AGM.'
  },
];


const CalendarView = ({ currentDate, setCurrentDate, setSelectedEvent, selectedEvent, events }) => {
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });
  const startOfCalendar = startOfWeek(firstDayOfMonth, { locale: es });
  const endOfCalendar = endOfWeek(lastDayOfMonth, { locale: es });
  const calendarDays = eachDayOfInterval({ start: startOfCalendar, end: endOfCalendar });

  const eventsByDate = useMemo(() => {
    const map = new Map();
    events.forEach(event => {
      const eventDate = format(parseISO(event.date), 'yyyy-MM-dd');
      if (!map.has(eventDate)) {
        map.set(eventDate, []);
      }
      map.get(eventDate).push(event);
    });
    return map;
  }, [events]);

  const handleDayClick = (day) => {
    const dayKey = format(day, 'yyyy-MM-dd');
    if (eventsByDate.has(dayKey)) {
      setSelectedEvent(eventsByDate.get(dayKey)[0]); // Selecciona el primer evento del día
    } else {
      setSelectedEvent(null);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
      <div style={{ flex: '2 1 600px', background: '#2c2c2c', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ textTransform: 'capitalize', margin: 0 }}>{format(currentDate, 'MMMM yyyy', { locale: es })}</h2>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} style={{ background: 'none', border: 'none', color: '#D7B615', cursor: 'pointer' }}><FaChevronLeft size={20} /></button>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} style={{ background: 'none', border: 'none', color: '#D7B615', cursor: 'pointer' }}><FaChevronRight size={20} /></button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', gap: '8px' }}>
          {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map(day => <div key={day} style={{ fontWeight: 'bold', color: '#aaa' }}>{day}</div>)}
          {calendarDays.map((day, i) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const hasEvent = eventsByDate.has(dayKey);
            return (
              <div 
                key={i} 
                onClick={() => handleDayClick(day)}
                style={{
                  padding: '10px', 
                  color: isSameMonth(day, currentDate) ? '#fff' : '#555',
                  background: hasEvent ? '#D7B615' : 'transparent',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: isToday(day) ? '1px solid #D7B615' : 'none',
                  fontWeight: hasEvent ? 'bold' : 'normal',
                  color: hasEvent ? '#1a1a1a' : (isSameMonth(day, currentDate) ? '#fff' : '#555'),
                }}
              >
                {format(day, 'd')}
              </div>
            );
          })}
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #444'}}>
          <span style={{color: '#aaa'}}>Horario</span>
          <span style={{background: '#444', color: '#fff', padding: '4px 12px', borderRadius: '8px', fontSize: '14px'}}>
             {format(new Date(), 'h:mm a')}
          </span>
        </div>
      </div>

      <div style={{ flex: '1 1 300px' }}>
        <p style={{ color: '#aaa' }}>Selecciona una fecha en tu calendario para ver más información del evento</p>
        {selectedEvent ? (
          <div style={{ background: '#2c2c2c', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
             <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url('https://images.unsplash.com/photo-1534665482403-a909d0d97c67?w=500&q=80')`, backgroundSize: 'cover', opacity: 0.1, zIndex: 0 }}></div>
            <div style={{position: 'relative', zIndex: 1}}>
              <h3 style={{ marginTop: 0 }}>{selectedEvent.title}</h3>
              <p style={{ color: '#aaa' }}>{format(parseISO(selectedEvent.date), 'EEE, d MMM, ', {locale: es})} {selectedEvent.duration}</p>
              <button style={{ width: '100%', background: '#444', border: 'none', color: '#fff', padding: '12px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                Agregar al calendario <FaPlus />
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background: '#2c2c2c', borderRadius: '16px', padding: '24px', textAlign: 'center', color: '#666' }}>
            <p>No hay eventos para esta fecha.</p>
          </div>
        )}
      </div>
    </div>
  );
};


const ListView = ({ events }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ textTransform: 'capitalize', margin: 0 }}>{format(new Date(), 'MMMM yyyy', { locale: es })}</h2>
      {events.map((event, i) => (
        <div key={i} style={{ display: 'flex', background: '#2c2c2c', borderRadius: '16px', padding: '24px', alignItems: 'center', gap: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url('https://images.unsplash.com/photo-1534665482403-a909d0d97c67?w=500&q=80')`, backgroundSize: 'cover', opacity: 0.1, zIndex: 0 }}></div>
          <div style={{ flex: '1', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <FaVideo color="#D7B615" />
              <h3 style={{ margin: 0 }}>"{event.title}"</h3>
            </div>
            <p style={{ margin: 0, color: '#aaa' }}>{format(parseISO(event.date), 'EEE, d MMM, ', {locale: es})} {event.duration}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
            <button style={{ background: 'linear-gradient(122deg, #D7B615, #B99C18)', color: '#111', border: 'none', borderRadius: '12px', padding: '10px 24px', fontWeight: '600', cursor: 'pointer' }}>Conectarse</button>
            <button style={{ background: '#444', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              Agregar al calendario <FaPlus />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};


function CalendarioPage() {
  const [view, setView] = useState('completo'); // 'completo' o 'lista'
  const [currentDate, setCurrentDate] = useState(new Date('2025-01-01'));
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Actualiza cada minuto
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Seleccionar el primer evento del mes actual al cargar
    const firstEventOfMonth = mockEvents.find(e => isSameMonth(parseISO(e.date), currentDate));
    setSelectedEvent(firstEventOfMonth || null);
  }, [currentDate]);

  const viewButtonStyle = (buttonView) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: view === buttonView ? 'linear-gradient(122deg, #D7B615, #B99C18)' : '#2c2c2c',
    color: view === buttonView ? '#1a1a1a' : '#fff',
    border: '1px solid',
    borderColor: view === buttonView ? '#D7B615' : '#444',
    borderRadius: '12px',
    padding: '10px 16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '24px', fontFamily: 'Poppins, sans-serif', color: '#fff' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px', margin: 0 }}>
          <FaCalendarAlt /> Tu mejor versión se lanza hoy
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setView('completo')} style={viewButtonStyle('completo')}>
            <FaCalendarAlt /> Completo
          </button>
          <button onClick={() => setView('lista')} style={viewButtonStyle('lista')}>
            <BsCardList /> Lista
          </button>
        </div>
      </header>

      {view === 'completo' ? (
        <CalendarView currentDate={currentDate} setCurrentDate={setCurrentDate} setSelectedEvent={setSelectedEvent} selectedEvent={selectedEvent} events={mockEvents} />
      ) : (
        <ListView events={mockEvents} />
      )}
    </div>
  );
}

export default CalendarioPage; 