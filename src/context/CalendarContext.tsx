
"use client";

import { createContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { format } from 'date-fns';

export type CalendarEvent = {
  id: string;
  title: string;
  date: string; // Store as ISO string (YYYY-MM-DD) to avoid timezone issues
  time: string;
  description?: string;
  isOfficial?: boolean; // Flag for official SEP dates
};

type CalendarContextType = {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id' | 'isOfficial' | 'date'> & { date: Date }) => void;
  updateEvent: (id: string, updatedEvent: Omit<CalendarEvent, 'id' | 'isOfficial' | 'date'> & { date: Date }) => void;
  deleteEvent: (id: string) => void;
};

// Official SEP dates (example for 2024-2025 cycle)
// These are non-editable
// By removing the Z (UTC marker), we let the browser interpret the date in its local timezone, which is what the calendar component does.
const officialEvents: CalendarEvent[] = [
    { id: 'sep-01', title: 'Inicio de Ciclo Escolar', date: '2024-08-26', time: '00:00', isOfficial: true, description: 'Inicio de clases del ciclo escolar 2024-2025.' },
    { id: 'sep-02', title: 'Día de la Independencia', date: '2024-09-16', time: '00:00', isOfficial: true, description: 'Suspensión de labores docentes.' },
    { id: 'sep-03', title: 'Consejo Técnico Escolar', date: '2024-09-27', time: '00:00', isOfficial: true, description: 'Junta de Consejo Técnico Escolar.' },
    { id: 'sep-04', title: 'Día de la Revolución Mexicana', date: '2024-11-18', time: '00:00', isOfficial: true, description: 'Suspensión de labores docentes por el 20 de Noviembre.' },
    { id: 'sep-05', title: 'Inicio de Vacaciones de Invierno', date: '2024-12-19', time: '00:00', isOfficial: true, description: 'Último día de clases antes de vacaciones.' },
    { id: 'sep-06', title: 'Día de la Constitución', date: '2025-02-03', time: '00:00', isOfficial: true, description: 'Suspensión de labores docentes por el 5 de Febrero.' },
    { id: 'sep-07', title: 'Natalicio de Benito Juárez', date: '2025-03-17', time: '00:00', isOfficial: true, description: 'Suspensión de labores docentes por el 21 de Marzo.' },
    { id: 'sep-08', title: 'Inicio de Vacaciones de Semana Santa', date: '2025-04-14', time: '00:00', isOfficial: true, description: 'Periodo vacacional de Semana Santa y Pascua.' },
    { id: 'sep-09', title: 'Fin de Vacaciones de Semana Santa', date: '2025-04-25', time: '00:00', isOfficial: true, description: 'Reanudación de clases.' },
    { id: 'sep-10', title: 'Día del Trabajo', date: '2025-05-01', time: '00:00', isOfficial: true, description: 'Suspensión de labores docentes.' },
    { id: 'sep-11', title: 'Batalla de Puebla', date: '2025-05-05', time: '00:00', isOfficial: true, description: 'Suspensión de labores docentes.' },
    { id: 'sep-12', title: 'Día del Maestro', date: '2025-05-15', time: '00:00', isOfficial: true, description: 'Suspensión de labores docentes.' },
    { id: 'sep-13', title: 'Fin de Ciclo Escolar', date: '2025-07-16', time: '00:00', isOfficial: true, description: 'Fin de clases del ciclo escolar 2024-2025.' },
];


export const CalendarContext = createContext<CalendarContextType>({
  events: [],
  addEvent: () => {},
  updateEvent: () => {},
  deleteEvent: () => {},
});

export const CalendarProvider = ({ children }: { children: ReactNode }) => {
  const [userEvents, setUserEvents] = useState<CalendarEvent[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    try {
      const storedEvents = window.localStorage.getItem('datalake-calendarEvents');
      if (storedEvents) {
        setUserEvents(JSON.parse(storedEvents));
      }
    } catch (error) {
      console.error("Error reading calendar events from localStorage", error);
    } finally {
      setIsInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    if (isInitialLoad) return;
    try {
      window.localStorage.setItem('datalake-calendarEvents', JSON.stringify(userEvents));
    } catch (error) {
      console.error("Error writing calendar events to localStorage", error);
    }
  }, [userEvents, isInitialLoad]);

  const addEvent = (event: Omit<CalendarEvent, 'id' | 'isOfficial' | 'date'> & { date: Date }) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: `evt-${Date.now()}`,
      isOfficial: false,
      date: format(event.date, 'yyyy-MM-dd'),
    };
    setUserEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (id: string, updatedEvent: Omit<CalendarEvent, 'id' | 'isOfficial' | 'date'> & { date: Date }) => {
    setUserEvents(prev =>
      prev.map(event => (event.id === id ? { ...updatedEvent, date: format(updatedEvent.date, 'yyyy-MM-dd'), id, isOfficial: false } : event))
    );
  };

  const deleteEvent = (id: string) => {
    setUserEvents(prev => prev.filter(event => event.id !== id));
  };
  
  const allEvents = useMemo(() => {
      return [...officialEvents, ...userEvents];
  }, [userEvents]);

  return (
    <CalendarContext.Provider value={{ events: allEvents, addEvent, updateEvent, deleteEvent }}>
      {children}
    </CalendarContext.Provider>
  );
};

// Helper function to format a Date object to 'yyyy-MM-dd' string
const formatDateToYyyyMmDd = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};
