
"use client";

import { useContext, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Award, Medal, ShieldCheck, ShieldAlert } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { UserContext } from "@/context/UserContext";
import { ConductContext } from "@/context/ConductContext";

export default function AlumnoConductaPage() {
    const { currentUser } = useContext(UserContext);
    const { getConductForStudent } = useContext(ConductContext);

    const { reports: conductReports, achievements } = useMemo(() => {
        if (!currentUser) return { reports: [], achievements: [] };
        return getConductForStudent(currentUser.id);
    }, [currentUser, getConductForStudent]);

    const { totalPoints, positiveReports, negativeReports } = useMemo(() => {
        const totalPoints = conductReports.reduce((acc, report) => acc + report.points, 100);
        const positiveReports = conductReports.filter(r => r.type === 'positivo').length;
        const negativeReports = conductReports.filter(r => r.type === 'negativo').length;
        return { totalPoints, positiveReports, negativeReports };
    }, [conductReports]);
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Mi Conducta y Logros</h1>
                <p className="text-muted-foreground">Consulta tu historial de comportamiento y los reconocimientos obtenidos.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Reportes de Conducta</CardTitle>
                            <CardDescription>Aquí se muestran las anotaciones de tus docentes sobre tu comportamiento.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Descripción del Reporte</TableHead>
                                            <TableHead className="text-right">Tipo</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {conductReports.length > 0 ? (
                                            conductReports.map(report => (
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
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                                    No tienes reportes de conducta.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
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
                    <CardTitle className="flex items-center gap-2"><Award />Mis Logros y Reconocimientos</CardTitle>
                    <CardDescription>Aquí se listan los premios e insignias que has ganado por tu buen desempeño.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {achievements.length > 0 ? (
                        achievements.map(ach => (
                            <div key={ach.id} className="p-4 border rounded-lg bg-yellow-50 border-yellow-200 flex items-start gap-4">
                                <Medal className="h-8 w-8 text-yellow-600 mt-1 shrink-0"/>
                                <div>
                                    <h3 className="font-semibold text-yellow-800">{ach.title}</h3>
                                    <p className="text-sm text-yellow-700/80">{ach.description}</p>
                                </div>
                            </div>
                        ))
                     ) : (
                        <div className="col-span-full text-center py-10 text-muted-foreground">
                            Aún no has ganado ningún reconocimiento.
                        </div>
                     )}
                </CardContent>
            </Card>
        </div>
    );
}
