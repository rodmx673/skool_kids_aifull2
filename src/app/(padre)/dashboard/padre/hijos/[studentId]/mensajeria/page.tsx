
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function StudentMirrorMensajeriaPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Mensajería (Vista de Tutor)</CardTitle>
                <CardDescription>La mensajería directa se gestiona desde su propio portal, no desde la vista del alumno.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center h-48 gap-2 text-center border-2 border-dashed rounded-lg">
                    <MessageSquare className="h-12 w-12 text-muted-foreground" />
                    <h3 className="font-semibold">Función No Disponible Aquí</h3>
                    <p className="text-muted-foreground text-sm">Para enviar un mensaje, por favor regrese a su portal y use la sección "Mensajería".</p>
                </div>
            </CardContent>
        </Card>
    );
}

