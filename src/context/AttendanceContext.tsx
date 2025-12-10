
"use client";

import { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import { UserContext } from './UserContext';

export type AttendanceStatus = 'presente' | 'ausente' | 'retardo' | 'justificado';

export type AttendanceRecord = {
  studentId: string;
  date: string; // YYYY-MM-DD
  subject: string;
  status: AttendanceStatus;
  recordedBy: string; // Teacher's ID
};

type AttendanceContextType = {
  attendanceRecords: AttendanceRecord[];
  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id'>) => void;
  getAttendanceForStudent: (studentId: string) => AttendanceRecord[];
};

export const AttendanceContext = createContext<AttendanceContextType>({
  attendanceRecords: [],
  addAttendanceRecord: () => {},
  getAttendanceForStudent: () => [],
});

// Mock data
const mockAttendance: AttendanceRecord[] = [
    { studentId: 'alu001', date: '2024-11-01', subject: 'Biología', status: 'presente', recordedBy: 'doc01' },
    { studentId: 'alu001', date: '2024-11-02', subject: 'Biología', status: 'presente', recordedBy: 'doc01' },
    { studentId: 'alu001', date: '2024-11-03', subject: 'Matemáticas', status: 'retardo', recordedBy: 'doc02' },
    { studentId: 'alu001', date: '2024-11-04', subject: 'Biología', status: 'ausente', recordedBy: 'doc01' },
    { studentId: 'alu001', date: '2024-11-05', subject: 'Inglés', status: 'justificado', recordedBy: 'doc07' },
];


export const AttendanceProvider = ({ children }: { children: ReactNode }) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    try {
      const storedRecords = window.localStorage.getItem('datalake-asistencias');
      if (storedRecords) {
        setAttendanceRecords(JSON.parse(storedRecords));
      } else {
        setAttendanceRecords(mockAttendance); // Use mock data if nothing is stored
      }
    } catch (error) {
      console.error("Error reading attendance from localStorage", error);
    } finally {
      setIsInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    if (isInitialLoad) return;
    try {
      // This simulates saving to the "Asistencias" folder in the Data Lake
      window.localStorage.setItem('datalake-asistencias', JSON.stringify(attendanceRecords));
    } catch (error) {
      console.error("Error writing attendance to localStorage", error);
    }
  }, [attendanceRecords, isInitialLoad]);

  const addAttendanceRecord = (record: Omit<AttendanceRecord, 'id'>) => {
    // In a real scenario, we might check for duplicates (e.g., one record per student/subject/day)
    setAttendanceRecords(prev => [...prev, record]);
  };

  const getAttendanceForStudent = (studentId: string): AttendanceRecord[] => {
    return attendanceRecords.filter(record => record.studentId === studentId);
  };

  return (
    <AttendanceContext.Provider value={{ attendanceRecords, addAttendanceRecord, getAttendanceForStudent }}>
      {children}
    </AttendanceContext.Provider>
  );
};
