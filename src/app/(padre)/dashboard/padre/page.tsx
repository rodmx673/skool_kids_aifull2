"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function PadreDashboardPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard/padre/hijos');
    }, [router]);

    return (
        <div className="flex h-full w-full items-center justify-center bg-background">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Redirigiendo a la gestión de hijos...
            </div>
        </div>
    );
}
