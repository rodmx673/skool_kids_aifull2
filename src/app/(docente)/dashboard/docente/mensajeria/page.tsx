
"use client";

import { useState, useContext, useEffect, useRef, useMemo } from "react";
import { UserContext, User } from "@/context/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Send, Search, MessageSquare, Wand2, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { rewriteDocument } from "@/ai/flows/rewrite-document-flow";
import { useToast } from "@/hooks/use-toast";
import { MessagingContext, Message } from "@/context/MessagingContext";
import { Badge } from "@/components/ui/badge";

type Contact = User & {
    lastMessage?: string;
    lastMessageTime?: string;
    isOnline?: boolean;
    hasUnread?: boolean;
}

export default function DocenteMessagingPage() {
    const { currentUser, visibleUsers: users } = useContext(UserContext);
    const { conversations, sendMessage, markConversationAsRead } = useContext(MessagingContext);
    
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isRewriting, setIsRewriting] = useState(false);
    const { toast } = useToast();
    
    const adminContacts = useMemo(() => {
        const safeUsers = Array.isArray(users) ? users : [];
        return safeUsers.filter(u => ['admin', 'administrativo'].includes(u.role) && u.id !== currentUser?.id);
    }, [users, currentUser]);

    const contactsWithMessages = useMemo(() => {
        return adminContacts.map((contact, index) => {
            const conversation = conversations.find(c => c.userId === contact.id);
            const lastMessage = conversation?.messages[conversation.messages.length - 1];
            const hasUnread = currentUser ? conversation?.messages.some(m => m.senderId !== currentUser.id && !m.readBy.includes(currentUser.id)) : false;

            return {
                ...contact,
                lastMessage: lastMessage?.text || "Inicia la conversación.",
                lastMessageTime: lastMessage?.timestamp || "",
                isOnline: index % 2 === 0, 
                hasUnread: hasUnread,
            };
        }).sort((a, b) => {
            if (a.hasUnread && !b.hasUnread) return -1;
            if (!a.hasUnread && b.hasUnread) return 1;
            return (b.lastMessageTime || "").localeCompare(a.lastMessageTime || "");
        });
    }, [adminContacts, conversations, currentUser]);
    
    useEffect(() => {
        if (contactsWithMessages.length > 0 && !selectedContact) {
            setSelectedContact(contactsWithMessages[0]);
        }
    }, [contactsWithMessages, selectedContact]);

    useEffect(() => {
        if (selectedContact && currentUser) {
            markConversationAsRead(selectedContact.id, currentUser.id);
        }
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedContact, conversations, currentUser, markConversationAsRead]);

    const handleSendMessage = () => {
        if (newMessage.trim() === "" || !selectedContact || !currentUser) return;
        sendMessage(selectedContact.id, newMessage, currentUser.id);
        setNewMessage("");
    };

    const handleRewriteMessage = async () => {
        if (!newMessage.trim()) {
            toast({ variant: "destructive", title: "Mensaje Vacío", description: "No hay texto que reescribir." });
            return;
        }
        setIsRewriting(true);
        try {
            const rewrittenText = await rewriteDocument({ documentBody: newMessage });
            setNewMessage(rewrittenText);
            toast({ title: "Mensaje Mejorado", description: "La IA ha reescrito tu mensaje." });
        } catch (error) {
            console.error("Error rewriting message:", error);
            toast({ variant: "destructive", title: "Error de IA", description: "No se pudo conectar con el servicio de IA." });
        } finally {
            setIsRewriting(false);
        }
    };
    
    const filteredContacts = contactsWithMessages.filter(c => 
        c.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getInitials = (name: string) => {
        if (!name) return "??";
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    
    const currentConversationMessages = conversations.find(c => c.userId === selectedContact?.id)?.messages || [];

    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
            <h1 className="text-2xl font-bold tracking-tight mb-4 flex-shrink-0">Mensajería</h1>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 min-h-0">
                {/* Lista de Conversaciones */}
                <Card className="md:col-span-1 lg:col-span-1 flex flex-col h-full">
                    <CardHeader className="p-4 border-b">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar administrador..." 
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-y-auto">
                        <div className="flex flex-col">
                            {filteredContacts.map((contact) => (
                                <button
                                    key={contact.id}
                                    className={cn(
                                        "flex items-center gap-4 p-3 text-left hover:bg-accent transition-colors w-full",
                                        selectedContact?.id === contact.id && "bg-accent"
                                    )}
                                    onClick={() => setSelectedContact(contact)}
                                >
                                    <div className="relative">
                                        <Avatar>
                                            <AvatarImage src={`https://picsum.photos/seed/${contact.id}/40/40`} data-ai-hint="person face"/>
                                            <AvatarFallback>{getInitials(contact.username)}</AvatarFallback>
                                        </Avatar>
                                        {contact.hasUnread && (
                                            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-background" />
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-semibold truncate">{contact.username}</p>
                                        <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground self-start">{contact.lastMessageTime}</p>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Panel de Chat */}
                <Card className="md:col-span-2 lg:col-span-3 flex flex-col h-full">
                    {selectedContact ? (
                        <>
                            <CardHeader className="p-4 border-b flex-row items-center gap-4 space-y-0">
                                <div className="relative">
                                    <Avatar>
                                        <AvatarImage src={`https://picsum.photos/seed/${selectedContact.id}/40/40`} data-ai-hint="person face"/>
                                        <AvatarFallback>{getInitials(selectedContact.username)}</AvatarFallback>
                                    </Avatar>
                                    {selectedContact.isOnline && (
                                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                                    )}
                                </div>
                                <h2 className="text-lg font-semibold">{selectedContact.username}</h2>
                                 <Badge variant="outline" className="capitalize ml-2">{selectedContact.role}</Badge>
                            </CardHeader>
                            <CardContent className="flex-1 p-4 overflow-y-auto bg-slate-50/50">
                                <div className="space-y-4">
                                    {currentConversationMessages.map((msg) => {
                                        if (msg.isSystemMessage) {
                                            return (
                                                <div key={msg.id} className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                                                    <Info className="h-4 w-4"/>
                                                    <span>{msg.text} - {msg.timestamp}</span>
                                                </div>
                                            )
                                        }
                                        return (
                                            <div
                                                key={msg.id}
                                                className={cn("flex items-end gap-2", msg.senderId === currentUser?.id ? "justify-end" : "justify-start")}
                                            >
                                                {msg.senderId !== currentUser?.id && (
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={`https://picsum.photos/seed/${selectedContact.id}/40/40`} data-ai-hint="person face" />
                                                        <AvatarFallback>{getInitials(selectedContact.username)}</AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div
                                                    className={cn(
                                                        "max-w-xs lg:max-w-md rounded-xl px-4 py-2",
                                                        msg.senderId === currentUser?.id
                                                            ? "bg-primary text-primary-foreground"
                                                            : "bg-card border"
                                                    )}
                                                >
                                                    <p className="text-sm">{msg.text}</p>
                                                    <p className={cn(
                                                        "text-xs mt-1",
                                                        msg.senderId === currentUser?.id ? "text-primary-foreground/70" : "text-muted-foreground/70",
                                                        "text-right"
                                                        )}>{msg.timestamp}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            </CardContent>
                            <div className="p-4 border-t">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }}
                                    className="flex items-center gap-2"
                                >
                                    <Input
                                        placeholder="Escribe un mensaje..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <Button type="button" variant="ghost" size="icon" onClick={handleRewriteMessage} disabled={isRewriting} className="flex-shrink-0">
                                        {isRewriting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                                        <span className="sr-only">Reescribir con IA</span>
                                    </Button>
                                    <Button type="submit" size="icon" className="flex-shrink-0">
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold">Selecciona una conversación</h3>
                            <p className="text-muted-foreground">Elige un administrador de la lista para ver los mensajes.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
