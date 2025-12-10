
"use client";

import { createContext, useState, ReactNode, useEffect } from 'react';
import { isToday, startOfDay } from 'date-fns';

export type AccessLogEntry = {
  userId: string;
  timestamp: string; // ISO String
  type: 'in' | 'out';
};

type AccessLogContextType = {
  accessLogs: AccessLogEntry[];
  addAccessLog: (userId: string, type: 'in' | 'out') => void;
  getTodayLastAccess: (userId: string) => AccessLogEntry | null;
};

export const AccessLogContext = createContext<AccessLogContextType>({
  accessLogs: [],
  addAccessLog: () => {},
  getTodayLastAccess: () => null,
});

export const AccessLogProvider = ({ children }: { children: ReactNode }) => {
  const [accessLogs, setAccessLogs] = useState<AccessLogEntry[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    try {
      const storedLogs = window.localStorage.getItem('datalake-access-log');
      if (storedLogs) {
        setAccessLogs(JSON.parse(storedLogs));
      }
    } catch (error) {
      console.error("Error reading access logs from localStorage", error);
    } finally {
      setIsInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    if (isInitialLoad) return;
    try {
      window.localStorage.setItem('datalake-access-log', JSON.stringify(accessLogs));
    } catch (error) {
      console.error("Error writing access logs to localStorage", error);
    }
  }, [accessLogs, isInitialLoad]);

  const addAccessLog = (userId: string, type: 'in' | 'out') => {
    const newLog: AccessLogEntry = {
      userId,
      type,
      timestamp: new Date().toISOString(),
    };
    setAccessLogs(prev => [...prev, newLog]);
  };

  const getTodayLastAccess = (userId: string): AccessLogEntry | null => {
    const todayLogs = accessLogs
      .filter(log => log.userId === userId && isToday(new Date(log.timestamp)))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return todayLogs[0] || null;
  };

  return (
    <AccessLogContext.Provider value={{ accessLogs, addAccessLog, getTodayLastAccess }}>
      {children}
    </AccessLogContext.Provider>
  );
};
