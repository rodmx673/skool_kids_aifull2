
"use client";

import { useContext, useState, useEffect, useRef } from "react";
import QRCode from "react-qr-code";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { UserContext } from "@/context/UserContext";
import { TeacherContext } from "@/context/TeacherContext";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { List, Mail, User, Hash, Star, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DocentePerfilPage() {
    const { currentUser } = useContext(UserContext);
    const { teachers } = useContext(TeacherContext);
    const [isClient, setIsClient] = useState(false);
    const qrCodeRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const teacherDetails = teachers.find(t => t.id === currentUser?.id);

    const getInitials = (name: string | undefined) => {
        if (!name) return "DO";
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    
    const getQrValue = () => {
        if (!currentUser || !teacherDetails) return "";
        const { id, username, email } = currentUser;
        const { rfc, curp } = teacherDetails;
        return JSON.stringify({ id, username, email, rfc, curp });
    };

    const handleDownload = () => {
        const svg = qrCodeRef.current?.querySelector('svg');
        if (!svg || !currentUser) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL("image/png");

            const downloadLink = document.createElement("a");
            downloadLink.download = `credencial-qr-${currentUser.id}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
            toast({ title: "QR Descargado", description: "La imagen de la credencial se ha guardado." });
        };
        
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

     if (!isClient || !currentUser || !teacherDetails) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-background">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Cargando perfil del docente...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
                <p className="text-muted-foreground">Tu información personal, académica y credencial digital.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna Izquierda - Perfil y QR */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="items-center text-center">
                            <Avatar className="w-24 h-24 mb-4 border-4 border-primary/20">
                                <AvatarImage src={currentUser.profilePictureUrl || `https://picsum.photos/seed/${currentUser.id}/100/100`} data-ai-hint="teacher face" />
                                <AvatarFallback className="text-3xl">{getInitials(currentUser.username)}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-2xl">{currentUser.username}</CardTitle>
                            <CardDescription>
                                <Badge variant="secondary">DOCENTE</Badge>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <Separator />
                            <div className="flex items-center gap-3 pt-2">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">ID de Docente:</span>
                                <span className="font-medium ml-auto">{currentUser.id}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-medium ml-auto">{currentUser.email}</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">RFC:</span>
                                <span className="font-medium ml-auto">{teacherDetails.rfc || 'No asignado'}</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">CURP:</span>
                                <span className="font-medium ml-auto">{teacherDetails.curp || 'No asignado'}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Link href="/dashboard/docente/settings" passHref className="w-full">
                                <Button variant="outline" className="w-full">Editar Perfil y Configuración</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Credencial Digital</CardTitle>
                            <CardDescription>Usa este QR para identificarte.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center">
                             <div className="bg-white p-4 rounded-md border" ref={qrCodeRef}>
                                <QRCode value={getQrValue()} size={160} />
                            </div>
                        </CardContent>
                         <CardFooter>
                            <Button variant="secondary" className="w-full" onClick={handleDownload}>
                                <Printer className="mr-2 h-4 w-4" />
                                Imprimir / Descargar
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
                {/* Columna Derecha - Info Académica */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumen Académico</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                                <Star className="h-8 w-8 text-primary mb-2" />
                                <p className="text-3xl font-bold">{teacherDetails.maxHours}</p>
                                <p className="text-sm text-muted-foreground">Horas Máximas/Semana</p>
                            </div>
                             <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                                <Star className="h-8 w-8 text-primary mb-2" />
                                <p className="text-3xl font-bold">{teacherDetails.qualifiedSubjects.length}</p>
                                <p className="text-sm text-muted-foreground">Asignaturas Calificadas</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Asignaturas Calificadas</CardTitle>
                            <CardDescription>Materias para las cuales estás calificado para impartir.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {teacherDetails.qualifiedSubjects.length > 0 ? (
                                <ul className="space-y-3">
                                    {teacherDetails.qualifiedSubjects.map(subject => (
                                        <li key={subject} className="flex items-center p-3 bg-muted/50 rounded-md">
                                            <List className="h-4 w-4 mr-3 text-primary" />
                                            <span className="font-medium">{subject}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">No tienes asignaturas calificadas. Solicita la asignación en administración.</p>
                            )}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Puestos Adicionales</CardTitle>
                            <CardDescription>Otros roles y responsabilidades dentro de la institución.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {teacherDetails.puestosAdicionales && teacherDetails.puestosAdicionales.length > 0 ? (
                                <ul className="space-y-3">
                                    {teacherDetails.puestosAdicionales.map((puesto, i) => (
                                        <li key={i} className="flex items-center p-3 bg-muted/50 rounded-md">
                                            <Star className="h-4 w-4 mr-3 text-amber-500" />
                                            <span className="font-medium">{puesto}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">No tienes puestos adicionales asignados.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
