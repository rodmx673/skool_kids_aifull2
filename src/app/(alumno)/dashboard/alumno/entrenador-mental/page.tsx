
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Brain, BookOpen, Calendar, Lightbulb, Check, X, Sparkles, Loader2, Folder, Book, Trophy, PartyPopper } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { libraryData } from "@/lib/libreria-data";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { generateQuiz, QuizQuestion } from "@/ai/flows/generate-quiz-flow";
import { useToast } from "@/hooks/use-toast";

type DifficultyLevel = "1" | "2" | "3";
const TOTAL_LOTES = 5; // 5 lotes de 10 preguntas = 50 preguntas

export default function EntrenadorMentalPage() {
    const { toast } = useToast();
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('');
    const [difficulty, setDifficulty] = useState<DifficultyLevel>("1");
    const [isTraining, setIsTraining] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Quiz state
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ correct: boolean, answer: string } | null>(null);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [incorrectAnswers, setIncorrectAnswers] = useState(0);
    const [currentLote, setCurrentLote] = useState(1);
    
    const [showBatchComplete, setShowBatchComplete] = useState(false);
    const [showLevelComplete, setShowLevelComplete] = useState(false);

    const studyPeriods = useMemo(() => {
        if (!selectedSubjectId) return [];
        const subject = libraryData.find(s => s.id === selectedSubjectId);
        return subject ? subject.progresiones : [];
    }, [selectedSubjectId]);
    
    useEffect(() => {
        setSelectedPeriod('');
    }, [selectedSubjectId]);

    const errorThreshold = useMemo(() => {
        if (difficulty === '2') return 1;
        if (difficulty === '3') return 0;
        return 3; 
    }, [difficulty]);

    const loadNewBatch = async (lote: number) => {
        setIsLoading(true);
        toast({ title: `Generando Lote ${lote}...`, description: "La IA está creando nuevas preguntas para ti." });

        try {
            const subject = libraryData.find(s => s.id === selectedSubjectId);
            const periodData = studyPeriods.find(p => `Progresión ${p.progresion}` === selectedPeriod);
            if (!subject || !periodData) throw new Error("Datos de asignatura o período no encontrados.");

            const topic = `Asignatura: ${subject.title}. Progresión ${periodData.progresion}: ${periodData.meta}`;
            const quizResult = await generateQuiz({ topic, numQuestions: 10 });
            
            setQuestions(quizResult.questions);
            setCurrentQuestionIndex(0);
            setCorrectAnswers(0);
            setIncorrectAnswers(0);
            setFeedback(null);
            setSelectedOption(null);
        } catch (error) {
            console.error("Failed to generate quiz:", error);
            toast({ variant: 'destructive', title: 'Error de IA', description: 'No se pudo generar el cuestionario. Intenta con otro tema.' });
            setIsTraining(false); // Salir del modo entrenamiento si falla la generación
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartTraining = async () => {
        if (!selectedSubjectId || !selectedPeriod) return;
        setCurrentLote(1);
        await loadNewBatch(1);
        setIsTraining(true);
    };

    const handleCheckAnswer = () => {
        if (!selectedOption) return;
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = selectedOption === currentQuestion.answer;
        setFeedback({ correct: isCorrect, answer: currentQuestion.answer });
        if (isCorrect) setCorrectAnswers(prev => prev + 1);
        else setIncorrectAnswers(prev => prev + 1);
    };
    
    const handleNextQuestion = () => {
        setFeedback(null);
        setSelectedOption(null);
        
        if (currentQuestionIndex === questions.length - 1) { // Fin del lote
            if (incorrectAnswers > errorThreshold) {
                toast({ title: '¡A Repasar!', description: `Demasiados errores. Reiniciando el lote ${currentLote}.` });
                loadNewBatch(currentLote); // Reiniciar el lote actual
                return;
            }

            if (currentLote < TOTAL_LOTES) {
                setShowBatchComplete(true);
            } else {
                setShowLevelComplete(true);
            }
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };
    
    const handleAdvanceLote = () => {
        setShowBatchComplete(false);
        const nextLote = currentLote + 1;
        setCurrentLote(nextLote);
        loadNewBatch(nextLote);
    };

    const handleStopTraining = () => {
        setIsTraining(false);
        setSelectedSubjectId('');
        setSelectedPeriod('');
        setDifficulty('1');
        setIsLoading(false);
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setFeedback(null);
        setCorrectAnswers(0);
        setIncorrectAnswers(0);
        setCurrentLote(1);
        setShowLevelComplete(false);
        setShowBatchComplete(false);
    };
    
    const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
    const selectedSubject = libraryData.find(s => s.id === selectedSubjectId);

    if (!isTraining) {
        return (
             <div className="flex justify-center items-center h-full">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Brain /> Entrenador Mental</CardTitle>
                        <CardDescription>Prepárate para tus exámenes con cuestionarios interactivos generados por IA.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="subject-select"><BookOpen className="inline-block mr-2 h-4 w-4"/>Asignatura</Label>
                            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                                <SelectTrigger id="subject-select"><SelectValue placeholder="Selecciona una materia..." /></SelectTrigger>
                                <SelectContent>
                                    {libraryData.map(subject => <SelectItem key={subject.id} value={subject.id}>{subject.title}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="period-select"><Calendar className="inline-block mr-2 h-4 w-4"/>Periodo de Estudio</Label>
                            <Select value={selectedPeriod} onValueChange={setSelectedPeriod} disabled={!selectedSubjectId}>
                                <SelectTrigger id="period-select"><SelectValue placeholder="Selecciona una progresión..." /></SelectTrigger>
                                <SelectContent>
                                    {studyPeriods.map(period => <SelectItem key={period.progresion} value={`Progresión ${period.progresion}`}>{`Progresión ${period.progresion}: ${period.meta.substring(0, 50)}...`}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <Label>Nivel de Dificultad</Label>
                            <RadioGroup value={difficulty} onValueChange={(v) => setDifficulty(v as DifficultyLevel)} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <Label htmlFor="level-1" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                     <RadioGroupItem value="1" id="level-1" className="sr-only" />
                                     <span className="font-semibold">Nivel 1</span>
                                     <span className="text-xs text-muted-foreground mt-1 text-center">Práctica Rápida (3 Errores)</span>
                                </Label>
                                <Label htmlFor="level-2" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                     <RadioGroupItem value="2" id="level-2" className="sr-only" />
                                     <span className="font-semibold">Nivel 2</span>
                                     <span className="text-xs text-muted-foreground mt-1 text-center">Práctica Estricta (1 Error)</span>
                                </Label>
                                <Label htmlFor="level-3" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                     <RadioGroupItem value="3" id="level-3" className="sr-only" />
                                     <span className="font-semibold">Nivel 3</span>
                                     <span className="text-xs text-muted-foreground mt-1 text-center">Dominio Total (0 Errores)</span>
                                </Label>
                            </RadioGroup>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" size="lg" onClick={handleStartTraining} disabled={!selectedSubjectId || !selectedPeriod || isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                            {isLoading ? "Generando cuestionario..." : "Iniciar Entrenamiento"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }
    
    if (isLoading && questions.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-full text-center">
                 <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                 <h2 className="text-xl font-semibold">Generando tu entrenamiento...</h2>
                 <p className="text-muted-foreground">La IA está preparando tus preguntas.</p>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null; // Safety check

    return (
         <>
            <Dialog open={showBatchComplete} onOpenChange={setShowBatchComplete}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl">¡Lote Completado!</DialogTitle>
                        <DialogDescription className="text-center">
                            <PartyPopper className="h-16 w-16 mx-auto text-yellow-500 my-4" />
                            ¡Excelente trabajo! Has dominado el lote {currentLote}. Prepárate para el siguiente desafío.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={handleAdvanceLote} className="w-full">Continuar al Lote {currentLote + 1}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={showLevelComplete} onOpenChange={setShowLevelComplete}>
                 <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl">¡Nivel Completado!</DialogTitle>
                        <DialogDescription className="text-center">
                             <Trophy className="h-16 w-16 mx-auto text-amber-500 my-4" />
                            ¡Felicidades! Has completado todas las preguntas del Nivel {difficulty}. Tu dominio del tema es impresionante.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center flex-col sm:flex-row gap-2">
                        {difficulty !== "3" && (
                            <Button onClick={() => { setShowLevelComplete(false); setDifficulty(prev => String(Number(prev) + 1) as DifficultyLevel); handleStartTraining(); }} className="w-full">
                                Subir al Nivel {Number(difficulty) + 1}
                            </Button>
                        )}
                        <Button onClick={handleStopTraining} className="w-full" variant="outline">
                            Volver al Inicio
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex justify-center items-center h-full">
                <Card className="w-full max-w-2xl relative">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <span>{selectedSubject?.title}</span>
                        </CardTitle>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleStopTraining}>
                                <X className="h-5 w-5" />
                                <span className="sr-only">Salir</span>
                        </Button>
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-2">
                            <span className="text-sm font-normal text-muted-foreground">Pregunta {currentQuestionIndex + 1} de {questions.length}</span>
                            <div className="flex items-center gap-2">
                            <Badge variant="secondary">Lote {currentLote} de {TOTAL_LOTES}</Badge>
                            <Badge variant="outline">Nivel {difficulty}</Badge>
                            <Badge variant={incorrectAnswers > errorThreshold ? "destructive" : "secondary"}>Errores: {incorrectAnswers}</Badge>
                            </div>
                        </div>
                        <Progress value={progress} className="mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-lg font-semibold text-center h-20 flex items-center justify-center">
                            {currentQuestion.question}
                        </p>
                        <RadioGroup
                            value={selectedOption || ''}
                            onValueChange={setSelectedOption}
                            className="space-y-3"
                            disabled={!!feedback}
                        >
                            {currentQuestion.options.map((option, index) => (
                                <Label
                                    key={index}
                                    htmlFor={`option-${index}`}
                                    className={cn(
                                        "flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all hover:border-primary",
                                        selectedOption === option && "border-primary ring-2 ring-primary",
                                        feedback && option === currentQuestion.answer && "border-green-400 ring-2 ring-green-500 bg-green-50",
                                        feedback && selectedOption === option && !feedback.correct && "border-red-400 ring-2 ring-red-500 bg-red-50"
                                    )}
                                >
                                    <RadioGroupItem value={option} id={`option-${index}`}/>
                                    <span className="flex-1">{option}</span>
                                </Label>
                            ))}
                        </RadioGroup>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                    {feedback ? (
                        <>
                            <div className={cn("w-full p-4 rounded-md flex items-start gap-3", feedback.correct ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>
                                {feedback.correct ? <Check className="h-5 w-5 mt-1"/> : <X className="h-5 w-5 mt-1"/>}
                                <div>
                                    <h4 className="font-bold">{feedback.correct ? "¡Correcto!" : "Respuesta Incorrecta"}</h4>
                                    {!feedback.correct && <p className="text-sm">La respuesta correcta es: <strong>{feedback.answer}</strong></p>}
                                </div>
                            </div>
                            <Button className="w-full" size="lg" onClick={handleNextQuestion}>
                                {currentQuestionIndex < questions.length - 1 ? "Siguiente Pregunta" : (currentLote < TOTAL_LOTES ? "Terminar Lote" : "Terminar Nivel")}
                            </Button>
                        </>
                    ) : (
                            <Button className="w-full" size="lg" onClick={handleCheckAnswer} disabled={!selectedOption}>
                                Comprobar Respuesta
                            </Button>
                    )}
                    </CardFooter>
                </Card>
            </div>
         </>
    );
}
