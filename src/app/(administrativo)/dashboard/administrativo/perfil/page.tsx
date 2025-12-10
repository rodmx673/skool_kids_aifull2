
"use client";

import { useContext, useState, useEffect, useRef } from "react";
import QRCode from "react-qr-code";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { UserContext } from "@/context/UserContext";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { List, Mail, User, Hash, Star, Phone, GraduationCap, Copy, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { AcademicContext } from "@/context/AcademicContext";
import { useToast } from "@/hooks/use-toast";

export default function AlumnoPerfilPage() {
    const { currentUser } = useContext(UserContext);
    const { careers } = useContext(AcademicContext);
    const [isClient, setIsClient] = useState(false);
    const { toast } = useToast();
    const qrCodeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);
    
    const careerName = careers.find(c => c.id === currentUser?.careerId)?.name || currentUser?.careerId || 'No asignada';

    const getInitials = (name: string | undefined) => {
        if (!name) return "AL";
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    
    const getQrValue = () => {
        if (!currentUser) return "";
        const { id, username, email, curp, careerId, level, group } = currentUser;
        return JSON.stringify({ id, username, email, curp, careerId, level, group });
    };

    const handleCopyId = () => {
        if (!currentUser) return;
        navigator.clipboard.writeText(currentUser.id);
        toast({
            title: "ID Copiado",
            description: "El ID de inquilino del administrador ha sido copiado al portapapeles."
        });
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

     if (!isClient || !currentUser) {
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
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
                <p className="text-muted-foreground">Tu información personal, académica y credencial digital.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="items-center text-center">
                            <Avatar className="w-24 h-24 mb-4 border-4 border-primary/20">
                                <AvatarImage src={currentUser.profilePictureUrl || `https://picsum.photos/seed/${currentUser.id}/100/100`} data-ai-hint="student face" />
                                <AvatarFallback className="text-3xl">{getInitials(currentUser.username)}</AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-2xl">{currentUser.username}</CardTitle>
                            <CardDescription>
                                <Badge variant="secondary" className="capitalize">{currentUser.role}</Badge>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <Separator />
                            <div className="flex items-center gap-3 pt-2">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">ID de Usuario:</span>
                                <span className="font-mono ml-auto">{currentUser.id}</span>
                            </div>
                            {currentUser.role === 'administrador' && (
                                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                    <div className="flex-1 space-y-1">
                                        <p className="text-xs font-semibold">ID de Inquilino</p>
                                        <p className="font-mono text-xs">{currentUser.id}</p>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCopyId}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-medium ml-auto truncate">{currentUser.email}</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">CURP:</span>
                                <span className="font-medium ml-auto">{currentUser.curp || 'No asignado'}</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Teléfono:</span>
                                <span className="font-medium ml-auto">{currentUser.phone || 'No asignado'}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Link href="/dashboard/alumno/settings" passHref className="w-full">
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
                                <p className="text-lg font-bold">{currentUser.level ? `${currentUser.level}°` : 'N/A'}</p>
                            </div>
                             <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Grupo</p>
                                <p className="text-lg font-bold">{currentUser.group || 'N/A'}</p>
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
