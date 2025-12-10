
"use client";

import { useState, useContext, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Book, Check, Filter, Save, Users, Calendar as CalendarIcon, UserCheck, UserX, Clock, Hand } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserContext } from "@/context/UserContext";
import { AttendanceContext, AttendanceStatus } from "@/context/AttendanceContext";
import { AcademicContext } from "@/context/AcademicContext";


const getInitials = (name: string) => {
    if (!name) return "AL";
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

export default function AsistenciasPage() {
    const { currentUser, users } = useContext(UserContext);
    const { addAttendanceRecord } = useContext(AttendanceContext);
    const { careers, distribution } = useContext(AcademicContext);
    const { toast } = useToast();

    const [selectedGroup, setSelectedGroup] = useState<string>("A");
    const [selectedCareer, setSelectedCareer] = useState<string>("ofimatica");
    const [selectedLevel, setSelectedLevel] = useState<string>("2"); // Asumiendo un nivel por defecto
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});

    const studentsInGroup = useMemo(() => {
        return users.filter(user => user.role === 'alumno' && user.careerId === selectedCareer && user.group === selectedGroup && user.level === selectedLevel);
    }, [users, selectedCareer, selectedLevel, selectedGroup]);

    const teacherSubjectsForGroup = useMemo(() => {
        if (!currentUser || !distribution || !selectedCareer || !selectedLevel) return [];
        
        const periodKey = `${selectedCareer}-${selectedLevel}`;
        const periodDistribution = distribution[periodKey];

        if (!periodDistribution) return [];

        return periodDistribution
            .filter(dist => dist.teacherIds[selectedGroup] === currentUser.id)
            .map(dist => dist.subjectName);

    }, [currentUser, distribution, selectedCareer, selectedLevel, selectedGroup]);
    
    useEffect(() => {
        setSelectedSubject('');
    }, [selectedCareer, selectedLevel, selectedGroup]);

    const handleSetAll = (status: AttendanceStatus) => {
        const newAttendance: Record<string, AttendanceStatus> = {};
        studentsInGroup.forEach(student => {
            newAttendance[student.id] = status;
        });
        setAttendance(newAttendance);
    };

    const handleSaveAttendance = () => {
        if (!currentUser || !date || Object.keys(attendance).length === 0 || !selectedSubject) {
            toast({
                variant: "destructive",
                title: "Faltan datos",
                description: "Asegúrate de seleccionar una carrera, grupo, materia, fecha y marcar la asistencia de al menos un alumno."
            });
            return;
        }

        let recordsSaved = 0;
        Object.entries(attendance).forEach(([studentId, status]) => {
             addAttendanceRecord({
                studentId: studentId,
                date: format(date, 'yyyy-MM-dd'),
                subject: selectedSubject,
                status: status,
                recordedBy: currentUser.id,
            });
            recordsSaved++;
        });

        toast({
            title: "¡Asistencia Guardada!",
            description: `Se han registrado ${recordsSaved} estados de asistencia para el día ${format(date, "PPP", { locale: es })}.`
        });
        setAttendance({});
    };
    
    const getStatusVariant = (status?: AttendanceStatus) => {
        switch (status) {
            case 'presente': return 'bg-green-100 text-green-800 border-green-200';
            case 'ausente': return 'bg-red-100 text-red-800 border-red-200';
            case 'retardo': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'justificado': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };


  return (
        <div className="space-y-6">
        <Card>
        <CardHeader>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                    <CardTitle>Registro de Asistencia</CardTitle>
                    <CardDescription>Seleccione los filtros para registrar la asistencia del día.</CardDescription>
                </div>
                <Button onClick={handleSaveAttendance} disabled={Object.keys(attendance).length === 0}>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Asistencia
                </Button>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/50 border">
                <div className="space-y-2 col-span-1 md:col-span-4">
                    <h4 className="font-semibold flex items-center gap-2 text-sm"><Filter className="h-4 w-4"/>Filtros de Selección</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        <Select value={selectedCareer} onValueChange={setSelectedCareer}>
                            <SelectTrigger><Users className="h-4 w-4 mr-2 text-muted-foreground"/><SelectValue placeholder="Carrera..." /></SelectTrigger>
                            <SelectContent>
                                {careers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                         <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                            <SelectTrigger><Users className="h-4 w-4 mr-2 text-muted-foreground"/><SelectValue placeholder="Semestre..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2">2° Semestre</SelectItem>
                                <SelectItem value="4">4° Semestre</SelectItem>
                                <SelectItem value="6">6° Semestre</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={selectedGroup} onValueChange={setSelectedGroup}>
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
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "justify-start text-left font-normal col-span-full lg:col-span-1",
                                    !date && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={es}/>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h4 className="font-semibold">Lista de Alumnos - {selectedCareer} {selectedLevel}° {selectedGroup}</h4>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Marcar todos como:</span>
                    <Button variant="outline" size="sm" onClick={() => handleSetAll('presente')}><UserCheck className="h-4 w-4 mr-2"/>Presente</Button>
                    <Button variant="outline" size="sm" onClick={() => handleSetAll('ausente')}><UserX className="h-4 w-4 mr-2"/>Ausente</Button>
                </div>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">Nombre del Alumno</TableHead>
                            <TableHead className="text-center w-[150px]">Estado Actual</TableHead>
                            <TableHead className="text-center">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {studentsInGroup.length > 0 ? studentsInGroup.map(student => (
                            <TableRow key={student.id}>
                                <TableCell className="font-medium flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={student.profilePictureUrl || `https://picsum.photos/seed/${student.id}/40/40`} data-ai-hint="student face" />
                                        <AvatarFallback>{getInitials(student.username)}</AvatarFallback>
                                    </Avatar>
                                    {student.username}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge className={cn("text-sm capitalize", getStatusVariant(attendance[student.id]))}>
                                        {attendance[student.id]?.replace('_', ' ') || 'Sin Registrar'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex justify-center gap-2">
                                        <Button variant={attendance[student.id] === 'presente' ? 'default' : 'outline'} size="sm" onClick={() => setAttendance(prev => ({...prev, [student.id]: 'presente'}))} className={cn(attendance[student.id] === 'presente' && 'bg-green-500 hover:bg-green-600')}>
                                            <UserCheck className="h-4 w-4 sm:mr-2"/> <span className="hidden sm:inline">Presente</span>
                                        </Button>
                                        <Button variant={attendance[student.id] === 'ausente' ? 'destructive' : 'outline'} size="sm" onClick={() => setAttendance(prev => ({...prev, [student.id]: 'ausente'}))}>
                                            <UserX className="h-4 w-4 sm:mr-2"/> <span className="hidden sm:inline">Ausente</span>
                                        </Button>
                                        <Button variant={attendance[student.id] === 'retardo' ? 'default' : 'outline'} size="sm" onClick={() => setAttendance(prev => ({...prev, [student.id]: 'retardo'}))} className={cn(attendance[student.id] === 'retardo' && 'bg-yellow-500 hover:bg-yellow-600')}>
                                            <Clock className="h-4 w-4 sm:mr-2"/> <span className="hidden sm:inline">Retardo</span>
                                        </Button>
                                        <Button variant={attendance[student.id] === 'justificado' ? 'default' : 'outline'} size="sm" onClick={() => setAttendance(prev => ({...prev, [student.id]: 'justificado'}))} className={cn(attendance[student.id] === 'justificado' && 'bg-blue-500 hover:bg-blue-600')}>
                                            <Hand className="h-4 w-4 sm:mr-2"/> <span className="hidden sm:inline">Justificado</span>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    No se encontraron alumnos con los filtros seleccionados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
        </Card>
        </div>
  );
}
