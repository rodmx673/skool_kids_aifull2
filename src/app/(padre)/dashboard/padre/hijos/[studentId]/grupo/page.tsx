

"use client";

import { useContext, useMemo } from "react";
import { UserContext, User } from "@/context/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, BookUser } from "lucide-react";
import { AcademicContext } from "@/context/AcademicContext";
import { TeacherContext } from "@/context/TeacherContext";
import { useParams } from "next/navigation";

const getInitials = (name: string) => {
    if (!name) return "??";
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

export default function StudentMirrorGrupoPage() {
    const params = useParams();
    const studentId = params.studentId as string;
    const { visibleUsers: users } = useContext(UserContext);
    const { distribution } = useContext(AcademicContext);
    const { teachers } = useContext(TeacherContext);
    
    const student = useMemo(() => users.find(u => u.id === studentId), [users, studentId]);

    const classmates = useMemo(() => {
        if (!student?.group || !student?.careerId || !student?.level) return [];
        return users.filter(user => 
            user.role === 'alumno' &&
            user.id !== student.id &&
            user.careerId === student.careerId &&
            user.level === student.level &&
            user.group === student.group
        );
    }, [student, users]);

    const assignedTeachers = useMemo(() => {
        if (!student?.group || !student.level || !student.careerId || !distribution) return [];

        const periodKey = `${student.careerId}-${student.level}`;
        const periodDistribution = distribution[periodKey];

        if (!Array.isArray(periodDistribution)) return [];

        return periodDistribution
            .map(dist => {
                const teacherId = dist.teacherIds?.[student.group!];
                if (!teacherId) return null;

                const teacher = teachers.find(t => t.id === teacherId);
                return {
                    subject: dist.subjectName,
                    teacherName: teacher?.name || 'Docente no encontrado'
                };
            })
            .filter(Boolean) as { subject: string, teacherName: string }[];

    }, [student, distribution, teachers]);
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Users />Compañeros de Clase</CardTitle>
                            <CardDescription>
                                Alumnos en el mismo grupo ({student?.careerId} {student?.level}°{student?.group}).
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">Avatar</TableHead>
                                            <TableHead>Nombre del Alumno</TableHead>
                                            <TableHead>ID</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {classmates.length > 0 ? (
                                            classmates.map(classmate => (
                                                <TableRow key={classmate.id}>
                                                    <TableCell>
                                                        <Avatar>
                                                            <AvatarImage src={classmate.profilePictureUrl || `https://picsum.photos/seed/${classmate.id}/40/40`} alt="Avatar" data-ai-hint="student face" />
                                                            <AvatarFallback>{getInitials(classmate.username)}</AvatarFallback>
                                                        </Avatar>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{classmate.username}</TableCell>
                                                    <TableCell><Badge variant="secondary">{classmate.id}</Badge></TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                             <TableRow>
                                                <TableCell colSpan={3} className="h-24 text-center">
                                                    No hay otros alumnos registrados en este grupo.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BookUser/>Docentes del Alumno</CardTitle>
                            <CardDescription>Docentes asignados a sus materias.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Asignatura</TableHead>
                                            <TableHead>Docente</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {assignedTeachers.length > 0 ? (
                                            assignedTeachers.map(({ subject, teacherName }) => (
                                                <TableRow key={subject}>
                                                    <TableCell className="font-medium">{subject}</TableCell>
                                                    <TableCell>{teacherName}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={2} className="h-24 text-center">
                                                    El alumno no tiene docentes asignados.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
