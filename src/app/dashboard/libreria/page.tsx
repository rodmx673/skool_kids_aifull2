
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Library, Target, CheckCircle, Folder, Tags, ChevronRight, File } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useContext } from "react";
import { AcademicContext, Subject } from "@/context/AcademicContext";
import Link from 'next/link';
import { Button } from "@/components/ui/button";

export default function LibreriaPage() {
  const { careers, subjects, academicPeriodOptions } = useContext(AcademicContext);

  const getSubjectsForCareerAndPeriod = (careerId: string, period: string) => {
    const periodKey = `${careerId}-${period}`;
    return subjects.filter(s => s.period === periodKey);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Librería de Contenidos Académicos</h1>
        <p className="text-muted-foreground">
          Consulta los planes de estudio oficiales por carrera y asignatura.
        </p>
      </div>

      {careers.length > 0 ? (
        <Accordion type="multiple" className="w-full space-y-4">
          {careers.map(career => (
            <AccordionItem value={career.id} key={career.id} className="border rounded-lg bg-card">
              <AccordionTrigger className="p-6 hover:no-underline">
                <div className="flex items-center gap-4">
                  <Folder className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold text-left">{career.name}</h3>
                    <p className="text-sm text-muted-foreground text-left">Explorar asignaturas de esta carrera.</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <Accordion type="multiple" className="w-full space-y-2">
                  {academicPeriodOptions.map(period => {
                    const periodSubjects = getSubjectsForCareerAndPeriod(career.id, period.value);
                    if (periodSubjects.length === 0) return null;

                    return (
                        <AccordionItem value={`${career.id}-${period.value}`} key={`${career.id}-${period.value}`} className="border-none">
                            <AccordionTrigger className="p-4 bg-background border rounded-lg hover:no-underline">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="h-5 w-5 text-primary"/>
                                    <div className="flex flex-col text-left">
                                        <span className="font-semibold">{period.label}</span>
                                        <span className="text-xs font-normal text-muted-foreground">{periodSubjects.length} asignatura(s)</span>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 pt-2">
                                <div className="pl-8 border-l-2 border-dashed border-primary/50 space-y-2">
                                   {periodSubjects.map(subject => (
                                        <div key={subject.name} className="p-3 border rounded-md bg-background flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                            <div className="flex items-center gap-3">
                                                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }}></div>
                                                 <span className="font-semibold">{subject.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 self-end sm:self-center">
                                                <Badge variant="secondary">{subject.hoursPerWeek} hrs/sem</Badge>
                                                {subject.pdfUrl && (
                                                    <a href={subject.pdfUrl} target="_blank" rel="noopener noreferrer">
                                                        <Button variant="outline" size="sm">
                                                            <File className="h-3 w-3 mr-1" />
                                                            Ver PDF
                                                        </Button>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                   ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )
                  })}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 gap-2 text-center border-2 border-dashed rounded-lg">
            <Library className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="font-semibold">No hay Contenidos en la Librería</h3>
            <p className="text-muted-foreground text-sm">
                No hay carreras definidas. Primero debe crear una carrera en la sección de <Link href="/dashboard/settings?tab=academico" className="text-primary underline">configuración académica</Link>.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
