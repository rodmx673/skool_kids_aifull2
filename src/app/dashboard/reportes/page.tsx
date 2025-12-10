
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BarChart3, PlusCircle, BookUser, Shield, GraduationCap, User, Users, FileSignature, BookCheck, ClipboardList, CalendarCheck, MoreHorizontal, Eye, Edit, Trash2, Settings, Folder, Calendar, MessageSquare } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";


type SavedReport = {
    id: string;
    name: string;
    source: string;
    createdAt: string;
    type: 'Tabla' | 'Gráfico' | 'Mixto';
};

const mockSavedReports: SavedReport[] = [
    { id: 'rep-001', name: 'Rendimiento Académico General - 4A', source: 'Docente > Calificaciones', createdAt: '2024-10-26', type: 'Gráfico' },
    { id: 'rep-002', name: 'Historial de Circulares (Q3)', source: 'Admin > Circulares', createdAt: '2024-10-25', type: 'Tabla' },
    { id: 'rep-003', name: 'Asistencias de Alumnos - Octubre', source: 'Admin > Gestión Escolar', createdAt: '2024-10-24', type: 'Mixto' },
];

export default function ReportesPage() {
    const [savedReports, setSavedReports] = useState(mockSavedReports);
    const { toast } = useToast();

    const handleGenerateReport = (source: string) => {
        toast({
            title: "Generando Reporte...",
            description: `Se están recopilando los datos de: ${source}.`
        });
        // Aquí iría la lógica para generar y mostrar el reporte
    };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Generador de Reportes</h1>
          <p className="text-muted-foreground">
            Crea, visualiza y gestiona reportes personalizados de toda la plataforma.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
              <Button className="w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Crear Nuevo Reporte
              </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
              <DropdownMenuLabel>Seleccionar Origen de Datos</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Administrador */}
              <DropdownMenuSub>
                  <DropdownMenuSubTrigger><Shield className="mr-2 h-4 w-4" /><span>Portal Administrador</span></DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => handleGenerateReport('Admin > Gestión Escolar')}>
                          <Users className="mr-2 h-4 w-4" /> Gestión Escolar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleGenerateReport('Admin > Circulares')}>
                          <FileSignature className="mr-2 h-4 w-4" /> Circulares
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleGenerateReport('Admin > Calendario')}>
                          <Calendar className="mr-2 h-4 w-4" /> Calendario
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleGenerateReport('Admin > Mensajería')}>
                          <MessageSquare className="mr-2 h-4 w-4" /> Mensajería
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger><Settings className="mr-2 h-4 w-4"/>Settings</DropdownMenuSubTrigger>
                         <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => handleGenerateReport('Admin > Settings > Profile')}>Profile</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleGenerateReport('Admin > Settings > Institution')}>Institución</DropdownMenuItem>
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger>Académico</DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                  <DropdownMenuItem onClick={() => handleGenerateReport('Admin > Settings > Académico > Carreras')}>Gestión de Carreras</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleGenerateReport('Admin > Settings > Académico > Asignaturas')}>Gestión de Asignaturas</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleGenerateReport('Admin > Settings > Académico > Distribución')}>Distribución Académica</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleGenerateReport('Admin > Settings > Académico > Plantilla')}>Plantilla de Horarios</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleGenerateReport('Admin > Settings > Académico > Reglas')}>Reglas y Restricciones</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleGenerateReport('Admin > Settings > Académico > Horarios Fijos')}>Horarios Fijos</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleGenerateReport('Admin > Settings > Académico > Horario')}>Generador de Horario</DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuItem onClick={() => handleGenerateReport('Admin > Settings > Data Lake')}>Data Lake</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleGenerateReport('Admin > Settings > Plantillas')}>Plantillas</DropdownMenuItem>
                         </DropdownMenuSubContent>
                      </DropdownMenuSub>
                  </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* Docente */}
              <DropdownMenuSub>
                  <DropdownMenuSubTrigger><BookUser className="mr-2 h-4 w-4" /><span>Portal Docente</span></DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => handleGenerateReport('Docente > Mis Grupos')}>
                          <Users className="mr-2 h-4 w-4" /> Mis Grupos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleGenerateReport('Docente > Circulares')}>
                          <FileSignature className="mr-2 h-4 w-4" /> Circulares
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleGenerateReport('Docente > Tareas')}>
                          <BookCheck className="mr-2 h-4 w-4" /> Tareas
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleGenerateReport('Docente > Calificaciones')}>
                          <ClipboardList className="mr-2 h-4 w-4" /> Calificaciones
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleGenerateReport('Docente > Asistencias')}>
                          <CalendarCheck className="mr-2 h-4 w-4" /> Asistencias
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => handleGenerateReport('Docente > Mi Horario')}>
                          <Calendar className="mr-2 h-4 w-4" /> Mi Horario
                      </DropdownMenuItem>
                  </DropdownMenuSubContent>
              </DropdownMenuSub>
              
              {/* Alumno */}
              <DropdownMenuSub>
                  <DropdownMenuSubTrigger><GraduationCap className="mr-2 h-4 w-4" /><span>Portal Alumno</span></DropdownMenuSubTrigger>
                   <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => handleGenerateReport('Alumno > Tareas')}>Mis Tareas</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleGenerateReport('Alumno > Calificaciones')}>Calificaciones</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleGenerateReport('Alumno > Asistencias')}>Asistencias</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleGenerateReport('Alumno > Horario')}>Mi Horario</DropdownMenuItem>
                  </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* Tutor */}
               <DropdownMenuSub>
                  <DropdownMenuSubTrigger><User className="mr-2 h-4 w-4" /><span>Portal Tutor</span></DropdownMenuSubTrigger>
                   <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => handleGenerateReport('Tutor > Rendimiento por Hijo')}>Rendimiento por Hijo</DropdownMenuItem>
                   </DropdownMenuSubContent>
              </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
          <CardHeader>
              <CardTitle>Reportes Guardados</CardTitle>
              <CardDescription>Aquí puedes ver, editar y volver a generar los reportes que has creado.</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="border rounded-lg overflow-x-auto">
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Nombre del Reporte</TableHead>
                              <TableHead>Origen de Datos</TableHead>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Fecha de Creación</TableHead>
                              <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {savedReports.length > 0 ? savedReports.map(report => (
                              <TableRow key={report.id}>
                                  <TableCell className="font-medium">{report.name}</TableCell>
                                  <TableCell><Badge variant="outline">{report.source}</Badge></TableCell>
                                  <TableCell><Badge variant="secondary">{report.type}</Badge></TableCell>
                                  <TableCell>{report.createdAt}</TableCell>
                                  <TableCell className="text-right">
                                      <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                              <DropdownMenuItem><Eye className="mr-2 h-4 w-4"/>Ver Reporte</DropdownMenuItem>
                                              <DropdownMenuItem><Edit className="mr-2 h-4 w-4"/>Editar Nombre</DropdownMenuItem>
                                              <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Eliminar</DropdownMenuItem>
                                          </DropdownMenuContent>
                                      </DropdownMenu>
                                  </TableCell>
                              </TableRow>
                          )) : (
                              <TableRow>
                                  <TableCell colSpan={5} className="h-24 text-center">
                                      No has guardado ningún reporte. ¡Crea uno nuevo para empezar!
                                  </TableCell>
                              </TableRow>
                          )}
                      </TableBody>
                  </Table>
              </div>
          </CardContent>
      </Card>

      <Card className="bg-muted/30">
          <CardHeader>
              <CardTitle>Vista Previa del Reporte</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center min-h-[300px] text-center border-2 border-dashed rounded-lg">
              <div>
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Genera un reporte para verlo aquí</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Selecciona una opción desde el botón "Crear Nuevo Reporte".</p>
              </div>
          </CardContent>
      </Card>

    </div>
  );
}
