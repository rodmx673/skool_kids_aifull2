
"use client";

import { createContext, useState, ReactNode, useEffect, useContext, useMemo } from 'react';
import initialTeachersFromFile from '@/lib/docentes.json';
import { UserContext } from './UserContext';

export type Availability = {
  [day: string]: string[]; // e.g. { "Lunes": ["07:00-07:50", "08:40-09:30"] }
};

export type Teacher = {
  id: string; // Unique short ID, e.g., "TURINGA"
  name: string;
  rfc: string;
  curp: string;
  clave: string;
  folio: string;
  maxHours: number;
  qualifiedSubjects: string[]; // Array of subject names
  puestosAdicionales: string[];
  availability?: Availability;
  tenantId: string;
};

type TeacherContextType = {
  teachers: Teacher[];
  addTeacher: (teacher: Omit<Teacher, 'availability'|'tenantId'> & { id: string }) => void;
  updateTeacher: (id: string, updatedTeacher: Partial<Omit<Teacher, 'id' | 'tenantId'>>) => void;
  removeTeacher: (id: string) => void;
};

export const TeacherContext = createContext<TeacherContextType>({
  teachers: [],
  addTeacher: () => {},
  updateTeacher: () => {},
  removeTeacher: () => {},
});

export const TeacherProvider = ({ children }: { children: ReactNode }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const { currentUser } = useContext(UserContext);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    try {
      const storedTeachersRaw = window.localStorage.getItem('datalake-teachers');
      if (storedTeachersRaw) {
         setTeachers(JSON.parse(storedTeachersRaw));
      } else {
        const fileTeachers = initialTeachersFromFile.map(t => ({
          ...t,
          availability: t.availability || {},
          rfc: t.rfc || '',
          curp: t.curp || '',
          clave: t.clave || '',
          folio: t.folio || '',
          puestosAdicionales: t.puestosAdicionales || [],
          tenantId: 'admin101', // Default tenant for initial data
        }));
        setTeachers(fileTeachers);
      }
    } catch (error) {
      console.error("Error reading teachers from localStorage, defaulting to JSON file.", error);
      const fileTeachers = initialTeachersFromFile.map(t => ({
          ...t,
          availability: t.availability || {},
          rfc: t.rfc || '',
          curp: t.curp || '',
          clave: t.clave || '',
          folio: t.folio || '',
          puestosAdicionales: t.puestosAdicionales || [],
          tenantId: 'admin101',
      }));
      setTeachers(fileTeachers);
    } finally {
        setIsInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    if (isInitialLoad) return;
    try {
      window.localStorage.setItem('datalake-teachers', JSON.stringify(teachers));
    } catch (error) {
      console.error("Error writing teachers to localStorage", error);
    }
  }, [teachers, isInitialLoad]);

  const addTeacher = (teacher: Omit<Teacher, 'availability'|'tenantId'> & { id: string }) => {
    if (!currentUser) return;
    const tenantId = currentUser.role === 'administrador' ? currentUser.id : currentUser.tenantId;
    if (!tenantId) return;

    const newTeacher: Teacher = { 
      ...teacher, 
      availability: {},
      puestosAdicionales: Array.isArray(teacher.puestosAdicionales) ? teacher.puestosAdicionales : (teacher.puestosAdicionales ? [teacher.puestosAdicionales] : []),
      tenantId: tenantId,
    };
    setTeachers((prev) => [...prev, newTeacher]);
  };

  const updateTeacher = (id: string, updatedTeacher: Partial<Omit<Teacher, 'id'|'tenantId'>>) => {
    setTeachers((prev) =>
      prev.map((teacher) => {
        if (teacher.id === id) {
           const puestos = updatedTeacher.puestosAdicionales;
           const newPuestos = Array.isArray(puestos) ? puestos : (puestos ? [puestos] : []);
           return { ...teacher, ...updatedTeacher, puestosAdicionales: newPuestos };
        }
        return teacher;
      })
    );
  };
  
  const removeTeacher = (id: string) => {
    setTeachers((prev) => prev.filter((teacher) => teacher.id !== id));
  };

  return (
    <TeacherContext.Provider value={{ teachers, addTeacher, updateTeacher, removeTeacher }}>
      {children}
    </TeacherContext.Provider>
  );
};
