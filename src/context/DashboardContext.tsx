"use client";

import { createContext, useState, ReactNode, useEffect } from 'react';

export type DashboardItem = {
    id: string;
    title: string;
    description: string;
    icon: string;
    link: string;
    mainStat: string;
    highlight: boolean;
    showButton: boolean;
    buttonText?: string;
    variant?: 'default' | 'destructive';
};

type DashboardContextType = {
    dashboardItems: DashboardItem[];
    setDashboardItems: React.Dispatch<React.SetStateAction<DashboardItem[]>>;
    addItem: (item: Omit<DashboardItem, 'id'>) => void;
    updateItem: (id: string, updatedItem: Partial<Omit<DashboardItem, 'id'>>) => void;
    deleteItem: (id: string) => void;
};

const initialDashboardItems: DashboardItem[] = [
    {
        id: 'docentes',
        title: 'Total de Docentes',
        description: 'Docentes registrados en el sistema',
        icon: 'BookUser',
        link: '/dashboard/gestion-escolar?tab=docente',
        mainStat: 'Dynamic', // Will be replaced by context data
        highlight: false,
        showButton: false,
        variant: 'default',
    },
    {
        id: 'alumnos',
        title: 'Total de Alumnos',
        description: 'Alumnos inscritos en la institución',
        icon: 'Users',
        link: '/dashboard/gestion-escolar?tab=alumno',
        mainStat: 'Dynamic',
        highlight: false,
        showButton: false,
        variant: 'default',
    },
    {
        id: 'gestion',
        title: 'Gestión de Usuarios',
        description: 'Administra docentes, alumnos y personal administrativo.',
        icon: 'UserCheck',
        link: '/dashboard/gestion-escolar',
        mainStat: '',
        highlight: false,
        showButton: true,
        buttonText: 'Ir a Gestión Escolar',
        variant: 'default',
    },
    {
        id: 'panic-button',
        title: 'Botón de Pánico',
        description: 'Activa protocolos de emergencia inmediatamente.',
        icon: 'AlertTriangle',
        link: '#', // No link needed, it triggers an action
        mainStat: 'EMERGENCIA',
        highlight: false,
        showButton: false,
        variant: 'destructive',
    }
];

export const DashboardContext = createContext<DashboardContextType>({
    dashboardItems: [],
    setDashboardItems: () => {},
    addItem: () => {},
    updateItem: () => {},
    deleteItem: () => {},
});

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
    const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        try {
            const storedItems = window.localStorage.getItem('datalake-dashboardItems');
            if (storedItems) {
                const parsedItems = JSON.parse(storedItems);
                // Ensure panic button exists
                if (!parsedItems.some((item: DashboardItem) => item.id === 'panic-button')) {
                    const panicButton = initialDashboardItems.find(item => item.id === 'panic-button');
                    if (panicButton) parsedItems.push(panicButton);
                }
                setDashboardItems(parsedItems);
            } else {
                setDashboardItems(initialDashboardItems);
            }
        } catch (error) {
            console.error("Error reading dashboard items from localStorage", error);
            setDashboardItems(initialDashboardItems);
        } finally {
            setIsInitialLoad(false);
        }
    }, []);

    useEffect(() => {
        if (isInitialLoad) return;
        try {
            window.localStorage.setItem('datalake-dashboardItems', JSON.stringify(dashboardItems));
        } catch (error) {
            console.error("Error writing dashboard items to localStorage", error);
        }
    }, [dashboardItems, isInitialLoad]);

    const addItem = (item: Omit<DashboardItem, 'id'>) => {
        const newItem: DashboardItem = {
            ...item,
            id: `item-${Date.now()}`
        };
        setDashboardItems(prev => [...prev, newItem]);
    };

    const updateItem = (id: string, updatedItem: Partial<Omit<DashboardItem, 'id'>>) => {
        setDashboardItems(prev => prev.map(item => item.id === id ? { ...item, ...updatedItem } : item));
    };

    const deleteItem = (id: string) => {
        setDashboardItems(prev => prev.filter(item => item.id !== id));
    };

    return (
        <DashboardContext.Provider value={{ dashboardItems, setDashboardItems, addItem, updateItem, deleteItem }}>
            {children}
        </DashboardContext.Provider>
    );
};
