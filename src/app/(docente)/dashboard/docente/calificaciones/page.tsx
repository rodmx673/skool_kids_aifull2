"use client";

import { useState, useContext, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Book, Check, Filter, Save, Search, Users, FilePenLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { UserContext, User } from "@/context/UserContext";
import { TaskContext, Task } from "@/context/TaskContext";
import { AcademicContext } from "@/context/AcademicContext";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function SubmissionsGrader({ task, users, onGrade, onClose }: { task: Task, users: User[], onGrade: (studentId: string, grade: number) => void, onClose: () => void }) {
    const [grades, setGrades] = useState<Record<string, string>>({});
    const { toast } = useToast();

    const getStudentName = (id: string) => users.find(u => u.id === id)?.username || 'Desconocido';
    
    const handleGradeChange = (studentId: string, value: string) => {
        const numericValue = parseFloat(value);
        if (value === "" || (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 10)) {
            setGrades(prev => ({...prev, [studentId]: value}));
        }
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
    
    const studentsInGroup = users.filter(u => u.group === task.groupId);
    const submissionsMap = new Map(task.submissions.map(s => [s.studentId, s]));

    return (
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>Calificar Entregas: {task.title}</DialogTitle>
                <DialogDescription>Asigne una calificación a las entregas de los alumnos para la materia de {task.subject}.</DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[60vh] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Alumno</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Calificación Actual</TableHead>
                            <TableHead>Nueva Calificación</TableHead>
                            <TableHead className="text-right">Acción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {studentsInGroup.map(student => {
                            const submission = submissionsMap.get(student.id);
                            return (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">{student.username}</TableCell>
                                    <TableCell>
                                        <Badge variant={submission ? "default" : "outline"} className={submission ? "bg-blue-500" : ""}>
                                            {submission ? 'Entregado' : 'Pendiente'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={submission?.grade === undefined ? "secondary" : "default"}>
                                            {submission?.grade ?? "Sin calificar"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Input 
                                            type="number" 
                                            className="w-24"
                                            placeholder={submission?.grade?.toString() || "0-10"}
                                            value={grades[student.id] || ""}
                                            onChange={(e) => handleGradeChange(student.id, e.target.value)}
                                            disabled={!submission}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" onClick={() => handleSaveGrade(student.id)} disabled={grades[student.id] === undefined || !submission}>Guardar</Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button onClick={onClose}>Cerrar</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

export default function CalificacionesPage() {
    const [selectedGroup, setSelectedGroup] = useState<string>("");
    const [selectedCareer, setSelectedCareer] = useState<string>("");
    const [selectedLevel, setSelectedLevel] = useState<string>("");
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [viewingTask, setViewingTask] = useState<Task | null>(null);

    const { currentUser, users } = useContext(UserContext);
    const { tasks, gradeSubmission } = useContext(TaskContext);
    const { careers, distribution } = useContext(AcademicContext);
    const { toast } = useToast();
    
    const teacherSubjectsForGroup = useMemo(() => {
        if (!currentUser || !distribution || !selectedCareer || !selectedLevel || !selectedGroup) return [];
        
        const periodKey = `${selectedCareer}-${selectedLevel}`;
        const periodDistribution = distribution[periodKey];

        if (!periodDistribution) return [];

        return periodDistribution
            .filter(dist => dist.teacherIds[selectedGroup] === currentUser.id)
            .map(dist => dist.subjectName);

    }, [currentUser, distribution, selectedCareer, selectedLevel, selectedGroup]);

    const teacherTasks = useMemo(() => {
        if (!currentUser) return [];
        return tasks.filter(t => t.creatorId === currentUser.id);
    }, [tasks, currentUser]);

    const filteredTasks = useMemo(() => {
        return teacherTasks.filter(task => 
            (!selectedGroup || task.groupId === selectedGroup) && 
            (!selectedSubject || task.subject === selectedSubject)
        );
    }, [teacherTasks, selectedGroup, selectedSubject]);
    
    const handleGrade = (studentId: string, grade: number) => {
        if (!viewingTask) return;
        gradeSubmission(viewingTask.id, studentId, grade);
    };

    
  return (
    <Card>
    <CardHeader>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
                <CardTitle>Registro de Calificaciones</CardTitle>
                <CardDescription>Seleccione los filtros para ver las tareas y calificar las entregas de sus alumnos.</CardDescription>
            </div>
        </div>
    </CardHeader>
    <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/50 border">
            <div className="space-y-2 col-span-1 md:col-span-4">
                <h4 className="font-semibold flex items-center gap-2 text-sm"><Filter className="h-4 w-4"/>Filtros de Selección</h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                     <Select value={selectedCareer} onValueChange={v => {setSelectedCareer(v); setSelectedGroup(''); setSelectedSubject('');}}>
                        <SelectTrigger><Users className="h-4 w-4 mr-2 text-muted-foreground"/><SelectValue placeholder="Carrera..." /></SelectTrigger>
                        <SelectContent>
                            {careers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={selectedLevel} onValueChange={v => {setSelectedLevel(v); setSelectedGroup(''); setSelectedSubject('');}}>
                        <SelectTrigger><Users className="h-4 w-4 mr-2 text-muted-foreground"/><SelectValue placeholder="Semestre..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2">2° Semestre</SelectItem>
                            <SelectItem value="4">4° Semestre</SelectItem>
                            <SelectItem value="6">6° Semestre</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={selectedGroup} onValueChange={v => {setSelectedGroup(v); setSelectedSubject('');}} disabled={!selectedCareer || !selectedLevel}>
                        <SelectTrigger><Users className="h-4 w-4 mr-2 text-muted-foreground"/><SelectValue placeholder="Grupo..." /></SelectTrigger>
                        <SelectContent>
                            {careers.find(c => c.id === selectedCareer)?.groups.map(g => <SelectItem key={g.name} value={g.name}>{g.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={teacherSubjectsForGroup.length === 0}>
                        <SelectTrigger><Book className="h-4 w-4 mr-2 text-muted-foreground"/><SelectValue placeholder="Materia..." /></SelectTrigger>
                        <SelectContent>
                            {teacherSubjectsForGroup.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tarea / Examen</TableHead>
                        <TableHead>Grupo</TableHead>
                        <TableHead>Fecha Límite</TableHead>
                        <TableHead className="text-center">Entregas</TableHead>
                        <TableHead className="text-center">Calificadas</TableHead>
                        <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map(task => {
                            const gradedCount = task.submissions.filter(s => s.grade !== undefined).length;
                            return (
                            <TableRow key={task.id}>
                                <TableCell className="font-medium">{task.title}</TableCell>
                                <TableCell>{task.groupId}</TableCell>
                                <TableCell>{format(new Date(task.dueDate), "dd MMM, yyyy", {locale: es})}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="secondary">{task.submissions.length}</Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={gradedCount === task.submissions.length && task.submissions.length > 0 ? "default" : "outline"} className={gradedCount === task.submissions.length && task.submissions.length > 0 ? "bg-green-600" : ""}>
                                        {gradedCount}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" onClick={() => setViewingTask(task)}>
                                        <FilePenLine className="h-4 w-4 mr-2" />
                                        Calificar Entregas
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )})
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No se encontraron tareas o exámenes con los filtros seleccionados.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>

        <Dialog open={!!viewingTask} onOpenChange={(isOpen) => !isOpen && setViewingTask(null)}>
            {viewingTask && <SubmissionsGrader task={viewingTask} users={users} onGrade={handleGrade} onClose={() => setViewingTask(null)} />}
        </Dialog>
    </CardContent>
    </Card>
  );
}
