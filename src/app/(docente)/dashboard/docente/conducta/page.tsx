
"use client";

import { useState, useContext, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Book, Filter, Users, Award, ShieldCheck, ShieldAlert, Medal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserContext, User } from "@/context/UserContext";
import { AcademicContext } from "@/context/AcademicContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ConductContext } from "@/context/ConductContext";


const getInitials = (name: string) => {
    if (!name) return "AL";
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

function ConductReportDialog({ student, onSave, onCancel, teacherId }: { student: User, onSave: (type: 'positivo' | 'negativo' | 'achievement', description: string) => void, onCancel: () => void, teacherId: string }) {
    const [reportType, setReportType] = useState<'positivo' | 'negativo' | 'achievement'>('positivo');
    const [description, setDescription] = useState('');
    const { toast } = useToast();

    const handleSubmit = () => {
        if (!description.trim()) {
            toast({ variant: "destructive", title: "Descripción Vacía", description: "Debe proporcionar una descripción para el reporte." });
            return;
        }
        onSave(reportType, description);
        setDescription('');
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Reporte de Conducta para {student.username}</DialogTitle>
                <DialogDescription>Añada una anotación sobre el comportamiento o un logro del alumno.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="space-y-2">
                    <Label>Tipo de Reporte</Label>
                    <Select value={reportType} onValueChange={(value) => setReportType(value as any)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="positivo">Reporte Positivo</SelectItem>
                            <SelectItem value="negativo">Reporte Negativo</SelectItem>
                            <SelectItem value="achievement">Otorgar Premio/Logro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="report-description">Descripción</Label>
                    <Textarea id="report-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: Mostró iniciativa al ayudar a un compañero..." />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline" onClick={onCancel}>Cancelar</Button></DialogClose>
                <Button onClick={handleSubmit}>Guardar Reporte</Button>
            </DialogFooter>
        </DialogContent>
    );
}


export default function ConductaPage() {
    const [selectedCareer, setSelectedCareer] = useState<string>("");
    const [selectedLevel, setSelectedLevel] = useState<string>("");
    const [selectedGroup, setSelectedGroup] = useState<string>("");
    
    const { currentUser, users } = useContext(UserContext);
    const { careers } = useContext(AcademicContext);
    const { getConductForStudent, addConductReport, addAchievement } = useContext(ConductContext);
    const { toast } = useToast();

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

    const studentsInGroup = useMemo(() => {
        if (!selectedCareer || !selectedLevel || !selectedGroup) return [];
        return users.filter(user => user.role === 'alumno' && user.careerId === selectedCareer && user.level === selectedLevel && user.group === selectedGroup);
    }, [users, selectedCareer, selectedLevel, selectedGroup]);
    
    const { reports: studentReports, achievements: studentAchievements } = useMemo(() => {
        if (!selectedStudent) return { reports: [], achievements: [] };
        return getConductForStudent(selectedStudent.id);
    }, [selectedStudent, getConductForStudent]);
    
    const conductStats = useMemo(() => {
        const totalPoints = studentReports.reduce((acc, report) => acc + report.points, 100);
        const positiveReports = studentReports.filter(r => r.type === 'positivo').length;
        const negativeReports = studentReports.filter(r => r.type === 'negativo').length;
        return { totalPoints, positiveReports, negativeReports };
    }, [studentReports]);

    const handleOpenReportModal = () => {
        if (selectedStudent) {
            setIsReportModalOpen(true);
        } else {
            toast({ variant: 'destructive', title: 'Ningún Alumno Seleccionado', description: 'Por favor, seleccione un alumno de la lista.' });
        }
    };

    const handleSaveReport = (type: 'positivo' | 'negativo' | 'achievement', description: string) => {
        if (!selectedStudent || !currentUser) return;

        if (type === 'achievement') {
            addAchievement({ studentId: selectedStudent.id, title: description, description: `Otorgado por ${currentUser.username}`, teacherId: currentUser.id });
             toast({ title: `Logro Otorgado`, description: `Se guardó el logro para ${selectedStudent.username}` });
        } else {
            addConductReport({ studentId: selectedStudent.id, report: description, type, points: type === 'positivo' ? 5 : -5, teacherId: currentUser.id });
             toast({ title: `Reporte Guardado`, description: `Se guardó un reporte ${type} para ${selectedStudent.username}` });
        }
        
        setIsReportModalOpen(false);
    };

    return (
        <>
            <div className="space-y-6">
                 <div>
                    <h1 className="text-2xl font-bold tracking-tight">Registro de Conducta y Logros</h1>
                    <p className="text-muted-foreground">Seleccione un grupo para ver a los alumnos y registrar su comportamiento.</p>
                </div>
                 <div className="p-4 border rounded-lg bg-muted/50">
                     <h4 className="font-semibold flex items-center gap-2 text-sm mb-2"><Filter className="h-4 w-4"/>Filtros de Grupo</h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        <Select value={selectedCareer} onValueChange={v => { setSelectedCareer(v); setSelectedGroup(''); setSelectedStudent(null); }}>
                            <SelectTrigger><Users className="mr-2 h-4 w-4 text-muted-foreground"/><SelectValue placeholder="Carrera..." /></SelectTrigger>
                            <SelectContent>{careers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={selectedLevel} onValueChange={v => { setSelectedLevel(v); setSelectedGroup(''); setSelectedStudent(null); }}>
                            <SelectTrigger><Users className="h-4 w-4 mr-2 text-muted-foreground"/><SelectValue placeholder="Semestre..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2">2° Semestre</SelectItem>
                                <SelectItem value="4">4° Semestre</SelectItem>
                                <SelectItem value="6">6° Semestre</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={selectedGroup} onValueChange={v => {setSelectedGroup(v); setSelectedStudent(null);}} disabled={!selectedCareer || !selectedLevel}>
                            <SelectTrigger><Users className="h-4 w-4 mr-2 text-muted-foreground"/><SelectValue placeholder="Grupo..." /></SelectTrigger>
                            <SelectContent>
                                {careers.find(c => c.id === selectedCareer)?.groups.map(g => <SelectItem key={g.name} value={g.name}>{g.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Alumnos del Grupo</CardTitle>
                                <CardDescription>Selecciona un alumno para ver su historial.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="max-h-[600px] overflow-y-auto">
                                    {studentsInGroup.length > 0 ? (
                                        studentsInGroup.map(student => (
                                            <button
                                                key={student.id}
                                                onClick={() => setSelectedStudent(student)}
                                                className={cn(
                                                    "w-full text-left p-3 flex items-center gap-3 border-b last:border-b-0 hover:bg-accent",
                                                    selectedStudent?.id === student.id && "bg-accent"
                                                )}
                                            >
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={student.profilePictureUrl || `https://picsum.photos/seed/${student.id}/40/40`} data-ai-hint="student face" />
                                                    <AvatarFallback>{getInitials(student.username)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{student.username}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-center text-muted-foreground p-8">
                                            Selecciona una carrera, semestre y grupo.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        {selectedStudent ? (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader className="flex flex-row items-start justify-between">
                                        <div>
                                            <CardTitle>Historial de {selectedStudent.username}</CardTitle>
                                            <CardDescription>Anotaciones sobre su comportamiento.</CardDescription>
                                        </div>
                                        <Button onClick={handleOpenReportModal}>Añadir Reporte</Button>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Descripción</TableHead><TableHead className="text-right">Tipo</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {studentReports.map(report => (
                                                    <TableRow key={report.id}>
                                                        <TableCell>{new Date(report.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}</TableCell>
                                                        <TableCell>{report.report}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Badge variant={report.type === 'positivo' ? 'default' : 'destructive'} className={report.type === 'positivo' ? 'bg-green-600' : ''}>
                                                                {report.type === 'positivo' ? <ShieldCheck className="mr-1 h-3 w-3"/> : <ShieldAlert className="mr-1 h-3 w-3" />}
                                                                {report.type}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2"><Award />Logros y Reconocimientos</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {studentAchievements.map(ach => (
                                            <div key={ach.id} className="p-4 border rounded-lg bg-yellow-50 border-yellow-200 flex items-start gap-4">
                                                <Medal className="h-8 w-8 text-yellow-600 mt-1 shrink-0"/>
                                                <div>
                                                    <h3 className="font-semibold text-yellow-800">{ach.title}</h3>
                                                    <p className="text-sm text-yellow-700/80">{ach.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                                <Users className="h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 font-semibold">Selecciona un Alumno</h3>
                                <p className="text-muted-foreground text-sm">Elige un alumno de la lista para ver su historial de conducta y añadir reportes.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
                {selectedStudent && currentUser && <ConductReportDialog student={selectedStudent} onSave={handleSaveReport} onCancel={() => setIsReportModalOpen(false)} teacherId={currentUser.id} />}
            </Dialog>
        </>
    );
}
