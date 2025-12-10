

"use client";

import { createContext, useState, ReactNode, useEffect, useContext, useMemo } from 'react';
import { TeacherContext } from './TeacherContext';
import initialTeachersFromFile from '@/lib/docentes.json';

export type User = {
  id: string;
  username: string;
  email: string;
  role: string;
  password?: string;
  tenantId?: string; // ID of the administrator this user belongs to
  careerId?: string; 
  level?: string;
  group?: string; 
  profilePictureUrl?: string;
  phone?: string;
  address?: string;
  curp?: string;
  medicalInfo?: string;
  childrenIds?: string[];
  managedDepartmentIds?: string[];
};

type UserContextType = {
  allUsers: User[];
  visibleUsers: User[];
  addUser: (user: Omit<User, 'id' | 'password'>) => User | null;
  updateUser: (identifier: string, updatedUser: Partial<Omit<User, 'id' | 'email'>>, by?: 'id' | 'email') => void;
  removeUser: (email: string) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isInitialLoad: boolean;
  roles: string[];
  addRole: (role: string) => boolean;
  updateRole: (oldRole: string, newRole: string) => boolean;
  removeRole: (role: string) => boolean;
  linkStudentToTutor: (tutorId: string, studentId: string) => { success: boolean; message: string };
  updatePassword: (email: string, newPassword: string) => boolean;
};

const generateUserId = (role: string, existingIds: Set<string>): string => {
  const prefix = role.substring(0, 4).toLowerCase();
  let id;
  let attempts = 0;
  do {
    const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
    id = `${prefix}${randomPart}`;
    attempts++;
  } while (existingIds.has(id) && attempts < 50);

  if (attempts >= 50) {
      id = `${prefix}${Date.now()}`;
  }

  return id;
};

export const UserContext = createContext<UserContextType>({
  allUsers: [],
  visibleUsers: [],
  addUser: () => null,
  updateUser: () => {},
  removeUser: () => {},
  currentUser: null,
  setCurrentUser: () => {},
  isInitialLoad: true,
  roles: [],
  addRole: () => false,
  updateRole: () => false,
  removeRole: () => false,
  linkStudentToTutor: () => ({ success: false, message: 'Función no implementada.' }),
  updatePassword: () => false,
});

const getInitialUsers = (): User[] => {
    const existingIds = new Set<string>();
    const superAdminUser: User = { 
        id: 'superadmin001', 
        username: "SUPERADMIN", 
        email: "superadmin@skoolkits.ai", 
        role: "superadmin", 
        password: "password123" 
    };
    existingIds.add(superAdminUser.id);
    
    const initialUsersRaw: Omit<User, 'id' | 'password' | 'tenantId'>[] = [
      { username: "ADMINISTRADOR", email: "admin@datalake.com", role: "administrador" },
      { username: "ALUMNO DEMO", email: "alumno.demo@alumnos.com", role: "alumno", careerId: 'ofimatica', level: '4', group: 'A' },
      { username: "ADMINISTRATIVO DEMO", email: "admin.demo@administrativos.com", role: "administrativo", managedDepartmentIds: ["direccion", "servicios-esc"] },
      { username: "TUTOR DEMO", email: "tutor.demo@example.com", role: "padre", childrenIds: ['alu001'] },
    ];
    
    const demoUsers: User[] = [superAdminUser];
    
    initialUsersRaw.forEach(user => {
        let id: string;
        let tenantId: string | undefined = 'admin101';
        
        if(user.role === 'administrador') {
            id = 'admin101';
            tenantId = id;
        } else if (user.email === 'alumno.demo@alumnos.com') {
            id = 'alu001';
        } else {
            id = generateUserId(user.role, existingIds);
        }
        
        existingIds.add(id);
        demoUsers.push({ ...user, id, password: "password123", tenantId });
    });
    
    const demoUserEmails = new Set(demoUsers.map(u => u.email));
    
    const teacherUsers = initialTeachersFromFile.map(teacher => {
        const email = `${teacher.id}@docentes.com`;
        if (demoUserEmails.has(email) || existingIds.has(teacher.id)) {
            return null;
        }
        existingIds.add(teacher.id);
        demoUserEmails.add(email);
        return {
            id: teacher.id,
            username: teacher.name,
            email: email,
            role: "docente",
            password: "password123",
            tenantId: 'admin101',
        };
    }).filter(Boolean) as User[];

    return [...demoUsers, ...teacherUsers];
};


const initialRoles = ["superadmin", "administrador", "docente", "alumno", "administrativo", "padre"];


