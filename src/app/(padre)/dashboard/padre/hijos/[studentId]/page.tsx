"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function StudentMirrorPage() {
    const params = useParams();
    const router = useRouter();
    const studentId = params.studentId as string;

    useEffect(() => {
        // Redirige a la primera página real del dashboard del estudiante
        if (studentId) {
            router.replace(`/dashboard/padre/hijos/${studentId}/inicio`);
        }
    }, [studentId, router]);

    return (
        <div className="flex h-full w-full items-center justify-center bg-background">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Cargando dashboard del alumno...
            </div>
        </div>
    );
}
