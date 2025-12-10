
"use client";

import { createContext, useState, ReactNode, useEffect } from 'react';

export type TaskStatus = 'pending' | 'submitted' | 'graded';

export type Submission = {
  studentId: string;
  submittedAt: string;
  fileUrl?: string;
  grade?: number;
  feedback?: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  subject: string;
  groupId: string;
  dueDate: string;
  creatorId: string; // Teacher's ID
  submissions: Submission[];
  type?: 'task' | 'exam';
};

type TaskContextType = {
  tasks: Task[];
  addTask: (taskData: Omit<Task, 'id' | 'submissions'>) => void;
  submitTask: (taskId: string, studentId: string, fileUrl?: string) => void;
  gradeSubmission: (taskId: string, studentId: string, grade: number, feedback?: string) => void;
  getTasksForStudent: (studentId: string, studentGroup: string) => Task[];
};

export const TaskContext = createContext<TaskContextType>({
  tasks: [],
  addTask: () => {},
  submitTask: () => {},
  gradeSubmission: () => {},
  getTasksForStudent: () => [],
});

// Mock data for demonstration purposes
const mockTasks: Task[] = [
    { 
        id: 'task-001', 
        title: 'Ensayo sobre la Célula', 
        description: 'Escribir un ensayo de 500 palabras sobre la estructura y función de la célula eucariota.',
        subject: 'Biología', 
        groupId: 'ofimatica-4-a', 
        dueDate: '2024-11-15',
        creatorId: 'doc01',
        submissions: [
            { studentId: 'alu003', submittedAt: '2024-11-04', grade: 9.5, feedback: 'Excelente trabajo.' }
        ],
        type: 'task',
    },
    { 
        id: 'task-002', 
        title: 'Resolver Guía de Ejercicios', 
        description: 'Resolver los ejercicios de la página 50 a la 55 del libro de texto.',
        subject: 'Matemáticas', 
        groupId: 'ofimatica-4-a', 
        dueDate: '2024-11-20',
        creatorId: 'doc02',
        submissions: [],
        type: 'task',
    },
    { 
        id: 'exam-001', 
        title: 'Examen Parcial 1: Algebra Lineal', 
        description: 'Examen que cubre los temas de la unidad 1 y 2.',
        subject: 'Matemáticas', 
        groupId: 'ofimatica-4-a', 
        dueDate: '2024-10-30',
        creatorId: 'doc02',
        submissions: [
            { studentId: 'alu001', submittedAt: '2024-10-30', grade: 7.5, feedback: 'Necesitas repasar el tema de matrices.' }
        ],
        type: 'exam',
    },
    { 
        id: 'task-003', 
        title: 'Video Presentation: The Globe Theatre', 
        description: 'Crear una presentación en video de 3 minutos sobre la historia del Globe Theatre.',
        subject: 'Inglés', 
        groupId: 'ofimatica-4-a', 
        dueDate: '2024-11-05',
        creatorId: 'doc07',
        submissions: [
            { studentId: 'alu001', submittedAt: '2024-11-04', grade: 8.0, feedback: 'Buen esfuerzo, faltó un poco de fluidez.' },
            { studentId: 'alu002', submittedAt: '2024-11-05' }
        ],
        type: 'task',
    },
    { 
        id: 'task-004', 
        title: 'Línea de Tiempo de la Revolución', 
        description: 'Crear una línea de tiempo interactiva sobre los eventos clave de la Revolución Mexicana.',
        subject: 'Historia', 
        groupId: 'ofimatica-4-b', 
        dueDate: '2024-10-28',
        creatorId: 'doc13',
        submissions: [],
        type: 'task',
    },
];


export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks); // Initialize with mock data
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    try {
      const storedTasks = window.localStorage.getItem('datalake-tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        setTasks(mockTasks);
      }
    } catch (error) {
      console.error("Error reading tasks from localStorage", error);
    } finally {
      setIsInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    if (isInitialLoad) return;
    try {
      window.localStorage.setItem('datalake-tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error("Error writing tasks to localStorage", error);
    }
  }, [tasks, isInitialLoad]);

  const addTask = (taskData: Omit<Task, 'id' | 'submissions'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      submissions: [],
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const submitTask = (taskId: string, studentId: string, fileUrl?: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newSubmission: Submission = { studentId, submittedAt: new Date().toISOString(), fileUrl };
        const otherSubmissions = task.submissions.filter(s => s.studentId !== studentId);
        return { ...task, submissions: [...otherSubmissions, newSubmission] };
      }
      return task;
    }));
  };

  const gradeSubmission = (taskId: string, studentId: string, grade: number, feedback?: string) => {
     setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          submissions: task.submissions.map(sub => 
            sub.studentId === studentId ? { ...sub, grade, feedback } : sub
          ),
        };
      }
      return task;
    }));
  };
  
  const getTasksForStudent = (studentId: string, studentGroup: string): Task[] => {
      if (!studentGroup) return [];
      return tasks.filter(task => task.groupId === studentGroup);
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, submitTask, gradeSubmission, getTasksForStudent }}>
      {children}
    </TaskContext.Provider>
  );
};
