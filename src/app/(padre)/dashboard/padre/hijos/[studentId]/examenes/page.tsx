"use client";

import { useContext, useMemo } from "react";
import { useParams } from "next/navigation";
import { UserContext } from "@/context/UserContext";
import { TaskContext, Task } from "@/context/TaskContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle, Clock } from "lucide-react";

export default function StudentMirrorExamenesPage() {
    const params = useParams();
    const studentId = params.studentId as string;
    const { users } = useContext(UserContext);
    const { getTasksForStudent } = useContext(TaskContext);

    const student = useMemo(() => users.find(u => u.id === studentId), [users, studentId]);

    const studentExams = useMemo(() => {
        if (!student || !student.group) return [];
        return getTasksForStudent(student.id, student.group)
            .filter(task => task.type === 'exam')
            .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
    }, [student, getTasksForStudent]);

    const getSubmissionStatus = (task: Task) => {
        const submission = task.submissions.find(s => s.studentId === student?.id);
        if (!submission) return 'Pendiente';
        if (submission.grade !== undefined) return 'Calificado';
        return 'Entregado';
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Listado de Exámenes</CardTitle>
                    <CardDescription>Fechas, estados y calificaciones de los exámenes.</CardDescription>
                </CardHeader>
                <CardContent>
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
                                    const submission = exam.submissions.find(s => s.studentId === student?.id);
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
                                        No hay exámenes registrados para este alumno.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}