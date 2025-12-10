

"use client";

import { useState, useMemo, useContext, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, PlusCircle, Trash2, Edit, Save, Wand2, Loader2, Upload, Printer, GitBranch, ChevronsUpDown, CheckCircle, Lightbulb, X } from "lucide-react";
import { AcademicContext, Subject } from "@/context/AcademicContext";
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { generatePlanning, GeneratePlanningOutput } from '@/ai/flows/generate-planning-flow';

function InstructionTemplates({ onSelect }: { onSelect: (text: string) => void }) {
  const templates = [
    {
      name: "Plan Estándar",
      description: "Balanceado con 3 parciales y un proyecto final.",
      text: "Genera un plan de 18 semanas que incluya 3 evaluaciones parciales y un proyecto final. Distribuye las progresiones de aprendizaje de manera equitativa a lo largo del semestre."
    },
    {
      name: "Enfoque Práctico",
      description: "Prioriza actividades y proyectos sobre teoría.",
      text: "Diseña un plan que priorice las actividades prácticas y proyectos semanales. Reduce el tiempo de clase expositiva y aumenta el trabajo en equipo. Incluye una evaluación práctica por cada parcial."
    },
    {
      name: "Evaluación Continua",
      description: "Múltiples evaluaciones de bajo impacto.",
      text: "Crea un plan con evaluaciones continuas de bajo impacto cada semana (quizzes, entregas cortas, participación). El proyecto final debe construirse gradualmente a lo largo del semestre."
    },
  ];

  return (
    <div className="space-y-3">
        <Label className="flex items-center gap-2 text-muted-foreground"><Lightbulb className="h-4 w-4"/>Sugerencias de Instrucciones</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {templates.map(template => (
                <Button key={template.name} variant="outline" className="h-auto text-left flex flex-col items-start p-3" onClick={() => onSelect(template.text)}>
                    <span className="font-semibold">{template.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">{template.description}</span>
                </Button>
            ))}
        </div>
    </div>
  );
}


export default function CareerPlanningPage() {
    const router = useRouter();
    const { careers, subjects: allSubjects, academicPeriodOptions, generatedSchedules, setGeneratedSchedules } = useContext(AcademicContext);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for filters
    const [selectedCareerId, setSelectedCareerId] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [weeks, setWeeks] = useState(18);

    // State for UI and content
    const [contextText, setContextText] = useState('');
    const [uploadedFileContent, setUploadedFileContent] = useState<string | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [generatedPlan, setGeneratedPlan] = useState<GeneratePlanningOutput['plan'] | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [refineQuery, setRefineQuery] = useState('');

    const careerSubjects = useMemo(() => {
        if (!selectedCareerId || !selectedPeriod) return [];
        const periodKey = `${selectedCareerId}-${selectedPeriod}`;
        return allSubjects.filter(s => s.period === periodKey);
    }, [allSubjects, selectedCareerId, selectedPeriod]);
    
    // Reset file upload status when filters change
    useEffect(() => {
        if (!uploadedFileName) return;
        handleRemoveFile();
    }, [selectedCareerId, selectedPeriod, selectedSubject]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type === 'application/pdf' || file.type.includes('wordprocessing') || file.type === 'text/plain') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const dataUrl = e.target?.result as string;
                    setUploadedFileContent(dataUrl); 
                    setUploadedFileName(file.name);
                    toast({ title: `Archivo "${file.name}" seleccionado y listo.` });
                };
                reader.onerror = () => {
                    toast({ variant: 'destructive', title: 'Error de Lectura', description: 'No se pudo leer el archivo.' });
                    handleRemoveFile();
                };
                reader.readAsDataURL(file); // Leer como Data URL (Base64)
            } else {
                toast({ variant: 'destructive', title: 'Archivo no Soportado', description: 'Por favor, suba un archivo PDF, DOCX o TXT.' });
                handleRemoveFile();
            }
        }
    };
    
    const handleRemoveFile = () => {
        setUploadedFileContent(null);
        setUploadedFileName(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleGenerate = async (isRefinement = false, currentPlan?: GeneratePlanningOutput['plan']) => {
        if (!selectedSubject) {
            toast({
                variant: 'destructive',
                title: 'Selección requerida',
                description: 'Por favor, selecciona una carrera, semestre y asignatura.',
            });
            return;
        }

        setIsGenerating(true);
        if (!isRefinement) {
            setGeneratedPlan(null);
        }
        
        toast({
            title: isRefinement ? 'Refinando Planeación...' : 'Generando Planeación...',
            description: isRefinement ? `Aplicando tus instrucciones...` : `La IA está creando un plan de ${weeks} semanas para ${selectedSubject}. Esto puede tardar un momento.`,
        });

        try {
            const instructions = isRefinement ? refineQuery : contextText;
            const result = await generatePlanning({
                subject: selectedSubject,
                weeks,
                instructions,
                fileContent: uploadedFileContent || undefined,
                existingPlan: currentPlan, // Pass existing plan for refinement
            });
            setGeneratedPlan(result.plan);
            toast({
                title: isRefinement ? '¡Plan Refinado!' : '¡Planeación Generada!',
                description: 'Revisa y refina el plan a continuación.',
            });
            if(isRefinement) setRefineQuery('');

        } catch(error) {
            console.error("AI plan generation failed:", error);
            toast({ variant: 'destructive', title: 'Error de IA', description: 'No se pudo generar la planeación. Inténtelo de nuevo.' });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleRefine = () => {
        if (!refineQuery.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Escribe una instrucción para refinar el plan.' });
            return;
        }
        if(!generatedPlan){
            toast({ variant: 'destructive', title: 'Error', description: 'Primero debes generar un plan antes de poder refinarlo.' });
            return;
        }
        handleGenerate(true, generatedPlan);
    };

    const handleSavePlan = () => {
        if (!generatedPlan || !selectedSubject || !selectedCareerId || !selectedPeriod) {
            toast({
                variant: 'destructive',
                title: 'No se puede guardar',
                description: 'Primero debes generar un plan para una asignatura específica.'
            });
            return;
        }
        
        const planKey = `${selectedCareerId}-${selectedPeriod}-${selectedSubject.replace(/\s+/g, '-')}`;
        
        setGeneratedSchedules(prev => ({
            ...prev,
            [planKey]: {
                planData: generatedPlan
            }
        }));

        toast({
            title: '¡Planeación Guardada!',
            description: `El plan para "${selectedSubject}" ha sido guardado en la Librería.`
        });
    };


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="link" className="p-0 h-auto text-muted-foreground" onClick={() => router.push('/dashboard/planeacion')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a Planeación
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Asistente de Planeación Didáctica</h1>
                    <p className="text-muted-foreground">Genera planes de estudio detallados por asignatura con la ayuda de IA.</p>
                </div>
                 <div className="flex gap-2">
                    {generatedPlan && (
                        <Button variant="outline" onClick={handleSavePlan}>
                            <Save className="mr-2 h-4 w-4"/>
                            Guardar en Librería
                        </Button>
                    )}
                    <Button onClick={() => handleGenerate()} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        {isGenerating ? 'Generando...' : 'Generar Planeación'}
                    </Button>
                 </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>1. Selección de Asignatura y Duración</CardTitle>
                    <CardDescription>Filtra por carrera y semestre, y define la duración del plan de estudios.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Carrera</Label>
                            <Select value={selectedCareerId} onValueChange={id => { setSelectedCareerId(id); setSelectedPeriod(''); setSelectedSubject(''); }}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar carrera..." /></SelectTrigger>
                                <SelectContent>{careers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Semestre</Label>
                            <Select value={selectedPeriod} onValueChange={p => { setSelectedPeriod(p); setSelectedSubject(''); }} disabled={!selectedCareerId}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar semestre..." /></SelectTrigger>
                                <SelectContent>{academicPeriodOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Asignatura</Label>
                             <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={careerSubjects.length === 0}>
                                <SelectTrigger><SelectValue placeholder="Seleccionar asignatura..." /></SelectTrigger>
                                <SelectContent>
                                    {careerSubjects.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="weeks">Semanas Efectivas</Label>
                            <Input
                                id="weeks"
                                type="number"
                                value={weeks}
                                onChange={(e) => setWeeks(Math.max(1, Number(e.target.value)))}
                                min="1"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>2. Contexto para la IA (Opcional)</CardTitle>
                    <CardDescription>Proporciona información adicional (temario, objetivos, etc.) para guiar a la IA.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea 
                        placeholder="Ej: 'Basado en el temario, crea un plan de 18 semanas que incluya 3 evaluaciones parciales, un proyecto final y actividades prácticas semanales. Dedica las primeras 6 semanas a la Progresión 1, las siguientes 6 a la Progresión 2, y las últimas 6 a la Progresión 3 y al proyecto.'"
                        rows={6}
                        value={contextText}
                        onChange={(e) => setContextText(e.target.value)}
                    />
                    <InstructionTemplates onSelect={setContextText} />
                     <div className="flex items-center gap-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".pdf,.docx,.txt"
                            onChange={handleFileUpload}
                        />
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="mr-2 h-4 w-4" />
                            Subir Archivo (PDF, DOCX, TXT)
                        </Button>
                        {uploadedFileName && (
                            <div className="flex items-center gap-2 text-green-600 font-medium text-sm p-2 bg-green-50 border border-green-200 rounded-md">
                                <CheckCircle className="h-5 w-5" />
                                <span>Archivo listo: ({uploadedFileName})</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={handleRemoveFile}>
                                    <X className="h-4 w-4"/>
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {generatedPlan && (
                <Card>
                    <CardHeader>
                        <CardTitle>3. Planeación Generada ({weeks} Semanas)</CardTitle>
                        <CardDescription>Este es el plan de estudios propuesto por la IA. Puedes editarlo directamente o usar el asistente para refinarlo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            {generatedPlan.map(week => (
                                <AccordionItem value={`week-${week.week}`} key={week.week}>
                                    <AccordionTrigger>Semana {week.week}: {week.topic}</AccordionTrigger>
                                    <AccordionContent className="space-y-4">
                                        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                            <div>
                                                <h4 className="font-semibold text-sm">Objetivos de Aprendizaje:</h4>
                                                <p className="text-sm whitespace-pre-wrap">{week.learningObjectives}</p>
                                            </div>
                                            <Separator />
                                            <div>
                                                <h4 className="font-semibold text-sm">Estrategias Docentes:</h4>
                                                <p className="text-sm whitespace-pre-wrap">{week.teachingStrategies}</p>
                                            </div>
                                             <Separator />
                                            <div>
                                                <h4 className="font-semibold text-sm">Actividades del Alumno:</h4>
                                                <p className="text-sm whitespace-pre-wrap">{week.studentActivities}</p>
                                            </div>
                                             <Separator />
                                            <div>
                                                <h4 className="font-semibold text-sm">Evaluación Propuesta:</h4>
                                                <p className="text-sm whitespace-pre-wrap">{week.evaluationMethods}</p>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-4">
                        <Label htmlFor="refine-query">Refinar con IA ("Recitar")</Label>
                        <div className="flex w-full gap-2">
                             <Input 
                                id="refine-query" 
                                placeholder="Ej: 'Haz la semana 5 más práctica', 'Añade un examen en la semana 9'..."
                                value={refineQuery}
                                onChange={(e) => setRefineQuery(e.target.value)}
                            />
                            <Button onClick={handleRefine} disabled={isGenerating}>
                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <GitBranch className="mr-2 h-4 w-4"/>}
                                Refinar
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}

