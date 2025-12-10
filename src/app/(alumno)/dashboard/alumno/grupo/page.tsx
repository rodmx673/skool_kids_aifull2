"use client";

import { useContext, useMemo } from "react";
import { UserContext, User } from "@/context/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, BookUser } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AcademicContext } from "@/context/AcademicContext";
import { TeacherContext } from "@/context/TeacherContext";

const getInitials = (name: string) => {
    if (!name) return "??";
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

export default function MiGrupoPage() {
    const { currentUser, visibleUsers: users } = useContext(UserContext);
    const { distribution } = useContext(AcademicContext);
    const { teachers } = useContext(TeacherContext);
    const router = useRouter();

    const classmates = useMemo(() => {
        if (!currentUser?.group || !currentUser?.careerId || !currentUser?.level) return [];
        return users.filter(user => 
            user.role === 'alumno' &&
            user.id !== currentUser.id &&
            user.careerId === currentUser.careerId &&
            user.level === currentUser.level &&
            user.group === currentUser.group
        );
    }, [currentUser, users]);

    const assignedTeachers = useMemo(() => {
        if (!currentUser?.group || !currentUser.level || !currentUser.careerId || !distribution) return [];

        const periodKey = `${currentUser.careerId}-${currentUser.level}`;
        const periodDistribution = distribution[periodKey];

        if (!Array.isArray(periodDistribution)) return [];

        return periodDistribution
            .map(dist => {
                const teacherId = dist.teacherIds?.[currentUser.group!];
                if (!teacherId) return null;

                const teacher = teachers.find(t => t.id === teacherId);
                return {
                    subject: dist.subjectName,
                    teacherName: teacher?.name || 'Docente no encontrado'
                };
            })
            .filter(Boolean) as { subject: string, teacherName: string }[];

    }, [currentUser, distribution, teachers]);

    const handleStartChat = (userId: string) => {
        router.push('/dashboard/alumno/mensajeria');
        console.log(`Iniciando chat con ${userId}`);
    };
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Mi Grupo</h1>
                <p className="text-muted-foreground">Consulta la lista de tus compañeros de clase y docentes.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Users />Compañeros de Clase</CardTitle>
                            <CardDescription>
                                Estos son los alumnos que están en tu mismo grupo ({currentUser?.careerId} {currentUser?.level}°{currentUser?.group}).
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
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {classmates.length > 0 ? (
                                            classmates.map(student => (
                                                <TableRow key={student.id}>
                                                    <TableCell>
                                                        <Avatar>
                                                            <AvatarImage src={student.profilePictureUrl || `https://picsum.photos/seed/${student.id}/40/40`} alt="Avatar" data-ai-hint="student face" />
                                                            <AvatarFallback>{getInitials(student.username)}</AvatarFallback>
                                                        </Avatar>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{student.username}</TableCell>
                                                    <TableCell><Badge variant="secondary">{student.id}</Badge></TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => handleStartChat(student.id)} title="Iniciar Chat">
                                                            <MessageSquare className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                             <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center">
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
                            <CardTitle className="flex items-center gap-2"><BookUser/>Mis Docentes</CardTitle>
                            <CardDescription>Docentes asignados a tus materias.</CardDescription>
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
                                                    Aún no tienes docentes asignados.
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
