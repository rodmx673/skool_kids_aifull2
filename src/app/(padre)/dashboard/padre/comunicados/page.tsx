
"use client";

import { useContext } from "react";
import { WebpageContext } from "@/context/WebpageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Newspaper } from "lucide-react";

export default function ComunicadosPadrePage() {
    const { news } = useContext(WebpageContext);

    // Ordenar noticias por fecha, de la más reciente a la más antigua
    const sortedNews = [...news].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Comunicados y Noticias</h1>
                <p className="text-muted-foreground">Mantente informado sobre los últimos anuncios y eventos de la institución.</p>
            </div>

            {sortedNews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedNews.map((item) => (
                        <Card key={item.id} className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
                            <div className="relative w-full h-48">
                                <Image
                                    src={item.imageUrl}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    data-ai-hint={item.imageHint}
                                />
                            </div>
                            <CardHeader>
                                <CardDescription>
                                    {new Date(item.date).toLocaleDateString('es-MX', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </CardDescription>
                                <CardTitle className="text-lg">{item.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                 <div className="flex flex-col items-center justify-center h-64 gap-2 text-center border-2 border-dashed rounded-lg">
                    <Newspaper className="h-12 w-12 text-muted-foreground" />
                    <h3 className="font-semibold">No hay comunicados</h3>
                    <p className="text-muted-foreground text-sm">Los anuncios y noticias de la escuela aparecerán aquí.</p>
                </div>
            )}
        </div>
    );
}
