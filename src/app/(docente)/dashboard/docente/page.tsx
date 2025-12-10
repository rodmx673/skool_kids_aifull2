"use client";

import { useContext, useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserContext } from "@/context/UserContext";
import { Users, ClipboardList, BookCheck, FileSignature, MessageSquare, ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const kpiCards = [
    { title: "Mis Grupos", icon: Users, description: "Gestiona tus alumnos y el progreso del grupo.", link: "/dashboard/docente/mis-grupos" },
    { title: "Tareas y Exámenes", icon: BookCheck, description: "Asigna y califica actividades.", link: "/dashboard/docente/tareas" },
    { title: "Calificaciones", icon: ClipboardList, description: "Registra y consulta calificaciones.", link: "/dashboard/docente/calificaciones" },
    { title: "Circulares", icon: FileSignature, description: "Revisa y firma documentos oficiales.", link: "/dashboard/docente/circulares", highlight: true },
    { title: "Mi Horario", icon: Calendar, description: "Consulta tus clases y horarios.", link: "/dashboard/docente/horarios" },
    { title: "Mensajería", icon: MessageSquare, description: "Comunícate con la administración.", link: "/dashboard/docente/mensajeria" },
];


export default function DocenteDashboardPage() {
  const { currentUser } = useContext(UserContext);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getQrValue = () => {
    if (!currentUser) return "";
    const { id, username, email } = currentUser;
    return JSON.stringify({ id, username, email });
  };

  if (!isClient || !currentUser) {
    return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Cargando datos del docente...</p>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bienvenido, {currentUser.username.split(" ")[0]}</h1>
          <p className="text-muted-foreground">Este es tu portal central. Desde aquí puedes acceder a tus grupos, tareas y calificaciones.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
             <Card className="lg:col-span-1 xl:col-span-1">
                <CardHeader>
                <CardTitle>Credencial Digital</CardTitle>
                <CardDescription>Usa este código QR para registrar tu asistencia en la institución.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center gap-4">
                <div className="bg-white p-4 rounded-md border">
                    <QRCode value={getQrValue()} size={128} />
                </div>
                <div className="text-center">
                    <p className="font-semibold">{currentUser.username}</p>
                    <p className="text-sm text-muted-foreground">{currentUser.id}</p>
                </div>
                </CardContent>
            </Card>

            <div className="lg:col-span-1 xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {kpiCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Card key={card.title} className={`hover:border-primary hover:shadow-lg transition-all flex flex-col ${card.highlight ? 'bg-primary text-primary-foreground' : ''}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Icon className={`h-5 w-5 ${card.highlight ? 'text-primary-foreground/80' : 'text-primary'}`} />
                        {card.title}
                      </CardTitle>
                      <CardDescription className={card.highlight ? 'text-primary-foreground/80' : ''}>{card.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-end">
                      <Link href={card.link} className="w-full">
                        <Button variant={card.highlight ? 'secondary': 'outline'} className="w-full">
                          Ir a la sección
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
        </div>
      </div>
  );
}
