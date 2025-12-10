
"use client";

import { useState, useContext, useMemo } from "react";
import { Calendar as CalendarIcon, Shield } from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarContext } from "@/context/CalendarContext";
import { cn } from "@/lib/utils";

export default function PadreCalendarioPage() {
    const { events } = useContext(CalendarContext);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Calendario Institucional</h1>
                <p className="text-muted-foreground">Consulta las fechas importantes, días festivos y eventos escolares.</p>
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
                                    <div key={event.id} className={cn("flex items-start gap-3 p-3 rounded-lg border", event.isOfficial ? "bg-red-50 border-red-200" : "bg-muted/50")}>
                                        {event.isOfficial && <Shield className="h-4 w-4 mt-1 text-red-600 shrink-0" />}
                                        <div className="flex-1 space-y-1">
                                            <p className={cn("font-semibold", event.isOfficial && "text-red-800")}>{event.title}</p>
                                            {event.time && event.time !== '00:00' && (
                                                <p className="text-sm text-muted-foreground">{event.time}</p>
                                            )}
                                            {event.description && <p className="text-sm text-muted-foreground pt-1">{event.description}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-sm font-semibold">No hay eventos programados</h3>
                                <p className="mt-1 text-sm text-muted-foreground">Selecciona otro día para ver sus eventos.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
