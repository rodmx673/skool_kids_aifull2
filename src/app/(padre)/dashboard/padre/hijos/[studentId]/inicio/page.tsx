
"use client";

import { useContext, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { UserContext } from "@/context/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookCheck, MessageCircle, LineChart, CalendarClock, Bell, GraduationCap, Presentation } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

// Mock data, to be replaced with real data from contexts
const chartData = [
  { month: "Enero", calificacion: 8.5 },
  { month: "Febrero", calificacion: 8.8 },
  { month: "Marzo", calificacion: 9.1 },
  { month: "Abril", calificacion: 9.2 },
  { month: "Mayo", calificacion: 9.0 },
  { month: "Junio", calificacion: 9.5 },
];

const chartConfig = {
  calificacion: {
    label: "Calificación",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const weeklySchedule = {
    "Lunes": [{ time: "08:00", subject: "Matemáticas" }, { time: "10:00", subject: "Historia" }],
    "Martes": [{ time: "09:00", subject: "Química" }, { time: "11:00", subject: "Inglés" }],
    "Miércoles": [{ time: "08:00", subject: "Matemáticas" }, { time: "12:00", subject: "Educación Física" }],
    "Jueves": [{ time: "09:00", subject: "Química" }, { time: "11:00", subject: "Literatura" }],
    "Viernes": [{ time: "10:00", subject: "Física" }],
    "Sábado": [],
    "Domingo": [],
};

export default function StudentMirrorInicioPage() {
    const params = useParams();
    const router = useRouter();
    const { visibleUsers: users, currentUser } = useContext(UserContext);
    const studentId = params.studentId as string;

    const student = useMemo(() => {
        return users.find(u => u.id === studentId);
    }, [users, studentId]);

    const isAuthorized = useMemo(() => {
        return currentUser?.role === 'padre' && currentUser.childrenIds?.includes(studentId);
    }, [currentUser, studentId]);

    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-2xl font-bold">Acceso Denegado</h1>
                <p className="text-muted-foreground">No tienes permiso para ver la información de este alumno.</p>
                <Button variant="link" onClick={() => router.back()}>Volver atrás</Button>
            </div>
        );
    }
    
    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h1 className="text-2xl font-bold">Alumno no encontrado</h1>
                <p className="text-muted-foreground">No se encontró al alumno con el ID proporcionado.</p>
                 <Link href="/dashboard/padre/hijos">
                    <Button variant="link">Volver a Mis Hijos</Button>
                </Link>
            </div>
        );
    }

    const todayKey = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).replace(/^\w/, c => c.toUpperCase()) as keyof typeof weeklySchedule;
    const todaysClasses = weeklySchedule[todayKey] || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard de {student.username}</h1>
                    <p className="text-muted-foreground">Vista de solo lectura del progreso académico.</p>
                </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tareas Pendientes</CardTitle>
                        <BookCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3 Tareas</div>
                        <p className="text-xs text-muted-foreground">1 vence hoy</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">9.2</div>
                        <p className="text-xs text-muted-foreground">+0.1% desde el último corte</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Próximo Examen</CardTitle>
                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">Matemáticas</div>
                        <p className="text-xs text-muted-foreground">Mañana a las 10:00 AM</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mensajes Nuevos</CardTitle>
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                        <p className="text-xs text-muted-foreground">Con profesores</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><LineChart className="h-5 w-5" />Rendimiento Académico</CardTitle>
                        <CardDescription>Evolución del promedio durante el ciclo escolar.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                            <BarChart accessibilityLayer data={chartData}>
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
                                <YAxis domain={[5, 10]} />
                                <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                <Bar dataKey="calificacion" fill="var(--color-calificacion)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Presentation className="h-5 w-5" />Clases de Hoy</CardTitle>
                        <CardDescription>{todayKey}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {todaysClasses.length > 0 ? (
                            <div className="space-y-4">
                                {todaysClasses.map(cls => (
                                    <div key={cls.time} className="flex items-center">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary mr-4">
                                            <CalendarClock className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{cls.subject}</p>
                                            <p className="text-sm text-muted-foreground">{cls.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">No hay clases programadas para hoy.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Anuncios y Novedades</CardTitle>
                    <CardDescription>Comunicados relevantes para el alumno.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex h-full min-h-[150px] items-center justify-center rounded-md border border-dashed">
                        <p className="text-muted-foreground">No hay nuevos anuncios por el momento.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
