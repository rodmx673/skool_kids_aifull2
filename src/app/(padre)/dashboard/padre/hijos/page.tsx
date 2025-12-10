
"use client";

import { useContext, useMemo, useState, useRef, useEffect } from "react";
import { UserContext } from "@/context/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, UserCheck, Bot, Send, Sparkles, Loader2, Book, CheckCircle, Target } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { generateStudentAnalysis, StudentAnalysisOutput } from "@/ai/flows/generate-student-analysis-flow";
import { TaskContext } from "@/context/TaskContext";
import { AttendanceContext } from "@/context/AttendanceContext";
import { ConductContext } from "@/context/ConductContext";
import { Badge } from "@/components/ui/badge";

const getInitials = (name: string) => {
    if (!name) return "AL";
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function LinkStudentDialog() {
    const { currentUser, linkStudentToTutor } = useContext(UserContext);
    const [studentId, setStudentId] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const handleLink = () => {
        if (!currentUser) return;
        if (!studentId.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'El ID del alumno no puede estar vacío.' });
            return;
        }
        const result = linkStudentToTutor(currentUser.id, studentId.trim());
        if (result.success) {
            toast({ title: '¡Éxito!', description: result.message });
            setStudentId('');
            setIsOpen(false);
        } else {
            toast({ variant: 'destructive', title: 'Error de Vinculación', description: result.message });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Vincular Alumno
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Vincular un Nuevo Alumno</DialogTitle>
                    <DialogDescription>
                        Ingresa el ID único de tu hijo (lo puede encontrar en su perfil o credencial QR) para vincularlo a tu cuenta.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="student-id">ID del Alumno</Label>
                    <Input
                        id="student-id"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="Ej: alum1234"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                    <Button onClick={handleLink}>Vincular</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function AnalysisChatDialog({ student, isOpen, onOpenChange }: { student: any, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    const [isLoading, setIsLoading] = useState(true);
    const [analysis, setAnalysis] = useState<StudentAnalysisOutput | null>(null);
    const { getTasksForStudent } = useContext(TaskContext);
    const { getAttendanceForStudent } = useContext(AttendanceContext);
    const { getConductForStudent } = useContext(ConductContext);

    useEffect(() => {
        if (isOpen && student) {
            setIsLoading(true);
            setAnalysis(null);
            
            const performAnalysis = async () => {
                // 1. Gather data
                const tasks = getTasksForStudent(student.id, student.group);
                const attendance = getAttendanceForStudent(student.id);
                const conduct = getConductForStudent(student.id);

                const grades = tasks.flatMap(t => t.submissions)
                                    .filter(s => s.studentId === student.id && s.grade !== undefined)
                                    .map(s => ({ subject: tasks.find(t => t.id === s.taskId)?.subject || 'N/A', grade: s.grade! }));
                
                const attendanceStats = {
                    total: attendance.length,
                    present: attendance.filter(a => a.status === 'presente').length,
                    absent: attendance.filter(a => a.status === 'ausente').length,
                    late: attendance.filter(a => a.status === 'retardo').length,
                };

                const conductReports = conduct.reports.map(r => ({ type: r.type, report: r.report }));

                // 2. Call AI flow
                try {
                    const result = await generateStudentAnalysis({
                        studentName: student.username,
                        grades,
                        attendance: attendanceStats,
                        conduct: conductReports,
                    });
                    setAnalysis(result);
                } catch (error) {
                    console.error("Analysis failed:", error);
                    // Handle error display inside the dialog
                } finally {
                    setIsLoading(false);
                }
            };

            performAnalysis();
        }
    }, [isOpen, student, getTasksForStudent, getAttendanceForStudent, getConductForStudent]);
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Sparkles className="text-primary"/>Análisis de REACTIVO</DialogTitle>
                    <DialogDescription>Asistente de IA analizando el progreso de {student?.username}.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 -mx-6 px-6">
                    <div className="py-4 space-y-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full pt-20">
                                <Bot className="h-10 w-10 text-primary animate-bounce" />
                                <p className="mt-4 text-muted-foreground animate-pulse">REACTIVO está analizando los datos...</p>
                            </div>
                        ) : analysis ? (
                            <div className="space-y-6 text-sm">
                                <div>
                                    <h3 className="font-semibold text-base mb-2">Evaluación General</h3>
                                    <p className="text-muted-foreground">{analysis.overallAssessment}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-base mb-2">Puntos Fuertes</h3>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {analysis.strengths.map((strength, i) => <li key={i}>{strength}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-base mb-2">Áreas de Oportunidad</h3>
                                     <ul className="list-disc pl-5 space-y-1">
                                        {analysis.areasForImprovement.map((area, i) => <li key={i}>{area}</li>)}
                                    </ul>
                                </div>
                                 <div>
                                    <h3 className="font-semibold text-base mb-2">Recomendaciones</h3>
                                    <div className="space-y-3">
                                    {analysis.actionableRecommendations.map((rec, i) => (
                                        <div key={i} className="p-3 border rounded-md bg-background/50">
                                            <p className="font-semibold flex items-center gap-2"><Target className="h-4 w-4 text-primary"/>{rec.recommendation}</p>
                                            <p className="text-xs text-muted-foreground pl-6">{rec.reason}</p>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                             <div className="text-center pt-20 text-muted-foreground">No se pudo generar el análisis.</div>
                        )}
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cerrar</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function AnalyzeStudentDialog({ linkedChildren }: { linkedChildren: ReturnType<typeof useMemo<any>> }) {
    const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(linkedChildren.length > 0 ? linkedChildren[0].id : undefined);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [isAnalysisChatOpen, setIsAnalysisChatOpen] = useState(false);

    const handleAnalyze = () => {
        setIsSelectorOpen(false);
        setIsAnalysisChatOpen(true);
    };
    
    const selectedStudent = useMemo(() => linkedChildren.find((c: any) => c.id === selectedStudentId), [linkedChildren, selectedStudentId]);

    return (
        <>
            <Dialog open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <Bot className="mr-2 h-4 w-4" />
                        Analizar con REACTIVO
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Analizar Progreso del Alumno</DialogTitle>
                        <DialogDescription>
                            Selecciona a uno de tus hijos para que el asistente de IA "REACTIVO" analice su rendimiento académico y conducta.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <RadioGroup value={selectedStudentId} onValueChange={setSelectedStudentId}>
                            {linkedChildren.map((child: any) => (
                                <div key={child.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent">
                                    <RadioGroupItem value={child.id} id={`r-${child.id}`} />
                                    <Label htmlFor={`r-${child.id}`} className="flex items-center gap-3 cursor-pointer">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={`https://picsum.photos/seed/${child.id}/40/40`} alt={child.username} data-ai-hint="student face" />
                                            <AvatarFallback>{getInitials(child.username)}</AvatarFallback>
                                        </Avatar>
                                        <span>{child.username}</span>
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSelectorOpen(false)}>Cancelar</Button>
                        <Button onClick={handleAnalyze} disabled={!selectedStudentId}>Analizar Alumno</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {selectedStudent && <AnalysisChatDialog student={selectedStudent} isOpen={isAnalysisChatOpen} onOpenChange={setIsAnalysisChatOpen} />}
        </>
    );
}

export default function PadreHijosPage() {
    const { currentUser, visibleUsers: users } = useContext(UserContext);

    const linkedChildren = useMemo(() => {
        if (!currentUser || !currentUser.childrenIds) return [];
        return users.filter(user => currentUser.childrenIds!.includes(user.id));
    }, [currentUser, users]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Mis Hijos</h1>
                <p className="text-muted-foreground">Gestiona y consulta la información de los alumnos que tienes vinculados a tu cuenta.</p>
            </div>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-6 w-6 text-primary" />
                            Alumnos Vinculados
                        </CardTitle>
                        <CardDescription>
                            Selecciona uno de tus hijos para ver su información detallada.
                        </CardDescription>
                    </div>
                    <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2">
                        <AnalyzeStudentDialog linkedChildren={linkedChildren} />
                        <LinkStudentDialog />
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {linkedChildren.length > 0 ? (
                        linkedChildren.map(child => (
                             <Card key={child.id} className="hover:border-primary transition-colors">
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={`https://picsum.photos/seed/${child.id}/40/40`} alt={child.username} data-ai-hint="student face" />
                                        <AvatarFallback>{getInitials(child.username)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-lg">{child.username}</CardTitle>
                                        <CardDescription>{child.group || 'Grupo no asignado'}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Link href={`/dashboard/padre/hijos/${child.id}`} passHref>
                                        <Button className="w-full">
                                            Ver Dashboard del Alumno
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </CardContent>
                             </Card>
                        ))
                    ) : (
                        <div className="md:col-span-2 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg text-center min-h-[200px]">
                            <Users className="h-8 w-8 text-muted-foreground mb-2" />
                            <h3 className="font-semibold">Aún no tienes alumnos vinculados</h3>
                            <p className="text-sm text-muted-foreground mb-3">Usa el botón "Vincular Alumno" para empezar.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

    
