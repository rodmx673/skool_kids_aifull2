
"use client";

import { useContext, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TaskContext, Task } from "@/context/TaskContext";
import { UserContext } from "@/context/UserContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle, Clock } from "lucide-react";

export default function AlumnoExamenesPage() {
    const { currentUser } = useContext(UserContext);
    const { getTasksForStudent } = useContext(TaskContext);

    const studentExams = useMemo(() => {
        if (!currentUser || !currentUser.group) return [];
        return getTasksForStudent(currentUser.id, currentUser.group)
            .filter(task => task.type === 'exam')
            .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
    }, [currentUser, getTasksForStudent]);

    const getSubmissionStatus = (task: Task) => {
        const submission = task.submissions.find(s => s.studentId === currentUser?.id);
        if (!submission) return 'Pendiente';
        if (submission.grade !== undefined) return 'Calificado';
        return 'Entregado';
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Mis Exámenes</h1>
                <p className="text-muted-foreground">Consulta las fechas, estados y calificaciones de tus exámenes.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Listado de Exámenes</CardTitle>
                    <CardDescription>Aquí puedes ver tus próximos exámenes y el historial de los ya presentados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Materia</TableHead>
                                    <TableHead>Título del Examen</TableHead>
                                    <TableHead>Fecha de Aplicación</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Calificación</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {studentExams.length > 0 ? (
                                    studentExams.map(exam => {
                                        const status = getSubmissionStatus(exam);
                                        const submission = exam.submissions.find(s => s.studentId === currentUser?.id);
                                        return (
                                            <TableRow key={exam.id}>
                                                <TableCell><Badge variant="outline">{exam.subject}</Badge></TableCell>
                                                <TableCell className="font-medium">{exam.title}</TableCell>
                                                <TableCell>{format(new Date(exam.dueDate), "dd MMM, yyyy", { locale: es })}</TableCell>
                                                <TableCell>
                                                    <Badge variant={status === 'Calificado' ? 'default' : (status === 'Entregado' ? 'secondary' : 'destructive')}>
                                                        {status === 'Entregado' && <CheckCircle className="mr-1 h-3 w-3" />}
                                                        {status === 'Pendiente' && <Clock className="mr-1 h-3 w-3" />}
                                                        {status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-semibold text-lg">
                                                    {submission?.grade !== undefined ? submission.grade : 'N/A'}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No tienes exámenes registrados por el momento.
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
