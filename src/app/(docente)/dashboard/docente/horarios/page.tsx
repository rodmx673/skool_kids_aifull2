"use client";

import { useContext, useMemo } from "react";
import { UserContext } from "@/context/UserContext";
import { AcademicContext } from "@/context/AcademicContext";
import { TeacherContext } from "@/context/TeacherContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { CalendarOff } from "lucide-react";

const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

export default function DocenteHorarioPage() {
  const { currentUser } = useContext(UserContext);
  const { certifiedSchedules, scheduleTemplates, careers } = useContext(AcademicContext);
  const { teachers } = useContext(TeacherContext);

  const teacherSchedule = useMemo(() => {
    if (!currentUser) return null;

    const schedule: { [day: string]: { [time: string]: { subject: string; group: string; color: string } } } = {};
    daysOfWeek.forEach(day => schedule[day] = {});
    
    let templateId: string | null = null;

    Object.entries(certifiedSchedules).forEach(([groupKey, groupSchedule]) => {
      const [careerId, level, groupName] = groupKey.split('-');
      
      if (!templateId) {
          const career = careers.find(c => c.id === careerId);
          const group = career?.groups.find(g => g.name === groupName);
          if (group) {
              templateId = group.scheduleTemplateId;
          }
      }

      Object.entries(groupSchedule).forEach(([day, daySchedule]) => {
        Object.entries(daySchedule).forEach(([time, block]) => {
          if (block && block.teacher === currentUser.id) {
            if (!schedule[day]) schedule[day] = {};
            schedule[day][time] = { ...block, group: groupName };
          }
        });
      });
    });

    const activeTemplate = scheduleTemplates.find(t => t.id === templateId) || scheduleTemplates[0];

    return { schedule, template: activeTemplate };
  }, [currentUser, certifiedSchedules, careers, scheduleTemplates]);

  return (
      <Card>
        <CardHeader>
          <CardTitle>Mi Horario de Clases</CardTitle>
          <CardDescription>Este es tu horario consolidado basado en los horarios certificados de tus grupos.</CardDescription>
        </CardHeader>
        <CardContent>
          {teacherSchedule && Object.values(teacherSchedule.schedule).some(day => Object.keys(day).length > 0) ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Hora</TableHead>
                    {daysOfWeek.map(day => <TableHead key={day}>{day}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherSchedule.template.timeSlots.map(slot => {
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
                          const block = teacherSchedule.schedule[day]?.[slot.time];
                          return (
                            <TableCell key={`${day}-${slot.time}`} className={cn("p-1 h-[70px]", !block && "bg-muted/30")}>
                              {block ? (
                                <div style={{ backgroundColor: block.color }} className="w-full h-full rounded-md p-2 text-white flex flex-col justify-center">
                                  <p className="text-sm font-bold leading-tight">{block.subject}</p>
                                  <p className="text-xs leading-tight">Grupo: {block.group}</p>
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
              <h3 className="font-semibold">No tienes un horario asignado</h3>
              <p className="text-muted-foreground text-sm">Tu horario aparecerá aquí una vez que el administrador lo haya certificado.</p>
            </div>
          )}
        </CardContent>
      </Card>
  );
}
