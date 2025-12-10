
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Bot, Send, User } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { cn } from "@/lib/utils";

// Mock para la conversación
type Message = {
    sender: 'user' | 'bot';
    text: string;
};

export function AIChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', text: '¡Hola! Soy tu asistente de IA. ¿En qué puedo ayudarte hoy?' }
    ]);
    const [input, setInput] = useState("");

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef<HTMLButtonElement>(null);
    const offsetRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const savedPosition = localStorage.getItem('ai-assistant-position');
        if (savedPosition) {
            setPosition(JSON.parse(savedPosition));
        } else {
            // Default position if none is saved (e.g., bottom-right corner)
             const defaultX = window.innerWidth - 80;
             const defaultY = window.innerHeight - 80;
             setPosition({ x: defaultX, y: defaultY });
        }
    }, []);

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!dragRef.current) return;
        setIsDragging(true);
        const rect = dragRef.current.getBoundingClientRect();
        offsetRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
        // Prevent text selection while dragging
        e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        let newX = e.clientX - offsetRef.current.x;
        let newY = e.clientY - offsetRef.current.y;

        // Prevent dragging outside the window
        const maxX = window.innerWidth - (dragRef.current?.offsetWidth || 0);
        const maxY = window.innerHeight - (dragRef.current?.offsetHeight || 0);
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            localStorage.setItem('ai-assistant-position', JSON.stringify(position));
        }
    };
    
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);


    const handleSendMessage = () => {
        if (input.trim() === "") return;
        const userMessage: Message = { sender: 'user', text: input };
        // Lógica de respuesta del bot (simulada)
        const botResponse: Message = { sender: 'bot', text: `He recibido tu mensaje: "${input}". En una futura versión, te daré una respuesta inteligente.` };
        setMessages(prev => [...prev, userMessage, botResponse]);
        setInput("");
    };
    
    // Check if click was a drag or a simple click
    const handleClick = (e: React.MouseEvent) => {
        // A simple heuristic: if the mouse moved more than a few pixels, it was a drag
        if (Math.abs(e.movementX) > 2 || Math.abs(e.movementY) > 2) {
             return;
        }
        setIsOpen(true);
    };

    return (
        <>
            <Button
                ref={dragRef}
                variant="outline"
                size="icon"
                className={cn(
                    "fixed h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90 text-primary-foreground cursor-grab",
                    isDragging && "cursor-grabbing"
                )}
                style={{ left: `${position.x}px`, top: `${position.y}px` }}
                onMouseDown={handleMouseDown}
                onClick={handleClick}
            >
                <Bot className="h-7 w-7" />
                <span className="sr-only">Asistente AI</span>
            </Button>
            
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md flex flex-col h-[70vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Bot className="h-5 w-5"/>
                            Asistente de IA
                        </DialogTitle>
                        <DialogDescription>
                            Realiza preguntas o pide ayuda para completar tareas.
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="flex-1 -mx-6 px-6">
                        <div className="space-y-4 py-4">
                            {messages.map((message, index) => (
                                <div key={index} className={cn("flex items-start gap-3", message.sender === 'user' ? "justify-end" : "justify-start")}>
                                     {message.sender === 'bot' && (
                                        <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                                            <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                                        </Avatar>
                                     )}
                                     <div className={cn("rounded-lg px-3 py-2 max-w-xs", message.sender === 'user' ? "bg-muted" : "bg-primary/10")}>
                                        <p className="text-sm">{message.text}</p>
                                     </div>
                                     {message.sender === 'user' && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                                        </Avatar>
                                     )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    <DialogFooter className="border-t pt-4">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage();
                            }} 
                            className="flex items-center gap-2 w-full"
                        >
                            <Input 
                                placeholder="Escribe tu mensaje..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <Button type="submit" size="icon" className="flex-shrink-0">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
