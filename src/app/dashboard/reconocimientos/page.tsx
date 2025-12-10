
"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Award, Download, Loader2, Sparkles, Wand2 } from "lucide-react";
import Image from "next/image";
import { generateDiploma } from "@/ai/flows/generate-diploma-flow";

export default function ReconocimientosPage() {
    const [recipientName, setRecipientName] = useState("");
    const [achievement, setAchievement] = useState("");
    const [imagePrompt, setImagePrompt] = useState("logro abstracto");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const { toast } = useToast();
    const resultCardRef = useRef<HTMLDivElement>(null);

    const handleGenerate = async () => {
        if (!recipientName || !achievement || !imagePrompt) {
            toast({
                variant: "destructive",
                title: "Campos Incompletos",
                description: "Por favor, complete todos los campos para generar el reconocimiento.",
            });
            return;
        }

        setIsGenerating(true);
        setGeneratedImage(null);

        try {
            const result = await generateDiploma({
                recipientName,
                achievement,
                imagePrompt,
            });

            if (result?.imageUrl) {
                setGeneratedImage(result.imageUrl);
                toast({
                    title: "¡Reconocimiento Generado!",
                    description: "La imagen está lista para ser descargada.",
                });
                setTimeout(() => {
                    resultCardRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            } else {
                throw new Error("La IA no devolvió una imagen.");
            }
        } catch (error) {
            console.error("Error generating diploma:", error);
            toast({
                variant: "destructive",
                title: "Error de Generación",
                description: "No se pudo crear la imagen. Por favor, intente de nuevo con otro texto.",
            });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleDownload = () => {
        if (!generatedImage) return;
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = `reconocimiento-${recipientName.toLowerCase().replace(/\s+/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Generador de Reconocimientos con IA</h1>
                    <p className="text-muted-foreground">Crea diplomas y reconocimientos personalizados de forma instantánea.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Detalles del Reconocimiento</CardTitle>
                    <CardDescription>Completa la información para generar el diploma.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="recipient-name">Nombre del Homenajeado</Label>
                            <Input
                                id="recipient-name"
                                placeholder="Ej: Juan Pérez"
                                value={recipientName}
                                onChange={(e) => setRecipientName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="achievement">Razón del Reconocimiento</Label>
                            <Input
                                id="achievement"
                                placeholder="Ej: Por su Excelente Desempeño Académico"
                                value={achievement}
                                onChange={(e) => setAchievement(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="image-prompt">Estilo de Imagen (Palabra Clave para IA)</Label>
                        <Input
                            id="image-prompt"
                            placeholder="Ej: logro, ciencia, arte, excelencia, abstracto"
                            value={imagePrompt}
                            onChange={(e) => setImagePrompt(e.target.value)}
                        />
                         <p className="text-xs text-muted-foreground">La IA usará esta palabra para crear un fondo artístico para el diploma.</p>
                    </div>
                </CardContent>
                <CardContent>
                     <Button onClick={handleGenerate} disabled={isGenerating} size="lg">
                        {isGenerating ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-5 w-5" />
                        )}
                        {isGenerating ? "Generando..." : "Generar Reconocimiento"}
                    </Button>
                </CardContent>
            </Card>

            {(isGenerating || generatedImage) && (
                 <Card ref={resultCardRef}>
                    <CardHeader>
                        <CardTitle>Resultado</CardTitle>
                        <CardDescription>Este es el reconocimiento generado. Puedes descargarlo como una imagen.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="w-full max-w-2xl aspect-[4/3] rounded-lg border bg-muted flex items-center justify-center">
                            {isGenerating && <Loader2 className="h-12 w-12 text-primary animate-spin" />}
                            {generatedImage && (
                                <Image
                                    src={generatedImage}
                                    alt={`Reconocimiento para ${recipientName}`}
                                    width={800}
                                    height={600}
                                    className="rounded-md object-contain"
                                />
                            )}
                        </div>
                         {generatedImage && (
                            <Button onClick={handleDownload} variant="outline" size="lg">
                                <Download className="mr-2 h-5 w-5" />
                                Descargar Imagen
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
