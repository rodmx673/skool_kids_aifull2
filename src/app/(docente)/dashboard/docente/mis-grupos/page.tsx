
"use client";

import { useContext, useMemo } from "react";
import { UserContext, User } from "@/context/UserContext";
import { AcademicContext, Career } from "@/context/AcademicContext";
import { TeacherContext } from "@/context/TeacherContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const getInitials = (name: string) => {
    if (!name) return "??";
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

export default function MisGruposPage() {
    const { currentUser, allUsers: users } = useContext(UserContext); // CORRECCIÓN: Usar allUsers en lugar de visibleUsers
    const { distribution, careers } = useContext(AcademicContext);
    const router = useRouter();

    const assignedGroups = useMemo(() => {
        if (!currentUser || !distribution) return [];

        const teacherGroups = new Set<string>();

        Object.keys(distribution).forEach(periodKey => {
            const periodData = distribution[periodKey];
            if (Array.isArray(periodData)) {
                periodData.forEach(dist => {
                    if (dist.teacherIds) {
                        Object.keys(dist.teacherIds).forEach(groupName => {
                            if (dist.teacherIds[groupName] === currentUser.id) {
                                const [careerId, level] = periodKey.split('-');
                                teacherGroups.add(`${careerId}-${level}-${groupName}`);
                            }
                        });
                    }
                });
            }
        });
        return Array.from(teacherGroups);
    }, [currentUser, distribution]);
    
    const getGroupDetails = (groupKey: string) => {
        const [careerId, level, groupName] = groupKey.split('-');
        const career = careers.find(c => c.id === careerId);
        
        const students = users.filter(u => 
            u.role === 'alumno' &&
            u.careerId === careerId &&
            u.level === level &&
            u.group === groupName
        );

        return {
            key: groupKey,
            name: `${career?.name || careerId} ${level}°${groupName}`,
            students: students
        };
    };

    const teacherGroupDetails = useMemo(() => {
        return assignedGroups.map(getGroupDetails);
    }, [assignedGroups, users, careers]);

    const handleStartChat = (userId: string) => {
        // En una app real, esto podría abrir un modal o navegar a una página de chat con el ID del usuario
        router.push('/dashboard/docente/mensajeria');
        console.log(`Iniciando chat con ${userId}`);
    };

    if (!currentUser) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Mis Grupos</h1>
                <p className="text-muted-foreground">Gestiona y consulta la información de los alumnos en tus grupos asignados.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Listado de Grupos</CardTitle>
                    <CardDescription>Selecciona un grupo para ver la lista de alumnos.</CardDescription>
                </CardHeader>
                <CardContent>
                    {teacherGroupDetails.length > 0 ? (
                        <Tabs defaultValue={teacherGroupDetails[0].key}>
                            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {teacherGroupDetails.map(group => (
                                    <TabsTrigger key={group.key} value={group.key}>{group.name}</TabsTrigger>
                                ))}
                            </TabsList>
                            {teacherGroupDetails.map(group => (
                                <TabsContent key={group.key} value={group.key} className="mt-4">
                                    <h3 className="text-lg font-semibold mb-2">Alumnos en {group.name} ({group.students.length})</h3>
                                    <div className="border rounded-lg">
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
                                                {group.students.map(student => (
                                                    <TableRow key={student.id}>
                                                        <TableCell>
                                                            <Avatar>
                                                                <AvatarImage src={`https://picsum.photos/seed/${student.id}/40/40`} alt="Avatar" data-ai-hint="student face" />
                                                                <AvatarFallback>{getInitials(student.username)}</AvatarFallback>
                                                            </Avatar>
                                                        </TableCell>
                                                        <TableCell className="font-medium">{student.username}</TableCell>
                                                        <TableCell><Badge variant="secondary">{student.id}</Badge></TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="ghost" size="icon" onClick={() => handleStartChat(student.id)}>
                                                                <MessageSquare className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {group.students.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="h-24 text-center">
                                                            No hay alumnos registrados en este grupo.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 gap-2 text-center border-2 border-dashed rounded-lg">
                            <Users className="h-12 w-12 text-muted-foreground" />
                            <h3 className="font-semibold">No tienes grupos asignados</h3>
                            <p className="text-muted-foreground text-sm">Contacta a un administrador para que te asigne grupos.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
