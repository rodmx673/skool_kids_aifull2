
"use client";

import { useContext, useMemo } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TaskContext, Task, Submission } from "@/context/TaskContext";
import { UserContext } from "@/context/UserContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle, Clock } from "lucide-react";

export default function StudentMirrorTareasPage() {
    const params = useParams();
    const studentId = params.studentId as string;
    const { visibleUsers: users } = useContext(UserContext);
    const { getTasksForStudent } = useContext(TaskContext);

    const student = useMemo(() => users.find(u => u.id === studentId), [users, studentId]);

    const studentTasks = useMemo(() => {
        if (!student || !student.group) return [];
        return getTasksForStudent(student.id, student.group);
    }, [student, getTasksForStudent]);

    const getSubmissionStatus = (task: Task): { status: 'Pendiente' | 'Entregada' | 'Calificada', submission?: Submission } => {
        const submission = task.submissions.find(s => s.studentId === student?.id);
        if (!submission) return { status: 'Pendiente' };
        if (submission.grade !== undefined) return { status: 'Calificada', submission };
        return { status: 'Entregada', submission };
    };

    const pendingTasks = studentTasks.filter(task => getSubmissionStatus(task).status === 'Pendiente' && new Date(task.dueDate) >= new Date());
    const submittedOrPastTasks = studentTasks.filter(task => getSubmissionStatus(task).status !== 'Pendiente' || new Date(task.dueDate) < new Date());

    return (
        <div className="space-y-6">
            <Tabs defaultValue="pendientes">
                <TabsList>
                    <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
                    <TabsTrigger value="historial">Historial</TabsTrigger>
                </TabsList>
                <TabsContent value="pendientes">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tareas y Exámenes Pendientes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Materia</TableHead>
                                        <TableHead>Título</TableHead>
                                        <TableHead>Fecha de Entrega</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingTasks.length > 0 ? (
                                        pendingTasks.map(task => (
                                            <TableRow key={task.id}>
                                                <TableCell><Badge variant="outline">{task.subject}</Badge></TableCell>
                                                <TableCell className="font-medium">{task.title}</TableCell>
                                                <TableCell>{format(new Date(task.dueDate), "dd MMM, yyyy", { locale: es })}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-24 text-center">
                                                ¡Felicidades! No hay tareas pendientes.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="historial">
                     <Card>
                        <CardHeader>
                            <CardTitle>Historial de Actividades</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Materia</TableHead>
                                        <TableHead>Título</TableHead>
                                        <TableHead>Fecha de Entrega</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Calificación</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {submittedOrPastTasks.length > 0 ? (
                                        submittedOrPastTasks.map(task => {
                                            const { status, submission } = getSubmissionStatus(task);
                                            return (
                                                <TableRow key={task.id}>
                                                    <TableCell><Badge variant="outline">{task.subject}</Badge></TableCell>
                                                    <TableCell className="font-medium">{task.title}</TableCell>
                                                    <TableCell>{format(new Date(task.dueDate), "dd MMM, yyyy", { locale: es })}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={status === 'Calificada' ? 'default' : (status === 'Entregada' ? 'secondary' : 'destructive')}>
                                                            {status === 'Entregada' && <CheckCircle className="mr-1 h-3 w-3" />}
                                                            {status === 'Pendiente' && <Clock className="mr-1 h-3 w-3" />}
                                                            {status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold">
                                                        {submission?.grade !== undefined ? submission.grade : 'N/A'}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                No hay actividades en el historial.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
