
"use client";

import { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import { UserContext } from './UserContext';

// --- Importar todos los JSON de asignaturas ---
import preparatoriaSemestre1 from '@/lib/preparatoria-diurna-semestre-1.json';
import preparatoriaSemestre2 from '@/lib/preparatoria-diurna-semestre-2.json';
import preparatoriaSemestre3 from '@/lib/preparatoria-diurna-semestre-3.json';
import preparatoriaSemestre4 from '@/lib/preparatoria-diurna-semestre-4.json';
import preparatoriaSemestre5 from '@/lib/preparatoria-diurna-semestre-5.json';
import preparatoriaSemestre6 from '@/lib/preparatoria-diurna-semestre-6.json';


export type Subject = {
  name: string;
  hoursPerWeek: number;
  period: string;
  color: string;
  isSpecialty: boolean;
  pdfUrl?: string; // Nuevo campo para el PDF
};

export type CareerGroup = {
  name: string;
  scheduleTemplateId: string;
};

export type Career = {
  id: string;
  name: string;
  groups: CareerGroup[];
  tenantId: string;
};

export type Distribution = {
  subjectName: string;
  hours: number;
  teacherIds: { [group: string]: string };
};

export type DistributionByPeriod = {
  [period: string]: Distribution[];
};

export type WeeklyHourGoals = {
  [period: string]: number;
};

export type ScheduleBlockData = {
    subject: string;
    teacher: string;
    color: string;
};
export type DaySchedule = { [timeSlot: string]: ScheduleBlockData };
export type GroupSchedule = { [day: string]: DaySchedule };
export type GeneratedSchedules = { [groupLevelKey: string]: GroupSchedule };

export type TimeSlot = {
  time: string;
  type: 'academic' | 'recess';
};

export type ScheduleTemplate = {
  id: string;
  name: string;
  timeSlots: TimeSlot[];
};

export type AcademicPeriodOption = {
  value: string;
  label: string;
};

type AcademicContextType = {
  academicGoal: string;
  setAcademicGoal: (goal: string) => void;
  subjects: Subject[];
  addSubject: (subject: Subject) => void;
  addMultipleSubjects: (subjects: Subject[]) => void;
  updateSubject: (originalName: string, originalPeriod: string, updatedSubject: Partial<Subject>) => void;
  deleteSubject: (subjectName: string, period: string) => void;
  distribution: DistributionByPeriod;
  setDistribution: React.Dispatch<React.SetStateAction<DistributionByPeriod>>;
  weeklyHourGoals: WeeklyHourGoals;
  setWeeklyHourGoals: React.Dispatch<React.SetStateAction<WeeklyHourGoals>>;
  generatedSchedules: GeneratedSchedules;
  setGeneratedSchedules: React.Dispatch<React.SetStateAction<GeneratedSchedules>>;
  certifiedSchedules: GeneratedSchedules;
  setCertifiedSchedules: React.Dispatch<React.SetStateAction<GeneratedSchedules>>;
  careers: Career[];
  setCareers: React.Dispatch<React.SetStateAction<Career[]>>;
  addCareer: (name: string) => void;
  updateCareer: (id: string, name: string) => void;
  deleteCareer: (id: string) => void;
  addCareerGroup: (careerId: string, scheduleTemplateId: string) => void;
  deleteCareerGroup: (careerId: string, groupName: string) => void;
  updateCareerGroup: (careerId: string, groupName: string, scheduleTemplateId: string) => void;
  academicPeriodOptions: AcademicPeriodOption[];
  scheduleTemplates: ScheduleTemplate[];
  setScheduleTemplates: React.Dispatch<React.SetStateAction<ScheduleTemplate[]>>;
};

export const AcademicContext = createContext<AcademicContextType>({
  academicGoal: '',
  setAcademicGoal: () => {},
  subjects: [],
  addSubject: () => {},
  addMultipleSubjects: () => {},
  updateSubject: () => {},
  deleteSubject: () => {},
  distribution: {},
  setDistribution: () => {},
  weeklyHourGoals: {},
  setWeeklyHourGoals: () => {},
  generatedSchedules: {},
  setGeneratedSchedules: () => {},
  certifiedSchedules: {},
  setCertifiedSchedules: () => {},
  careers: [],
  setCareers: () => {},
  addCareer: () => {},
  updateCareer: () => {},
  deleteCareer: () => {},
  addCareerGroup: () => {},
  deleteCareerGroup: () => {},
  updateCareerGroup: () => {},
  academicPeriodOptions: [],
  scheduleTemplates: [],
  setScheduleTemplates: () => {},
});

const initialScheduleTemplates: ScheduleTemplate[] = [
    {
      id: 'turno-matutino',
      name: 'Turno Matutino',
      timeSlots: [
        { time: "07:00-07:50", type: "academic" },
        { time: "07:50-08:40", type: "academic" },
        { time: "08:40-09:30", type: "academic" },
        { time: "09:30-10:00", type: "recess" },
        { time: "10:00-10:50", type: "academic" },
        { time: "10:50-11:40", type: "academic" },
        { time: "11:40-12:30", type: "academic" },
        { time: "12:30-13:20", type: "academic" },
      ]
    },
    {
      id: 'turno-vespertino',
      name: 'Turno Vespertino',
      timeSlots: [
          { time: "14:00-14:50", type: "academic" },
          { time: "14:50-15:40", type: "academic" },
          { time: "15:40-16:30", type: "academic" },
          { time: "16:30-17:00", type: "recess" },
          { time: "17:00-17:50", type: "academic" },
          { time: "17:50-18:40", type: "academic" },
          { time: "18:40-19:30", type: "academic" },
          { time: "19:30-20:20", type: "academic" },
      ]
    }
];

const initialCareers: Career[] = [
    { id: 'preparatoria', name: 'Preparatoria Diurna', groups: [{ name: 'A', scheduleTemplateId: 'turno-matutino' }], tenantId: 'admin101'},
    { id: 'ofimatica', name: 'OFIMATICA', groups: [{ name: 'A', scheduleTemplateId: 'turno-matutino' }, { name: 'B', scheduleTemplateId: 'turno-matutino' }], tenantId: 'admin101' },
    { id: 'mecanica', name: 'MECANICA Y SERVICIO AUTOMOTRIZ', groups: [{ name: 'A', scheduleTemplateId: 'turno-matutino' }, { name: 'B', scheduleTemplateId: 'turno-matutino' }], tenantId: 'admin101' },
    { id: 'contabilidad', name: 'CONTABILIDAD', groups: [{ name: 'A', scheduleTemplateId: 'turno-matutino' }, { name: 'B', scheduleTemplateId: 'turno-matutino' }, { name: 'C', scheduleTemplateId: 'turno-matutino' }], tenantId: 'admin101' },
];

const getInitialSubjects = (): Subject[] => {
  const allSubjectsRaw = [
    ...preparatoriaSemestre1.map(s => ({ ...s, period: 'preparatoria-1' })),
    ...preparatoriaSemestre2.map(s => ({ ...s, period: 'preparatoria-2' })),
    ...preparatoriaSemestre3.map(s => ({ ...s, period: 'preparatoria-3' })),
    ...preparatoriaSemestre4.map(s => ({ ...s, period: 'preparatoria-4' })),
    ...preparatoriaSemestre5.map(s => ({ ...s, period: 'preparatoria-5' })),
    ...preparatoriaSemestre6.map(s => ({ ...s, period: 'preparatoria-6' })),
  ];

  return allSubjectsRaw.map(s => ({
    name: s.nombre,
    hoursPerWeek: s.horas_semanales,
    period: s.period,
    color: s.color,
    isSpecialty: false,
  }));
};


export const AcademicProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useContext(UserContext);
  const [academicGoal, setAcademicGoalState] = useState('');
  const [subjects, setSubjectsState] = useState<Subject[]>([]);
  const [distribution, setDistribution] = useState<DistributionByPeriod>({});
  const [weeklyHourGoals, setWeeklyHourGoals] = useState<WeeklyHourGoals>({});
  const [generatedSchedules, setGeneratedSchedules] = useState<GeneratedSchedules>({});
  const [certifiedSchedules, setCertifiedSchedules] = useState<GeneratedSchedules>({});
  const [careers, setCareers] = useState<Career[]>([]);
  const [academicPeriodOptions, setAcademicPeriodOptions] = useState<AcademicPeriodOption[]>([]);
  const [scheduleTemplates, setScheduleTemplates] = useState(initialScheduleTemplates);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    try {
      const goal = window.localStorage.getItem('datalake-academicGoal');
      if (goal) setAcademicGoalState(JSON.parse(goal));

      const subjectsData = window.localStorage.getItem('datalake-subjects');
      setSubjectsState(subjectsData ? JSON.parse(subjectsData) : getInitialSubjects());
      
      const distributionData = window.localStorage.getItem('datalake-distribution');
      setDistribution(distributionData ? JSON.parse(distributionData) : {});

      const hourGoals = window.localStorage.getItem('datalake-weeklyHourGoals');
      setWeeklyHourGoals(hourGoals ? JSON.parse(hourGoals) : {});
      
      const schedules = window.localStorage.getItem('datalake-generatedSchedules');
      setGeneratedSchedules(schedules ? JSON.parse(schedules) : {});
      
      const certified = window.localStorage.getItem('datalake-certifiedSchedules');
      setCertifiedSchedules(certified ? JSON.parse(certified) : {});

      const templatesData = window.localStorage.getItem('datalake-scheduleTemplates');
      setScheduleTemplates(templatesData ? JSON.parse(templatesData) : initialScheduleTemplates);

      const careersData = window.localStorage.getItem('datalake-careers');
      setCareers(careersData ? JSON.parse(careersData) : initialCareers);

      const institutionData = window.localStorage.getItem('datalake-institution');
      if (institutionData) {
          const institution = JSON.parse(institutionData);
          const academicPeriodsConfig: { [key: string]: { label: string; count: number } } = {
            preescolar: { label: "Grado", count: 3 },
            primaria: { label: "Grado", count: 6 },
            secundaria: { label: "Grado", count: 3 },
            preparatoria: { label: "Semestre", count: 6 },
            "preparatoria-tecnica": { label: "Semestre", count: 6 },
            universidad: { label: "Semestre", count: 9 },
          };
          const options: AcademicPeriodOption[] = [];
          if (institution.type && academicPeriodsConfig[institution.type]) {
              const { label, count } = academicPeriodsConfig[institution.type];
              for (let i = 1; i <= count; i++) {
                  options.push({ value: `${i}`, label: `${i}° ${label}` });
              }
          }
          setAcademicPeriodOptions(options);
      }

    } catch (error) {
      console.error("Error reading academic data from localStorage", error);
    }
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (isInitialLoad) return;
    try {
        window.localStorage.setItem('datalake-academicGoal', JSON.stringify(academicGoal));
        window.localStorage.setItem('datalake-subjects', JSON.stringify(subjects));
        window.localStorage.setItem('datalake-distribution', JSON.stringify(distribution));
        window.localStorage.setItem('datalake-weeklyHourGoals', JSON.stringify(weeklyHourGoals));
        window.localStorage.setItem('datalake-generatedSchedules', JSON.stringify(generatedSchedules));
        window.localStorage.setItem('datalake-certifiedSchedules', JSON.stringify(certifiedSchedules));
        window.localStorage.setItem('datalake-scheduleTemplates', JSON.stringify(scheduleTemplates));
        window.localStorage.setItem('datalake-careers', JSON.stringify(careers));
    } catch (error) {
      console.error("Error writing academic data to localStorage", error);
    }
  }, [academicGoal, subjects, distribution, weeklyHourGoals, generatedSchedules, scheduleTemplates, certifiedSchedules, careers, isInitialLoad]);

  const visibleCareers = careers.filter(c => c.tenantId === (currentUser?.role === 'administrador' ? currentUser.id : currentUser?.tenantId));

  const setAcademicGoal = (goal: string) => setAcademicGoalState(goal);
  const addSubject = (subject: Subject) => setSubjectsState(prev => [...prev, subject]);
  const addMultipleSubjects = (newSubjects: Subject[]) => {
    setSubjectsState(prev => {
      const existingSubjects = new Set(prev.map(s => `${s.name}-${s.period}`));
      const filteredNewSubjects = newSubjects.filter(s => !existingSubjects.has(`${s.name}-${s.period}`));
      return [...prev, ...filteredNewSubjects];
    });
  };
  const updateSubject = (originalName: string, originalPeriod: string, updatedFields: Partial<Subject>) => {
    setSubjectsState(prev => prev.map(s => (s.name === originalName && s.period === originalPeriod) ? { ...s, ...updatedFields } : s));
  };
  const deleteSubject = (subjectName: string, period: string) => setSubjectsState(prev => prev.filter(s => !(s.name === subjectName && s.period === period)));

  const addCareer = (name: string) => {
    if(!currentUser) return;
    const tenantId = currentUser.role === 'administrador' ? currentUser.id : currentUser.tenantId;
    if(!tenantId) return;

    const newId = name.toLowerCase().replace(/\s+/g, '-');
    setCareers(prev => [...prev, { id: newId, name, groups: [], tenantId }]);
  };

  const updateCareer = (id: string, name: string) => setCareers(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  const deleteCareer = (id: string) => {
    setSubjectsState(prev => prev.filter(s => !s.period.startsWith(id)));
    setCareers(prev => prev.filter(c => c.id !== id));
  };
  
  const addCareerGroup = (careerId: string, scheduleTemplateId: string) => {
    setCareers(prev => prev.map(c => {
      if (c.id === careerId) {
        const groups = c.groups || [];
        const nextGroupChar = String.fromCharCode(groups.length + 65);
        return { ...c, groups: [...groups, { name: nextGroupChar, scheduleTemplateId }] };
      }
      return c;
    }));
  };

  const deleteCareerGroup = (careerId: string, groupName: string) => {
    setCareers(prev => prev.map(c => c.id === careerId ? { ...c, groups: c.groups.filter(g => g.name !== groupName) } : c));
  };

  const updateCareerGroup = (careerId: string, groupName: string, scheduleTemplateId: string) => {
    setCareers(prev => prev.map(c => c.id === careerId ? { ...c, groups: c.groups.map(g => g.name === groupName ? { ...g, scheduleTemplateId } : g) } : c));
  };

  return (
    <AcademicContext.Provider value={{ 
      academicGoal, setAcademicGoal, 
      subjects, addSubject, addMultipleSubjects, updateSubject, deleteSubject,
      distribution, setDistribution,
      weeklyHourGoals, setWeeklyHourGoals,
      generatedSchedules, setGeneratedSchedules,
      certifiedSchedules, setCertifiedSchedules,
      careers: visibleCareers, // Use visible careers
      setCareers, addCareer, updateCareer, deleteCareer, addCareerGroup, deleteCareerGroup, updateCareerGroup,
      academicPeriodOptions,
      scheduleTemplates, setScheduleTemplates,
    }}>
      {children}
    </AcademicContext.Provider>
  );
};
