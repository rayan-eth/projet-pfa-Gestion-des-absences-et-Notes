import React from 'react';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8:00 to 18:00

const CalendarView = ({ events, onDelete }) => {
    
    // Helper to calculate top and height based on time (HH:MM)
    const calculatePosition = (startTime, endTime) => {
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        
        const top = ((startH - 8) + startM / 60) * 60; // 60px per hour
        const height = ((endH - startH) + (endM - startM) / 60) * 60;
        
        return { top: `${top}px`, height: `${height}px` };
    };

    // Group events by day
    const eventsByDay = DAYS.reduce((acc, day) => {
        acc[day] = events.filter(e => e.day_of_week === day);
        return acc;
    }, {});

    return (
        <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)', overflowX: 'auto', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)' }}>
            <div style={{ minWidth: '800px' }}>
                {/* Header: Days */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ width: '60px', flexShrink: 0 }}></div>
                    {DAYS.map(day => (
                        <div key={day} style={{ flex: 1, padding: '1rem', textAlign: 'center', fontWeight: 'bold', borderLeft: '1px solid var(--glass-border)' }}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Body: Hours & Events */}
                <div style={{ display: 'flex', position: 'relative' }}>
                    {/* Time labels axis */}
                    <div style={{ width: '60px', flexShrink: 0, position: 'relative', height: `${10 * 60}px` }}>
                        {HOURS.slice(0, -1).map((hour, idx) => (
                            <div key={hour} style={{ position: 'absolute', top: `${idx * 60}px`, width: '100%', textAlign: 'right', paddingRight: '8px', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                {hour}:00
                            </div>
                        ))}
                    </div>

                    {/* Background grid lines */}
                    <div style={{ position: 'absolute', top: 0, left: '60px', right: 0, bottom: 0, pointerEvents: 'none' }}>
                        {HOURS.slice(0, -1).map((hour, idx) => (
                            <div key={hour} style={{ position: 'absolute', top: `${idx * 60}px`, left: 0, right: 0, height: '1px', background: 'var(--glass-border)' }}></div>
                        ))}
                    </div>

                    {/* Days columns containing events */}
                    {DAYS.map(day => (
                        <div key={day} style={{ flex: 1, position: 'relative', height: `${10 * 60}px`, borderLeft: '1px solid var(--glass-border)' }}>
                            {eventsByDay[day].map(event => {
                                const { top, height } = calculatePosition(event.start_time, event.end_time);
                                return (
                                    <div key={event.id} style={{
                                        position: 'absolute', top, height, left: '4px', right: '4px',
                                        background: 'rgba(79, 70, 229, 0.15)', // primary color tinted
                                        borderLeft: '4px solid var(--primary-color)',
                                        borderRight: '1px solid rgba(79, 70, 229, 0.2)',
                                        borderTop: '1px solid rgba(79, 70, 229, 0.2)',
                                        borderBottom: '1px solid rgba(79, 70, 229, 0.2)',
                                        borderRadius: '6px',
                                        padding: '6px',
                                        fontSize: '0.75rem',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        backdropFilter: 'blur(4px)',
                                        zIndex: 10
                                    }}>
                                        <strong style={{ display: 'block', marginBottom: '2px', color: 'var(--text-primary)', fontSize: '0.8rem' }}>{event.subject_name}</strong>
                                        <span style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>{event.start_time} - {event.end_time}</span>
                                        <span style={{ color: 'var(--text-secondary)', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Class: {event.class_name}</span>
                                        <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Prof: {event.teacher_name}</span>
                                        {onDelete && (
                                            <button 
                                                onClick={() => onDelete(event.id)}
                                                style={{ marginTop: 'auto', background: 'rgba(239, 68, 68, 0.8)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px', fontSize: '0.7rem', transition: 'background 0.2s' }}
                                                onMouseOver={e => e.target.style.background = 'var(--danger)'}
                                                onMouseOut={e => e.target.style.background = 'rgba(239, 68, 68, 0.8)'}
                                            >
                                                Supprimer
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
