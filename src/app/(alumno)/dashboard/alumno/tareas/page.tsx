"use client";

import { useContext, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskContext, Task, Submission } from "@/context/TaskContext";
import { UserContext } from "@/context/UserContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { FileUp, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AlumnoTareasPage() {
    const { currentUser } = useContext(UserContext);
    const { getTasksForStudent, submitTask } = useContext(TaskContext);
    const { toast } = useToast();

    const studentTasks = useMemo(() => {
        if (!currentUser || !currentUser.group) return [];
        return getTasksForStudent(currentUser.id, currentUser.group);
    }, [currentUser, getTasksForStudent]);

    const getSubmissionStatus = (task: Task): { status: 'Pendiente' | 'Entregada' | 'Calificada', submission?: Submission } => {
        const submission = task.submissions.find(s => s.studentId === currentUser?.id);
        if (!submission) {
            return { status: 'Pendiente' };
        }
        if (submission.grade !== undefined) {
            return { status: 'Calificada', submission };
        }
        return { status: 'Entregada', submission };
    };

    const pendingTasks = studentTasks.filter(task => getSubmissionStatus(task).status === 'Pendiente' && new Date(task.dueDate) >= new Date());
    const submittedOrPastTasks = studentTasks.filter(task => getSubmissionStatus(task).status !== 'Pendiente' || new Date(task.dueDate) < new Date());

    const handleSumbit = (taskId: string) => {
        if (!currentUser) return;
        submitTask(taskId, currentUser.id);
        toast({
            title: "¡Tarea Entregada!",
            description: "Tu tarea ha sido marcada como entregada.",
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Mis Tareas y Exámenes</h1>
                <p className="text-muted-foreground">Consulta tus actividades pendientes y entregadas.</p>
            </div>
            <Tabs defaultValue="pendientes">
                <TabsList>
                    <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
                    <TabsTrigger value="historial">Historial</TabsTrigger>
                </TabsList>
                <TabsContent value="pendientes">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tareas y Exámenes Pendientes</CardTitle>
                            <CardDescription>Estas son las actividades que necesitas completar.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Materia</TableHead>
                                        <TableHead>Título</TableHead>
                                        <TableHead>Fecha de Entrega</TableHead>
                                        <TableHead className="text-right">Acción</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingTasks.length > 0 ? (
                                        pendingTasks.map(task => (
                                            <TableRow key={task.id}>
                                                <TableCell><Badge variant="outline">{task.subject}</Badge></TableCell>
                                                <TableCell className="font-medium">{task.title}</TableCell>
                                                <TableCell>{format(new Date(task.dueDate), "dd MMM, yyyy", { locale: es })}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button size="sm" onClick={() => handleSumbit(task.id)}>
                                                        <FileUp className="mr-2 h-4 w-4" />
                                                        Entregar
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                ¡Felicidades! No tienes tareas pendientes.
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
                            <CardDescription>Aquí puedes ver tus entregas pasadas y actividades ya calificadas.</CardDescription>
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
                                                No hay actividades en tu historial.
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
