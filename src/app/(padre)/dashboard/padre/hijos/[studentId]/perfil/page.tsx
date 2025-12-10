

"use client";

import { useContext, useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { UserContext } from "@/context/UserContext";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { List, Mail, User, Hash, Star, Phone, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { AcademicContext } from "@/context/AcademicContext";
import { useParams } from "next/navigation";

export default function StudentMirrorPerfilPage() {
    const params = useParams();
    const studentId = params.studentId as string;
    const { visibleUsers: users } = useContext(UserContext);
    const { careers } = useContext(AcademicContext);
    const [isClient, setIsClient] = useState(false);
    
    const student = users.find(u => u.id === studentId);

    useEffect(() => {
        setIsClient(true);
    }, []);
    
    const careerName = careers.find(c => c.id === student?.careerId)?.name || student?.careerId || 'No asignada';

    const getInitials = (name: string | undefined) => {
        if (!name) return "AL";
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    
    const getQrValue = () => {
        if (!student) return "";
        const { id, username, email, curp, careerId, level, group } = student;
        return JSON.stringify({ id, username, email, curp, careerId, level, group });
    };

     if (!isClient || !student) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-background">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Cargando perfil del alumno...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="items-center text-center">
                            <Avatar className="w-24 h-24 mb-4 border-4 border-primary/20">
                                <AvatarImage src={student.profilePictureUrl || `https://picsum.photos/seed/${student.id}/100/100`} data-ai-hint="student face" />
                                <AvatarFallback className="text-3xl">{getInitials(student.username)}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-2xl">{student.username}</CardTitle>
                            <CardDescription>
                                <Badge variant="secondary" className="capitalize">{student.role}</Badge>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <Separator />
                            <div className="flex items-center gap-3 pt-2">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">ID de Alumno:</span>
                                <span className="font-mono ml-auto">{student.id}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-medium ml-auto truncate">{student.email}</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">CURP:</span>
                                <span className="font-medium ml-auto">{student.curp || 'No asignado'}</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Teléfono:</span>
                                <span className="font-medium ml-auto">{student.phone || 'No asignado'}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><GraduationCap/>Información Académica</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Carrera</p>
                                <p className="text-lg font-bold">{careerName}</p>
                            </div>
                             <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Semestre</p>
                                <p className="text-lg font-bold">{student.level ? `${student.level}°` : 'N/A'}</p>
                            </div>
                             <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Grupo</p>
                                <p className="text-lg font-bold">{student.group || 'N/A'}</p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Promedio General</p>
                                <p className="text-lg font-bold">9.2</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
