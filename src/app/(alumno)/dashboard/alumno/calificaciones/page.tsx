"use client";

import { useContext, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TaskContext, Task, Submission } from "@/context/TaskContext";
import { UserContext } from "@/context/UserContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  calificacion: {
    label: "Calificación",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;


export default function AlumnoCalificacionesPage() {
    const { currentUser } = useContext(UserContext);
    const { getTasksForStudent } = useContext(TaskContext);

    const gradedSubmissions = useMemo(() => {
        if (!currentUser || !currentUser.group) return [];
        const studentTasks = getTasksForStudent(currentUser.id, currentUser.group);
        const submissions: (Submission & { taskTitle: string, subject: string })[] = [];

        studentTasks.forEach(task => {
            task.submissions.forEach(sub => {
                if (sub.studentId === currentUser.id && sub.grade !== undefined) {
                    submissions.push({
                        ...sub,
                        taskTitle: task.title,
                        subject: task.subject,
                    });
                }
            });
        });

        return submissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }, [currentUser, getTasksForStudent]);

    const averageGrade = useMemo(() => {
        if (gradedSubmissions.length === 0) return 0;
        const total = gradedSubmissions.reduce((acc, sub) => acc + (sub.grade || 0), 0);
        return (total / gradedSubmissions.length).toFixed(1);
    }, [gradedSubmissions]);

    const chartData = useMemo(() => {
        const dataBySubject: { [key: string]: { total: number, count: number } } = {};
        gradedSubmissions.forEach(sub => {
            if (!dataBySubject[sub.subject]) {
                dataBySubject[sub.subject] = { total: 0, count: 0 };
            }
            dataBySubject[sub.subject].total += sub.grade || 0;
            dataBySubject[sub.subject].count++;
        });

        return Object.entries(dataBySubject).map(([subject, data]) => ({
            materia: subject,
            calificacion: parseFloat((data.total / data.count).toFixed(1)),
        }));

    }, [gradedSubmissions]);


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Mis Calificaciones</h1>
                <p className="text-muted-foreground">Consulta el historial de tus calificaciones y tu rendimiento académico.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Promedio por Materia</CardTitle>
                        <CardDescription>Visualiza tu calificación promedio en cada una de tus materias.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {chartData.length > 0 ? (
                             <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="materia" tickLine={false} axisLine={false} tickMargin={8} angle={-10} textAnchor="end" height={50} interval={0} />
                                    <YAxis domain={[0, 10]} />
                                    <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                    <Bar dataKey="calificacion" fill="var(--color-calificacion)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        ) : (
                             <div className="flex h-[300px] items-center justify-center text-center text-muted-foreground">
                                No hay suficientes datos para mostrar el gráfico.
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="items-center text-center">
                        <CardDescription>Promedio General</CardDescription>
                        <CardTitle className="text-7xl font-bold">{averageGrade}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground text-center">
                            Este promedio se calcula con base en {gradedSubmissions.length} actividades calificadas.
                        </p>
                    </CardContent>
                </Card>
            </div>


            <Card>
                <CardHeader>
                    <CardTitle>Historial de Calificaciones</CardTitle>
                    <CardDescription>Aquí se muestran todas las actividades que han sido calificadas por tus docentes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Materia</TableHead>
                                    <TableHead>Tarea / Examen</TableHead>
                                    <TableHead>Fecha de Entrega</TableHead>
                                    <TableHead className="text-right">Calificación</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {gradedSubmissions.length > 0 ? (
                                    gradedSubmissions.map(sub => (
                                        <TableRow key={`${sub.taskTitle}-${sub.submittedAt}`}>
                                            <TableCell><Badge variant="outline">{sub.subject}</Badge></TableCell>
                                            <TableCell className="font-medium">{sub.taskTitle}</TableCell>
                                            <TableCell>{new Date(sub.submittedAt).toLocaleDateString('es-MX')}</TableCell>
                                            <TableCell className="text-right font-bold text-lg">{sub.grade}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            Aún no tienes actividades calificadas.
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
