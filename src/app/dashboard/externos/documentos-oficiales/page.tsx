"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

const officialDocuments = [
  {
    id: 'doc-01',
    title: "Ficha de Inscripción",
    description: "Formulario para recabar los datos completos del alumno y tutor para el proceso de inscripción.",
    link: "https://example.com/ficha-inscripcion",
  },
  {
    id: 'doc-02',
    title: "Carta Compromiso de Corresponsabilidad",
    description: "Documento donde el tutor se compromete a colaborar activamente con la institución educativa.",
    link: "https://example.com/carta-compromiso",
  },
  {
    id: 'doc-03',
    title: "Solicitud de Beca",
    description: "Formulario para solicitar apoyo económico o beca académica para el ciclo escolar vigente.",
    link: "https://example.com/solicitud-beca",
  },
  {
    id: 'doc-04',
    title: "Autorización para Salidas Escolares",
    description: "Permiso requerido para que el alumno pueda participar en excursiones y visitas fuera del plantel.",
    link: "https://example.com/autorizacion-salidas",
  },
];

export default function DocumentosOficialesPage() {
  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link href="/dashboard/externos" passHref>
               <Button variant="link" className="p-0 h-auto mb-2 text-muted-foreground">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver a Accesos
               </Button>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">
              Documentos Oficiales para Padres de Familia
            </h1>
            <p className="text-muted-foreground">
              Seleccione un documento para acceder al formulario y rellenarlo.
            </p>
          </div>
       </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {officialDocuments.map((doc) => (
                <Card key={doc.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                           <FileText className="h-6 w-6 text-primary" />
                           <CardTitle>{doc.title}</CardTitle>
                        </div>
                        <CardDescription>{doc.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-end">
                       <a href={doc.link} target="_blank" rel="noopener noreferrer" className="w-full">
                           <Button variant="outline" className="w-full">
                               Ir al Documento
                               <ArrowRight className="ml-2 h-4 w-4" />
                           </Button>
                       </a>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );
}
