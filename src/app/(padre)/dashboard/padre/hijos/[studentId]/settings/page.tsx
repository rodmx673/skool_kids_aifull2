
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function StudentMirrorSettingsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Configuración (Vista de Tutor)</CardTitle>
                <CardDescription>La configuración de la cuenta del alumno solo puede ser modificada por el propio alumno desde su portal.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center h-48 gap-2 text-center border-2 border-dashed rounded-lg">
                    <Settings className="h-12 w-12 text-muted-foreground" />
                    <h3 className="font-semibold">Vista de Solo Lectura</h3>
                    <p className="text-muted-foreground text-sm">No se pueden realizar cambios en la configuración desde esta vista.</p>
                </div>
            </CardContent>
        </Card>
    );
}
