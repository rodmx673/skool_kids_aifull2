
"use client";

import { useState, useContext, useMemo } from "react";
import { Calendar as CalendarIcon, Plus, Edit, Trash2, Shield } from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CalendarContext, CalendarEvent } from "@/context/CalendarContext";
import { cn } from "@/lib/utils";

function EventForm({ event, onSave, onCancel }: { event: Partial<CalendarEvent> & { date: Date }, onSave: (event: Omit<CalendarEvent, 'id' | 'isOfficial' | 'date'> & { date: Date }) => void, onCancel: () => void }) {
    const [title, setTitle] = useState(event?.title || "");
    const [date, setDate] = useState(event?.date ? new Date(event.date) : new Date());
    const [time, setTime] = useState(event?.time || "12:00");
    const [description, setDescription] = useState(event?.description || "");
    const { toast } = useToast();

    const handleSubmit = () => {
        if (!title.trim()) {
            toast({ variant: "destructive", title: "Error", description: "El título del evento es obligatorio." });
            return;
        }
        onSave({ title, date, time, description });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="event-title">Título del Evento</Label>
                <Input id="event-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Fecha</Label>
                    <div className="p-3 border rounded-md flex justify-center">
                        <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="event-time">Hora</Label>
                    <Input id="event-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="event-description">Descripción (Opcional)</Label>
                <Textarea id="event-description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                </DialogClose>
                <Button type="button" onClick={handleSubmit}>Guardar Evento</Button>
            </DialogFooter>
        </div>
    );
}


export default function CalendarioPage() {
    const { events, addEvent, updateEvent, deleteEvent } = useContext(CalendarContext);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

    const { toast } = useToast();

    const selectedDayEvents = useMemo(() => {
        const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
        return events.filter(event => event.date === formattedSelectedDate).sort((a, b) => {
            if (a.isOfficial && !b.isOfficial) return -1;
            if (!a.isOfficial && b.isOfficial) return 1;
            return (a.time || "00:00").localeCompare(b.time || "00:00");
        });
    }, [events, selectedDate]);
    
    const officialDays = useMemo(() => {
        return events.filter(e => e.isOfficial).map(e => parseISO(e.date));
    }, [events]);

    const personalDays = useMemo(() => {
        return events.filter(e => !e.isOfficial).map(e => parseISO(e.date));
    }, [events]);

    const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id' | 'isOfficial' | 'date'> & { date: Date }) => {
        if (editingEvent) {
            updateEvent(editingEvent.id, eventData);
            toast({ title: "Evento Actualizado", description: `"${eventData.title}" ha sido modificado.` });
        } else {
            addEvent(eventData);
            toast({ title: "Evento Creado", description: `Se ha añadido "${eventData.title}" al calendario.` });
        }
        setIsEventDialogOpen(false);
        setEditingEvent(null);
    };

    const handleOpenDialog = (event: CalendarEvent | null) => {
        setEditingEvent(event);
        setIsEventDialogOpen(true);
    };
    
    const handleDeleteEvent = (eventId: string) => {
        deleteEvent(eventId);
        toast({ title: "Evento Eliminado", variant: "destructive" });
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Calendario de Eventos</h1>
                    <p className="text-muted-foreground">Gestiona tus eventos, reuniones y recordatorios.</p>
                </div>
                <Button onClick={() => handleOpenDialog(null)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Evento
                </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Vista Mensual</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            className="p-0"
                            locale={es}
                            modifiers={{ 
                                official: officialDays,
                                personal: personalDays,
                            }}
                            modifiersClassNames={{
                                official: 'day-official',
                                personal: 'day-personal',
                            }}
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Eventos para el {format(selectedDate, "PPP", { locale: es })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedDayEvents.length > 0 ? (
                            <div className="space-y-4">
                                {selectedDayEvents.map(event => (
                                    <div key={event.id} className={cn("group flex items-start gap-3 p-3 rounded-lg border", event.isOfficial ? "bg-red-50 border-red-200" : "bg-muted/50")}>
                                        {event.isOfficial && <Shield className="h-4 w-4 mt-1 text-red-600 shrink-0" />}
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className={cn("font-semibold", event.isOfficial && "text-red-800")}>{event.title}</p>
                                                {!event.isOfficial && (
                                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenDialog(event)}><Edit className="h-4 w-4" /></Button>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteEvent(event.id)}><Trash2 className="h-4 w-4" /></Button>
                                                    </div>
                                                )}
                                            </div>
                                            {event.time && event.time !== '00:00' && <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                {event.time}
                                            </p>}
                                            {event.description && <p className="text-sm text-muted-foreground pt-1">{event.description}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-sm font-semibold">No hay eventos programados</h3>
                                <p className="mt-1 text-sm text-muted-foreground">Selecciona otro día o crea un nuevo evento.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
             <Dialog open={isEventDialogOpen} onOpenChange={(open) => { if(!open) setEditingEvent(null); setIsEventDialogOpen(open); }}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingEvent ? "Editar Evento" : "Crear Nuevo Evento"}</DialogTitle>
                        <DialogDescription>
                            Complete los detalles del evento a continuación.
                        </DialogDescription>
                    </DialogHeader>
                    <EventForm
                        event={editingEvent ? {...editingEvent, date: new Date(editingEvent.date)} : { date: selectedDate, time: '12:00' }}
                        onSave={handleSaveEvent}
                        onCancel={() => { setIsEventDialogOpen(false); setEditingEvent(null); }}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
