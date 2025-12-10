
"use client";

import { createContext, useState, ReactNode, useEffect } from 'react';
import { contact, institution as initialInstitutionContent } from '@/context/WebpageContext'; // Importar los objetos

export type Department = {
  id: string;
  name: string;
};

export type DataLakeFolder = {
  id: string;
  name: string;
  link: string;
};

export type FeatureFlags = {
  [key: string]: boolean;
};

export type Institution = {
  name: string;
  fullName: string; 
  type: string;
  phone: string;
  email: string;
  address: string;
  slogan: string;
  entryTime: string;
  exitTime: string;
  departments: Department[];
  folioPrefix: string;
  folioNextNumber: number;
  headerLine1: string;
  headerLine2: string;
  headerLine3: string;
  headerLine4: string;
  schoolCycle: string;
  maxStudentsPerGroup: number;
  featureFlags: FeatureFlags; // Nuevo campo
};

type InstitutionContextType = {
  institution: Institution | null;
  setInstitution: (institution: Institution) => void;
  updateDepartments: (departments: Department[]) => void;
  dataLakeFolders: DataLakeFolder[];
  setDataLakeFolders: React.Dispatch<React.SetStateAction<DataLakeFolder[]>>;
  getNextFolio: () => string;
  consumeNextFolio: () => void;
  updateFeatureFlag: (flagName: string, value: boolean) => void;
};

const initialFeatureFlags: FeatureFlags = {
    gestionEscolar: true,
    academicos: true,
    mensajeria: true,
    externos: true,
    circulares: true,
    oficios: true,
    documentosFoliados: true,
    minutas: true,
    planeacion: true,
    presentaciones: true,
    libreria: true,
    skoolKitsUsuarios: true,
    paneles: true,
    calendario: true,
    horariosCertificados: true,
    reportes: true,
    reconocimientos: true,
    editorWeb: true,
    asistenteAI: true,
};

export const InstitutionContext = createContext<InstitutionContextType>({
  institution: null,
  setInstitution: () => {},
  updateDepartments: () => {},
  dataLakeFolders: [],
  setDataLakeFolders: () => {},
  getNextFolio: () => '',
  consumeNextFolio: () => {},
  updateFeatureFlag: () => {},
});

const initialDepartments: Department[] = [
    { id: "direccion", name: "Dirección" },
    { id: "subdireccion", name: "Sub Dirección" },
    { id: "servicios-admin", name: "Servicios Adm." },
    { id: "vinculacion", name: "Vinculación" },
    { id: "servicios-doc", name: "Servicios Docentes" },
    { id: "planeacion", name: "Planeación" },
    { id: "servicios-esc", name: "Servicios Escolares" },
];

const initialDataLakeFolders: DataLakeFolder[] = [
    { id: 'folder-1', name: 'planeacion academica', link: '/dashboard/planeacion' },
    { id: 'folder-2', name: 'grupos', link: '/dashboard/gestion-escolar' },
    { id: 'folder-3', name: 'asistencias', link: '/dashboard/docente/asistencias' },
    { id: 'folder-4', name: 'mensajeria', link: '/dashboard/messaging' },
    { id: 'folder-5', name: 'tareas', link: '/dashboard/docente/tareas' },
    { id: 'folder-6', name: 'calificaciones', link: '/dashboard/docente/calificaciones' },
    { id: 'folder-7', name: 'solicitudes-inscripcion', link: '/dashboard/gestion-escolar?tab=nuevo-ingreso' },
];

export const InstitutionProvider = ({ children }: { children: ReactNode }) => {
  const [institution, setInstitutionState] = useState<Institution | null>(null);
  const [dataLakeFolders, setDataLakeFolders] = useState<DataLakeFolder[]>(initialDataLakeFolders);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem('datalake-institution');
      const initialData: Institution = {
          name: 'CBTis No. 55',
          fullName: "Secretaría de Educación Pública\nSubsecretaría de Educación Media Superior\nDirección General de Educación Tecnológica Industrial y de Servicios\nCentro de Bachillerato Tecnológico Industrial y de Servicios No. 55",
          type: 'preparatoria-tecnica',
          phone: '(846) 266 0122',
          email: 'cbtis055.dir@dgeti.sems.gob.mx',
          address: "Prolongación Carranza S/N, Col. Electricistas, C. P. 93994, Pánuco, Veracruz",
          slogan: "Forjando el Futuro de México",
          entryTime: '07:00',
          exitTime: '14:00',
          departments: initialDepartments,
          folioPrefix: 'AESCBT',
          folioNextNumber: 1,
          headerLine1: 'EDUCACIÓN (Secretaría de Educación Pública)',
          headerLine2: 'CENTRO DE BACHILLERATO TECNOLÓGICO INDUSTRIAL Y DE SERVICIOS No. 55',
          headerLine3: '"Francisco Javier Mina"',
          headerLine4: '',
          schoolCycle: '2025-2026',
          maxStudentsPerGroup: 40,
          featureFlags: initialFeatureFlags,
      };

      if (item) {
        const parsed = JSON.parse(item);
        // Merge initial data with stored data to ensure all fields are present
        setInstitutionState({ 
            ...initialData, 
            ...parsed,
            // Ensure featureFlags is an object and merge it
            featureFlags: { ...initialFeatureFlags, ...(parsed.featureFlags || {}) }
        });
      } else {
        setInstitutionState(initialData);
      }

      const foldersItem = window.localStorage.getItem('datalake-folders');
      setDataLakeFolders(foldersItem ? JSON.parse(foldersItem) : initialDataLakeFolders);

    } catch (error) {
      console.error("Error reading institution from localStorage", error);
    } finally {
        setIsInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    if (isInitialLoad) return;
    try {
      if (institution) {
        window.localStorage.setItem('datalake-institution', JSON.stringify(institution));
      }
      window.localStorage.setItem('datalake-folders', JSON.stringify(dataLakeFolders));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  }, [institution, dataLakeFolders, isInitialLoad]);

  const setInstitution = (newInstitution: Institution) => {
    setInstitutionState(newInstitution);
  };
  
  const updateDepartments = (departments: Department[]) => {
    setInstitutionState(prev => {
        if (!prev) return null;
        return { ...prev, departments };
    });
  }

  const updateFeatureFlag = (flagName: string, value: boolean) => {
    setInstitutionState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        featureFlags: {
          ...prev.featureFlags,
          [flagName]: value,
        },
      };
    });
  };
  
  const getNextFolio = (): string => {
    if (!institution) return "ERROR-000";
    
    const prefix = institution.folioPrefix || 'DOC';
    const nextNumber = institution.folioNextNumber;
    const formattedNumber = nextNumber.toString().padStart(4, '0');
    return `${prefix}-${new Date().getFullYear()}-${formattedNumber}`;
  };

  const consumeNextFolio = () => {
    setInstitutionState(prev => {
        if (!prev) return null;
        return {
            ...prev,
            folioNextNumber: prev.folioNextNumber + 1,
        };
    });
  };

  return (
    <InstitutionContext.Provider value={{ institution, setInstitution, updateDepartments, dataLakeFolders, setDataLakeFolders, getNextFolio, consumeNextFolio, updateFeatureFlag }}>
      {children}
    </InstitutionContext.Provider>
  );
};
