
"use client";

import { useContext, useMemo } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Award, Medal, ShieldCheck, ShieldAlert } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ConductContext } from "@/context/ConductContext";

export default function StudentMirrorConductaPage() {
    const params = useParams();
    const studentId = params.studentId as string;
    const { getConductForStudent } = useContext(ConductContext);

    const { reports: conductReports, achievements } = useMemo(() => {
        if (!studentId) return { reports: [], achievements: [] };
        return getConductForStudent(studentId);
    }, [studentId, getConductForStudent]);
    
    const { totalPoints, positiveReports, negativeReports } = useMemo(() => {
        const totalPoints = conductReports.reduce((acc, report) => acc + report.points, 100);
        const positiveReports = conductReports.filter(r => r.type === 'positivo').length;
        const negativeReports = conductReports.filter(r => r.type === 'negativo').length;
        return { totalPoints, positiveReports, negativeReports };
    }, [conductReports]);
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Reportes de Conducta</CardTitle>
                            <CardDescription>Anotaciones de los docentes sobre el comportamiento del alumno.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Descripción del Reporte</TableHead>
                                        <TableHead className="text-right">Tipo</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {conductReports.map(report => (
                                        <TableRow key={report.id}>
                                            <TableCell>{new Date(report.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}</TableCell>
                                            <TableCell className="font-medium">{report.report}</TableCell>
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
                </div>
                 <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Estado General</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium">Puntaje de Conducta</span>
                                    <span className="font-bold">{totalPoints} / 100</span>
                                </div>
                                <Progress value={totalPoints} />
                            </div>
                             <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Reportes Positivos</p>
                                <p className="text-2xl font-bold text-green-600">{positiveReports}</p>
                            </div>
                             <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Reportes Negativos</p>
                                <p className="text-2xl font-bold text-red-600">{negativeReports}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Award />Logros y Reconocimientos</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {achievements.map(ach => (
                        <div key={ach.id} className="p-4 border rounded-lg bg-yellow-50 border-yellow-200 flex items-start gap-4">
                            <Medal className="h-8 w-8 text-yellow-600 mt-1 shrink-0"/>
                            <div>
                                <h3 className="font-semibold text-yellow-800">{ach.title}</h3>
                                <p className="text-sm text-yellow-700/80">{ach.description}</p>
                            </div>
                        </div>
                    ))}
                     {achievements.length === 0 && (
                        <div className="col-span-full text-center py-10 text-muted-foreground">
                            Este alumno aún no tiene logros o reconocimientos.
                        </div>
                     )}
                </CardContent>
            </Card>
        </div>
    );
}
