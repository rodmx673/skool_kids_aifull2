
"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Users, 
    GraduationCap, 
    Calendar, 
    CreditCard, 
    FileText, 
    Bell, 
    MessageCircle, 
    ArrowRight,
    CalendarCheck,
} from "lucide-react";

const kpiCards = [
    { title: "Padres de Familia", icon: Users, description: "Gestionar tutores y su información.", link: "/dashboard/administrativo/padres" },
    { title: "Alumnos", icon: GraduationCap, description: "Administrar perfiles y matrícula estudiantil.", link: "/dashboard/administrativo/alumnos" },
    { title: "Control de Asistencia", icon: CalendarCheck, description: "Monitorear entradas y salidas del plantel.", link: "/dashboard/administrativo/asistencias" },
    { title: "Agenda / Citas", icon: Calendar, description: "Programar y consultar citas con padres.", link: "/dashboard/administrativo/agenda" },
    { title: "Gestión de Pagos", icon: CreditCard, description: "Revisar estados de cuenta y registrar pagos.", link: "/dashboard/administrativo/pagos" },
    { title: "Gestión de Documentos", icon: FileText, description: "Administrar documentos y constancias.", link: "/dashboard/administrativo/documentos" },
    { title: "Comunicados", icon: Bell, description: "Enviar y monitorear comunicados.", link: "/dashboard/administrativo/comunicados" },
    { title: "Mensajería", icon: MessageCircle, description: "Comunicación directa con docentes y padres.", link: "/dashboard/administrativo/mensajeria" },
];

export default function AdministrativoDashboardPage() {
  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Panel del Administrativo
          </h1>
          <p className="text-muted-foreground">
            Acceso rápido a las principales herramientas de gestión.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="hover:border-primary hover:shadow-lg transition-all flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className="h-5 w-5 text-primary" />
                    {card.title}
                  </CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-end">
                  <Link href={card.link} className="w-full">
                    <Button variant="outline" className="w-full">
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
  );
}
