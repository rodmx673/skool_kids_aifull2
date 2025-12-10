

"use client";

import { useContext, useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, PlusCircle, Pencil, Trash2, Search, CalendarOff, Upload, Settings, Eye, Check, X, FileDown, File, CheckCircle, AlertCircle, Clock, GraduationCap } from "lucide-react"
import { User, UserContext } from "@/context/UserContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator, SelectGroup, SelectLabel } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ConnectionStatus } from "@/components/connection-status";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AcademicContext, Career, CareerGroup, ScheduleTemplate, Distribution, Subject } from "@/context/AcademicContext";
import { TeacherContext, Teacher, Availability } from "@/context/TeacherContext";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useSearchParams } from "next/navigation";
import { InstitutionContext } from "@/context/InstitutionContext";
import * as XLSX from 'xlsx';
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// --- Formulario de Usuario Genérico ---
function UserForm({ user, onSave, onCancel, roleToSet }: { user?: Partial<User> | null, onSave: (user: Partial<User>) => void, onCancel: () => void, roleToSet: string }) {
  const { visibleUsers: users, currentUser } = useContext(UserContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setUsername(user?.username || '');
    setEmail(user?.email || '');
  }, [user]);

  const handleSubmit = () => {
    const lowerCaseEmail = email.toLowerCase();
    
    if (!username || !email) {
      toast({ variant: "destructive", title: "Error", description: "Por favor, complete todos los campos." });
      return;
    }

    if (!user?.id) { // Only check for duplicates when creating a new user
        const emailExists = users.some(u => u.email.toLowerCase() === lowerCaseEmail);
        if (emailExists) {
            toast({ variant: "destructive", title: "Error", description: "El email ya está registrado. Use otro correo." });
            return;
        }
    }
    
    onSave({
      id: user?.id,
      username: username,
      email: lowerCaseEmail,
      role: roleToSet,
      tenantId: currentUser?.role === 'administrador' ? currentUser.id : currentUser?.tenantId
    });
  };

  return (
    <div className="space-y-4">
       <div className="space-y-2">
        <Label htmlFor="username">Nombre Completo</Label>
        <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => setEmail(email.toLowerCase())} disabled={!!user?.email} />
      </div>
       <Button onClick={handleSubmit} className="w-full">
            {user ? 'Guardar Cambios' : 'Crear Usuario'}
        </Button>
        {user && <Button variant="outline" onClick={onCancel} className="w-full mt-2">Limpiar / Cancelar</Button>}
    </div>
  );
}

