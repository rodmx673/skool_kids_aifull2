
"use client";

import { createContext, useState, ReactNode, useEffect } from 'react';

// --- Tipos de Datos ---

export type SignatureStatus = 'pending' | 'signed';

export type CircularRecipient = {
  recipientId: string; // ID del usuario (puede ser docente u otro)
  status: SignatureStatus;
  signatureDataUrl?: string; // Data URL de la imagen de la firma
  signedAt?: string; // ISO 8601
};

export type Circular = {
  id: string; // ID único para la circular
  title: string;
  content: string;
  departmentId: string; // ID del departamento que la creó
  folio?: string; // Folio del documento
  attachmentUrl?: string; // URL a un PDF adjunto opcional
  creatorId: string; // ID del admin que la creó
  createdAt: string; // ISO 8601
  recipients: CircularRecipient[];
};

type CircularContextType = {
  circulars: Circular[];
  createCircular: (circularData: Omit<Circular, 'id' | 'createdAt' | 'recipients'>, recipientIds: string[]) => void;
  signCircular: (circularId: string, teacherId: string, signatureDataUrl: string) => void;
  getCircularsForTeacher: (teacherId: string) => Circular[];
  getCircularById: (circularId: string) => Circular | undefined;
};

// --- Creación del Contexto ---
export const CircularContext = createContext<CircularContextType>({
  circulars: [],
  createCircular: () => {},
  signCircular: () => {},
  getCircularsForTeacher: () => [],
  getCircularById: () => undefined,
});


// --- Proveedor del Contexto ---
export const CircularProvider = ({ children }: { children: ReactNode }) => {
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Cargar desde localStorage al inicio
  useEffect(() => {
    try {
      const storedCirculars = window.localStorage.getItem('datalake-circulars');
      if (storedCirculars) {
        setCirculars(JSON.parse(storedCirculars));
      }
    } catch (error) {
      console.error("Error reading circulars from localStorage", error);
    } finally {
      setIsInitialLoad(false);
    }
  }, []);

  // Guardar en localStorage cuando hay cambios
  useEffect(() => {
    if (isInitialLoad) return;
    try {
      window.localStorage.setItem('datalake-circulars', JSON.stringify(circulars));
    } catch (error) {
      console.error("Error writing circulars to localStorage", error);
    }
  }, [circulars, isInitialLoad]);

  // --- Funciones del Contexto ---
  const createCircular = (circularData: Omit<Circular, 'id' | 'createdAt' | 'recipients'>, recipientIds: string[]) => {
    const newCircular: Circular = {
      ...circularData,
      id: `circ-${Date.now()}`,
      createdAt: new Date().toISOString(),
      recipients: recipientIds.map(id => ({
        recipientId: id,
        status: 'pending',
      })),
    };
    setCirculars(prev => [newCircular, ...prev]);
  };

  const signCircular = (circularId: string, recipientId: string, signatureDataUrl: string) => {
    setCirculars(prev => prev.map(circ => {
      if (circ.id === circularId) {
        return {
          ...circ,
          recipients: circ.recipients.map(rec => {
            if (rec.recipientId === recipientId) {
              return {
                ...rec,
                status: 'signed' as SignatureStatus,
                signatureDataUrl,
                signedAt: new Date().toISOString(),
              };
            }
            return rec;
          }),
        };
      }
      return circ;
    }));
  };

  const getCircularsForTeacher = (teacherId: string): Circular[] => {
    return circulars.filter(circ => circ.recipients.some(rec => rec.recipientId === teacherId));
  };
  
  const getCircularById = (circularId: string): Circular | undefined => {
    return circulars.find(circ => circ.id === circularId);
  };


  return (
    <CircularContext.Provider value={{ circulars, createCircular, signCircular, getCircularsForTeacher, getCircularById }}>
      {children}
    </CircularContext.Provider>
  );
};
