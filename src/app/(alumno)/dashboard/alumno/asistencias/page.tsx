
"use client";

import { useContext, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AttendanceContext, AttendanceRecord } from "@/context/AttendanceContext";
import { UserContext } from "@/context/UserContext";
import { Progress } from "@/components/ui/progress";
import { CalendarCheck, UserCheck, UserX, Clock, Hand } from "lucide-react";
import { cn } from "@/lib/utils";

const getStatusInfo = (status: string) => {
    switch (status) {
        case 'presente':
            return { Icon: UserCheck, color: "text-green-600", label: "Presente" };
        case 'ausente':
            return { Icon: UserX, color: "text-red-600", label: "Ausente" };
        case 'retardo':
            return { Icon: Clock, color: "text-yellow-600", label: "Retardo" };
        case 'justificado':
            return { Icon: Hand, color: "text-blue-600", label: "Justificado" };
        default:
            return { Icon: UserCheck, color: "", label: "N/A" };
    }
};

export default function AlumnoAsistenciasPage() {
    const { currentUser } = useContext(UserContext);
    const { getAttendanceForStudent } = useContext(AttendanceContext);

    const studentRecords = useMemo(() => {
        if (!currentUser) return [];
        return getAttendanceForStudent(currentUser.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [currentUser, getAttendanceForStudent]);

    const attendanceStats = useMemo(() => {
        const total = studentRecords.length;
        if (total === 0) return { total: 0, present: 0, absent: 0, late: 0, justified: 0, percentage: 0 };

        const presentCount = studentRecords.filter(r => r.status === 'presente' || r.status === 'justificado').length;
        const absentCount = studentRecords.filter(r => r.status === 'ausente').length;
        const lateCount = studentRecords.filter(r => r.status === 'retardo').length;
        const justifiedCount = studentRecords.filter(r => r.status === 'justificado').length;
        
        const effectiveTotal = total - justifiedCount; // Justified absences might not count against percentage
        const percentage = effectiveTotal > 0 ? (presentCount / effectiveTotal) * 100 : 100;

        return {
            total,
            present: presentCount,
            absent: absentCount,
            late: lateCount,
            justified: justifiedCount,
            percentage: Math.round(percentage),
        };
    }, [studentRecords]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Mis Asistencias</h1>
                <p className="text-muted-foreground">Consulta tu historial de asistencias a clases.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Resumen de Asistencia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Porcentaje General de Asistencia</span>
                            <span className="text-lg font-bold">{attendanceStats.percentage}%</span>
                        </div>
                        <Progress value={attendanceStats.percentage} />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold">{attendanceStats.present}</p>
                            <p className="text-sm text-muted-foreground">Presente</p>
                        </div>
                         <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold">{attendanceStats.absent}</p>
                            <p className="text-sm text-muted-foreground">Ausente</p>
                        </div>
                         <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold">{attendanceStats.late}</p>
                            <p className="text-sm text-muted-foreground">Retardos</p>
                        </div>
                         <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold">{attendanceStats.justified}</p>
                            <p className="text-sm text-muted-foreground">Justificado</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Historial de Asistencias</CardTitle>
                    <CardDescription>Aquí se muestran todos los registros de asistencia tomados por tus docentes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Materia</TableHead>
                                    <TableHead className="text-right">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {studentRecords.length > 0 ? (
                                    studentRecords.map((record, index) => {
                                        const { Icon, color, label } = getStatusInfo(record.status);
                                        return (
                                            <TableRow key={`${record.date}-${record.subject}-${index}`}>
                                                <TableCell>{new Date(record.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</TableCell>
                                                <TableCell><Badge variant="outline">{record.subject}</Badge></TableCell>
                                                <TableCell className={cn("text-right font-medium flex items-center justify-end gap-2", color)}>
                                                    <Icon className="h-4 w-4" />
                                                    {label}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            Aún no tienes registros de asistencia.
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
