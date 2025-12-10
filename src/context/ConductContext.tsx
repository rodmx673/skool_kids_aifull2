
"use client";

import { createContext, useState, ReactNode, useEffect, useContext } from 'react';

// --- Tipos de Datos ---

export type ConductReport = {
    id: string;
    studentId: string;
    date: string; // ISO String
    report: string;
    type: 'positivo' | 'negativo';
    points: number;
    teacherId: string;
};

export type Achievement = {
    id: string;
    studentId: string;
    title: string;
    description: string;
    date: string; // ISO String
    teacherId: string;
};

type ConductContextType = {
    conductReports: ConductReport[];
    achievements: Achievement[];
    addConductReport: (report: Omit<ConductReport, 'id' | 'date'>) => void;
    addAchievement: (achievement: Omit<Achievement, 'id' | 'date'>) => void;
    getConductForStudent: (studentId: string) => { reports: ConductReport[]; achievements: Achievement[] };
};

// --- Creación del Contexto ---
export const ConductContext = createContext<ConductContextType>({
    conductReports: [],
    achievements: [],
    addConductReport: () => {},
    addAchievement: () => {},
    getConductForStudent: () => ({ reports: [], achievements: [] }),
});

const mockConductReports: ConductReport[] = [
    { id: 'rep-1', studentId: 'alu001', date: '2024-10-28T10:00:00.000Z', report: 'Participación proactiva en clase de Historia.', type: 'positivo', points: 5, teacherId: 'doc01' },
    { id: 'rep-2', studentId: 'alu001', date: '2024-10-22T11:00:00.000Z', report: 'No entregó el material solicitado para el laboratorio de Química.', type: 'negativo', points: -2, teacherId: 'doc02' },
    { id: 'rep-3', studentId: 'alu001', date: '2024-10-15T09:00:00.000Z', report: 'Ayudó a un compañero a entender un tema complejo.', type: 'positivo', points: 5, teacherId: 'doc01' },
    { id: 'rep-4', studentId: 'alu001', date: '2024-10-05T14:00:00.000Z', report: 'Interrupción durante la clase de Inglés.', type: 'negativo', points: -3, teacherId: 'doc07' },
];

const mockAchievements: Achievement[] = [
    { id: 'ach-1', studentId: 'alu001', title: 'Asistencia Perfecta (Septiembre)', description: 'No tuvo ninguna falta durante todo el mes.', date: '2024-10-01T00:00:00.000Z', teacherId: 'admin' },
    { id: 'ach-2', studentId: 'alu001', title: 'Alumno del Mes (Octubre)', description: 'Reconocimiento por su excelente desempeño y actitud.', date: '2024-11-01T00:00:00.000Z', teacherId: 'admin' },
    { id: 'ach-3', studentId: 'alu001', title: 'Líder de Proyecto Exitoso', description: 'Lideró a su equipo hacia la máxima calificación en el proyecto de Biología.', date: '2024-11-15T00:00:00.000Z', teacherId: 'doc01' },
];


// --- Proveedor del Contexto ---
export const ConductProvider = ({ children }: { children: ReactNode }) => {
    const [conductReports, setConductReports] = useState<ConductReport[]>([]);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        try {
            const storedReports = window.localStorage.getItem('datalake-conducta-reports');
            const storedAchievements = window.localStorage.getItem('datalake-conducta-achievements');

            setConductReports(storedReports ? JSON.parse(storedReports) : mockConductReports);
            setAchievements(storedAchievements ? JSON.parse(storedAchievements) : mockAchievements);
        } catch (error) {
            console.error("Error reading conduct data from localStorage", error);
        } finally {
            setIsInitialLoad(false);
        }
    }, []);

    useEffect(() => {
        if (isInitialLoad) return;
        try {
            window.localStorage.setItem('datalake-conducta-reports', JSON.stringify(conductReports));
            window.localStorage.setItem('datalake-conducta-achievements', JSON.stringify(achievements));
        } catch (error) {
            console.error("Error writing conduct data to localStorage", error);
        }
    }, [conductReports, achievements, isInitialLoad]);

    const addConductReport = (report: Omit<ConductReport, 'id' | 'date'>) => {
        const newReport: ConductReport = {
            ...report,
            id: `rep-${Date.now()}`,
            date: new Date().toISOString(),
        };
        setConductReports(prev => [newReport, ...prev]);
    };

    const addAchievement = (achievement: Omit<Achievement, 'id' | 'date'>) => {
        const newAchievement: Achievement = {
            ...achievement,
            id: `ach-${Date.now()}`,
            date: new Date().toISOString(),
        };
        setAchievements(prev => [newAchievement, ...prev]);
    };

    const getConductForStudent = (studentId: string) => {
        const reports = conductReports.filter(r => r.studentId === studentId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const studentAchievements = achievements.filter(a => a.studentId === studentId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return { reports, achievements: studentAchievements };
    };

    return (
        <ConductContext.Provider value={{ conductReports, achievements, addConductReport, addAchievement, getConductForStudent }}>
            {children}
        </ConductContext.Provider>
    );
};