function StudentForm({ student, onSave, onCancel }: { student: Partial<User> | null, onSave: (data: Partial<User>) => void, onCancel: () => void }) {
    const { allUsers: users, currentUser } = useContext(UserContext);
    const { careers, academicPeriodOptions } = useContext(AcademicContext);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [careerId, setCareerId] = useState('');
    const [level, setLevel] = useState('');
    const [group, setGroup] = useState('');
    const [curp, setCurp] = useState('');
    const [phone, setPhone] = useState('');
    const { toast } = useToast();
    
    useEffect(() => {
        setUsername(student?.username || '');
        setEmail(student?.email || '');
        setCareerId(student?.careerId || '');
        setLevel(student?.level || '');
        setGroup(student?.group || '');
        setCurp(student?.curp || '');
        setPhone(student?.phone || '');
    }, [student]);

    const availableGroups = useMemo(() => {
        const selectedCareer = careers.find(c => c.id === careerId);
        return selectedCareer?.groups || [];
    }, [careerId, careers]);

    useEffect(() => {
        if (careerId && student?.careerId !== careerId) {
            setGroup('');
        }
    }, [careerId, student]);

    const handleSubmit = () => {
        const lowerCaseEmail = email.toLowerCase();
        if (!username || !email) {
            toast({ variant: 'destructive', title: 'Error', description: 'Nombre y email son obligatorios.' });
            return;
        }

        if (!student?.id) { // Check only on creation
            const emailExists = users.some(u => u.email.toLowerCase() === lowerCaseEmail);
            if (emailExists) {
                toast({ variant: "destructive", title: "Error", description: "El email ya está registrado. Use otro correo." });
                return;
            }
        }
        
        onSave({ id: student?.id, username, email: lowerCaseEmail, careerId, level, group, curp, phone, role: 'alumno', tenantId: currentUser?.role === 'administrador' ? currentUser.id : currentUser?.tenantId });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{student ? 'Editar Alumno' : 'Añadir Alumno'}</CardTitle>
                <CardDescription>{student ? `Editando a ${student.username}` : 'Crea un nuevo usuario de tipo Alumno.'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="student-name">Nombre Completo</Label>
                        <Input id="student-name" value={username} onChange={e => setUsername(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="student-email">Email</Label>
                        <Input id="student-email" type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={!!student?.id} />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="student-career">Carrera</Label>
                        <Select value={careerId} onValueChange={setCareerId}><SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger><SelectContent>{careers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="student-level">Semestre</Label>
                         <Select value={level} onValueChange={setLevel}><SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger><SelectContent>{academicPeriodOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="student-group">Grupo</Label>
                         <Select value={group} onValueChange={setGroup} disabled={!careerId}>
                            <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                            <SelectContent>
                                {availableGroups.map(g => <SelectItem key={g.name} value={g.name}>{g.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="student-curp">CURP</Label>
                        <Input id="student-curp" value={curp} onChange={e => setCurp(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="student-phone">Teléfono</Label>
                        <Input id="student-phone" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="gap-2">
                 <Button onClick={handleSubmit} className="w-full">{student ? 'Guardar Cambios' : 'Crear Alumno'}</Button>
                 {student && <Button variant="outline" onClick={onCancel} className="w-full">Limpiar / Cancelar</Button>}
            </CardFooter>
        </Card>
    );
}

// --- Modal de Disponibilidad de Docentes ---
const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

function AvailabilityModal({ teacher, onSave, onCancel }: { teacher: Teacher, onSave: (availability: Availability) => void, onCancel: () => void }) {
  const { scheduleTemplates } = useContext(AcademicContext);
  const [activeTemplateId, setActiveTemplateId] = useState<string>(scheduleTemplates[0]?.id || '');
  const [availability, setAvailability] = useState<Availability>(teacher.availability || {});

  const timeSlots = scheduleTemplates.find(t => t.id === activeTemplateId)?.timeSlots || [];

  const handleDayBlockChange = useCallback((day: string, checked: boolean, currentSlots: typeof timeSlots) => {
    setAvailability(prev => {
      const newAvail = { ...prev };
      if (checked) {
        newAvail[day] = currentSlots.map(ts => ts.time);
      } else {
        newAvail[day] = (newAvail[day] || []).filter(time => !currentSlots.some(ts => ts.time === time));
        if (newAvail[day].length === 0) {
          delete newAvail[day];
        }
      }
      return newAvail;
    });
  }, []);

  const handleSlotChange = useCallback((day: string, slot: string, checked: boolean) => {
    setAvailability(prev => {
      const newAvail = { ...prev };
      const daySlots = newAvail[day] ? [...newAvail[day]] : [];
      
      if (checked) {
        if (!daySlots.includes(slot)) daySlots.push(slot);
      } else {
        const index = daySlots.indexOf(slot);
        if (index > -1) daySlots.splice(index, 1);
      }

      if (daySlots.length > 0) newAvail[day] = daySlots;
      else delete newAvail[day];
      
      return newAvail;
    });
  }, []);

  const handleSave = () => onSave(availability);
  
  return (
    <DialogContent className="sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>Restricciones Horarias para {teacher.name}</DialogTitle>
        <DialogDescription>
          Marque los bloques de horas en los que el docente <span className="font-bold">{teacher.id}</span> no está disponible.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4 space-y-6">
        <Tabs value={activeTemplateId} onValueChange={setActiveTemplateId}>
          <TabsList>
            {scheduleTemplates.map(t => <TabsTrigger key={t.id} value={t.id}>{t.name}</TabsTrigger>)}
          </TabsList>
          {scheduleTemplates.map(template => (
             <TabsContent key={template.id} value={template.id} className="space-y-4">
                <div className="flex items-center space-x-4">
                  {daysOfWeek.map(day => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`check-${template.id}-${day}`}
                        checked={template.timeSlots.every(ts => availability[day]?.includes(ts.time))}
                        onCheckedChange={(checked) => handleDayBlockChange(day, !!checked, template.timeSlots)}
                      />
                      <Label htmlFor={`check-${template.id}-${day}`}>{day}</Label>
                    </div>
                  ))}
                </div>
                <Table>
                  <TableHeader><TableRow><TableHead className="w-[120px]">Hora</TableHead>{daysOfWeek.map(day => <TableHead key={day}>{day}</TableHead>)}</TableRow></TableHeader>
                  <TableBody>
                    {template.timeSlots.map(slot => (
                      slot.type === 'academic' && (
                        <TableRow key={slot.time}>
                          <TableCell className="font-medium">{slot.time}</TableCell>
                          {daysOfWeek.map(day => (
                            <TableCell key={`${day}-${slot.time}`}>
                              <Checkbox 
                                checked={availability[day]?.includes(slot.time) ?? false}
                                onCheckedChange={(checked) => handleSlotChange(day, slot.time, !!checked)}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      )
                    ))}
                  </TableBody>
                </Table>
             </TabsContent>
          ))}
        </Tabs>
      </div>
      <DialogFooter>
        <DialogClose asChild><Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button></DialogClose>
        <Button type="button" onClick={handleSave}>Guardar Restricciones</Button>
      </DialogFooter>
    </DialogContent>
  )
}

function RoleManager() {
    const { roles, addRole, updateRole, removeRole, users } = useContext(UserContext);
    const [newRole, setNewRole] = useState('');
    const [editingRole, setEditingRole] = useState<{ old: string; new: string } | null>(null);
    const { toast } = useToast();

    const handleAddRole = () => {
        if (!newRole.trim()) return;
        if (addRole(newRole)) {
            toast({ title: 'Rol Agregado', description: `El rol "${newRole}" ha sido creado.` });
            setNewRole('');
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'El rol ya existe.' });
        }
    };

    const handleUpdateRole = () => {
        if (!editingRole || !editingRole.new.trim()) return;
        if (updateRole(editingRole.old, editingRole.new)) {
            toast({ title: 'Rol Actualizado', description: `Rol "${editingRole.old}" ha sido renombrado a "${editingRole.new}".` });
            setEditingRole(null);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'El nuevo nombre de rol ya existe.' });
        }
    };

    const handleRemoveRole = (role: string) => {
        if (removeRole(role)) {
            toast({ title: 'Rol Eliminado' });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'No se puede eliminar un rol que está en uso.' });
        }
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Gestionar Roles de Usuario</DialogTitle>
                <DialogDescription>Añada, edite o elimine las categorías de roles de usuario.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="flex gap-2">
                    <Input placeholder="Nuevo rol (ej: administrativo)" value={newRole} onChange={(e) => setNewRole(e.target.value)} />
                    <Button onClick={handleAddRole}>Agregar Rol</Button>
                </div>
                <div className="space-y-2">
                    {roles.map(role => (
                        <div key={role} className="flex items-center justify-between gap-2 p-2 border rounded-md">
                            {editingRole?.old === role ? (
                                <Input value={editingRole.new} onChange={(e) => setEditingRole({ ...editingRole, new: e.target.value })} />
                            ) : (
                                <span className="capitalize">{role}</span>
                            )}
                            <div className="flex gap-1">
                                {editingRole?.old === role ? (
                                    <>
                                        <Button size="sm" onClick={handleUpdateRole}>Guardar</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setEditingRole(null)}>Cancelar</Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingRole({ old: role, new: role })}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" disabled={!users || users.some(u => u.role === role)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>¿Está seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción eliminará el rol "{role}".</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleRemoveRole(role)}>Eliminar</AlertDialogAction></AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DialogContent>
    );
}

// --- Nuevo Ingreso Component ---
function ApplicationDetails({ viewingApplication, onApprove, onReject }: {
    viewingApplication: any;
    onApprove: (group: string) => void;
    onReject: () => void;
}) {
    const { careers } = useContext(AcademicContext);
    const { allUsers: users } = useContext(UserContext);
    const { institution } = useContext(InstitutionContext);
    const [suggestedGroupInfo, setSuggestedGroupInfo] = useState<{group: string; count: number} | null>(null);

    useEffect(() => {
        if (viewingApplication) {
            const maxStudents = institution?.maxStudentsPerGroup || 40;
            const preferredCareerId = viewingApplication.opcion_1;
            if (preferredCareerId) {
                const career = careers.find(c => c.id === preferredCareerId);
                if (career && career.groups.length > 0) {
                    for (const group of career.groups.sort((a,b) => a.name.localeCompare(b.name))) {
                        const studentCount = users.filter(u => u?.role === 'alumno' && u?.careerId === preferredCareerId && u?.level === '1' && u?.group === group.name).length;
                        if (studentCount < maxStudents) {
                            setSuggestedGroupInfo({ group: group.name, count: studentCount });
                            return;
                        }
                    }
                    setSuggestedGroupInfo({ group: 'N/A', count: maxStudents});
                } else {
                     setSuggestedGroupInfo(null);
                }
            } else {
                 setSuggestedGroupInfo(null);
            }
        }
    }, [viewingApplication, institution, careers, users]);

    const getCareerName = (careerId: string) => careers.find(c => c.id === careerId)?.name || careerId;

    return (
        <>
            <DialogHeader>
                <DialogTitle>Revisar Solicitud de: {viewingApplication?.nombre} {viewingApplication?.apellidoPaterno}</DialogTitle>
                <DialogDescription>Verifica los datos del aspirante antes de tomar una acción.</DialogDescription>
            </DialogHeader>
            {suggestedGroupInfo && viewingApplication?.status === 'pending' && (
                <div className={cn(
                    'p-3 my-2 rounded-md text-sm font-semibold flex items-center gap-2',
                    suggestedGroupInfo.group === 'N/A' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                )}>
                    <GraduationCap className="h-5 w-5"/>
                    {suggestedGroupInfo.group !== 'N/A' ? (
                        <span>Sugerencia de Asignación: <strong>Grupo {suggestedGroupInfo.group}</strong> ({suggestedGroupInfo.count} / {institution?.maxStudentsPerGroup || 40})</span>
                    ): (
                        <span>¡Alerta! Todos los grupos para esta carrera están llenos (límite: {institution?.maxStudentsPerGroup || 40}).</span>
                    )}
                </div>
            )}

            <div className="py-4 max-h-[50vh] overflow-y-auto pr-4">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3 text-sm">
                    {viewingApplication && Object.entries(viewingApplication).map(([key, value]) => {
                        if (['id', 'status', 'tenantId'].includes(key) || !value || typeof value === 'object') return null;
                        const label = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                        const displayValue = key.startsWith('opcion_') ? getCareerName(value as string) : String(value);

                        return (
                            <div key={key} className="flex flex-col border-b pb-1">
                                <span className="text-xs font-bold text-primary">{label}:</span>
                                <span className="text-foreground font-medium">{displayValue}</span>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold mb-2">Documentos Adjuntos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                         {viewingApplication && Object.entries(viewingApplication).map(([key, value]) => {
                            if (!key.startsWith('doc_') || !value) return null;
                            const label = key.replace('doc_', '').replace(/_/g, ' ').replace(/^./, str => str.toUpperCase());
                            const fileName = typeof value === 'string' ? value : 'Nombre de archivo no disponible';
                            return (
                                <Button asChild key={key} variant="secondary" className="justify-start">
                                    <a target="_blank" rel="noopener noreferrer">
                                        <File className="mr-2 h-4 w-4" />
                                        <span className="truncate">{label}: {fileName}</span>
                                    </a>
                                </Button>
                            )
                         })}
                    </div>
                </div>
            </div>
            <DialogFooter className="justify-between">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={viewingApplication?.status !== 'pending'}>Rechazar Solicitud</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Está seguro de rechazar esta solicitud?</AlertDialogTitle>
                            <AlertDialogDescription>Esta acción marcará la solicitud como "rechazada" pero no la eliminará.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={onReject} className="bg-destructive hover:bg-destructive/90">Sí, Rechazar</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <div className="flex gap-2">
                    <DialogClose asChild><Button variant="outline">Cerrar</Button></DialogClose>
                    <Button onClick={() => onApprove(suggestedGroupInfo!.group)} disabled={viewingApplication?.status !== 'pending' || !suggestedGroupInfo || suggestedGroupInfo.group === 'N/A'}>
                        <Check className="mr-2 h-4 w-4"/>
                        Aprobar e Inscribir Alumno
                    </Button>
                </div>
            </DialogFooter>
        </>
    );
}

function NewStudentApplications() {
    const [allApplications, setAllApplications] = useState<any[]>([]);
    const [viewingApplication, setViewingApplication] = useState<any | null>(null);
    const { addUser, allUsers: users } = useContext(UserContext);
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

    useEffect(() => {
        const stored = localStorage.getItem('datalake-inscripciones');
        if (stored) {
            setAllApplications(JSON.parse(stored));
        }
    }, []);

    const applications = useMemo(() => {
        return allApplications.filter(app => (app.status || 'pending') === activeTab);
    }, [allApplications, activeTab]);

    const handleApproveApplication = (group: string) => {
        if (!viewingApplication) return;
        const appData = viewingApplication;

        const newStudentData: Partial<User> = {
            username: `${appData.nombre} ${appData.apellidoPaterno} ${appData.apellidoMaterno}`,
            email: appData.email,
            role: 'alumno',
            tenantId: appData.tenantId,
            careerId: appData.opcion_1,
            level: '1',
            group,
            curp: appData.curp,
            phone: appData.telefonoCelular,
        };

        const newUser = addUser(newStudentData as Omit<User, 'id'>);

        if (newUser) {
            toast({ title: '¡Alumno Inscrito!', description: `${newUser.username} ha sido creado e inscrito en el Grupo ${group}.` });
            
            const updatedApplications = allApplications.map(app => 
                app.id === appData.id ? { ...app, status: 'approved' } : app
            );
            setAllApplications(updatedApplications);
            localStorage.setItem('datalake-inscripciones', JSON.stringify(updatedApplications));
            
            setViewingApplication(null);
        } else {
             toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear el usuario. El email o CURP podrían ya existir.' });
        }
    };
    
    const handleRejectApplication = () => {
        if (!viewingApplication) return;
        const updatedApplications = allApplications.map(app => 
            app.id === viewingApplication.id ? { ...app, status: 'rejected' } : app
        );
        setAllApplications(updatedApplications);
        localStorage.setItem('datalake-inscripciones', JSON.stringify(updatedApplications));
        toast({ title: 'Solicitud Rechazada', description: 'La solicitud ha sido marcada como rechazada.' });
        setViewingApplication(null);
    };

    const capitalize = (s: string | undefined) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '');

    return (
         <Card>
            <CardHeader>
                <CardTitle>Solicitudes de Nuevo Ingreso</CardTitle>
                <CardDescription>Revisa las solicitudes pendientes y conviértelas en alumnos oficiales.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                    <TabsList>
                        <TabsTrigger value="pending">Pendientes</TabsTrigger>
                        <TabsTrigger value="approved">Aprobadas</TabsTrigger>
                        <TabsTrigger value="rejected">Rechazadas</TabsTrigger>
                    </TabsList>
                    <TabsContent value={activeTab} className="mt-4">
                        <div className="border rounded-lg">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre del Aspirante</TableHead>
                                        <TableHead>CURP</TableHead>
                                        <TableHead>1ra Opción</TableHead>
                                        <TableHead>Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {applications.length > 0 ? applications.map(app => (
                                        <TableRow key={app.id} onClick={() => setViewingApplication(app)} className="cursor-pointer">
                                            <TableCell className="font-medium">{`${app.nombre || ''} ${app.apellidoPaterno || ''}`.trim()}</TableCell>
                                            <TableCell>{app.curp}</TableCell>
                                            <TableCell>{app.opcion_1}</TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={app.status === 'approved' ? 'default' : (app.status === 'rejected' ? 'destructive' : 'secondary')}
                                                    className={app.status === 'approved' ? "bg-green-600" : ""}
                                                >
                                                    {app.status === 'approved' ? <CheckCircle className="h-3 w-3 mr-1" /> : (app.status === 'rejected' ? <X className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1"/>)}
                                                    {capitalize(app.status || 'pendiente')}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                No hay solicitudes en estado "{activeTab}".
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>

                <Dialog open={!!viewingApplication} onOpenChange={(open) => !open && setViewingApplication(null)}>
                    <DialogContent className="max-w-3xl">
                       {viewingApplication && (
                          <ApplicationDetails 
                            viewingApplication={viewingApplication}
                            onApprove={handleApproveApplication}
                            onReject={handleRejectApplication}
                          />
                       )}
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
// --- Componente de la Página Principal ---
export default function GestionEscolarPage() {
  const { allUsers, addUser: addUserToContext, updateUser, removeUser, roles } = useContext(UserContext);
  const { careers } = useContext(AcademicContext);
  const { teachers, addTeacher, updateTeacher: updateTeacherContext, removeTeacher: removeTeacherContext } = useContext(TeacherContext);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFormRef = useRef<HTMLDivElement>(null);
  
  const [selectedUser, setSelectedUser] = useState<Partial<User> | null>(null);
  const [isRoleManagerOpen, setIsRoleManagerOpen] = useState(false);
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'docente');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [rfc, setRfc] = useState('');
  const [curp, setCurp] = useState('');
  const [clave, setClave] = useState('');
  const [folio, setFolio] = useState('');
  const [maxHours, setMaxHours] = useState('');
  const [puestosAdicionales, setPuestosAdicionales] = useState('');
  const [qualifiedSubjects, setQualifiedSubjects] = useState<string[]>([]);
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [availabilityModalTeacher, setAvailabilityModalTeacher] = useState<Teacher | null>(null);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddOrUpdateUser = (userFormData: Partial<User>) => {
    let userToProcess: User | undefined;
    
    if (userFormData.id) {
        updateUser(userFormData.id, userFormData, 'id');
        toast({ title: "¡Usuario actualizado!", description: "Los datos del usuario han sido actualizados." });
        userToProcess = allUsers.find(u => u.id === userFormData.id);
    } else {
        const newUser = addUserToContext(userFormData as Omit<User, 'id'>);
        if (newUser) {
            toast({ title: "¡Usuario creado!", description: `El usuario ${newUser.username} ha sido agregado.` });
            userToProcess = newUser;
        } else {
            toast({ variant: "destructive", title: "Error al Crear Usuario" });
            return;
        }
    }
    
    if (userToProcess && userToProcess.role === 'docente' && !teachers.some(t => t.id === userToProcess!.id)) {
        const newTeacherProfile: Teacher = {
            id: userToProcess.id,
            name: userToProcess.username,
            maxHours: 40,
            qualifiedSubjects: [],
            rfc: '',
            curp: '',
            clave: '',
            folio: '',
            puestosAdicionales: [],
            availability: {},
            tenantId: userToProcess.tenantId || ''
        };
        addTeacher(newTeacherProfile);
        handleEditTeacher(newTeacherProfile);
    }

    setSelectedUser(null);
  };


  const handleEditUser = (user: User, role: string) => {
    setActiveTab(role);
    setSelectedUser(user);
    if(role !== 'docente' && role !== 'alumno') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handleDeleteUser = (email: string) => {
    removeUser(email);
    toast({ title: "¡Usuario eliminado!", description: "El usuario ha sido eliminado." });
  };
  

  // --- Teacher Logic ---
  const handleAddOrUpdateTeacher = () => {
    if (!editingTeacher) return;
    
    if (!name || !maxHours) {
        toast({ variant: 'destructive', title: 'Error', description: 'Nombre y Horas Máximas son obligatorios.' });
        return;
    }

    const userToUpdate = allUsers.find(u => u.id === editingTeacher.id);
    if (userToUpdate) {
        const userUpdates: Partial<User> = {};
        if (userToUpdate.email !== email && email) userUpdates.email = email;
        if (userToUpdate.username !== name) userUpdates.username = name;
        
        if (Object.keys(userUpdates).length > 0) {
            if(userUpdates.email) toast({ title: 'Nota', description: 'El cambio de email requiere un nuevo inicio de sesión.' });
            updateUser(editingTeacher.id, userUpdates, 'id');
        }
    }

    updateTeacherContext(editingTeacher.id, {
      name, rfc, curp, clave, folio,
      maxHours: parseInt(maxHours),
      qualifiedSubjects,
      puestosAdicionales: puestosAdicionales.split('\n').filter(p => p.trim() !== ''),
    });
    
    toast({ title: 'Docente Actualizado', description: 'El docente ha sido actualizado exitosamente.' });
    
    resetTeacherForm();
  };


  const resetTeacherForm = () => {
    setName(''); setUniqueId(''); setRfc(''); setCurp(''); setClave(''); setFolio('');
    setMaxHours(''); setQualifiedSubjects([]); setPuestosAdicionales('');
    setEditingTeacher(null);
    setEmail('');
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setName(teacher.name); 
    setUniqueId(teacher.id); 
    setRfc(teacher.rfc || '');
    setCurp(teacher.curp || ''); 
    setClave(teacher.clave || ''); 
    setFolio(teacher.folio || '');
    setMaxHours(teacher.maxHours.toString()); 
    setQualifiedSubjects(teacher.qualifiedSubjects || []);
    setPuestosAdicionales(teacher.puestosAdicionales?.join('\n') || '');
    const user = allUsers.find(u => u.id === teacher.id);
    setEmail(user?.email || '');
    editFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteTeacher = (id: string) => {
    const user = allUsers.find(u => u.id === id);
    if(user) {
        handleDeleteUser(user.email);
    } else {
        removeTeacherContext(id);
        toast({ title: 'Docente Eliminado', description: 'El docente fue eliminado, pero no se encontró un usuario asociado.' });
    }
  };

  const handleSaveAvailability = (availability: Availability) => {
    if (availabilityModalTeacher) {
      updateTeacherContext(availabilityModalTeacher.id, { availability });
      toast({ title: 'Restricciones Guardadas', description: `Se guardaron las restricciones horarias para ${availabilityModalTeacher.name}.`});
      setAvailabilityModalTeacher(null);
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        
        if (!Array.isArray(data)) throw new Error("El JSON debe ser un array de docentes.");

        let addedCount = 0;
        let skippedCount = 0;
        
        data.forEach((teacherFromFile: any) => {
            const { id, name, maxHours, qualifiedSubjects, rfc, curp, clave, folio, puestosAdicionales, email } = teacherFromFile;
            
            if (id && name && maxHours && qualifiedSubjects && email) {
                const teacherExists = teachers.some(t => t.id.toLowerCase() === id.toLowerCase());
                const userExists = allUsers.some(u => u.email.toLowerCase() === email.toLowerCase());

                if (!teacherExists && !userExists) {
                    const createdUser = addUserToContext({ username: name, email, role: 'docente' });
                    if (createdUser) {
                        addTeacher({
                           id: createdUser.id, name, rfc: rfc || '', curp: curp || '', clave: clave || '', folio: folio || '',
                           maxHours, qualifiedSubjects,
                           puestosAdicionales: puestosAdicionales || []
                        });
                        addedCount++;
                    } else {
                        skippedCount++;
                    }
                } else {
                    skippedCount++;
                }
            } else {
                skippedCount++;
            }
        });
        toast({ title: "Carga Finalizada", description: `${addedCount} docentes y usuarios agregados. ${skippedCount} omitidos.` });

      } catch (error: any) {
        toast({ variant: "destructive", title: "Error al cargar archivo", description: error.message });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };


  const filteredTeachers = useMemo(() => {
    if (!teacherSearchTerm) return teachers;
    return teachers.filter(t => t.name.toLowerCase().includes(teacherSearchTerm.toLowerCase()) || t.id.toLowerCase().includes(teacherSearchTerm.toLowerCase()));
  }, [teachers, teacherSearchTerm]);

 const getAssignedGroups = (teacherId: string): string[] => {
    const groups = new Set<string>();
    const { distribution, careers } = useContext(AcademicContext);
    if (!distribution || !careers) return [];

    Object.keys(distribution).forEach(periodKey => {
      const periodData = distribution[periodKey];
      if (Array.isArray(periodData)) { // Safety check
        periodData.forEach(dist => {
          if (dist.teacherIds) {
            Object.keys(dist.teacherIds).forEach(groupName => {
              if (dist.teacherIds[groupName] === teacherId) {
                const [careerId, semester] = periodKey.split('-');
                const careerName = careers.find(c => c.id === careerId)?.name || careerId;
                groups.add(`${careerName} ${semester}-${groupName}`);
              }
            });
          }
        });
      }
    });
    return Array.from(groups).sort();
  };

  const { academicPeriodOptions, subjects } = useContext(AcademicContext);
  const subjectsByCareerAndPeriod = useMemo(() => {
    const grouped: { [careerName: string]: { [periodLabel: string]: Subject[] } } = {};
    careers.forEach(career => {
      grouped[career.name] = {};
      academicPeriodOptions.forEach(period => {
        const periodKey = `${career.id}-${period.value}`;
        const periodSubjects = subjects.filter(s => s.period === periodKey);
        if (periodSubjects.length > 0) {
          grouped[career.name][period.label] = periodSubjects;
        }
      });
    });
    return grouped;
  }, [subjects, careers, academicPeriodOptions]);


  const handleDownload = (type: 'nuevos-ingresos' | 'docentes' | 'alumnos', careerId?: string, group?: string) => {
    let data: any[] = [];
    let fileName = type;

    if (type === 'nuevos-ingresos') {
      const storedData = localStorage.getItem('datalake-inscripciones');
      data = storedData ? JSON.parse(storedData) : [];
      fileName = 'nuevos-ingresos';
    } else if (type === 'docentes') {
      data = teachers;
      fileName = 'docentes';
    } else if (type === 'alumnos') {
      data = getFilteredStudentsForDownload(careerId, group);
      if (careerId && group) {
        fileName = `alumnos-${careerId}-${group}`;
      } else if (careerId) {
        fileName = `alumnos-${careerId}-todos`;
      } else {
        fileName = 'alumnos-todos';
      }
    }
    
    if (data.length === 0) {
        toast({variant: 'destructive', title: "Sin datos", description: `No hay datos para descargar para la selección: ${fileName}`});
        return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    toast({title: "Descarga Iniciada", description: `Se está descargando el archivo ${fileName}.xlsx`});
  };

  const getFilteredStudentsForDownload = (careerId?: string, group?: string) => {
    return allUsers.filter(u => 
      u.role === 'alumno' &&
      (!careerId || u.careerId === careerId) &&
      (!group || u.group === group)
    );
  }

  const getStudentsByCareerAndGroup = () => {
    const grouped: { [careerName: string]: { [groupName: string]: User[] } } = {};
    careers.forEach(career => {
        grouped[career.name] = {};
        career.groups.forEach(group => {
            const studentsInGroup = getFilteredStudentsForDownload(career.id, group.name);
            if (studentsInGroup.length > 0) {
                grouped[career.name][group.name] = studentsInGroup;
            }
        });
    });
    return grouped;
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-lg font-semibold md:text-2xl">Gestión Escolar</h1>
         <div className="flex items-center gap-2 w-full sm:w-auto">
            <ConnectionStatus />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1 flex-1 sm:flex-initial">
                  <FileDown className="h-4 w-4"/>
                  Descargar Lista
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Descargar en Excel</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDownload('nuevos-ingresos')}>
                  Solicitudes de Nuevo Ingreso
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('docentes')}>
                  Lista de Docentes
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    Lista de Alumnos
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => handleDownload('alumnos')}>
                      Todos los Alumnos
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {careers.map(career => (
                      <DropdownMenuSub key={career.id}>
                          <DropdownMenuSubTrigger>{career.name}</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => handleDownload('alumnos', career.id)}>
                                Todos los de {career.name}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {career.groups.map(group => (
                              <DropdownMenuItem key={`${career.id}-${group.name}`} onClick={() => handleDownload('alumnos', career.id, group.name)}>
                                Grupo {group.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={isRoleManagerOpen} onOpenChange={setIsRoleManagerOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1 flex-1 sm:flex-initial">
                        <Settings className="h-4 w-4" />
                        Gestionar Roles
                    </Button>
                </DialogTrigger>
                <RoleManager />
            </Dialog>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2">
            <div className="inline-block">
                <TabsList>
                    <TabsTrigger value="nuevo-ingreso">Nuevo Ingreso</TabsTrigger>
                    {roles.map(role => (
                        <TabsTrigger key={role} value={role} className="capitalize">{role}</TabsTrigger>
                    ))}
                </TabsList>
            </div>
        </div>
        
        <TabsContent value="nuevo-ingreso">
          <NewStudentApplications />
        </TabsContent>

        {roles.map(role => (
             <TabsContent key={role} value={role}>
                {role === 'docente' ? (
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div ref={editFormRef} className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{editingTeacher ? 'Editar Docente' : 'Añadir/Editar Docente'}</CardTitle>
                                    <CardDescription>
                                        {editingTeacher ? `Editando a ${editingTeacher.name}` : 'Crea un nuevo usuario de tipo "docente" o selecciona uno de la lista para editar sus detalles.'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="teacher-id">ID Único del Docente</Label>
                                        <Input id="teacher-id" value={uniqueId} onChange={e => setUniqueId(e.target.value)} readOnly placeholder="ID del usuario docente"/>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="teacher-name">Nombre Completo</Label>
                                            <Input id="teacher-name" value={name} onChange={e => setName(e.target.value)} disabled={!editingTeacher}/>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="teacher-email">Email</Label>
                                            <Input id="teacher-email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!editingTeacher}/>
                                        </div>
                                    </div>
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="teacher-rfc">RFC</Label>
                                            <Input id="teacher-rfc" value={rfc} onChange={e => setRfc(e.target.value)} disabled={!editingTeacher}/>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="teacher-curp">CURP</Label>
                                            <Input id="teacher-curp" value={curp} onChange={e => setCurp(e.target.value)} disabled={!editingTeacher}/>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="teacher-clave">Clave</Label>
                                            <Input id="teacher-clave" value={clave} onChange={e => setClave(e.target.value)} disabled={!editingTeacher}/>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="teacher-folio">Folio</Label>
                                            <Input id="teacher-folio" value={folio} onChange={e => setFolio(e.target.value)} disabled={!editingTeacher}/>
                                        </div>
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="teacher-max-hours">Horas Máximas por Semana</Label>
                                        <Input id="teacher-max-hours" type="number" value={maxHours} onChange={e => setMaxHours(e.target.value)} disabled={!editingTeacher}/>
                                    </div>
                                     <div className="space-y-2">
                                        <Label>Asignaturas Calificadas</Label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between" disabled={!editingTeacher}>
                                                    <span>{qualifiedSubjects.length > 0 ? `${qualifiedSubjects.length} seleccionadas` : 'Seleccionar asignaturas'}</span>
                                                    <Users className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[350px] max-h-96 overflow-y-auto">
                                                <DropdownMenuLabel>Asignaturas por Carrera y Semestre</DropdownMenuLabel>
                                                {Object.entries(subjectsByCareerAndPeriod).map(([careerName, periods]) => (
                                                    <DropdownMenuSub key={careerName}>
                                                        <DropdownMenuSubTrigger>{careerName}</DropdownMenuSubTrigger>
                                                        <DropdownMenuSubContent className="max-h-80 overflow-y-auto">
                                                            {Object.entries(periods).map(([periodLabel, subjectsInPeriod]) => (
                                                                <DropdownMenuSub key={`${careerName}-${periodLabel}`}>
                                                                    <DropdownMenuSubTrigger>{periodLabel}</DropdownMenuSubTrigger>
                                                                    <DropdownMenuSubContent className="max-h-60 overflow-y-auto">
                                                                        {subjectsInPeriod.map(subject => (
                                                                            <DropdownMenuCheckboxItem
                                                                                key={subject.name}
                                                                                checked={qualifiedSubjects.includes(subject.name)}
                                                                                onCheckedChange={(checked) => {
                                                                                    setQualifiedSubjects(prev => 
                                                                                        checked 
                                                                                        ? [...prev, subject.name]
                                                                                        : prev.filter(s => s !== subject.name)
                                                                                    );
                                                                                }}
                                                                            >
                                                                                {subject.name}
                                                                            </DropdownMenuCheckboxItem>
                                                                        ))}
                                                                    </DropdownMenuSubContent>
                                                                </DropdownMenuSub>
                                                            ))}
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuSub>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                         <div className="flex flex-wrap gap-1 mt-2">
                                            {qualifiedSubjects.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                                        </div>
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="teacher-positions">Puestos Adicionales (uno por línea)</Label>
                                        <Textarea id="teacher-positions" value={puestosAdicionales} onChange={e => setPuestosAdicionales(e.target.value)} placeholder="Ej: Jefe de Departamento..." disabled={!editingTeacher}/>
                                    </div>
                                </CardContent>
                                <CardContent>
                                    <Button onClick={handleAddOrUpdateTeacher} className="w-full" disabled={!editingTeacher}>
                                        Guardar Cambios
                                    </Button>
                                    {editingTeacher && <Button variant="outline" onClick={resetTeacherForm} className="w-full mt-2">Limpiar / Cancelar</Button>}
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div>
                                        <CardTitle>Lista de Docentes</CardTitle>
                                        <CardDescription>Docentes registrados en el sistema.</CardDescription>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                        <Button variant="outline" size="sm" className="gap-1 flex-1" onClick={() => fileInputRef.current?.click()}>
                                            <Upload className="h-4 w-4" />
                                            Importar
                                        </Button>
                                         <Dialog>
                                            <DialogTrigger asChild><Button size="sm" className="gap-1 flex-1"><PlusCircle className="h-4 w-4" />Crear Docente</Button></DialogTrigger>
                                            <DialogContent>
                                                 <DialogHeader>
                                                    <DialogTitle>Crear Nuevo Docente</DialogTitle>
                                                    <DialogDescription>
                                                        Esto creará un nuevo usuario con el rol de 'docente'. Luego podrá editar sus detalles.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <UserForm user={null} onSave={handleAddOrUpdateUser} onCancel={() => setSelectedUser(null)} roleToSet="docente" />
                                            </DialogContent>
                                         </Dialog>
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileUpload} />
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4 relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Buscar por nombre o ID..." className="pl-8 w-full" value={teacherSearchTerm} onChange={e => setTeacherSearchTerm(e.target.value)} />
                                    </div>
                                    <div className="border rounded-md max-h-[600px] overflow-y-auto">
                                        <Table>
                                            <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Nombre</TableHead><TableHead>Email</TableHead><TableHead>Grupos Asignados</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {filteredTeachers.map(teacher => {
                                                  const user = allUsers.find(u => u.id === teacher.id);
                                                  const assignedGroups = getAssignedGroups(teacher.id);
                                                  return (
                                                    <TableRow key={teacher.id}>
                                                        <TableCell><Badge variant="outline">{teacher.id}</Badge></TableCell>
                                                        <TableCell className="font-medium">{teacher.name}</TableCell>
                                                        <TableCell className="text-muted-foreground">{user?.email || 'N/A'}</TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-wrap gap-1 max-w-xs">
                                                                {assignedGroups.map(g => <Badge key={g} variant="default">{g}</Badge>)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end">
                                                                <Button variant="ghost" size="sm" className="gap-1" onClick={() => setAvailabilityModalTeacher(teacher)}><CalendarOff className="h-4 w-4" /></Button>
                                                                <Button variant="ghost" size="icon" onClick={() => handleEditTeacher(teacher)}><Pencil className="h-4 w-4" /></Button>
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader><AlertDialogTitle>¿Seguro?</AlertDialogTitle><AlertDialogDescription>Se eliminará al docente y su cuenta de usuario asociada.</AlertDialogDescription></AlertDialogHeader>
                                                                        <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteTeacher(teacher.id)}>Eliminar Docente</AlertDialogAction></AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )})}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : role === 'alumno' ? (
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <StudentForm student={selectedUser} onSave={handleAddOrUpdateUser} onCancel={() => setSelectedUser(null)} />
                        </div>
                        <div className="lg:col-span-2">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Lista de Alumnos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                   <div className="border rounded-lg overflow-x-auto">
                                    <Table>
                                        <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Nombre</TableHead><TableHead>Email</TableHead><TableHead>Carrera/Grupo</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {allUsers.filter(u => u.role === 'alumno').map(user => {
                                                const careerName = careers.find(c => c.id === user.careerId)?.name;
                                                return (
                                                <TableRow key={user.id}>
                                                    <TableCell><Badge variant="outline">{user.id}</Badge></TableCell>
                                                    <TableCell>{user.username}</TableCell>
                                                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs">{careerName || user.careerId || 'N/A'}</span>
                                                            <span className="text-xs text-muted-foreground">{user.level || 'N/A'} - {user.group || 'N/A'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEditUser(user, role)}><Pencil className="h-4 w-4"/></Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader><AlertDialogTitle>¿Seguro?</AlertDialogTitle><AlertDialogDescription>Se eliminará permanentemente al usuario.</AlertDialogDescription></AlertDialogHeader>
                                                                <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteUser(user.email)}>Eliminar</AlertDialogAction></AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </TableCell>
                                                </TableRow>
                                            )})}
                                        </TableBody>
                                   </Table>
                                   </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="capitalize">{selectedUser ? 'Editar' : 'Añadir'} {role}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <UserForm user={selectedUser} onSave={handleAddOrUpdateUser} onCancel={() => setSelectedUser(null)} roleToSet={role} />
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-2">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Lista de <span className="capitalize">{role}s</span></CardTitle>
                                </CardHeader>
                                <CardContent>
                                   <div className="border rounded-lg overflow-x-auto">
                                   <Table>
                                        <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Nombre</TableHead><TableHead>Email</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                                        <TableBody>
                                            {allUsers.filter(u => u.role === role).map(user => (
                                                <TableRow key={user.id}>
                                                    <TableCell>{user.id}</TableCell>
                                                    <TableCell>{user.username}</TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEditUser(user, role)}><Pencil className="h-4 w-4"/></Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader><AlertDialogTitle>¿Seguro?</AlertDialogTitle><AlertDialogDescription>Se eliminará permanentemente al usuario.</AlertDialogDescription></AlertDialogHeader>
                                                                <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteUser(user.email)}>Eliminar</AlertDialogAction></AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                   </Table>
                                   </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </TabsContent>
        ))}

      </Tabs>
      
      <Dialog open={!!availabilityModalTeacher} onOpenChange={(open) => !open && setAvailabilityModalTeacher(null)}>
        {availabilityModalTeacher && (<AvailabilityModal teacher={availabilityModalTeacher} onSave={handleSaveAvailability} onCancel={() => setAvailabilityModalTeacher(null)} />)}
      </Dialog>
    </>
  )
}

    