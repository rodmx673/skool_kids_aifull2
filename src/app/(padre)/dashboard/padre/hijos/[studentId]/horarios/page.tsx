"use client";

import { useContext, useMemo } from "react";
import { useParams } from "next/navigation";
import { UserContext } from "@/context/UserContext";
import { AcademicContext } from "@/context/AcademicContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { CalendarOff } from "lucide-react";

const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

export default function StudentMirrorHorarioPage() {
  const params = useParams();
  const studentId = params.studentId as string;
  const { users } = useContext(UserContext);
  const { certifiedSchedules, scheduleTemplates, careers } = useContext(AcademicContext);
  
  const student = useMemo(() => users.find(u => u.id === studentId), [users, studentId]);

  const studentSchedule = useMemo(() => {
    if (!student || !student.careerId || !student.level || !student.group) return null;

    const groupKey = `${student.careerId}-${student.level}-${student.group}`;
    const schedule = certifiedSchedules[groupKey];
    
    if (!schedule) return null;
    
    const career = careers.find(c => c.id === student.careerId);
    const group = career?.groups.find(g => g.name === student.group);
    const templateId = group?.scheduleTemplateId;
    const activeTemplate = scheduleTemplates.find(t => t.id === templateId) || scheduleTemplates[0];

    return { schedule, template: activeTemplate };
  }, [student, certifiedSchedules, careers, scheduleTemplates]);

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Horario de Clases - Grupo {student?.group || 'N/A'}</CardTitle>
                <CardDescription>Este es el horario certificado del alumno.</CardDescription>
            </CardHeader>
            <CardContent>
                {studentSchedule ? (
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Hora</TableHead>
                                    {daysOfWeek.map(day => <TableHead key={day}>{day}</TableHead>)}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {studentSchedule.template.timeSlots.map(slot => {
                                    if (slot.type === "recess") {
                                        return (
                                            <TableRow key={slot.time} className="bg-muted/50">
                                                <TableCell className="font-medium text-muted-foreground">{slot.time}<br/>(Receso)</TableCell>
                                                <TableCell colSpan={5} className="text-center font-semibold text-muted-foreground">RECESO</TableCell>
                                            </TableRow>
                                        )
                                    }
                                    return (
                                        <TableRow key={slot.time}>
                                            <TableCell className="font-medium text-muted-foreground">{slot.time}</TableCell>
                                            {daysOfWeek.map(day => {
                                                const block = studentSchedule.schedule[day]?.[slot.time];
                                                return (
                                                    <TableCell key={`${day}-${slot.time}`} className={cn("p-1 h-[70px]", !block && "bg-muted/30")}>
                                                    {block ? (
                                                        <div style={{ backgroundColor: block.color }} className="w-full h-full rounded-md p-2 text-white flex flex-col justify-center">
                                                        <p className="text-sm font-bold leading-tight">{block.subject}</p>
                                                        </div>
                                                    ) : null}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 gap-2 text-center border-2 border-dashed rounded-lg">
                        <CalendarOff className="h-12 w-12 text-muted-foreground" />
                        <h3 className="font-semibold">Sin Horario Asignado</h3>
                        <p className="text-muted-foreground text-sm">El horario del alumno aparecerá aquí una vez que sea certificado.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}