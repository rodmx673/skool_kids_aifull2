
"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2, Sparkles, Text, BookOpen } from "lucide-react";
import Image from "next/image";
import { generatePresentation, GeneratePresentationOutput } from "@/ai/flows/generate-presentation-flow";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PresentacionesPage() {
    const [topic, setTopic] = useState("");
    const [audience, setAudience] = useState("High School Students");
    const [instructions, setInstructions] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<GeneratePresentationOutput | null>(null);
    const { toast } = useToast();
    const resultCardRef = useRef<HTMLDivElement>(null);

    const handleGenerate = async () => {
        if (!topic || !audience) {
            toast({
                variant: "destructive",
                title: "Campos Incompletos",
                description: "Por favor, especifique un tema y una audiencia.",
            });
            return;
        }

        setIsGenerating(true);
        setGeneratedContent(null);

        try {
            const result = await generatePresentation({
                topic,
                audience,
                instructions,
            });

            if (result?.imageUrl) {
                setGeneratedContent(result);
                toast({
                    title: "¡Presentación Generada!",
                    description: "La diapositiva está lista para ser descargada.",
                });
                setTimeout(() => {
                    resultCardRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            } else {
                throw new Error("La IA no devolvió una imagen.");
            }
        } catch (error) {
            console.error("Error generating presentation:", error);
            toast({
                variant: "destructive",
                title: "Error de Generación",
                description: "No se pudo crear la diapositiva. Por favor, intente de nuevo con otro tema.",
            });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleDownload = () => {
        if (!generatedContent?.imageUrl) return;
        const link = document.createElement('a');
        link.href = generatedContent.imageUrl;
        link.download = `presentacion-${topic.toLowerCase().replace(/\s+/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Generador de Presentaciones con IA</h1>
                    <p className="text-muted-foreground">Crea diapositivas educativas sobre cualquier tema de forma instantánea.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Crear una Diapositiva</CardTitle>
                    <CardDescription>Completa la información para que la IA genere el contenido visual y textual.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="topic"><BookOpen className="inline-block mr-2 h-4 w-4"/>Tema Principal</Label>
                        <Input
                            id="topic"
                            placeholder="Ej: El Ciclo del Agua, Leyes de Newton, La Revolución Francesa"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="audience">Audiencia</Label>
                             <Select value={audience} onValueChange={setAudience}>
                                <SelectTrigger id="audience">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Elementary School Students">Alumnos de Primaria</SelectItem>
                                    <SelectItem value="Middle School Students">Alumnos de Secundaria</SelectItem>
                                    <SelectItem value="High School Students">Alumnos de Preparatoria</SelectItem>
                                    <SelectItem value="University Students">Alumnos Universitarios</SelectItem>
                                    <SelectItem value="General Public">Público General</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="instructions"><Text className="inline-block mr-2 h-4 w-4"/>Instrucciones Adicionales (Opcional)</Label>
                        <Textarea
                            id="instructions"
                            placeholder="Ej: Enfócate en las aplicaciones prácticas. Incluye un dato curioso."
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                     <Button onClick={handleGenerate} disabled={isGenerating} size="lg">
                        {isGenerating ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-5 w-5" />
                        )}
                        {isGenerating ? "Generando Diapositiva..." : "Generar con IA"}
                    </Button>
                </CardFooter>
            </Card>

            {(isGenerating || generatedContent) && (
                 <Card ref={resultCardRef}>
                    <CardHeader>
                        <CardTitle>Diapositiva Generada</CardTitle>
                        <CardDescription>
                            Este es el resultado. Puedes descargarlo como una imagen.
                            <br/>
                            <span className="text-xs text-muted-foreground">Prompt de imagen usado: "{generatedContent?.imageGenerationPrompt}"</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="w-full max-w-3xl aspect-video rounded-lg border bg-muted flex items-center justify-center">
                            {isGenerating && <Loader2 className="h-12 w-12 text-primary animate-spin" />}
                            {generatedContent?.imageUrl && (
                                <Image
                                    src={generatedContent.imageUrl}
                                    alt={`Presentación sobre ${topic}`}
                                    width={1280}
                                    height={720}
                                    className="rounded-md object-contain"
                                />
                            )}
                        </div>
                         {generatedContent?.imageUrl && (
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