export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { removeTeacher } = useContext(TeacherContext);

  useEffect(() => {
    try {
        const usersItem = window.localStorage.getItem('datalake-users');
        let loadedUsers = usersItem ? JSON.parse(usersItem) : getInitialUsers();

        const superAdminExists = loadedUsers.some((u: User) => u.email === 'superadmin@skoolkits.ai');
        if (!superAdminExists) {
            loadedUsers.push({
                id: 'superadmin001', 
                username: "SUPERADMIN", 
                email: "superadmin@skoolkits.ai", 
                role: "superadmin", 
                password: "password123"
            });
        }
        setUsers(loadedUsers);
        
        const rolesItem = window.localStorage.getItem('datalake-roles');
        setRoles(rolesItem ? JSON.parse(rolesItem) : initialRoles);

        const currentUserItem = window.localStorage.getItem('datalake-currentUser');
        setCurrentUser(currentUserItem ? JSON.parse(currentUserItem) : null);

    } catch (error) {
        console.error("Error reading from localStorage on initial load:", error);
        setUsers(getInitialUsers());
        setRoles(initialRoles);
        setCurrentUser(null);
    }
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (isInitialLoad) return;
    try {
        window.localStorage.setItem('datalake-users', JSON.stringify(users));
        window.localStorage.setItem('datalake-roles', JSON.stringify(roles));
        if (currentUser) {
            window.localStorage.setItem('datalake-currentUser', JSON.stringify(currentUser));
        } else {
            window.localStorage.removeItem('datalake-currentUser');
        }
    } catch (error) {
        console.error("Error writing to localStorage", error);
    }
  }, [users, roles, currentUser, isInitialLoad]);

    const visibleUsers = useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.role === 'superadmin') {
            return users; // Superadmin can see everyone
        }
        if (currentUser.role === 'administrador') {
            return users.filter(u => u.tenantId === currentUser.id || u.id === currentUser.id);
        }
        return users.filter(u => u.tenantId === currentUser.tenantId);
    }, [currentUser, users]);

  const addUser = (user: Omit<User, 'id' | 'password'>): User | null => {
    const existingIds = new Set(users.map(u => u.id));
    
    let tenantId = user.tenantId;
    let newUserId;

    if (user.role === 'administrador') {
        newUserId = generateUserId(user.role, existingIds);
        tenantId = newUserId;
    } else {
        newUserId = generateUserId(user.role, existingIds);
        if (!tenantId || !users.some(u => u.id === tenantId && ['administrador', 'superadmin'].includes(u.role))) {
             return null;
        }
    }

    const newUser: User = { 
        ...user, 
        tenantId, 
        id: newUserId, 
        password: "password123",
        childrenIds: user.role === 'padre' ? [] : undefined,
        managedDepartmentIds: user.role === 'administrativo' ? [] : undefined
    };

    setUsers((prevUsers) => [...prevUsers, newUser]);

    return newUser;
  };

  const updateUser = (identifier: string, updatedFields: Partial<Omit<User, 'id' | 'email'>>, by: 'id' | 'email' = 'email') => {
    setUsers((prevUsers) => 
      prevUsers.map((user) => {
        if ((by === 'email' && user.email === identifier) || (by === 'id' && user.id === identifier)) {
            return { ...user, ...updatedFields };
        }
        return user;
      })
    );
    if ((by === 'email' && currentUser?.email === identifier) || (by === 'id' && currentUser?.id === identifier)) {
      setCurrentUser(prev => prev ? {...prev, ...updatedFields} : null);
    }
  };

  const updatePassword = (email: string, newPassword: string): boolean => {
    let userFound = false;
    setUsers(prevUsers =>
      prevUsers.map(user => {
        if (user.email === email) {
          userFound = true;
          return { ...user, password: newPassword };
        }
        return user;
      })
    );
    if (currentUser?.email === email) {
        setCurrentUser(prev => prev ? {...prev, password: newPassword } : null);
    }
    return userFound;
  };
  
  const removeUser = (email: string) => {
    const userToRemove = users.find(u => u.email === email);
    if (userToRemove && userToRemove.role === 'docente') {
        removeTeacher(userToRemove.id);
    }
    setUsers((prevUsers) => prevUsers.filter((user) => user.email !== email));
  };

  const addRole = (role: string): boolean => {
    const normalizedRole = role.toLowerCase();
    if (roles.includes(normalizedRole)) {
      return false; // Role already exists
    }
    setRoles(prev => [...prev, normalizedRole]);
    return true;
  };

  const updateRole = (oldRole: string, newRole: string): boolean => {
    const normalizedNewRole = newRole.toLowerCase();
    if (roles.includes(normalizedNewRole) && oldRole !== normalizedNewRole) {
      return false; // New role name already exists
    }
    setUsers(prev => prev.map(u => u.role === oldRole ? { ...u, role: normalizedNewRole } : u));
    setRoles(prev => prev.map(r => r === oldRole ? normalizedNewRole : r));
    return true;
  };

  const removeRole = (role: string): boolean => {
    if (users.some(u => u.role === role)) {
      return false; // Role is in use
    }
    setRoles(prev => prev.filter(r => r !== role));
    return true;
  };

  const linkStudentToTutor = (tutorId: string, studentId: string): { success: boolean; message: string } => {
    const tutor = users.find(u => u.id === tutorId && u.role === 'padre');
    if (!tutor) {
        return { success: false, message: 'No se encontró el perfil del tutor.' };
    }
    
    const student = users.find(u => u.id === studentId && u.role === 'alumno' && u.tenantId === tutor.tenantId);
    if (!student) {
      return { success: false, message: 'ID de alumno no válido, no encontrado o no pertenece a su institución.' };
    }

    if (tutor.childrenIds?.includes(studentId)) {
        return { success: false, message: 'Este alumno ya está vinculado a tu cuenta.' };
    }

    const updatedTutor = {
        ...tutor,
        childrenIds: [...(tutor.childrenIds || []), studentId],
    };

    setUsers(prev => prev.map(u => u.id === tutorId ? updatedTutor : u));
    
    if (currentUser?.id === tutorId) {
        setCurrentUser(updatedTutor);
    }

    return { success: true, message: `¡${student.username} ha sido vinculado exitosamente!` };
  };


  return (
    <UserContext.Provider value={{ 
        allUsers: users,
        visibleUsers, addUser, updateUser, removeUser, currentUser, setCurrentUser, isInitialLoad,
        roles, addRole, updateRole, removeRole,
        linkStudentToTutor, updatePassword
    }}>
      {children}
    </UserContext.Provider>
  );
};
