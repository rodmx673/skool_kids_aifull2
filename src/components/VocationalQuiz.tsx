
"use client";

import { useState, useEffect, useContext } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Bot, Loader2, PartyPopper, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateVocationalQuiz, analyzeQuizAnswers, VocationalQuizQuestion } from '@/ai/flows/generate-vocational-quiz-flow';
import { AcademicContext } from '@/context/AcademicContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import Link from 'next/link';

type QuizStep = 'loading' | 'quiz' | 'analyzing' | 'result';

type Answer = {
    question: string;
    selectedOption: string;
    trait: string;
};

export function VocationalQuiz() {
    const { toast } = useToast();
    const { careers } = useContext(AcademicContext);
    
    const [step, setStep] = useState<QuizStep>('loading');
    const [questions, setQuestions] = useState<VocationalQuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [analysisResult, setAnalysisResult] = useState<{ recommendedCareer: string; reasoning: string; closingArgument: string; } | null>(null);

    useEffect(() => {
        const loadQuiz = async () => {
            try {
                const quiz = await generateVocationalQuiz();
                setQuestions(quiz.questions);
                setStep('quiz');
            } catch (error) {
                console.error("Failed to load quiz:", error);
                toast({
                    variant: 'destructive',
                    title: 'Error de IA',
                    description: 'No se pudo cargar el quiz vocacional. Inténtalo más tarde.'
                });
            }
        };
        loadQuiz();
    }, [toast]);

    const handleAnswer = (option: { text: string; trait: string }) => {
        const newAnswer: Answer = {
            question: questions[currentQuestionIndex].question,
            selectedOption: option.text,
            trait: option.trait
        };
        const updatedAnswers = [...answers, newAnswer];
        setAnswers(updatedAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // End of quiz, start analysis
            setStep('analyzing');
            analyzeAnswers(updatedAnswers);
        }
    };
    
    const analyzeAnswers = async (finalAnswers: Answer[]) => {
        try {
             const availableCareers = careers.map(c => ({id: c.id, name: c.name}));
             const result = await analyzeQuizAnswers({ answers: finalAnswers, careers: availableCareers });
             setAnalysisResult(result);
             setStep('result');
        } catch (error) {
            console.error("Failed to analyze answers:", error);
            toast({
                variant: 'destructive',
                title: 'Error de Análisis',
                description: 'La IA no pudo procesar tus respuestas. Por favor, intenta de nuevo.'
            });
            // Reset to quiz start on failure
            setStep('quiz');
            setCurrentQuestionIndex(0);
            setAnswers([]);
        }
    };

    const renderContent = () => {
        switch (step) {
            case 'loading':
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="font-semibold">Preparando tu quiz vocacional...</p>
                    </div>
                );
            case 'quiz':
                const question = questions[currentQuestionIndex];
                if (!question) return null;
                return (
                    <div className="p-6 space-y-6">
                        <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                                <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                            </Avatar>
                            <Card className="bg-primary/10 border-primary/20 rounded-xl rounded-tl-none">
                                <CardContent className="p-3">
                                    <p className="font-semibold">{question.question}</p>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="space-y-3 pl-11">
                            {question.options.map((option, index) => (
                                <Button 
                                    key={index} 
                                    variant="outline" 
                                    className="w-full justify-start h-auto py-3 text-left"
                                    onClick={() => handleAnswer(option)}
                                >
                                    {option.text}
                                </Button>
                            ))}
                        </div>
                    </div>
                );
            case 'analyzing':
                 return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="font-semibold">¡Analizando tus respuestas!</p>
                        <p className="text-sm text-muted-foreground">La IA está descubriendo tu carrera ideal...</p>
                    </div>
                );
            case 'result':
                return (
                    <div className="p-6 space-y-4 text-center">
                        <PartyPopper className="h-14 w-14 mx-auto text-yellow-500" />
                        <h3 className="text-2xl font-bold">¡Tenemos una recomendación para ti!</h3>
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-muted-foreground text-sm">Tu carrera ideal podría ser...</p>
                            <p className="text-3xl font-extrabold text-primary">{analysisResult?.recommendedCareer}</p>
                        </div>
                        <div className="text-left space-y-4 pt-4">
                            <div className="flex items-start gap-3">
                                <Sparkles className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                <p className="text-muted-foreground">{analysisResult?.reasoning}</p>
                            </div>
                            <p className="font-bold text-center text-lg leading-tight p-4 bg-primary/10 rounded-lg">{analysisResult?.closingArgument}</p>
                             <Link href="/dashboard/externos/inscripciones" passHref>
                                <Button size="lg" className="w-full mt-4">
                                ¡Inscribirme Ahora!
                                </Button>
                            </Link>
                        </div>
                    </div>
                );
        }
    };
    
    return (
        <Card className="h-full flex flex-col">
            <CardContent className="flex-1 overflow-y-auto p-0">
                {renderContent()}
            </CardContent>
             {step === 'quiz' && (
                <div className="p-2 border-t text-center">
                    <p className="text-xs text-muted-foreground">Pregunta {currentQuestionIndex + 1} de {questions.length}</p>
                </div>
             )}
        </Card>
    );
}
