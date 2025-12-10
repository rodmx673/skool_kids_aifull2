"use client";

import Link from "next/link";
import { useState, useEffect, useContext } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { 
    BookCheck, 
    MessageCircle, 
    ArrowRight, 
    LineChart, 
    CalendarClock, 
    Bell, 
    GraduationCap, 
    Presentation,
    FileText,
    ListTodo,
    Brain,
} from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress";
import { AcademicContext } from "@/context/AcademicContext";


const chartData = [
  { month: "Enero", calificacion: 8.5 },
  { month: "Febrero", calificacion: 8.8 },
  { month: "Marzo", calificacion: 9.1 },
  { month: "Abril", calificacion: 9.2 },
  { month: "Mayo", calificacion: 9.0 },
  { month: "Junio", calificacion: 9.5 },
]

const chartConfig = {
  calificacion: {
    label: "Calificación",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig


export default function AlumnoDashboardPage() {
  const { certifiedSchedules, scheduleTemplates } = useContext(AcademicContext);
  const [todayKey, setTodayKey] = useState<string>("Lunes");
  const [todaysClasses, setTodaysClasses] = useState<{time: string, subject: string}[]>([]);

  useEffect(() => {
    const today = new Date().toLocaleDateString('es-ES', { weekday: 'long' });
    const capitalizedToday = today.charAt(0).toUpperCase() + today.slice(1);
    setTodayKey(capitalizedToday);

    // This is a simplified mock. A real implementation would use the certified schedules.
    const weeklySchedule = {
        "Lunes": [{ time: "08:00", subject: "Matemáticas" }, { time: "10:00", subject: "Historia" }],
        "Martes": [{ time: "09:00", subject: "Química" }, { time: "11:00", subject: "Inglés" }],
        "Miércoles": [{ time: "08:00", subject: "Matemáticas" }, { time: "12:00", subject: "Educación Física" }],
        "Jueves": [{ time: "09:00", subject: "Química" }, { time: "11:00", subject: "Literatura" }],
        "Viernes": [{ time: "10:00", subject: "Física" }],
        "Sábado": [],
        "Domingo": [],
    };
    
    setTodaysClasses(weeklySchedule[capitalizedToday as keyof typeof weeklySchedule] || []);
  }, []);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Bienvenido, Alumno</h1>
        <p className="text-muted-foreground text-sm">Resumen de tu actividad académica</p>
      </div>
      
      {/* KPI Cards */}
      <div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card className="hover:border-primary transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tareas Pendientes
            </CardTitle>
            <BookCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 Tareas</div>
            <p className="text-xs text-muted-foreground">
              1 vence hoy
            </p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Promedio General
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9.2</div>
            <p className="text-xs text-muted-foreground">
              +0.1% desde el último corte
            </p>
          </CardContent>
        </Card>
        <Card className="hover:border-primary transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Examen</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">Matemáticas</div>
            <p className="text-xs text-muted-foreground">
              Mañana a las 10:00 AM
            </p>
          </CardContent>
        </Card>
         <Card className="bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MessageCircle className="h-5 w-5"/>
                <span>Mensajes Nuevos</span>
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Tienes 2 mensajes sin leer de tus profesores.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Link href="/dashboard/alumno/mensajeria">
                <Button variant="secondary" className="w-full">
                    Ir a Mensajería
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Academic Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Rendimiento Académico
            </CardTitle>
            <CardDescription>Evolución de tu promedio durante el ciclo escolar.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                 <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                 <YAxis domain={[5, 10]} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="calificacion" fill="var(--color-calificacion)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Schedule */}
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Presentation className="h-5 w-5" />
                        Clases de Hoy
                    </CardTitle>
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
                        <p className="text-muted-foreground text-center py-8">No tienes clases programadas para hoy.</p>
                    )}
                </CardContent>
            </Card>
            <Card className="hover:border-primary transition-colors flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        Entrenador Mental
                    </CardTitle>
                    <CardDescription>Resumen de tu último entrenamiento.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <div className="space-y-3">
                         <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">Precisión en "Química"</span>
                                <span className="text-sm font-bold">85%</span>
                            </div>
                            <Progress value={85} />
                        </div>
                        <p className="text-xs text-muted-foreground">¡Sigue así! Estás a solo un paso de dominar el periodo.</p>
                    </div>
                </CardContent>
                <CardContent>
                    <Link href="/dashboard/alumno/entrenador-mental">
                        <Button variant="outline" className="w-full">
                            Continuar Entrenando
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* Announcements Feed */}
       <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Anuncios y Novedades
                </CardTitle>
                 <CardDescription>Mantente al día con los últimos comunicados.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex h-full min-h-[150px] items-center justify-center rounded-md border border-dashed">
                    <p className="text-muted-foreground">No hay nuevos anuncios por el momento.</p>
                </div>
            </CardContent>
        </Card>
    </>
  )
}
