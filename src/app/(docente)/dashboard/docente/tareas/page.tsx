
"use client";

import { useState, useContext, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, Search, ListFilter, MoreHorizontal, FilePenLine, Trash2, Eye, X, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { TaskContext, Task } from "@/context/TaskContext";
import { UserContext, User } from "@/context/UserContext";
import { AcademicContext } from "@/context/AcademicContext";
import { useToast } from "@/hooks/use-toast";

function TaskForm({ task, onSave, onCancel }: { task: Partial<Task> | null, onSave: (data: Omit<Task, 'id' | 'submissions' | 'creatorId'>) => void, onCancel: () => void }) {
    const { currentUser } = useContext(UserContext);
    const { careers, distribution, academicPeriodOptions } = useContext(AcademicContext);
    const { toast } = useToast();
    
    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [careerId, setCareerId] = useState('');
    const [level, setLevel] = useState('');
    const [groupId, setGroupId] = useState(task?.groupId || '');
    const [subject, setSubject] = useState(task?.subject || '');
    const [dueDate, setDueDate] = useState<Date | undefined>(task?.dueDate ? new Date(task.dueDate) : undefined);
    const [type, setType] = useState<'task' | 'exam'>(task?.type || 'task');

    const teacherSubjects = useMemo(() => {
        if (!currentUser || !distribution || !careerId || !level || !groupId) return [];
        
        const periodKey = `${careerId}-${level}`;
        const periodDistribution = distribution[periodKey];

        if (!periodDistribution) return [];

        return periodDistribution
            .filter(dist => dist.teacherIds[groupId] === currentUser.id)
            .map(dist => dist.subjectName);

    }, [currentUser, distribution, careerId, level, groupId]);
    
    const availableGroups = useMemo(() => {
        const selectedCareer = careers.find(c => c.id === careerId);
        return selectedCareer?.groups || [];
    }, [careerId, careers]);

    const handleSubmit = () => {
        if (!title || !groupId || !subject || !dueDate) {
            toast({ variant: "destructive", title: "Campos incompletos", description: "Todos los campos son obligatorios." });
            return;
        }
        onSave({ title, description, groupId, subject, dueDate: format(dueDate, "yyyy-MM-dd"), type });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Título de la Tarea/Examen</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="career">Carrera</Label>
                    <Select value={careerId} onValueChange={(v) => { setCareerId(v); setGroupId(''); setSubject(''); }}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar carrera..." /></SelectTrigger>
                        <SelectContent>{careers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="level">Semestre</Label>
                    <Select value={level} onValueChange={(v) => { setLevel(v); setGroupId(''); setSubject(''); }}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar semestre..." /></SelectTrigger>
                        <SelectContent>{academicPeriodOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="group">Grupo</Label>
                    <Select value={groupId} onValueChange={setGroupId} disabled={!careerId || !level}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar grupo..."/></SelectTrigger>
                        <SelectContent>{availableGroups.map(g => <SelectItem key={g.name} value={g.name}>{g.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={type} onValueChange={(value: 'task' | 'exam') => setType(value)}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="task">Tarea</SelectItem>
                            <SelectItem value="exam">Examen</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="subject">Materia</Label>
                    <Select value={subject} onValueChange={setSubject} disabled={teacherSubjects.length === 0}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar materia..."/></SelectTrigger>
                        <SelectContent>
                           {teacherSubjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Fecha Límite</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dueDate ? format(dueDate, "PPP", {locale: es}) : <span>Seleccionar fecha</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus locale={es}/></PopoverContent>
                    </Popover>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button onClick={handleSubmit}>Guardar</Button>
            </DialogFooter>
        </div>
    );
}

function SubmissionsViewer({ task, users, onGrade, onClose }: { task: Task, users: User[], onGrade: (studentId: string, grade: number) => void, onClose: () => void }) {
    const [grades, setGrades] = useState<Record<string, string>>({});
    const { toast } = useToast();

    const getStudentName = (id: string) => users.find(u => u.id === id)?.username || 'Desconocido';
    
    const handleGradeChange = (studentId: string, value: string) => {
        setGrades(prev => ({...prev, [studentId]: value}));
    };

    const handleSaveGrade = (studentId: string) => {
        const gradeValue = parseFloat(grades[studentId]);
        if (!isNaN(gradeValue) && gradeValue >= 0 && gradeValue <= 10) {
            onGrade(studentId, gradeValue);
            toast({ title: "Calificación Guardada", description: `Se guardó la calificación para ${getStudentName(studentId)}.` });
            setGrades(prev => {
                const newGrades = {...prev};
                delete newGrades[studentId];
                return newGrades;
            });
        } else {
             toast({ variant: "destructive", title: "Valor Inválido", description: "La calificación debe ser un número entre 0 y 10." });
        }
    };
    
    return (
        <>
            <DialogHeader>
                <DialogTitle>Entregas para: {task.title}</DialogTitle>
                <DialogDescription>Revisa las entregas de los alumnos y asigna una calificación.</DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[60vh] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Alumno</TableHead>
                            <TableHead>Fecha de Entrega</TableHead>
                            <TableHead>Calificación Actual</TableHead>
                            <TableHead>Nueva Calificación</TableHead>
                            <TableHead className="text-right">Acción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {task.submissions.map(sub => (
                            <TableRow key={sub.studentId}>
                                <TableCell className="font-medium">{getStudentName(sub.studentId)}</TableCell>
                                <TableCell>{format(new Date(sub.submittedAt), "PPP p", {locale: es})}</TableCell>
                                <TableCell>
                                    <Badge variant={sub.grade === undefined ? "secondary" : "default"}>
                                        {sub.grade ?? "Sin calificar"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Input 
                                        type="number" 
                                        className="w-24"
                                        placeholder={sub.grade?.toString() || "0-10"}
                                        value={grades[sub.studentId] || ""}
                                        onChange={(e) => handleGradeChange(sub.studentId, e.target.value)}
                                    />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" onClick={() => handleSaveGrade(sub.studentId)} disabled={grades[sub.studentId] === undefined}>Guardar</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 {task.submissions.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                        Aún no hay entregas para esta tarea.
                    </div>
                )}
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button onClick={onClose}>Cerrar</Button>
                </DialogClose>
            </DialogFooter>
        </>
    );
}

export default function DocenteTareasPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const { currentUser, users } = useContext(UserContext);
    const { tasks, addTask, gradeSubmission } = useContext(TaskContext); // Assuming updateTask and deleteTask exist
    const { toast } = useToast();
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);

    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewingTask, setViewingTask] = useState<Task | null>(null);

    const teacherTasks = useMemo(() => {
        if (!currentUser) return [];
        return tasks.filter(t => t.creatorId === currentUser.id);
    }, [tasks, currentUser]);

    const activeTasks = teacherTasks.filter(t => new Date(t.dueDate) >= new Date());
    const gradedOrClosedTasks = teacherTasks.filter(t => new Date(t.dueDate) < new Date());
    
    const handleSaveTask = (data: Omit<Task, 'id' | 'submissions' | 'creatorId'>) => {
        if (!currentUser) return;
        // In a real scenario, you'd have an updateTask function
        if (editingTask?.id) {
            // updateTask(editingTask.id, {...data, creatorId: currentUser.id});
             toast({ title: "Tarea Actualizada (simulado)" });
        } else {
            addTask({...data, creatorId: currentUser.id});
            toast({ title: "¡Tarea Creada!", description: `Se ha asignado "${data.title}" al grupo seleccionado.` });
        }
        setIsFormOpen(false);
        setEditingTask(null);
    };

    const handleOpenForm = (task: Partial<Task> | null) => {
        setEditingTask(task);
        setIsFormOpen(true);
    };
    
    const handleOpenViewer = (task: Task) => {
        setViewingTask(task);
        setIsViewerOpen(true);
    };
    
     const handleGrade = (studentId: string, grade: number) => {
        if (!viewingTask) return;
        gradeSubmission(viewingTask.id, studentId, grade);
    };

    return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
                <CardTitle>Gestión de Tareas y Exámenes</CardTitle>
                <CardDescription>Aquí podrás crear, asignar y revisar las tareas de tus alumnos.</CardDescription>
            </div>
            <Button className="w-full md:w-auto" onClick={() => handleOpenForm(null)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear Tarea/Examen
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="activas">
            <div className="flex items-center justify-between gap-4">
                <TabsList>
                    <TabsTrigger value="activas">Activas y Próximas</TabsTrigger>
                    <TabsTrigger value="calificadas">Cerradas y Calificadas</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                     <div className="relative flex-1 md:grow-0">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Buscar..."
                          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                </div>
            </div>
            <TabsContent value="activas">
                <div className="border rounded-lg mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Título</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Grupo</TableHead>
                                <TableHead>Fecha de Entrega</TableHead>
                                <TableHead>Entregas</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activeTasks.filter(task => task.title.toLowerCase().includes(searchTerm.toLowerCase())).map(task => (
                                <TableRow key={task.id}>
                                    <TableCell className="font-medium">{task.title}</TableCell>
                                    <TableCell><Badge variant="outline">{task.type === 'exam' ? 'Examen' : 'Tarea'}</Badge></TableCell>
                                    <TableCell>{task.groupId}</TableCell>
                                    <TableCell>{format(new Date(task.dueDate), "dd MMM, yyyy", {locale: es})}</TableCell>
                                    <TableCell>{task.submissions.length}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleOpenViewer(task)}><Eye className="mr-2 h-4 w-4"/>Ver Entregas</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleOpenForm(task)}><FilePenLine className="mr-2 h-4 w-4"/>Editar</DropdownMenuItem>
                                                <DropdownMenuSeparator/>
                                                <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Eliminar</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     {activeTasks.length === 0 && <div className="text-center py-8 text-muted-foreground">No hay tareas activas.</div>}
                </div>
            </TabsContent>
            <TabsContent value="calificadas">
                 <div className="border rounded-lg mt-4">
                    <Table>
                        <TableHeader>
                             <TableRow>
                                <TableHead>Título</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Grupo</TableHead>
                                <TableHead>Fecha de Cierre</TableHead>
                                <TableHead>Entregas</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {gradedOrClosedTasks.filter(task => task.title.toLowerCase().includes(searchTerm.toLowerCase())).map(task => (
                                <TableRow key={task.id}>
                                    <TableCell className="font-medium">{task.title}</TableCell>
                                    <TableCell><Badge variant="outline">{task.type === 'exam' ? 'Examen' : 'Tarea'}</Badge></TableCell>
                                    <TableCell>{task.groupId}</TableCell>
                                    <TableCell>{format(new Date(task.dueDate), "dd MMM, yyyy", {locale: es})}</TableCell>
                                    <TableCell>{task.submissions.length}</TableCell>
                                    <TableCell className="text-right">
                                       <Button variant="outline" size="sm" onClick={() => handleOpenViewer(task)}><Eye className="mr-2 h-4 w-4"/>Ver Entregas</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     {gradedOrClosedTasks.length === 0 && <div className="text-center py-8 text-muted-foreground">No hay tareas cerradas o calificadas.</div>}
                </div>
            </TabsContent>
        </Tabs>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent>
                 <DialogHeader>
                    <DialogTitle>{editingTask ? 'Editar' : 'Crear'} Tarea o Examen</DialogTitle>
                    <DialogDescription>Complete los detalles y asigne a un grupo.</DialogDescription>
                </DialogHeader>
                <TaskForm task={editingTask} onSave={handleSaveTask} onCancel={() => setIsFormOpen(false)} />
            </DialogContent>
        </Dialog>
         <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
            <DialogContent className="max-w-4xl">
              {viewingTask && <SubmissionsViewer task={viewingTask} users={users} onGrade={handleGrade} onClose={() => setIsViewerOpen(false)} />}
            </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
