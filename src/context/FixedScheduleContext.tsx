
"use client";

import { createContext, useState, ReactNode, useEffect } from 'react';

export type FixedSchedule = {
  id: string;
  day: string;
  level: string;
  group: string;
  time: string;
  subject: string;
  teacherId: string;
  locked: boolean;
};

type FixedScheduleContextType = {
  fixedSchedules: FixedSchedule[];
  addFixedSchedule: (schedule: FixedSchedule) => void;
  updateFixedSchedule: (id: string, updatedSchedule: Partial<FixedSchedule>) => void;
  removeFixedSchedule: (id: string) => void;
};

export const FixedScheduleContext = createContext<FixedScheduleContextType>({
  fixedSchedules: [],
  addFixedSchedule: () => {},
  updateFixedSchedule: () => {},
  removeFixedSchedule: () => {},
});

export const FixedScheduleProvider = ({ children }: { children: ReactNode }) => {
  const [fixedSchedules, setFixedSchedules] = useState<FixedSchedule[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    try {
      const storedSchedules = window.localStorage.getItem('datalake-fixedSchedules');
      if (storedSchedules) {
        setFixedSchedules(JSON.parse(storedSchedules));
      }
    } catch (error) {
      console.error("Error reading fixed schedules from localStorage", error);
    } finally {
      setIsInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    if (isInitialLoad) return;
    try {
      window.localStorage.setItem('datalake-fixedSchedules', JSON.stringify(fixedSchedules));
    } catch (error) {
      console.error("Error writing fixed schedules to localStorage", error);
    }
  }, [fixedSchedules, isInitialLoad]);

  const addFixedSchedule = (schedule: FixedSchedule) => {
    setFixedSchedules(prev => [...prev, schedule]);
  };

  const updateFixedSchedule = (id: string, updatedSchedule: Partial<FixedSchedule>) => {
    setFixedSchedules(prev =>
      prev.map(schedule => (schedule.id === id ? { ...schedule, ...updatedSchedule } : schedule))
    );
  };

  const removeFixedSchedule = (id: string) => {
    setFixedSchedules(prev => prev.filter(schedule => schedule.id !== id));
  };

  return (
    <FixedScheduleContext.Provider value={{ fixedSchedules, addFixedSchedule, updateFixedSchedule, removeFixedSchedule }}>
      {children}
    </FixedScheduleContext.Provider>
  );
};
