
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, BookUser, Shield, GraduationCap, Users as UsersIcon, CreditCard, FileSearch, CalendarPlus, ArrowRight, Bell, BarChart3, Presentation, BookCheck, ClipboardList } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const groupChartData = [
  { group: "2°A Contabilidad", average: 8.8 },
  { group: "4°A Ofimática", average: 9.2 },
  { group: "4°B Ofimática", average: 8.5 },
  { group: "6°A Programación", average: 9.5 },
];

const chartConfig = {
  average: {
    label: "Promedio",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const todayClasses = [
    { time: "08:00", subject: "Cálculo Diferencial", group: "4°A Ofimática" },
    { time: "10:00", subject: "Estructura de Datos", group: "4°A Programación" },
    { time: "12:00", subject: "Bases de Datos", group: "6°A Programación" },
];

export default function PanelesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Paneles de Control</h1>
        <p className="text-muted-foreground">
          Vistas centralizadas para diferentes roles de usuario.
        </p>
      </div>

      <Tabs defaultValue="docente" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="docente">
              <BookUser className="mr-2 h-4 w-4" />
              DOCENTE
          </TabsTrigger>
          <TabsTrigger value="alumno">
              <GraduationCap className="mr-2 h-4 w-4" />
              ALUMNO
          </TabsTrigger>
          <TabsTrigger value="administrativo">
              <Shield className="mr-2 h-4 w-4" />
              ADMINISTRATIVO
          </TabsTrigger>
          <TabsTrigger value="tutor">
              <User className="mr-2 h-4 w-4" />
              TUTOR
          </TabsTrigger>
        </TabsList>
        <TabsContent value="docente">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                  <CardTitle>Panel del Docente</CardTitle>
                  <CardDescription>
                  Resumen de la actividad académica y accesos directos.
                  </CardDescription>
              </div>
              <Link href="/dashboard/docente" passHref>
                  <Button>Ir al Portal Completo del Docente <ArrowRight className="ml-2 h-4 w-4"/></Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-6">
               {/* KPI Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="hover:border-primary transition-colors">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Grupos Asignados</CardTitle>
                          <UsersIcon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                          <div className="text-2xl font-bold">4 Grupos</div>
                          <p className="text-xs text-muted-foreground">120 alumnos en total</p>
                      </CardContent>
                  </Card>
                  <Card className="hover:border-primary transition-colors">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Circulares Pendientes</CardTitle>
                          <Bell className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                          <div className="text-2xl font-bold">2 por firmar</div>
                          <p className="text-xs text-muted-foreground">1 vence esta semana</p>
                      </CardContent>
                  </Card>
                  <Card className="hover:border-primary transition-colors">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Promedio de Calificación</CardTitle>
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                          <div className="text-2xl font-bold">8.9</div>
                          <p className="text-xs text-muted-foreground">General de todos los grupos</p>
                      </CardContent>
                  </Card>
                  <Card className="bg-primary text-primary-foreground">
                      <CardHeader className="pb-2">
                          <CardTitle className="text-lg font-semibold flex items-center gap-2"><BookCheck className="h-5 w-5"/><span>Tareas por Calificar</span></CardTitle>
                          <CardDescription className="text-primary-foreground/80">3 tareas tienen nuevas entregas.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <Link href="/dashboard/docente/tareas">
                              <Button variant="secondary" className="w-full">
                                  Ir a Tareas <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                          </Link>
                      </CardContent>
                  </Card>
              </div>
              {/* Main content grid */}
              <div className="grid gap-6 lg:grid-cols-3">
                  <Card className="lg:col-span-2">
                      <CardHeader>
                          <CardTitle>Rendimiento de Grupos</CardTitle>
                          <CardDescription>Promedio general por grupo en tus asignaturas.</CardDescription>
                      </CardHeader>
                      <CardContent>
                           <ChartContainer config={chartConfig} className="h-[250px] w-full">
                              <BarChart accessibilityLayer data={groupChartData}>
                                  <XAxis dataKey="group" tickLine={false} axisLine={false} tickMargin={8} angle={-10} textAnchor="end" height={50} />
                                  <YAxis domain={[5, 10]} />
                                  <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                  <Bar dataKey="average" fill="var(--color-average)" radius={4} />
                              </BarChart>
                          </ChartContainer>
                      </CardContent>
                  </Card>
                   <Card>
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Presentation className="h-5 w-5"/><span>Próximas Clases de Hoy</span></CardTitle>
                          <CardDescription>Resumen de tu jornada.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          {todayClasses.length > 0 ? (
                              <div className="space-y-4">
                                  {todayClasses.map(cls => (
                                      <div key={cls.time} className="flex items-center gap-3">
                                          <div className="flex items-center justify-center rounded-md bg-primary/10 text-primary p-2 mr-2">
                                              <span className="font-mono text-sm">{cls.time}</span>
                                          </div>
                                          <div>
                                              <p className="font-medium leading-tight">{cls.subject}</p>
                                              <p className="text-sm text-muted-foreground">{cls.group}</p>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          ) : (
                              <p className="text-muted-foreground text-center py-8">No tienes clases programadas para hoy.</p>
                          )}
                      </CardContent>
                  </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="alumno">
          <Card>
            <CardHeader className="flex justify-between items-start">
              <div>
                <CardTitle>Panel del Alumno</CardTitle>
                <CardDescription>
                  Información consolidada relevante para los alumnos.
                </CardDescription>
              </div>
              <Link href="/dashboard/alumno" passHref>
                  <Button>Ir al Dashboard del Alumno</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex h-48 items-center justify-center rounded-md border border-dashed">
                  <p className="text-muted-foreground">El contenido del panel del alumno irá aquí.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="administrativo">
          <Card>
              <CardHeader>
                  <div className="flex items-center justify-between">
                      <CardTitle>Panel del Administrativo</CardTitle>
                      <p className="text-muted-foreground text-sm">Resumen de la actividad del día</p>
                  </div>
                  <CardDescription>
                    Información consolidada y herramientas para la gestión diaria del personal administrativo.
                  </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Card className="hover:border-primary transition-colors">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Padres por Atender</CardTitle>
                              <UsersIcon className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                              <div className="text-2xl font-bold">5</div>
                              <p className="text-xs text-muted-foreground">2 citas programadas para hoy</p>
                          </CardContent>
                      </Card>
                      <Card className="hover:border-primary transition-colors">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                              <div className="text-2xl font-bold">12</div>
                              <p className="text-xs text-muted-foreground">Total de $3,450.00 MXN</p>
                          </CardContent>
                      </Card>
                      <Card className="hover:border-primary transition-colors">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Documentos por Revisar</CardTitle>
                              <FileSearch className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                              <div className="text-xl font-bold">8</div>
                              <p className="text-xs text-muted-foreground">3 son de alta prioridad</p>
                          </CardContent>
                      </Card>
                      <Card className="bg-primary text-primary-foreground">
                          <CardHeader className="pb-2">
                              <CardTitle className="text-lg font-semibold flex items-center gap-2"><CalendarPlus className="h-5 w-5"/><span>Agendar Cita</span></CardTitle>
                              <CardDescription className="text-primary-foreground/80">Programa una nueva reunión con un padre.</CardDescription>
                          </CardHeader>
                          <CardContent>
                              <Link href="/dashboard/administrativo/agenda">
                                  <Button variant="secondary" className="w-full">
                                      Ir a la Agenda <ArrowRight className="ml-2 h-4 w-4" />
                                  </Button>
                              </Link>
                          </CardContent>
                      </Card>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                      <Card>
                          <CardHeader>
                              <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Últimos Comunicados</CardTitle>
                              <CardDescription>Resumen de los últimos anuncios enviados.</CardDescription>
                          </CardHeader>
                          <CardContent>
                              <div className="flex h-full min-h-[150px] items-center justify-center rounded-md border border-dashed">
                                  <p className="text-muted-foreground">No se han enviado comunicados recientemente.</p>
                              </div>
                          </CardContent>
                      </Card>
                      <Card>
                          <CardHeader>
                              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Informe de Actividad</CardTitle>
                              <CardDescription>Resumen de la gestión semanal.</CardDescription>
                          </CardHeader>
                          <CardContent>
                              <div className="flex h-full min-h-[150px] items-center justify-center rounded-md border border-dashed">
                                  <p className="text-muted-foreground">Los datos para el informe se están generando.</p>
                              </div>
                          </CardContent>
                      </Card>
                  </div>
              </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tutor">
          <Card>
            <CardHeader>
              <CardTitle>Panel del Tutor</CardTitle>
              <CardDescription>
                Información consolidada relevante para los tutores (padres de familia).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
               <div className="flex h-48 items-center justify-center rounded-md border border-dashed">
                  <p className="text-muted-foreground">El contenido del panel del tutor irá aquí.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
