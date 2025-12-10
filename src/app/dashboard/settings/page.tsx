

"use client";

import { useContext, useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from 'next/link';
import QRCode from "react-qr-code";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator, SelectGroup, SelectLabel } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ConnectionStatus } from "@/components/connection-status";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ThemeContext } from "@/context/ThemeContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Institution, InstitutionContext, Department, DataLakeFolder } from "@/context/InstitutionContext";
import { AcademicContext, Subject, Distribution, WeeklyHourGoals, DistributionByPeriod, TimeSlot, GeneratedSchedules, GroupSchedule, ScheduleBlockData, Career, AcademicPeriodOption, ScheduleTemplate, CareerGroup } from "@/context/AcademicContext";
import { TeacherContext, Teacher, Availability } from "@/context/TeacherContext";
import { FixedScheduleContext, FixedSchedule } from '@/context/FixedScheduleContext';
import { TemplateContext, DocumentType, Template } from "@/context/TemplateContext";
import { UserContext, User } from "@/context/UserContext";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ArrowLeft, BookOpen, CalendarCog, Download, AlertCircle, Copy, Lock, Loader2, CalendarCheck, CalendarDays, Unlock, Upload, FilePlus, ArrowRight, Wand2, Mail, GraduationCap, Landmark, Wrench, Printer, Code, HardHat, Library, FileText, Settings as SettingsIcon, FileKey, Eye, Save, Bot, Shield, FileSignature, Calendar, MessageSquare, BookUser, BookCheck, ClipboardList, Palette, ChevronDown, Folder, Pencil, Trash2, Search, PlusCircle, Users, Edit
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

const passwordFormSchema = z.object({
    newPassword: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
});
type PasswordFormValues = z.infer<typeof passwordFormSchema>;


type EditingSubjectState = {
  isEditing: boolean;
  originalName: string;
  originalPeriod: string;
  subject: Partial<Subject> | null;
};

const initialEditingSubjectState: EditingSubjectState = {
  isEditing: false,
  originalName: '',
  originalPeriod: '',
  subject: null
};

type SelectedBlock = {
  data: ScheduleBlockData;
  origin:
    | { type: "grid"; day: string; time: string }
    | { type: "unassigned"; index: number };
};

// --- Helper Components ---

function ScheduleBlock({ 
  subject, 
  teacher, 
  color, 
  group,
  isSelected, 
  onClick 
}: ScheduleBlockData & { isSelected?: boolean; onClick?: () => void; group?: string; }) {
  const { teachers } = useContext(TeacherContext);
  const teacherName = useMemo(() => {
    const foundTeacher = teachers.find(t => t.id === teacher);
    return foundTeacher ? foundTeacher.name : teacher;
  }, [teachers, teacher]);

  return (
    <div
      onClick={onClick}
      className={cn(
        "w-full h-full rounded-md p-2 text-white flex flex-col justify-center cursor-pointer transition-all",
        isSelected && "ring-2 ring-offset-2 ring-blue-500 shadow-lg"
      )}
      style={{ backgroundColor: color }}
    >
      <p className="text-sm font-bold leading-tight">{subject}</p>
      <p className="text-xs leading-tight">{group ? `${teacherName}` : teacherName}</p>
    </div>
  );
}

function SubjectTable({ careerId }: { careerId: string }) {
    const { subjects, addSubject, updateSubject, deleteSubject, addMultipleSubjects } = useContext(AcademicContext);
    const [editingSubject, setEditingSubject] = useState<EditingSubjectState>(initialEditingSubjectState);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);
    const [pdfSubject, setPdfSubject] = useState<Subject | null>(null);

    const { academicPeriodOptions } = useContext(AcademicContext);
    const [selectedPeriod, setSelectedPeriod] = useState<string>(academicPeriodOptions[0]?.value || '1');

    const handleSaveSubject = () => {
        if (!editingSubject.subject?.name || !editingSubject.subject.period) {
            toast({ variant: 'destructive', title: 'Error', description: 'Nombre y período son obligatorios.' });
            return;
        }

        const finalSubject: Partial<Subject> = {
            name: editingSubject.subject.name,
            hoursPerWeek: Number(editingSubject.subject.hoursPerWeek) || 0,
            period: editingSubject.subject.period,
            color: editingSubject.subject.color || `#${Math.floor(Math.random()*16777215).toString(16)}`,
            isSpecialty: !!editingSubject.subject.isSpecialty,
        };

        if (editingSubject.isEditing) {
            updateSubject(editingSubject.originalName, editingSubject.originalPeriod, finalSubject);
            toast({ title: 'Asignatura Actualizada' });
        } else {
            addSubject(finalSubject as Subject);
            toast({ title: 'Asignatura Creada' });
        }
        setEditingSubject(initialEditingSubjectState);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const data = JSON.parse(text);
                if (!Array.isArray(data)) throw new Error('El JSON debe ser un array de asignaturas.');

                const newSubjects: Subject[] = data.map((item: any) => ({
                    name: item.nombre,
                    hoursPerWeek: item.horas_semanales,
                    period: `${careerId}-${selectedPeriod}`, // Use selected semester
                    color: item.color || `#${Math.floor(Math.random()*16777215).toString(16)}`,
                    isSpecialty: item.es_especialidad ?? false,
                }));

                addMultipleSubjects(newSubjects);
                toast({ title: 'Carga Masiva Exitosa', description: `${newSubjects.length} asignaturas han sido procesadas para el semestre seleccionado.` });

            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error al cargar archivo', description: error.message });
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };
    
    const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && pdfSubject) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const pdfUrl = reader.result as string;
                updateSubject(pdfSubject.name, pdfSubject.period, { pdfUrl });
                toast({ title: 'PDF Guardado', description: `El plan de estudios para "${pdfSubject.name}" se ha guardado.` });
            };
            reader.onerror = () => {
                toast({ variant: 'destructive', title: 'Error', description: 'No se pudo leer el archivo PDF.' });
            };
            reader.readAsDataURL(file);
        }
        setPdfSubject(null);
        if (pdfInputRef.current) pdfInputRef.current.value = '';
    };

    const currentPeriodSubjects = useMemo(() => {
        return subjects.filter(s => s.period === `${careerId}-${selectedPeriod}`);
    }, [subjects, careerId, selectedPeriod]);

    return (
        <div className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-center gap-2">
                    <Label>Semestre:</Label>
                     <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {academicPeriodOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Carga Masiva (JSON)
                    </Button>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileUpload} />
                     <input type="file" ref={pdfInputRef} className="hidden" accept=".pdf" onChange={handlePdfUpload} />
                    <Button size="sm" className="flex-1" onClick={() => setEditingSubject({ ...initialEditingSubjectState, subject: { name: '', hoursPerWeek: 0, period: `${careerId}-${selectedPeriod}`, color: `#${Math.floor(Math.random()*16777215).toString(16)}`, isSpecialty: false } })}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir Asignatura
                    </Button>
                </div>
            </div>
            
            {editingSubject.subject && !editingSubject.isEditing && (
                 <Card className="my-4">
                    <CardHeader><CardTitle>Nueva Asignatura para {academicPeriodOptions.find(o => o.value === selectedPeriod)?.label}</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input placeholder="Nombre" value={editingSubject.subject.name} onChange={e => setEditingSubject(prev => ({ ...prev, subject: { ...prev.subject!, name: e.target.value } }))} />
                            <Input type="number" placeholder="Horas/Semana" value={editingSubject.subject.hoursPerWeek} onChange={e => setEditingSubject(prev => ({ ...prev, subject: { ...prev.subject!, hoursPerWeek: Number(e.target.value) } }))} />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="is-specialty-new" checked={editingSubject.subject.isSpecialty} onCheckedChange={checked => setEditingSubject(prev => ({ ...prev, subject: { ...prev.subject!, isSpecialty: !!checked } }))} />
                            <Label htmlFor="is-specialty-new">Es de especialidad</Label>
                        </div>
                         <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setEditingSubject(initialEditingSubjectState)}>Cancelar</Button>
                            <Button size="sm" onClick={handleSaveSubject}>Guardar Asignatura</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="border rounded-lg mt-4">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Asignatura</TableHead>
                            <TableHead>Horas/Semana</TableHead>
                            <TableHead>Especialidad</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentPeriodSubjects.map(s => (
                            editingSubject.isEditing && editingSubject.originalName === s.name && editingSubject.originalPeriod === s.period ? (
                                <TableRow key={`${s.name}-${s.period}`}>
                                    <TableCell><Input value={editingSubject.subject!.name} onChange={e => setEditingSubject(prev => ({ ...prev, subject: { ...prev.subject!, name: e.target.value } }))} /></TableCell>
                                    <TableCell><Input type="number" value={editingSubject.subject!.hoursPerWeek} onChange={e => setEditingSubject(prev => ({ ...prev, subject: { ...prev.subject!, hoursPerWeek: Number(e.target.value) } }))} className="w-20"/></TableCell>
                                    <TableCell><Checkbox checked={editingSubject.subject!.isSpecialty} onCheckedChange={checked => setEditingSubject(prev => ({ ...prev, subject: { ...prev.subject!, isSpecialty: !!checked } }))} /></TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" onClick={handleSaveSubject}>Guardar</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setEditingSubject(initialEditingSubjectState)}>Cancelar</Button>
                                    </TableCell>
                                </TableRow>
                            ) : (
                            <TableRow key={`${s.name}-${s.period}`}>
                                <TableCell className="font-medium flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></div>{s.name}</TableCell>
                                <TableCell>{s.hoursPerWeek}</TableCell>
                                <TableCell>{s.isSpecialty ? <Badge>Especialidad</Badge> : <Badge variant="outline">Tronco Común</Badge>}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" className="mr-2" onClick={() => { setPdfSubject(s); pdfInputRef.current?.click();}}>
                                        <Upload className="h-3 w-3 mr-1" />
                                        PDF
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setEditingSubject({ isEditing: true, originalName: s.name, originalPeriod: s.period, subject: { ...s } })}><Pencil className="h-4 w-4" /></Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>¿Eliminar Asignatura?</AlertDialogTitle><AlertDialogDescription>Se eliminará "{s.name}" del semestre correspondiente.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => deleteSubject(s.name, s.period)}>Eliminar</AlertDialogAction></AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                            )
                        ))}
                         {currentPeriodSubjects.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                    No hay asignaturas definidas para este semestre.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function DistributionTable({ career }: { career: Career }) {
    const { subjects, academicPeriodOptions, distribution, setDistribution } = useContext(AcademicContext);
    const { teachers } = useContext(TeacherContext);
    const [selectedPeriod, setSelectedPeriod] = useState<string>(academicPeriodOptions[0]?.value || '1');
    const { toast } = useToast();

    const [localDistribution, setLocalDistribution] = useState<Distribution[]>([]);
    
    const distributionKey = useMemo(() => `${career.id}-${selectedPeriod}`, [career.id, selectedPeriod]);

    useEffect(() => {
        setLocalDistribution(distribution[distributionKey] || []);
    }, [distribution, distributionKey]);

    const assignedHoursPerTeacher = useMemo(() => {
        const hoursCount: { [teacherId: string]: number } = {};
        teachers.forEach(t => hoursCount[t.id] = 0);

        Object.keys(distribution).forEach(periodKey => {
            const periodData = distribution[periodKey];
            if (Array.isArray(periodData)) { // Safety check
                periodData.forEach(dist => {
                    // Exclude subjects from the currently edited distribution to get a "base" load
                    const isCurrentSubject = periodKey === distributionKey && localDistribution.some(localDist => localDist.subjectName === dist.subjectName);
                    if (isCurrentSubject) return; 

                    Object.values(dist.teacherIds).forEach(teacherId => {
                        if (teacherId && hoursCount.hasOwnProperty(teacherId)) {
                            hoursCount[teacherId] += dist.hours;
                        }
                    });
                });
            }
        });

        // Now, add hours from the currently edited local distribution
        localDistribution.forEach(dist => {
            Object.values(dist.teacherIds).forEach(teacherId => {
                if (teacherId && hoursCount.hasOwnProperty(teacherId)) {
                    hoursCount[teacherId] += dist.hours;
                }
            });
        });

        return hoursCount;
    }, [distribution, localDistribution, teachers, distributionKey]);


    const handleDistributionChange = (rowIndex: number, groupName: string, teacherId: string) => {
        setLocalDistribution(prev => {
            const newDist = [...prev];
            const subjectDist = newDist[rowIndex];
            if (subjectDist) {
                subjectDist.teacherIds = {
                    ...subjectDist.teacherIds,
                    [groupName]: teacherId === 'unassigned' ? '' : teacherId
                };
            }
            return newDist;
        });
    };

    const handleSubjectChange = (rowIndex: number, subjectName: string) => {
        const subject = subjects.find(s => s.name === subjectName && s.period === `${career.id}-${selectedPeriod}`);
        setLocalDistribution(prev => {
            const newDist = [...prev];
            if (!newDist[rowIndex]) newDist[rowIndex] = { subjectName: '', hours: 0, teacherIds: {} };
            newDist[rowIndex].subjectName = subjectName;
            newDist[rowIndex].hours = subject?.hoursPerWeek || 0;
            // Reset teacher assignments when subject changes
            newDist[rowIndex].teacherIds = {};
            return newDist;
        });
    };

    const handleAddSubjectRow = () => {
        setLocalDistribution(prev => [...prev, { subjectName: '', hours: 0, teacherIds: {} }]);
    };

    const handleRemoveSubjectRow = (rowIndex: number) => {
        setLocalDistribution(prev => prev.filter((_, index) => index !== rowIndex));
    };

    const handleSaveChanges = () => {
        setDistribution(prev => ({
            ...prev,
            [distributionKey]: localDistribution.filter(d => d.subjectName)
        }));
        toast({ title: 'Distribución Guardada', description: `Se guardaron los cambios para el ${selectedPeriod}° Semestre.` });
    };

    const periodSubjects = useMemo(() => {
        const usedSubjects = new Set(localDistribution.map(d => d.subjectName));
        const allPeriodSubjects = subjects.filter(s => s.period === `${career.id}-${selectedPeriod}`);
        
        return (currentSubjectName: string) => {
            return allPeriodSubjects.filter(s => s.name === currentSubjectName || !usedSubjects.has(s.name));
        };
    }, [subjects, career.id, selectedPeriod, localDistribution]);

    const getAvailableTeachers = (rowIndex: number, groupName: string) => {
        const currentSubjectDist = localDistribution[rowIndex];
        if (!currentSubjectDist || !currentSubjectDist.subjectName) return { qualified: [], others: [] };
        
        const currentTeacherId = currentSubjectDist.teacherIds[groupName];
        const subjectHours = currentSubjectDist.hours;

        const filterFn = (teacher: Teacher) => {
            let currentLoad = assignedHoursPerTeacher[teacher.id] || 0;
            // If the teacher being evaluated is the one currently assigned, subtract the subject's hours from their load to see if they *would* be available without this assignment.
            if (teacher.id === currentTeacherId) {
                currentLoad -= subjectHours;
            }
            return (currentLoad + subjectHours) <= teacher.maxHours;
        };

        const qualified = teachers
            .filter(t => t.qualifiedSubjects.includes(currentSubjectDist.subjectName))
            .filter(filterFn);

        const others = teachers
            .filter(t => !t.qualifiedSubjects.includes(currentSubjectDist.subjectName))
            .filter(filterFn);
            
        return { qualified, others };
    };

    const totalHoursPerGroup = useMemo(() => {
        const totals: { [group: string]: number } = {};
        (career.groups || []).forEach(g => totals[g.name] = 0);

        localDistribution.forEach(dist => {
            if (dist.subjectName) {
                (career.groups || []).forEach(group => {
                    if (dist.teacherIds[group.name]) {
                        totals[group.name] += dist.hours;
                    }
                });
            }
        });
        return totals;
    }, [localDistribution, career.groups]);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Distribución Académica por Grupo</CardTitle>
                <CardDescription>Asigne las materias definidas a los diferentes grupos y docentes para el semestre seleccionado.</CardDescription>
                <div className="pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className='flex items-center gap-2'>
                        <Label htmlFor="period-selector" className='shrink-0'>Seleccionar Semestre</Label>
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                            <SelectTrigger className="w-full sm:w-[180px]" id="period-selector"><SelectValue /></SelectTrigger>
                            <SelectContent>{academicPeriodOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]">Asignatura</TableHead>
                                <TableHead className="w-[100px]">Horas</TableHead>
                                {(career.groups || []).map(group => (
                                    <TableHead key={group.name} className="w-[250px]">Grupo {group.name}</TableHead>
                                ))}
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {localDistribution.map((dist, rowIndex) => {
                                return (
                                    <TableRow key={rowIndex}>
                                        <TableCell>
                                            <Select value={dist.subjectName} onValueChange={(value) => handleSubjectChange(rowIndex, value)}>
                                                <SelectTrigger><SelectValue placeholder="Seleccionar asignatura..." /></SelectTrigger>
                                                <SelectContent>
                                                    {periodSubjects(dist.subjectName).map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>{dist.hours}</TableCell>
                                        {(career.groups || []).map(group => {
                                            const assignedTeacherId = dist.teacherIds[group.name];
                                            const { qualified: availableQualified, others: availableOthers } = getAvailableTeachers(rowIndex, group.name);

                                            return (
                                                <TableCell key={group.name}>
                                                    <Select
                                                        value={assignedTeacherId || 'unassigned'}
                                                        onValueChange={(value) => handleDistributionChange(rowIndex, group.name, value)}
                                                        disabled={!dist.subjectName}
                                                    >
                                                        <SelectTrigger><SelectValue placeholder="Sin Asignar" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="unassigned">Sin asignar</SelectItem>
                                                            <SelectSeparator />
                                                            <SelectGroup>
                                                                <SelectLabel>Docentes Calificados</SelectLabel>
                                                                {availableQualified.map(t => <SelectItem key={t.id} value={t.id}>{`${t.name} (${(assignedHoursPerTeacher[t.id] || 0) - (assignedTeacherId === t.id ? dist.hours : 0)}/${t.maxHours})`}</SelectItem>)}
                                                            </SelectGroup>
                                                            <SelectSeparator />
                                                            <SelectGroup>
                                                                <SelectLabel>Otros Docentes</SelectLabel>
                                                                {availableOthers.map(t => <SelectItem key={t.id} value={t.id}>{`${t.name} (${(assignedHoursPerTeacher[t.id] || 0) - (assignedTeacherId === t.id ? dist.hours : 0)}/${t.maxHours})`}</SelectItem>)}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveSubjectRow(rowIndex)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                        <TableRow className="bg-muted/50">
                            <TableCell colSpan={2} className="text-right font-bold">Total Horas/Grupo:</TableCell>
                            {(career.groups || []).map(group => (
                                <TableCell key={group.name} className="font-bold">{totalHoursPerGroup[group.name]} hrs</TableCell>
                            ))}
                            <TableCell></TableCell>
                        </TableRow>
                    </Table>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <Button variant="outline" onClick={handleAddSubjectRow}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Agregar Asignatura
                    </Button>
                    <Button onClick={handleSaveChanges}>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Distribución del Semestre
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function CareerManager({ career, onEditCareer, deleteCareer }: { career: Career, onEditCareer: (career: Career) => void, deleteCareer: (id: string) => void }) {
  const { updateCareerGroup, scheduleTemplates, addCareerGroup, deleteCareerGroup } = useContext(AcademicContext);
  const { toast } = useToast();
  const [editingGroup, setEditingGroup] = useState<{name: string, newName: string} | null>(null);

  const handleSaveGroupName = () => {
    if (!editingGroup || !editingGroup.newName.trim()) return;
    updateCareerGroup(career.id, editingGroup.name, editingGroup.newName);
    toast({ title: "Grupo renombrado" });
    setEditingGroup(null);
  };
  
    const handleAddGroup = () => {
        addCareerGroup(career.id, scheduleTemplates[0]?.id || 'turno-matutino');
    };
    
    const handleSaveGroupTurn = (groupName: string, scheduleTemplateId: string) => {
        updateCareerGroup(career.id, groupName, scheduleTemplateId);
        toast({title: "Turno actualizado", description: `Se guardó el turno para el Grupo ${groupName}.`});
    }

  return (
    <Collapsible key={career.id} className="border rounded-lg">
      <div className="flex items-center justify-between p-4">
        <CollapsibleTrigger asChild>
            <div className="flex items-center gap-4 cursor-pointer group">
              <Folder className="h-6 w-6 text-primary" />
              <div className="flex-1">
                  <p className="text-lg font-semibold">{career.name}</p>
                  <p className="text-sm text-muted-foreground">{(career.groups || []).length} grupos</p>
              </div>
              <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </div>
        </CollapsibleTrigger>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEditCareer(career)}><Pencil className="h-4 w-4"/></Button>
            <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>¿Está seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción eliminará la carrera "{career.name}" y todas sus asignaturas y grupos asociados. Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => deleteCareer(career.id)}>Eliminar</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>
      <CollapsibleContent>
        <div className="bg-muted/50 p-4">
            <Tabs defaultValue="asignaturas" className="w-full">
                <TabsList>
                    <TabsTrigger value="asignaturas">Asignaturas</TabsTrigger>
                    <TabsTrigger value="grupos">Grupos</TabsTrigger>
                    <TabsTrigger value="distribucion">Distribución de Asignaturas</TabsTrigger>
                </TabsList>
                <TabsContent value="asignaturas">
                    <SubjectTable careerId={career.id} />
                </TabsContent>
                <TabsContent value="grupos" className="pt-4">
                    <Card>
                        <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div>
                                <CardTitle>Gestión de Grupos</CardTitle>
                                <CardDescription>Añade, edita y asigna turnos a los grupos de la carrera.</CardDescription>
                            </div>
                             <Button onClick={handleAddGroup} size="sm" className='w-full sm:w-auto'>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Agregar Grupo
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre del Grupo</TableHead>
                                        <TableHead>Turno Asignado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(career.groups || []).map(group => (
                                        <TableRow key={group.name}>
                                            <TableCell>
                                                {editingGroup?.name === group.name ? (
                                                    <Input value={editingGroup.newName} onChange={(e) => setEditingGroup({...editingGroup, newName: e.target.value})} className="h-8" autoFocus onBlur={handleSaveGroupName}/>
                                                ) : (
                                                    `Grupo ${group.name}`
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Select value={group.scheduleTemplateId} onValueChange={(value) => handleSaveGroupTurn(group.name, value)}>
                                                    <SelectTrigger className="w-[250px]"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {scheduleTemplates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingGroup({name: group.name, newName: group.name})}><Pencil className="h-4 w-4"/></Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>¿Eliminar Grupo?</AlertDialogTitle><AlertDialogDescription>Se eliminará el Grupo {group.name} y todas sus asignaciones.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => deleteCareerGroup(career.id, group.name)}>Eliminar</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="distribucion" className="pt-4">
                    <DistributionTable career={career} />
                </TabsContent>
            </Tabs>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function PasswordForm() {
    const { currentUser, updatePassword } = useContext(UserContext);
    const { toast } = useToast();

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onPasswordSubmit = (data: PasswordFormValues) => {
        if (!currentUser) return;
        if (updatePassword(currentUser.email, data.newPassword)) {
            toast({
                title: "¡Contraseña Cambiada!",
                description: "Tu nueva contraseña ha sido establecida.",
            });
            passwordForm.reset();
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo cambiar la contraseña.",
            });
        }
    };

    return (
        <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-8 mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Cambiar Contraseña</CardTitle>
                        <CardDescription>Establece una nueva contraseña para tu cuenta.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nueva Contraseña</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="ml-auto">Establecer Nueva Contraseña</Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}

function FixedScheduleRow({ row }: { row: FixedSchedule }) {
    const { updateFixedSchedule, removeFixedSchedule, fixedSchedules } = useContext(FixedScheduleContext);
    const { careers, distribution, scheduleTemplates, academicPeriodOptions } = useContext(AcademicContext);
    const { teachers } = useContext(TeacherContext);
    
    const getFilteredSubjectsForFixed = useCallback((level: string, group: string, currentSubject: string) => {
        if (!level || !group) return [];
        const career = careers.find(c => (c.groups || []).some(g => g.name === group));
        if (!career) return [];
        
        const distributionKey = `${career.id}-${level}`;
        const periodDistribution = distribution[distributionKey];
        if (!Array.isArray(periodDistribution)) return [];

        const assignedHoursInFixed = fixedSchedules.reduce((acc, fs) => {
            if (fs.id !== row.id && fs.group === group && fs.level === level) {
                acc[fs.subject] = (acc[fs.subject] || 0) + 1;
            }
            return acc;
        }, {} as {[subject: string]: number});

        return periodDistribution.filter(dist => {
            const assignedCount = assignedHoursInFixed[dist.subjectName] || 0;
            return assignedCount < dist.hours || dist.subjectName === currentSubject;
        }).map(d => d.subjectName);
    }, [careers, distribution, row.id, fixedSchedules]);

    const getAvailableTimeSlots = useCallback((day: string, level: string, group: string, rowId: string) => {
        const career = careers.find(c => c.groups.some(g => g.name === group));
        const groupInfo = career?.groups.find(g => g.name === group);
        const templateId = groupInfo?.scheduleTemplateId || scheduleTemplates[0].id;
        const activeTemplate = scheduleTemplates.find(t => t.id === templateId) || scheduleTemplates[0];
        const allTimeSlots = activeTemplate ? activeTemplate.timeSlots : [];

        if (!day || !level || !group) return allTimeSlots.filter(ts => ts.type === 'academic');
    
        const usedTimes = new Set(
        fixedSchedules
            .filter(fs => 
            fs.id !== rowId && 
            fs.day === day && 
            fs.level === level && 
            fs.group === group
            )
            .map(fs => fs.time)
        );
    
        return allTimeSlots.filter(ts => ts.type === 'academic' && !usedTimes.has(ts.time));
    }, [fixedSchedules, scheduleTemplates, careers]);

    const filteredSubjects = useMemo(() => getFilteredSubjectsForFixed(row.level, row.group, row.subject), [row.level, row.group, row.subject, getFilteredSubjectsForFixed]);
    const availableSlots = useMemo(() => getAvailableTimeSlots(row.day, row.level, row.group, row.id), [row.day, row.level, row.group, row.id, getAvailableTimeSlots]);

    const currentTeacher = row.teacherId ? teachers.find(t => t.id === row.teacherId) : null;
    
    const handleUpdateFixedRow = (id: string, field: keyof Omit<FixedSchedule, 'id'>, value: string | boolean) => {
      let updatedFields: Partial<FixedSchedule> = { [field]: value };
      let mergedSchedule = { ...row, ...updatedFields };
  
      if (field === 'level' || field === 'group') {
        mergedSchedule.subject = '';
        mergedSchedule.teacherId = '';
        mergedSchedule.time = '';
      }
      if (field === 'day') {
        mergedSchedule.time = '';
      }
      if (field === 'subject') {
        mergedSchedule.teacherId = '';
        const careerId = careers.find(c => (c.groups || []).some(g => g.name === mergedSchedule.group))?.id;
        if (careerId) {
          const distributionKey = `${careerId}-${mergedSchedule.level}`;
          const teacherId = (distribution[distributionKey] as Distribution[] | undefined)
              ?.find(d => d.subjectName === value)?.teacherIds[mergedSchedule.group];
          if (teacherId) {
            mergedSchedule.teacherId = teacherId;
          }
        }
      }
      
      updateFixedSchedule(id, mergedSchedule);
  };


    return (
        <TableRow key={row.id}>
            <TableCell className="min-w-[150px]">
                <Select value={row.day} onValueChange={(value) => handleUpdateFixedRow(row.id, 'day', value)}>
                <SelectTrigger><SelectValue placeholder="Día" /></SelectTrigger>
                <SelectContent>
                    {daysOfWeek.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                </SelectContent>
                </Select>
            </TableCell>
            <TableCell className="min-w-[150px]">
                <Select value={row.level} onValueChange={(value) => handleUpdateFixedRow(row.id, 'level', value)}>
                <SelectTrigger><SelectValue placeholder="Nivel" /></SelectTrigger>
                <SelectContent>
                    {academicPeriodOptions && academicPeriodOptions.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
                </Select>
            </TableCell>
            <TableCell className="min-w-[200px]">
                <Select value={row.group} onValueChange={(value) => handleUpdateFixedRow(row.id, 'group', value)} disabled={!row.level}>
                <SelectTrigger><SelectValue placeholder="Grupo" /></SelectTrigger>
                <SelectContent>
                    {careers.map(c => (
                        <SelectGroup key={c.id}>
                            <SelectLabel>{c.name}</SelectLabel>
                            {c.groups.map(g => (
                                <SelectItem key={`${c.id}-${g.name}`} value={g.name}>{`Grupo ${g.name}`}</SelectItem>
                            ))}
                        </SelectGroup>
                    ))}
                </SelectContent>
                </Select>
            </TableCell>
            <TableCell className="min-w-[180px]">
                <Select value={row.time} onValueChange={(value) => handleUpdateFixedRow(row.id, 'time', value)} disabled={!row.day || !row.level || !row.group}>
                <SelectTrigger><SelectValue placeholder="Hora" /></SelectTrigger>
                <SelectContent>
                    {availableSlots.map(slot => <SelectItem key={slot.time} value={slot.time}>{slot.time}</SelectItem>)}
                    {row.time && !availableSlots.some(s => s.time === row.time) && (
                    <SelectItem value={row.time} disabled>{row.time} (Ocupado)</SelectItem>
                    )}
                </SelectContent>
                </Select>
            </TableCell>
            <TableCell className="min-w-[200px]">
                <Select value={row.subject} onValueChange={(value) => handleUpdateFixedRow(row.id, 'subject', value)} disabled={!row.level || !row.group}>
                <SelectTrigger><SelectValue placeholder="Asignatura" /></SelectTrigger>
                <SelectContent>
                    {filteredSubjects.map((subj, subjIndex) => <SelectItem key={`${subj}-${subjIndex}`} value={subj}>{subj}</SelectItem>)}
                </SelectContent>
                </Select>
            </TableCell>
            <TableCell className="min-w-[200px]">
                <Select value={row.teacherId} onValueChange={() => {}} disabled>
                <SelectTrigger><SelectValue placeholder="Docente" /></SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Docente Asignado</SelectLabel>
                        {currentTeacher && <SelectItem value={currentTeacher.id}>{currentTeacher.name}</SelectItem>}
                    </SelectGroup>
                </SelectContent>
                </Select>
            </TableCell>
            <TableCell className="w-[100px] text-center">
                <Checkbox checked={row.locked} onCheckedChange={(checked) => handleUpdateFixedRow(row.id, 'locked', !!checked)} />
            </TableCell>
            <TableCell className="w-[80px]">
                <Button variant="ghost" size="icon" onClick={() => removeFixedSchedule(row.id)}>
                <Trash2 className="h-4 w-4" />
                </Button>
            </TableCell>
        </TableRow>
    );
}

// --- Main Component ---

export default function SettingsPage() {
  const { currentUser } = useContext(UserContext);
  const { institution, setInstitution, updateDepartments, dataLakeFolders, setDataLakeFolders, updateFeatureFlag } = useContext(InstitutionContext);
  const { 
    subjects,
    distribution, setDistribution,
    generatedSchedules, setGeneratedSchedules,
    certifiedSchedules, setCertifiedSchedules,
    scheduleTemplates, setScheduleTemplates,
    careers, addCareer, updateCareer, deleteCareer,
    academicPeriodOptions,
  } = useContext(AcademicContext);
  const { teachers } = useContext(TeacherContext);
  const { fixedSchedules, addFixedSchedule } = useContext(FixedScheduleContext);
  const { addTemplate, documentTypes, addDocumentType, updateDocumentType, removeDocumentType, templates: allTemplates } = useContext(TemplateContext);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isAddFolderOpen, setAddFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderLink, setNewFolderLink] = useState("");
  const [isClient, setIsClient] = useState(false);

  const [institutionName, setInstitutionName] = useState('');
  const [institutionSlogan, setInstitutionSlogan] = useState('');
  const [institutionAddress, setInstitutionAddress] = useState('');
  const [institutionFullName, setInstitutionFullName] = useState('');
  const [schoolType, setSchoolType] = useState('');
  const [institutionPhone, setInstitutionPhone] = useState('');
  const [institutionEmail, setInstitutionEmail] = useState('');
  const [entryTime, setEntryTime] = useState('');
  const [exitTime, setExitTime] = useState('');
  const [folioPrefix, setFolioPrefix] = useState('');
  const [folioNextNumber, setFolioNextNumber] = useState(1);
  const [dataLakeSearchTerm, setDataLakeSearchTerm] = useState("");
  
  const [maxStudentsPerGroup, setMaxStudentsPerGroup] = useState(40);
  
  const [headerLine1, setHeaderLine1] = useState('');
  const [headerLine2, setHeaderLine2] = useState('');
  const [headerLine3, setHeaderLine3] = useState('');
  const [headerLine4, setHeaderLine4] = useState('');
  const [schoolCycle, setSchoolCycle] = useState('');
  
  const [ruleNoOverlap, setRuleNoOverlap] = useState(true);
  const [ruleUniqueTeacher, setRuleUniqueTeacher] = useState(true);
  const [ruleNoRepeatClass, setRuleNoRepeatClass] = useState(true);

  const [selectedScheduleLevel, setSelectedScheduleLevel] = useState('1');
  const [selectedScheduleGroup, setSelectedScheduleGroup] = useState('A');
  const [selectedScheduleCareer, setSelectedScheduleCareer] = useState<string>('');
  const [unassignedBlocks, setUnassignedBlocks] = useState<ScheduleBlockData[]>([]);
  const [generationAttempted, setGenerationAttempted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<SelectedBlock | null>(null);

  const [isCopyModalOpen, setCopyModalOpen] = useState(false);
  const [sourcePeriod, setSourcePeriod] = useState('');
  const [destinationPeriod, setDestinationPeriod] = useState('');

  const [isTeacherViewOpen, setIsTeacherViewOpen] = useState(false);
  const [selectedTeacherForView, setSelectedTeacherForView] = useState('');

  const [isCareerModalOpen, setCareerModalOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [careerName, setCareerName] = useState('');

  const [departmentModalOpen, setDepartmentModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [departmentName, setDepartmentName] = useState('');

  const tabFromUrl = searchParams.get('tab');
  const [activeSettingsTab, setActiveSettingsTab] = useState(tabFromUrl || "profile");
  
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleDescription, setNewRuleDescription] = useState('');
  const [customRules, setCustomRules] = useState<{name: string, description: string, active: boolean}[]>([]);

  const [docType, setDocType] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [docLocation, setDocLocation] = useState("");
  
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateModalAction, setTemplateModalAction] = useState<'create' | 'rename'>('create');
  const [templateNameInput, setTemplateNameInput] = useState('');
  const [activeTemplateId, setActiveTemplateIdState] = useState<string>('');
  
  const [isDocTypeManagerOpen, setDocTypeManagerOpen] = useState(false);
  const [newDocTypeName, setNewDocTypeName] = useState("");
  const [editingDocType, setEditingDocType] = useState<DocumentType | null>(null);
  
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const { removeTemplate } = useContext(TemplateContext);

  const setActiveTemplateId = (id: string) => {
    setActiveTemplateIdState(id);
  };
  
  useEffect(() => {
    setIsClient(true);
    if (scheduleTemplates.length > 0 && !activeTemplateId) {
        setActiveTemplateId(scheduleTemplates[0].id);
    }
    setDocLocation(`Pánuco, Veracruz, a ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`);
    if(institution) {
      setInstitutionName(institution.name);
      setInstitutionFullName(institution.fullName || '');
      setSchoolType(institution.type);
      setInstitutionPhone(institution.phone);
      setInstitutionEmail(institution.email);
      setInstitutionAddress(institution.address || '');
      setInstitutionSlogan(institution.slogan || '');
      setEntryTime(institution.entryTime);
      setExitTime(institution.exitTime);
      setFolioPrefix(institution.folioPrefix);
      setFolioNextNumber(institution.folioNextNumber);
      setMaxStudentsPerGroup(institution.maxStudentsPerGroup || 40);
      setHeaderLine1(institution.headerLine1);
      setHeaderLine2(institution.headerLine2);
      setHeaderLine3(institution.headerLine3);
      setHeaderLine4(institution.headerLine4);
      setSchoolCycle(institution.schoolCycle);
    }
    if (careers.length > 0 && !selectedScheduleCareer) {
        setSelectedScheduleCareer(careers[0].id);
    }
  }, [institution, careers, selectedScheduleCareer, scheduleTemplates, activeTemplateId]);
  
  useEffect(() => {
    if (tabFromUrl) {
      setActiveSettingsTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  useEffect(() => {
    setUnassignedBlocks([]);
    setGenerationAttempted(false); 
  }, [selectedScheduleLevel, selectedScheduleGroup, selectedScheduleCareer]);

  const activeScheduleTemplate = useMemo(() => {
      if (!isClient) return null;
      if (!selectedScheduleCareer || !selectedScheduleGroup || !careers || !scheduleTemplates) return scheduleTemplates.find(t => t.id === activeTemplateId) || null;
      const career = careers.find(c => c.id === selectedScheduleCareer);
      if (!career || !career.groups) return scheduleTemplates.find(t => t.id === activeTemplateId) || null;
      const group = career.groups.find(g => g.name === selectedScheduleGroup);
      if (!group) return scheduleTemplates.find(t => t.id === activeTemplateId) || null;
      return scheduleTemplates.find(t => t.id === group.scheduleTemplateId) || null;
  }, [selectedScheduleCareer, selectedScheduleGroup, careers, scheduleTemplates, activeTemplateId, isClient]);


  const handleAddNewRule = () => {
    if (newRuleName.trim() && newRuleDescription.trim()) {
      setCustomRules(prev => [...prev, { name: newRuleName, description: newRuleDescription, active: true }]);
      setNewRuleName('');
      setNewRuleDescription('');
      setIsRuleModalOpen(false);
      toast({ title: 'Regla Personalizada Agregada' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'El nombre y la descripción son obligatorios.' });
    }
  };
  
  const toggleCustomRule = (index: number) => {
    setCustomRules(prev => prev.map((rule, i) => i === index ? { ...rule, active: !rule.active } : rule));
  };


  const handleSaveChanges = () => {
    if(!institution) return;
    setInstitution({
      ...institution,
      name: institutionName,
      fullName: institutionFullName,
      type: schoolType,
      phone: institutionPhone,
      email: institutionEmail,
      address: institutionAddress,
      slogan: institutionSlogan,
      entryTime: entryTime,
      exitTime: exitTime,
      folioPrefix: folioPrefix,
      folioNextNumber: folioNextNumber,
      maxStudentsPerGroup: maxStudentsPerGroup,
      headerLine1: headerLine1,
      headerLine2: headerLine2,
      headerLine3: headerLine3,
      headerLine4: headerLine4,
      schoolCycle: schoolCycle,
    });
    toast({ title: "Datos guardados", description: "La información de la institución ha sido actualizada." });
  };

  const handleAddFolder = () => {
    if (newFolderName.trim() === "") {
        toast({ variant: "destructive", title: "Error", description: "El nombre de la carpeta no puede estar vacío." });
        return;
    }
    if (dataLakeFolders.some(f => f.name === newFolderName)) {
      toast({ variant: "destructive", title: "Error", description: "Ya existe una carpeta con ese nombre." });
      return;
    }

    const newFolder: DataLakeFolder = {
        id: `folder-${Date.now()}`,
        name: newFolderName,
        link: newFolderLink || '#'
    };

    setDataLakeFolders(prev => [...prev, newFolder]);
    toast({ title: "Carpeta creada", description: `La carpeta "${newFolderName}" ha sido creada.` });
    setNewFolderName("");
    setNewFolderLink("");
    setAddFolderOpen(false);
  };

  const getQrValue = () => {
    if (!currentUser) return "";
    const { id, username, email } = currentUser;
    return JSON.stringify({ id, username, email });
  }

  const handleDownload = () => {
    const svg = qrCodeRef.current?.querySelector('svg');
    if (!svg || !currentUser) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const img = new Image();

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");

        const downloadLink = document.createElement("a");
        downloadLink.download = `credencial-qr-${currentUser.id}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
        toast({ title: "QR Descargado", description: "La imagen de la credencial se ha guardado." });
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };


  const handleAddFixedRow = () => {
    addFixedSchedule({
      id: Date.now().toString(),
      day: '',
      level: '',
      group: '',
      time: '',
      subject: '',
      teacherId: '',
      locked: true,
    });
  };
  
  const scheduleKey = useMemo(() => {
    if (!selectedScheduleCareer) return null;
    return `${selectedScheduleCareer}-${selectedScheduleLevel}`;
  }, [selectedScheduleCareer, selectedScheduleLevel]);

  const currentSchedule: GroupSchedule | undefined = generatedSchedules[`${scheduleKey}-${selectedScheduleGroup}`];
  const isCurrentScheduleCertified = useMemo(() => !!certifiedSchedules[`${scheduleKey}-${selectedScheduleGroup}`], [certifiedSchedules, scheduleKey, selectedScheduleGroup]);
  
  const buildTeacherAvailability = (currentScheduleKeyToExclude?: string): { [teacherId: string]: { [day: string]: { [time: string]: boolean } } } => {
    const availability: { [teacherId: string]: { [day: string]: { [time: string]: boolean } } } = {};
    const allSchedules = { ...generatedSchedules, ...certifiedSchedules };
    const allTimeSlots = scheduleTemplates.flatMap(t => t.timeSlots);

    teachers.forEach(teacher => {
        availability[teacher.id] = {};
        daysOfWeek.forEach(day => {
            availability[teacher.id][day] = {};
            allTimeSlots.forEach(slot => {
                if (slot.type === 'academic') {
                    availability[teacher.id][day][slot.time] = false;
                }
            });
        });

        if (teacher.availability) {
            Object.entries(teacher.availability).forEach(([day, unavailableSlots]) => {
                if (availability[teacher.id]?.[day]) {
                    unavailableSlots.forEach(time => {
                        if (time in availability[teacher.id][day]) {
                            availability[teacher.id][day][time] = true;
                        }
                    });
                }
            });
        }
    });

    Object.entries(allSchedules).forEach(([key, schedule]) => {
        if (key === currentScheduleKeyToExclude) return;
        Object.entries(schedule).forEach(([day, daySchedule]) => {
            if (daysOfWeek.includes(day)) {
                Object.entries(daySchedule).forEach(([time, block]) => {
                    if (block?.teacher && availability[block.teacher]?.[day]?.[time] !== undefined) {
                        availability[block.teacher][day][time] = true;
                    }
                });
            }
        });
    });

    fixedSchedules.forEach(fs => {
        if (fs.teacherId && fs.day && fs.time && availability[fs.teacherId]?.[fs.day]?.[fs.time] !== undefined) {
            availability[fs.teacherId][fs.day][fs.time] = true;
        }
    });

    return availability;
  };
  
  const isValidPlacement = (
    blockData: ScheduleBlockData,
    day: string,
    time: string,
    schedule: GroupSchedule,
    teacherAvailability: ReturnType<typeof buildTeacherAvailability>,
    ignoreBlock?: { day: string; time: string }
  ): boolean => {
    const isTargetFixedAndLocked = fixedSchedules.some(fs => fs.day === day && fs.time === time && fs.level === selectedScheduleLevel && fs.group === selectedScheduleGroup && fs.locked);
    if(isTargetFixedAndLocked) {
        console.error(`Validation failed: Target block at ${day} ${time} for group ${selectedScheduleGroup} is fixed and locked.`);
        return false;
    }

    if (ruleUniqueTeacher) {
        if (teacherAvailability[blockData.teacher]?.[day]?.[time]) {
             console.error(`Validation failed: Teacher ${blockData.teacher} is already occupied at ${day} ${time} in another group or has a restriction.`);
            return false;
        }
    }
  
    if (ruleNoRepeatClass) {
      const daySchedule = schedule[day] || {};
      for (const t in daySchedule) {
          if (ignoreBlock && t === ignoreBlock.time && day === ignoreBlock.day) continue;
          if (daySchedule[t]?.subject === blockData.subject) {
             console.error(`Validation failed: Subject ${blockData.subject} is already scheduled on ${day} for this group.`);
            return false;
          }
      }
    }
    
    if(ruleNoOverlap) {
        if(schedule[day]?.[time] && !(ignoreBlock && day === ignoreBlock.day && time === ignoreBlock.time)) {
             console.error(`Validation failed: Group ${selectedScheduleGroup} already has a class at ${day} ${time}.`);
            return false;
        }
    }

    return true;
  };
  
  const handleBlockClick = (
    day: string,
    time: string,
    block: ScheduleBlockData | null
  ) => {
    if (isCurrentScheduleCertified) {
        toast({ variant: "destructive", title: "Horario Certificado", description: "No se puede modificar un horario certificado. Debe descertificarlo primero." });
        return;
    }

    if (!selectedBlock) {
      if (block) {
        const isLocked = fixedSchedules.some(fs => fs.day === day && fs.time === time && fs.level === selectedScheduleLevel && fs.group === selectedScheduleGroup && fs.locked);
        if(isLocked) {
            toast({ variant: "destructive", title: "Bloque Fijo", description: "Este bloque está fijado y no se puede mover." });
            return;
        }
        setSelectedBlock({ data: block, origin: { type: "grid", day, time } });
      }
    } else { // A block is already selected, this is the destination click
      const sourceBlock = selectedBlock.data;

      if (selectedBlock.origin.type === "grid" && selectedBlock.origin.day === day && selectedBlock.origin.time === time) {
        setSelectedBlock(null);
        return;
      }

      const isTargetLocked = fixedSchedules.some(fs => fs.day === day && fs.time === time && fs.level === selectedScheduleLevel && fs.group === selectedScheduleGroup && fs.locked);
      if(isTargetLocked) {
          toast({ variant: "destructive", title: "Movimiento Inválido", description: "No se puede mover un bloque a una posición fijada." });
          setSelectedBlock(null);
          return;
      }
      
      const scheduleKeyToExclude = `${scheduleKey}-${selectedScheduleGroup}`;
      const teacherAvailability = buildTeacherAvailability(scheduleKeyToExclude);
      const scheduleToUpdate = { ...(generatedSchedules[scheduleKeyToExclude] || {}) };
      
      const ignoreSourceValidation = selectedBlock.origin.type === "grid" ? {day: selectedBlock.origin.day, time: selectedBlock.origin.time} : undefined;
      
      if (!isValidPlacement(sourceBlock, day, time, scheduleToUpdate, teacherAvailability, ignoreSourceValidation)) {
        toast({ variant: "destructive", title: "Movimiento Inválido", description: `Conflicto de horario para el docente "${sourceBlock.teacher}" o una regla ha sido violada.` });
        setSelectedBlock(null);
        return;
      }
      
      if (block && selectedBlock.origin.type === "grid") { // It's a swap
        if (!isValidPlacement(block, selectedBlock.origin.day, selectedBlock.origin.time, scheduleToUpdate, teacherAvailability, { day, time })) {
          toast({ variant: "destructive", title: "Intercambio Inválido", description: `Conflicto de horario para el docente "${block.teacher}" al moverlo a la posición de origen.` });
          setSelectedBlock(null);
          return;
        }
      }

      // All checks passed, perform the move/swap
      const newSchedules = { ...generatedSchedules };
      const newGroupSchedule: GroupSchedule = JSON.parse(JSON.stringify(newSchedules[scheduleKeyToExclude] || {}));
      
      if (!newGroupSchedule[day]) newGroupSchedule[day] = {};
       if (selectedBlock.origin.type === "grid" && !newGroupSchedule[selectedBlock.origin.day]) {
          newGroupSchedule[selectedBlock.origin.day] = {};
       }

      newGroupSchedule[day][time] = sourceBlock;

      if (selectedBlock.origin.type === "grid") {
        if (block) { // Swap
          newGroupSchedule[selectedBlock.origin.day][selectedBlock.origin.time] = block;
        } else { // Move
          delete newGroupSchedule[selectedBlock.origin.day][selectedBlock.origin.time];
        }
      } else { // Block came from unassigned
        const newUnassigned = [...unassignedBlocks];
        if (block) { // Swap unassigned with a grid block
           newUnassigned.splice(selectedBlock.origin.index, 1, block);
        } else { // Move unassigned to empty grid cell
           newUnassigned.splice(selectedBlock.origin.index, 1);
        }
        setUnassignedBlocks(newUnassigned);
      }
      
      newSchedules[scheduleKeyToExclude] = newGroupSchedule;
      setGeneratedSchedules(newSchedules);

      toast({ title: "Horario Actualizado", description: "El bloque ha sido movido/intercambiado."});
      setSelectedBlock(null);
    }
  };

  const handleUnassignedBlockClick = (index: number) => {
    if (isCurrentScheduleCertified) {
        toast({ variant: "destructive", title: "Horario Certificado", description: "No se puede modificar un horario certificado." });
        return;
    }

    if (!selectedBlock) {
      setSelectedBlock({
        data: unassignedBlocks[index],
        origin: { type: "unassigned", index },
      });
    } else {
      if (selectedBlock.origin.type === "unassigned" && selectedBlock.origin.index === index) {
        setSelectedBlock(null);
        return;
      }
      toast({ variant: "destructive", title: "Movimiento Inválido", description: "No se puede intercambiar bloques dentro de la lista de 'Sin Asignar'."});
      setSelectedBlock(null);
    }
  };

  const handleClearGroupSchedule = () => {
    if (!scheduleKey) return;
    setGeneratedSchedules(prev => {
      const newSchedules: GeneratedSchedules = { ...prev };
      delete newSchedules[`${scheduleKey}-${selectedScheduleGroup}`];
      return newSchedules;
    });
    setUnassignedBlocks([]);
    setGenerationAttempted(false);
    toast({ title: "Horario Limpiado", description: `Se ha limpiado el horario para el Grupo ${selectedScheduleGroup}.` });
  };
  
  const handleClearAllSchedules = () => {
    setGeneratedSchedules({});
    setUnassignedBlocks([]);
    setGenerationAttempted(false);
    toast({ variant: "destructive", title: "Todos los Horarios Limpiados", description: "Se han borrado todos los horarios generados." });
  };

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    setGenerationAttempted(true);
    setUnassignedBlocks([]);
    setSelectedBlock(null);

     if (!scheduleKey) {
        toast({
            variant: "destructive",
            title: "Selección Incompleta",
            description: "Por favor, seleccione una carrera y un nivel antes de generar un horario."
        });
        setIsGenerating(false);
        return;
    }

    const groupDistribution = distribution[scheduleKey];
    if (!groupDistribution || groupDistribution.some(d => d.hours > 0 && !d.teacherIds[selectedScheduleGroup])) {
      toast({
        variant: "destructive",
        title: "Error de Distribución",
        description: `Asegúrese de que todas las asignaturas para el Grupo ${selectedScheduleGroup} con horas asignadas tengan un docente en la pestaña 'Distribución Académica'.`
      });
      setIsGenerating(false);
      return;
    }
    
    if (!activeScheduleTemplate) {
        toast({ variant: "destructive", title: "Error", description: "No se encontró una plantilla de horario activa." });
        setIsGenerating(false);
        return;
    }
  
    const generationPromise = new Promise<{ schedule: GroupSchedule, unplaced: ScheduleBlockData[] }>((resolve) => {
      setTimeout(() => {
        let classesToSchedule: ScheduleBlockData[] = [];
        const subjectColorMap = new Map(subjects.map(s => [s.name, s.color]));
  
        groupDistribution.forEach(dist => {
          for (let i = 0; i < dist.hours; i++) {
            const teacherId = dist.teacherIds[selectedScheduleGroup];
            if (teacherId) {
              classesToSchedule.push({
                subject: dist.subjectName,
                teacher: teacherId,
                color: subjectColorMap.get(dist.subjectName) || '#cccccc'
              });
            }
          }
        });
  
        const newSchedule: GroupSchedule = {};
        daysOfWeek.forEach(day => {newSchedule[day] = {};});
  
        const teacherAvailability = buildTeacherAvailability();
        const groupFixedSchedules = fixedSchedules.filter(fs => fs.level === selectedScheduleLevel && fs.group === selectedScheduleGroup && fs.locked);
  
        groupFixedSchedules.forEach(fs => {
          if (fs.day && fs.time && newSchedule[fs.day] && !newSchedule[fs.day][fs.time]) {
            const blockData = { 
              subject: fs.subject, 
              teacher: fs.teacherId, 
              color: subjectColorMap.get(fs.subject) || '#cccccc' 
            };
            newSchedule[fs.day][fs.time] = blockData;

            if (teacherAvailability[fs.teacherId]?.[fs.day]) {
              teacherAvailability[fs.teacherId][fs.day][fs.time] = true;
            }
            const classIndex = classesToSchedule.findIndex(c => c.subject === fs.subject && c.teacher === fs.teacherId);
            if (classIndex > -1) {
              classesToSchedule.splice(classIndex, 1);
            }
          }
        });
  
        const academicSlots = activeScheduleTemplate.timeSlots.filter(ts => ts.type === 'academic').map(ts => ts.time);
  
        function solve(classes: ScheduleBlockData[]): ScheduleBlockData[] {
            if (classes.length === 0) {
                return []; 
            }

            const remainingClasses = [...classes];
            const unplacedClasses: ScheduleBlockData[] = [];

            while(remainingClasses.length > 0) {
              const currentClass = remainingClasses.shift()!;
              let placed = false;

              const shuffledDays = [...daysOfWeek].sort(() => Math.random() - 0.5);
              for (const day of shuffledDays) {
                  const shuffledSlots = [...academicSlots].sort(() => Math.random() - 0.5);
                  for (const time of shuffledSlots) {
                      if (!newSchedule[day][time]) {
                          if (isValidPlacement(currentClass, day, time, newSchedule, teacherAvailability)) {
                              newSchedule[day][time] = currentClass;
                              if (teacherAvailability[currentClass.teacher]?.[day]) {
                                  teacherAvailability[currentClass.teacher][day][time] = true;
                              }
                              placed = true;
                              break; 
                          }
                      }
                  }
                  if (placed) break;
              }

              if (!placed) {
                  unplacedClasses.push(currentClass);
              }
            }
            return unplacedClasses;
        }
  
        const remaining = solve(classesToSchedule);
        resolve({ schedule: newSchedule, unplaced: remaining });
      }, 0);
    });
  
    generationPromise.then(({ schedule, unplaced }) => {
      setGeneratedSchedules(prev => ({ ...prev, [`${scheduleKey}-${selectedScheduleGroup}`]: schedule }));
      setUnassignedBlocks(unplaced);
  
      toast({
        title: "Generación Completa",
        description: `Horario generado para Grupo ${selectedScheduleGroup}. ${unplaced.length > 0 ? `${unplaced.length} bloques no pudieron ser asignados.` : 'Todos los bloques fueron asignados.'}`
      });
      
      setIsGenerating(false);
    });
  };

  const handleToggleCertifySchedule = () => {
    if (!scheduleKey) return;
    const fullScheduleKey = `${scheduleKey}-${selectedScheduleGroup}`;
    if (isCurrentScheduleCertified) {
        setCertifiedSchedules(prev => {
            const newCertified = { ...prev };
            delete newCertified[fullScheduleKey];
            return newCertified;
        });
        toast({
            title: "Horario Descertificado",
            description: `El horario para el Grupo ${selectedScheduleGroup} ahora es editable.`,
        });
    } else {
        if (!currentSchedule || Object.keys(currentSchedule).length === 0) {
            toast({
                variant: "destructive",
                title: "Horario Vacío",
                description: "No se puede certificar un horario que no ha sido generado o está vacío.",
            });
            return;
        }
        if (unassignedBlocks.length > 0) {
            toast({
                variant: "destructive",
                title: "Bloques sin Asignar",
                description: "No se puede certificar un horario con bloques sin asignar. Por favor, asígnelos manually.",
            });
            return;
        }
        setCertifiedSchedules(prev => ({ ...prev, [fullScheduleKey]: currentSchedule }));
        toast({
            title: "¡Horario Certificado!",
            description: `El horario para el Grupo ${selectedScheduleGroup} ha sido guardado y bloqueado.`,
        });
    }
  };

  const handleTimeSlotChange = (templateId: string, index: number, field: keyof TimeSlot, value: string) => {
    setScheduleTemplates(prev => prev.map(t => {
      if (t.id === templateId) {
        const newTimeSlots = [...t.timeSlots];
        newTimeSlots[index] = { ...newTimeSlots[index], [field]: value };
        return { ...t, timeSlots: newTimeSlots };
      }
      return t;
    }));
  };

  const addTimeSlot = (templateId: string, index: number) => {
    setScheduleTemplates(prev => prev.map(t => {
      if (t.id === templateId) {
        const newTimeSlots = [...t.timeSlots];
        newTimeSlots.splice(index + 1, 0, { time: "00:00-00:00", type: "academic" });
        return { ...t, timeSlots: newTimeSlots };
      }
      return t;
    }));
  };

  const removeTimeSlot = (templateId: string, index: number) => {
    setScheduleTemplates(prev => prev.map(t => {
      if (t.id === templateId) {
        const newTimeSlots = t.timeSlots.filter((_, i) => i !== index);
        return { ...t, timeSlots: newTimeSlots };
      }
      return t;
    }));
  };

  const handleTemplateAction = () => {
    if (!templateNameInput.trim()) {
        toast({ variant: 'destructive', title: 'Error', description: 'El nombre del turno no puede estar vacío.' });
        return;
    }

    if (templateModalAction === 'create') {
        const newTemplate: ScheduleTemplate = {
            id: `turno-${Date.now()}`,
            name: templateNameInput,
            timeSlots: [{ time: "00:00-00:00", type: "academic" }],
        };
        setScheduleTemplates(prev => [...prev, newTemplate]);
        toast({ title: 'Turno Creado', description: `Se ha creado el turno "${templateNameInput}".` });
    } else if (templateModalAction === 'rename') {
        setScheduleTemplates(prev => prev.map(t => t.id === activeTemplateId ? { ...t, name: templateNameInput } : t));
        toast({ title: 'Turno Renombrado' });
    }

    setTemplateModalOpen(false);
    setTemplateNameInput('');
  };

  const openTemplateModal = (action: 'create' | 'rename') => {
      setTemplateModalAction(action);
      if (action === 'rename') {
          const currentTemplate = scheduleTemplates.find(t => t.id === activeTemplateId);
          setTemplateNameInput(currentTemplate?.name || '');
      } else {
          setTemplateNameInput('');
      }
      setTemplateModalOpen(true);
  };
  
  const deleteTemplate = () => {
    if (scheduleTemplates.length <= 1) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se puede eliminar la última plantilla de turno.' });
        return;
    }
    const newActiveId = scheduleTemplates.find(t => t.id !== activeTemplateId)?.id || '';
    setActiveTemplateId(newActiveId);
    setScheduleTemplates(prev => prev.filter(t => t.id !== activeTemplateId));
    toast({ title: 'Turno Eliminado' });
  };
  
  const teacherScheduleView = useMemo(() => {
    if (!selectedTeacherForView) return null;

    const schedules: { [templateId: string]: { [day: string]: { [time: string]: { subject: string; group: string; color: string } } } } = {};
    
    Object.entries(generatedSchedules).forEach(([groupKey, groupSchedule]) => {
        const [careerId, level, groupName] = groupKey.split('-');
        const career = careers.find(c => c.id === careerId);
        const group = career?.groups.find(g => g.name === groupName);
        const templateId = group?.scheduleTemplateId;

        if (templateId) {
             Object.entries(groupSchedule).forEach(([day, daySchedule]) => {
                Object.entries(daySchedule).forEach(([time, block]) => {
                    if (block && block.teacher === selectedTeacherForView) {
                        if (!schedules[templateId]) {
                            schedules[templateId] = {};
                            daysOfWeek.forEach(d => schedules[templateId][d] = {});
                        }
                        if (!schedules[templateId][day]) schedules[templateId][day] = {};
                        schedules[templateId][day][time] = { ...block, group: `${career?.name} ${level}-${groupName}` };
                    }
                });
            });
        }
    });
    return schedules;
}, [selectedTeacherForView, generatedSchedules, careers]);
  
  const relevantTemplatesForTeacherView = useMemo(() => {
    if (!teacherScheduleView) return [];
    const templateIds = Object.keys(teacherScheduleView);
    return scheduleTemplates.filter(t => templateIds.includes(t.id));
  }, [teacherScheduleView, scheduleTemplates]);

  const handleOpenCareerModal = (career: Career | null) => {
      setEditingCareer(career);
      setCareerName(career ? career.name : '');
      setCareerModalOpen(true);
  };
  const handleSaveCareer = () => {
      if (!careerName.trim()) {
          toast({ variant: "destructive", title: "Error", description: "El nombre de la carrera no puede estar vacío." });
          return;
      }
      if (editingCareer) {
          updateCareer(editingCareer.id, careerName);
          toast({ title: "Carrera Actualizada" });
      } else {
          addCareer(careerName);
          toast({ title: "Carrera Creada" });
      }
      setCareerModalOpen(false);
      setEditingCareer(null);
      setCareerName('');
  };
    
    const handleOpenDepartmentModal = (department: Department | null) => {
        setEditingDepartment(department);
        setDepartmentName(department ? department.name : '');
        setDepartmentModalOpen(true);
    };

    const handleSaveDepartment = () => {
        if (!departmentName.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'El nombre del departamento no puede estar vacío.' });
            return;
        }

        if (editingDepartment) {
            const updated = institution?.departments.map(d => d.id === editingDepartment.id ? { ...d, name: departmentName } : d) || [];
            updateDepartments(updated);
            toast({ title: 'Departamento Actualizado' });
        } else {
            const newId = departmentName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            if (institution?.departments.some(d => d.id === newId)) {
                toast({ variant: 'destructive', title: 'Error', description: 'Ya existe un departamento con un ID similar.' });
                return;
            }
            const newDepartment = { id: newId, name: departmentName };
            const updated = [...(institution?.departments || []), newDepartment];
            updateDepartments(updated);
            toast({ title: 'Departamento Creado' });
        }

        setDepartmentModalOpen(false);
        setEditingDepartment(null);
        setDepartmentName('');
    };

    const handleDeleteDepartment = (departmentId: string) => {
        const updated = institution?.departments.filter(d => d.id !== departmentId) || [];
        updateDepartments(updated);
        toast({ title: 'Departamento Eliminado' });
    };

    const handleAddDocType = () => {
        if (newDocTypeName.trim()) {
            addDocumentType(newDocTypeName);
            setNewDocTypeName("");
        }
    };
    const handleUpdateDocType = () => {
        if (editingDocType && editingDocType.name.trim()) {
            updateDocumentType(editingDocType.id, editingDocType.name);
            setEditingDocType(null);
        }
    };
    
    const handleCreateTemplate = () => {
        localStorage.removeItem('templateToEdit'); // Asegurarse de que no haya una plantilla fantasma
        const newTemplate: Template = {
            id: `new-${Date.now()}`,
            name: 'Nueva Plantilla',
            departmentId: 'direccion', // o un valor por defecto
            body: 'Escribe aquí el cuerpo del documento...',
            signerName: 'ING. ADRIAN BARUCH ZUNIGA SANJUAN',
            signerTitle: 'ENCARGADO DE LA DIRECCION DEL PLANTEL',
            ccEmail: 'asistenteaicbtispanuco@gmail.com',
            headerLogo1Url: "https://picsum.photos/seed/logo1/200/200",
            headerLogo2Url: "https://picsum.photos/seed/logo2/200/200",
            footerLogo1Url: "https://picsum.photos/seed/logo3/100/100",
            footerLogo2Url: "https://picsum.photos/seed/logo4/100/100",
            signatureUrl: "https://picsum.photos/seed/firma/200/100",
            docType: 'Oficio',
            locationAndDate: `Pánuco, Veracruz, a ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`
        };
        localStorage.setItem('templateToEdit', JSON.stringify(newTemplate));
        router.push(`/dashboard/editor/${newTemplate.id}`);
    };
    
    const handleEditTemplate = (template: Template) => {
        localStorage.setItem('templateToEdit', JSON.stringify(template));
        router.push(`/dashboard/editor/${template.id}`);
    };
    
    const handleDeleteTemplate = (id: string) => {
      removeTemplate(id);
      toast({ title: 'Plantilla eliminada' });
    }

  const selectedCareerName = useMemo(() => {
    if (!selectedScheduleCareer) return "Seleccionar Carrera...";
    const career = careers.find(c => c.id === selectedScheduleCareer);
    return career ? career.name : "Seleccionar Carrera...";
  }, [selectedScheduleCareer, careers]);
  
  const { themes, changeTheme, currentTheme } = useContext(ThemeContext);

  const formatFlagName = (flagName: string) => {
    const formatted = flagName.replace(/([A-Z])/g, ' $1');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };
  
  // --- Main Component ---
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
      </div>
      <Tabs value={activeSettingsTab} onValueChange={setActiveSettingsTab} className="w-full">
        <div className="overflow-x-auto pb-2">
            <div className="flex w-max">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="institution">Institución</TabsTrigger>
                <TabsTrigger value="academico">Academico</TabsTrigger>
                {currentUser?.role === 'superadmin' && <TabsTrigger value="feature-flags">Módulos</TabsTrigger>}
                <TabsTrigger value="theme">Tema</TabsTrigger>
                <TabsTrigger value="data-lake">Data Lake</TabsTrigger>
                <TabsTrigger value="templates">Plantillas</TabsTrigger>
                <TabsTrigger value="asistente-ai">Asistente AI</TabsTrigger>
              </TabsList>
            </div>
        </div>
        <TabsContent value="feature-flags">
            <Card>
                <CardHeader>
                    <CardTitle>Gestión de Funcionalidades (Feature Flags)</CardTitle>
                    <CardDescription>
                        Activa o desactiva módulos de la aplicación para todas las instituciones.
                        <br/>
                        <span className="text-destructive font-bold">Acceso exclusivo para Superadmin.</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   {institution?.featureFlags ? (
                        <div className="space-y-2">
                            {Object.entries(institution.featureFlags).map(([flagName, isActive]) => (
                                <div key={flagName} className="flex items-center justify-between rounded-lg border p-3">
                                    <Label htmlFor={`flag-${flagName}`} className="flex-1 cursor-pointer">{formatFlagName(flagName)}</Label>
                                    <Switch
                                        id={`flag-${flagName}`}
                                        checked={isActive}
                                        onCheckedChange={(checked) => updateFeatureFlag(flagName, checked)}
                                    />
                                </div>
                            ))}
                        </div>
                   ) : (
                       <div className="text-center py-10 border-2 border-dashed rounded-lg">
                          <p className="text-muted-foreground">No se pudieron cargar las funcionalidades.</p>
                       </div>
                   )}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>Administra la información de tu cuenta.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {isClient && currentUser ? (
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                      <Label htmlFor="profile-id" className="text-left sm:text-right">ID</Label>
                      <Input id="profile-id" value={currentUser.id} readOnly className="col-span-1 sm:col-span-3" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                      <Label htmlFor="profile-username" className="text-left sm:text-right">Nombre de Usuario</Label>
                      <Input id="profile-username" value={currentUser.username} readOnly className="col-span-1 sm:col-span-3" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                      <Label htmlFor="profile-email" className="text-left sm:text-right">Email</Label>
                      <Input id="profile-email" value={currentUser.email} readOnly className="col-span-1 sm:col-span-3" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                      <Label htmlFor="profile-role" className="text-left sm:text-right">Rol</Label>
                      <Input id="profile-role" value={currentUser.role} readOnly className="col-span-1 sm:col-span-3" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-4 pt-4 md:pt-0">
                    <Label>Código QR del Usuario</Label>
                    <div className="bg-white p-4 rounded-md border" ref={qrCodeRef}>
                      <QRCode value={getQrValue()} size={128} />
                    </div>
                     <Button variant="secondary" className="w-full" onClick={handleDownload}>
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir / Descargar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-40">
                    <p className="text-muted-foreground">Cargando perfil...</p>
                </div>
              )}
            </CardContent>
          </Card>
          <PasswordForm />
        </TabsContent>
         <TabsContent value="institution">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Datos de la Institución</CardTitle>
                <CardDescription>Gestiona la información general que se mostrará en los documentos oficiales.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="institution-name">Nombre Corto</Label>
                        <Input id="institution-name" placeholder="Ej: CBTis No. 55" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="institution-slogan">Lema o Slogan</Label>
                        <Input id="institution-slogan" placeholder="Ej: Forjando el Futuro de México" value={institutionSlogan} onChange={(e) => setInstitutionSlogan(e.target.value)} />
                    </div>
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="institution-full-name">Nombre Completo de la Institución</Label>
                      <Textarea id="institution-full-name" placeholder="Ej: Centro de Bachillerato Tecnológico..." value={institutionFullName} onChange={(e) => setInstitutionFullName(e.target.value)} />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="institution-address">Dirección Completa</Label>
                      <Textarea id="institution-address" placeholder="Ej: Prolongación Carranza S/N, Col. Electricistas..." value={institutionAddress} onChange={(e) => setInstitutionAddress(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="institution-phone">Teléfono</Label>
                          <Input id="institution-phone" type="tel" placeholder="Ej: 55 1234 5678" value={institutionPhone} onChange={(e) => setInstitutionPhone(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="institution-email">Email de Contacto</Label>
                          <Input id="institution-email" type="email" placeholder="Ej: contacto@colegio.com" value={institutionEmail} onChange={(e) => setInstitutionEmail(e.target.value)} />
                      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="school-type">Tipo de Escuela</Label>
                        <Select onValueChange={setSchoolType} value={schoolType}>
                            <SelectTrigger id="school-type"><SelectValue placeholder="Selecciona un tipo" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="preescolar">Preescolar</SelectItem>
                                <SelectItem value="primaria">Primaria</SelectItem>
                                <SelectItem value="secundaria">Secundaria</SelectItem>
                                <SelectItem value="preparatoria">Preparatoria</SelectItem>
                                <SelectItem value="preparatoria-tecnica">Preparatoria (Técnica)</SelectItem>
                                <SelectItem value="universidad">Universidad</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="entry-time">Horario de Entrada</Label>
                          <Input id="entry-time" type="time" value={entryTime} onChange={(e) => setEntryTime(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="exit-time">Horario de Salida</Label>
                          <Input id="exit-time" type="time" value={exitTime} onChange={(e) => setExitTime(e.target.value)} />
                      </div>
                  </div>
              </CardContent>
              <CardFooter>
                  <Button className="ml-auto" onClick={handleSaveChanges}>Guardar Cambios</Button>
              </CardFooter>
            </Card>
            
             <Card>
                <CardHeader>
                    <CardTitle>Parámetros de Matrícula</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="max-students">Límite de Alumnos por Grupo</Label>
                        <Input id="max-students" type="number" value={maxStudentsPerGroup} onChange={(e) => setMaxStudentsPerGroup(Number(e.target.value))} />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="ml-auto" onClick={handleSaveChanges}>Guardar Límite</Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Encabezado de Documentos Oficiales</CardTitle>
                    <CardDescription>Personaliza las líneas de texto que aparecen en la cabecera de los documentos.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="header-line1">Línea 1</Label>
                        <Input id="header-line1" value={headerLine1} onChange={(e) => setHeaderLine1(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="header-line2">Línea 2</Label>
                        <Input id="header-line2" value={headerLine2} onChange={(e) => setHeaderLine2(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="header-line3">Línea 3</Label>
                        <Input id="header-line3" value={headerLine3} onChange={(e) => setHeaderLine3(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="header-line4">Línea 4</Label>
                        <Input id="header-line4" value={headerLine4} onChange={(e) => setHeaderLine4(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="school-cycle">Ciclo Escolar</Label>
                        <Input id="school-cycle" value={schoolCycle} onChange={(e) => setSchoolCycle(e.target.value)} />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="ml-auto" onClick={handleSaveChanges}>Guardar Cambios de Encabezado</Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader className="flex items-center gap-2"><FileKey className="h-5 w-5 text-primary" /> Configuración de Folios</CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="folio-prefix">Prefijo del Folio</Label>
                        <Input id="folio-prefix" placeholder="Ej: AESCBT" value={folioPrefix} onChange={(e) => setFolioPrefix(e.target.value.toUpperCase())} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="folio-next-number">Próximo Número de Folio</Label>
                        <Input id="folio-next-number" type="number" min="1" value={folioNextNumber} onChange={(e) => setFolioNextNumber(Number(e.target.value))} />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="ml-auto" onClick={handleSaveChanges}>Guardar Configuración de Folios</Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <CardTitle>Áreas Académicas y Departamentos</CardTitle>
                        <CardDescription>Gestiona los diferentes departamentos de la institución. Estos se usarán para organizar plantillas y recursos.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <ConnectionStatus />
                        <Button variant="outline" size="sm" onClick={() => handleOpenDepartmentModal(null)} className="gap-1 flex-1 sm:flex-initial">
                            <PlusCircle className="h-4 w-4" />
                            Crear Departamento
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {(institution?.departments || []).map(dep => (
                           <Card key={dep.id} className="group relative">
                                <CardContent className="p-0">
                                    <div className="flex flex-col items-center justify-center p-6 h-24 rounded-md">
                                        <Folder className="h-8 w-8 mb-2 text-muted-foreground" />
                                        <p className="font-semibold text-center">{dep.name}</p>
                                    </div>
                                </CardContent>
                                <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.preventDefault(); handleOpenDepartmentModal(dep); }}>
                                        <Pencil className="h-3 w-3" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive" onClick={(e) => e.preventDefault()}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta acción eliminará el departamento "{dep.name}". Las plantillas asociadas no se eliminarán pero quedarán sin departamento.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteDepartment(dep.id)}>Eliminar</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="academico">
           <Tabs defaultValue="carreras" className="w-full">
            <div className="overflow-x-auto pb-2">
              <div className="flex w-max">
                <TabsList className="inline-flex h-auto">
                    <TabsTrigger value="carreras">Gestión de Carreras</TabsTrigger>
                    <TabsTrigger value="plantilla">Plantilla de Horarios</TabsTrigger>
                    <TabsTrigger value="reglas">Reglas y Restricciones</TabsTrigger>
                    <TabsTrigger value="fixed-schedules">Horarios Fijos</TabsTrigger>
                    <TabsTrigger value="horario">Generador de Horario</TabsTrigger>
                    <TabsTrigger value="planeacion">Planeación Académica</TabsTrigger>
                </TabsList>
              </div>
            </div>
            <TabsContent value="carreras">
                <Card>
                    <CardHeader className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                            <CardTitle>Oferta Académica</CardTitle>
                            <CardDescription>Gestiona las carreras técnicas que ofrece la institución.</CardDescription>
                        </div>
                         <div className="flex items-center gap-2 w-full sm:w-auto">
                           <ConnectionStatus />
                           <Button onClick={() => handleOpenCareerModal(null)} className="gap-2 flex-1 sm:flex-initial">
                                <PlusCircle className="h-4 w-4" />
                                Crear Carrera
                            </Button>
                         </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {careers.length > 0 ? (
                           careers.map((career) => (
                            <CareerManager key={career.id} career={career} onEditCareer={handleOpenCareerModal} deleteCareer={deleteCareer} />
                           ))
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                                <p className="text-muted-foreground">No hay carreras técnicas definidas.</p>
                                <p className="text-muted-foreground text-sm">Haga clic en "Crear Carrera" para añadir la primera.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="plantilla">
                <Card>
                    <CardHeader>
                        <CardTitle>Plantillas de Turnos de Horario</CardTitle>
                        <CardDescription>Define la estructura de los bloques de tiempo para cada turno escolar.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <Select value={activeTemplateId} onValueChange={setActiveTemplateId}>
                                <SelectTrigger className="w-full sm:w-[250px]">
                                    <SelectValue placeholder="Seleccionar turno..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {scheduleTemplates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Button variant="outline" size="sm" className="flex-1" onClick={() => openTemplateModal('create')}>Crear Turno</Button>
                                <Button variant="outline" size="sm" className="flex-1" onClick={() => openTemplateModal('rename')} disabled={!activeTemplateId}>Renombrar</Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm" className="flex-1" disabled={!activeTemplateId || scheduleTemplates.length <= 1}>Eliminar</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción eliminará la plantilla de turno seleccionada. Asegúrese de que ningún grupo la esté utilizando.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={deleteTemplate}>Eliminar</AlertDialogAction></AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[200px]">Bloque Horario</TableHead>
                                        <TableHead className="w-[200px]">Tipo</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {scheduleTemplates.find(t => t.id === activeTemplateId)?.timeSlots.map((slot, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Input
                                                    value={slot.time}
                                                    onChange={(e) => handleTimeSlotChange(activeTemplateId, index, 'time', e.target.value)}
                                                    placeholder="Ej: 07:00-07:50"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={slot.type}
                                                    onValueChange={(value) => handleTimeSlotChange(activeTemplateId, index, 'type', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="academic">Académico</SelectItem>
                                                        <SelectItem value="recess">Receso</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => addTimeSlot(activeTemplateId, index)}>
                                                    <PlusCircle className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => removeTimeSlot(activeTemplateId, index)} disabled={(scheduleTemplates.find(t => t.id === activeTemplateId)?.timeSlots.length ?? 0) <= 1}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                         <Button variant="ghost" className="w-full mt-2" onClick={() => addTimeSlot(activeTemplateId, scheduleTemplates.find(t => t.id === activeTemplateId)?.timeSlots.length ? scheduleTemplates.find(t => t.id === activeTemplateId)!.timeSlots.length-1 : 0)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Agregar Bloque al Final
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="reglas">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Reglas y Restricciones</CardTitle>
                  <CardDescription>Defina las reglas del generador y consulte los horarios de los docentes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Card>
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">Reglas Base del Generador</CardTitle>
                        <CardDescription>Active o desactive las reglas que el generador de horarios debe seguir.</CardDescription>
                      </div>
                      <Dialog open={isRuleModalOpen} onOpenChange={setIsRuleModalOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Agregar Regla
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Agregar Nueva Regla</DialogTitle>
                            <DialogDescription>Define una nueva regla personalizada para el generador.</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="rule-name">Nombre de la Regla</Label>
                              <Input id="rule-name" value={newRuleName} onChange={(e) => setNewRuleName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="rule-desc">Descripción</Label>
                              <Textarea id="rule-desc" value={newRuleDescription} onChange={(e) => setNewRuleDescription(e.target.value)} />
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                            <Button onClick={handleAddNewRule}>Guardar Regla</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Activado</TableHead>
                                    <TableHead>Regla</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                <TableRow>
                                    <TableCell>
                                    <Switch id="rule-no-overlap" checked={ruleNoOverlap} onCheckedChange={setRuleNoOverlap} aria-label="No sobreponer asignaturas" />
                                    </TableCell>
                                    <TableCell className="font-medium">No sobreponer asignaturas</TableCell>
                                    <TableCell className="text-muted-foreground">Un grupo no puede tener dos materias en el mismo bloque.</TableCell>
                                    <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="icon">
                                        <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                        <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                    <Switch id="rule-unique-teacher" checked={ruleUniqueTeacher} onCheckedChange={setRuleUniqueTeacher} aria-label="Docente único por bloque" />
                                    </TableCell>
                                    <TableCell className="font-medium">Docente único por bloque</TableCell>
                                    <TableCell className="text-muted-foreground">Un docente no puede estar en dos clases al mismo tiempo.</TableCell>
                                    <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="icon">
                                        <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                        <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                    <Switch id="rule-no-repeat" checked={ruleNoRepeatClass} onCheckedChange={setRuleNoRepeatClass} aria-label="No repetir clase el mismo día" />
                                    </TableCell>
                                    <TableCell className="font-medium">No repetir clase el mismo día</TableCell>
                                    <TableCell className="text-muted-foreground">Una materia no puede repetirse más de una vez por día en el mismo grupo.</TableCell>
                                    <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="icon">
                                        <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                        <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    </TableCell>
                                </TableRow>
                                {customRules.map((rule, index) => (
                                    <TableRow key={index}>
                                    <TableCell>
                                        <Switch checked={rule.active} onCheckedChange={() => toggleCustomRule(index)} />
                                    </TableCell>
                                    <TableCell className="font-medium">{rule.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{rule.description}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                        <Button variant="ghost" size="icon" disabled>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setCustomRules(prev => prev.filter((_, i) => i !== index))}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        </div>
                                    </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="fixed-schedules">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Gestión de Horarios Fijos</CardTitle>
                    <CardDescription>
                      Define bloques horarios que el generador no debe modificar.
                      Asegúrese que la distribución académica esté completa para el nivel y grupo antes de fijar un bloque.
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddFixedRow} className='gap-2 w-full sm:w-auto'>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Bloque Fijo
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Día</TableHead>
                          <TableHead>Nivel</TableHead>
                          <TableHead>Grupo</TableHead>
                          <TableHead>Hora</TableHead>
                          <TableHead>Asignatura</TableHead>
                          <TableHead>Docente</TableHead>
                          <TableHead>Bloqueado</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fixedSchedules.length > 0 ? fixedSchedules.map((row) => (
                          <FixedScheduleRow key={row.id} row={row} />
                        )) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center h-24">
                              No hay bloques fijos definidos. Haga clic en "Agregar Bloque Fijo" para empezar.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="horario">
              <Card>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2">
                             <Button onClick={handleToggleCertifySchedule} className="bg-orange-500 hover:bg-orange-600">
                                {isCurrentScheduleCertified ? <><Unlock className="mr-2 h-4 w-4" /> Descertificar</> : <><CalendarCheck className="mr-2 h-4 w-4" /> Certificar Horario</>}
                            </Button>
                            <Button onClick={handleGenerateSchedule} disabled={isGenerating || isCurrentScheduleCertified} className="bg-orange-500 hover:bg-orange-600">
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generando...
                                    </>
                                ) : (
                                    <>
                                        <CalendarCog className="mr-2 h-4 w-4" />
                                        Generar Horario
                                    </>
                                )}
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="bg-green-600 hover:bg-green-700 gap-2">
                                        <span>{selectedCareerName}</span>
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>Carreras</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {careers.length > 0 ? (
                                        careers.map(career => (
                                            <DropdownMenuItem key={career.id} onClick={() => setSelectedScheduleCareer(career.id)}>
                                                {career.name}
                                            </DropdownMenuItem>
                                        ))
                                    ) : (
                                        <DropdownMenuItem disabled>No hay carreras definidas</DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Select value={selectedScheduleLevel} onValueChange={setSelectedScheduleLevel} disabled={isCurrentScheduleCertified}>
                                <SelectTrigger className="w-full sm:w-auto min-w-[180px]">
                                    <SelectValue placeholder="Seleccionar Nivel" />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicPeriodOptions.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={selectedScheduleGroup} onValueChange={setSelectedScheduleGroup} disabled={isCurrentScheduleCertified}>
                                <SelectTrigger className="w-full sm:w-auto min-w-[180px]">
                                    <SelectValue placeholder="Seleccionar Grupo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(careers.find(c => c.id === selectedScheduleCareer)?.groups || []).map(g => <SelectItem key={g.name} value={g.name}>Grupo {g.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                             {isCurrentScheduleCertified && (
                                <div className="flex items-center gap-2 text-yellow-600 font-semibold border border-yellow-300 bg-yellow-50 rounded-lg px-3 py-2">
                                    <Lock className="h-4 w-4" />
                                    <span>Horario Certificado y Bloqueado</span>
                                </div>
                            )}
                             <Dialog open={isTeacherViewOpen} onOpenChange={setIsTeacherViewOpen}>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Users className="h-4 w-4" />
                                    Horarios de Docente
                                </Button>
                              </DialogTrigger>
                                <DialogContent className="max-w-6xl">
                                    <DialogHeader>
                                        <DialogTitle>Vista por Docente</DialogTitle>
                                        <DialogDescription>Seleccione un docente para ver su horario consolidado.</DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4 space-y-4">
                                        <Select value={selectedTeacherForView} onValueChange={setSelectedTeacherForView}>
                                            <SelectTrigger className="w-[300px]">
                                                <SelectValue placeholder="Seleccionar docente..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name} ({t.id})</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        
                                        <ScrollArea className="h-[60vh] w-full pr-4">
                                            {selectedTeacherForView && relevantTemplatesForTeacherView && Object.keys(relevantTemplatesForTeacherView).length > 0 ? (
                                                <Tabs defaultValue={relevantTemplatesForTeacherView[0].id} className="w-full mt-4">
                                                    <TabsList>
                                                        {relevantTemplatesForTeacherView.map(template => (
                                                            <TabsTrigger key={template.id} value={template.id}>{template.name}</TabsTrigger>
                                                        ))}
                                                    </TabsList>
                                                    {relevantTemplatesForTeacherView.map(template => (
                                                        <TabsContent key={template.id} value={template.id} className="mt-4">
                                                             <div className="border rounded-lg overflow-hidden">
                                                                <Table>
                                                                    <TableHeader>
                                                                        <TableRow>
                                                                            <TableHead className="w-[100px]">Hora</TableHead>
                                                                            {daysOfWeek.map(day => <TableHead key={day}>{day}</TableHead>)}
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {template.timeSlots.map((slot) => {
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
                                                                                        const block = teacherScheduleView?.[template.id]?.[day]?.[slot.time];
                                                                                        return (
                                                                                            <TableCell key={`${day}-${slot.time}`} className={cn("p-1 h-[70px]", !block && "bg-muted/30")}>
                                                                                                {block ? <ScheduleBlock {...block} group={block.group} /> : null}
                                                                                            </TableCell>
                                                                                        )
                                                                                    })}
                                                                                </TableRow>
                                                                            )
                                                                        })}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                        </TabsContent>
                                                    ))}
                                                </Tabs>
                                            ) : (
                                                <div className="text-center text-muted-foreground py-10">
                                                <p>{selectedTeacherForView ? "Este docente no tiene clases asignadas." : "Por favor, seleccione un docente para ver su horario."}</p>
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                    <DialogFooter>
                                      <DialogClose asChild>
                                        <Button type="button">Cerrar</Button>
                                      </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                           </Dialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2" disabled={isCurrentScheduleCertified}>
                                  <Trash2 className="h-4 w-4"/>
                                  Limpiar Horario del Grupo
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se borrará el horario generado para el grupo {selectedScheduleGroup} del {academicPeriodOptions.find(p => p.value === selectedScheduleLevel)?.label}.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleClearGroupSchedule}>Continuar</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" className="gap-2" disabled={isCurrentScheduleCertified}>
                                    <AlertCircle className="h-4 w-4"/>
                                    Limpiar Todos los Horarios
                                </Button>
                              </AlertDialogTrigger>
                               <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Estás absolutely seguro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Se borrarán permanentemente TODOS los horarios generados para TODOS los grupos.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleClearAllSchedules}>Sí, borrar todo</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                     
                     <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
                        <div className="space-y-4">
                            <CardTitle>Horario de {academicPeriodOptions.find(p => p.value === selectedScheduleLevel)?.label} - Grupo {selectedScheduleGroup}</CardTitle>
                            <CardDescription>Haga clic en un bloque para seleccionarlo, luego haga clic en una celda vacía para moverlo o en otro bloque para intercambiarlo.</CardDescription>
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Hora</TableHead>
                                        {daysOfWeek.map(day => <TableHead key={day}>{day}</TableHead>)}
                                    </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                    {(activeScheduleTemplate?.timeSlots || []).map((slot) => {
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
                                                    const block = currentSchedule && currentSchedule[day] ? currentSchedule[day][slot.time] : undefined;
                                                    const isSelected = selectedBlock?.origin.type === 'grid' && selectedBlock.origin.day === day && selectedBlock.origin.time === slot.time;
                                                    return (
                                                        <TableCell 
                                                          key={`${day}-${slot.time}`} 
                                                          className={cn("p-1 h-[70px] cursor-pointer", block ? "" : "hover:bg-accent", isCurrentScheduleCertified && "cursor-not-allowed")}
                                                          onClick={() => handleBlockClick(day, slot.time, block || null)}
                                                        >
                                                            {block ? <ScheduleBlock {...block} isSelected={isSelected} /> : null}
                                                        </TableCell>
                                                    )
                                                })}
                                            </TableRow>
                                        )
                                    })}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Bloques sin Asignar</CardTitle>
                                    <CardDescription>Estos bloques no pudieron ser asignados automáticamente.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {!generationAttempted ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">Los resultados de la generación aparecerán aquí.</p>
                                    ) : unassignedBlocks.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">¡Todos los bloques asignados!</p>
                                    ) : (
                                        unassignedBlocks.map((block, index) => (
                                            <ScheduleBlock 
                                              key={index} 
                                              {...block} 
                                              isSelected={selectedBlock?.origin.type === 'unassigned' && selectedBlock.origin.index === index}
                                              onClick={() => handleUnassignedBlockClick(index)}
                                            />
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                  </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="planeacion">
              <Card>
                <CardHeader>
                  <CardTitle>Planeación Académica por Carrera</CardTitle>
                  <CardDescription>
                    Selecciona una carrera para generar o editar su planeación académica.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {careers.map(career => (
                        <Link href={`/dashboard/planeacion/${career.id}`} key={career.id} passHref>
                            <div className="p-4 border rounded-md hover:bg-accent cursor-pointer flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <Folder className="h-6 w-6 text-primary" />
                                    <span className="font-semibold">{career.name}</span>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </Link>
                    ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
        <TabsContent value="theme">
            <Card>
                <CardHeader>
                    <CardTitle>Selector de Tema</CardTitle>
                    <CardDescription>Elige una paleta de colores para personalizar la apariencia de la aplicación.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {themes.map((theme) => (
                            <div key={theme.name} onClick={() => changeTheme(theme.name)} className="cursor-pointer">
                                <Card className={cn(
                                    "overflow-hidden transition-all hover:ring-2 hover:ring-offset-2 hover:ring-ring",
                                    currentTheme?.name === theme.name && "ring-2 ring-offset-2 ring-ring"
                                )}>
                                    <div className="flex h-16">
                                        <div style={{ backgroundColor: `hsl(${theme.colors.primary})` }} className="w-1/3"></div>
                                        <div style={{ backgroundColor: `hsl(${theme.colors.accent})` }} className="w-1/3"></div>
                                        <div style={{
                                                backgroundColor: `hsl(${theme.colors.card})`,
                                                color: `hsl(${theme.colors.cardForeground})`,
                                                borderColor: `hsl(${theme.colors.border})`
                                            }} className="w-1/3 border-l"
                                        ></div>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="text-sm font-medium">{theme.name}</h3>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="data-lake">
           <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Data Lake</CardTitle>
                <CardDescription>
                  Explora, gestiona y descarga los datos de tu Data Lake.
                </CardDescription>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Buscar..." 
                        className="pl-8 w-full"
                        value={dataLakeSearchTerm}
                        onChange={(e) => setDataLakeSearchTerm(e.target.value)}
                    />
                </div>
                <ConnectionStatus />
                <Dialog open={isAddFolderOpen} onOpenChange={setAddFolderOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                            <PlusCircle className="h-4 w-4" />
                            Agregar
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                        <DialogTitle>Agregar Nueva Carpeta</DialogTitle>
                        <DialogDescription>
                            Escribe el nombre para la nueva carpeta y vincúlala a una página.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="folder-name">Nombre de la Carpeta</Label>
                                <Input id="folder-name" placeholder="Ej: Documentos" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="folder-link">Vincular a una Página (Lógica)</Label>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                            {newFolderLink ? `Vinculado a: ${newFolderLink}` : "Seleccionar sección..."}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-64 max-h-[40vh] overflow-y-auto" align="start">
                                        <DropdownMenuLabel>Seleccionar Origen de Datos</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger><Shield className="mr-2 h-4 w-4" /><span>Portal Administrador</span></DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuItem onClick={() => setNewFolderLink('Admin > Gestión Escolar')}>
                                                    <Users className="mr-2 h-4 w-4" /> Gestión Escolar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setNewFolderLink('Admin > Circulares')}>
                                                    <FileSignature className="mr-2 h-4 w-4" /> Circulares
                                                </DropdownMenuItem>
                                                 <DropdownMenuItem onClick={() => setNewFolderLink('Admin > Calendario')}>
                                                    <Calendar className="mr-2 h-4 w-4" /> Calendario
                                                </DropdownMenuItem>
                                                 <DropdownMenuItem onClick={() => setNewFolderLink('Admin > Mensajería')}>
                                                    <MessageSquare className="mr-2 h-4 w-4" /> Mensajería
                                                </DropdownMenuItem>
                                                <DropdownMenuSub>
                                                <DropdownMenuSubTrigger><SettingsIcon className="mr-2 h-4 w-4"/>Settings</DropdownMenuSubTrigger>
                                                <DropdownMenuSubContent>
                                                    <DropdownMenuItem onClick={() => setNewFolderLink('Admin > Settings > Profile')}>Profile</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setNewFolderLink('Admin > Settings > Institution')}>Institución</DropdownMenuItem>
                                                    <DropdownMenuSub>
                                                        <DropdownMenuSubTrigger>Académico</DropdownMenuSubTrigger>
                                                        <DropdownMenuSubContent>
                                                            <DropdownMenuItem onClick={() => setNewFolderLink('Admin > Settings > Académico > Carreras')}>Gestión de Carreras</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => setNewFolderLink('Admin > Settings > Académico > Asignaturas')}>Gestión de Asignaturas</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => setNewFolderLink('Admin > Settings > Académico > Distribución')}>Distribución Académica</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => setNewFolderLink('Admin > Settings > Académico > Plantilla')}>Plantilla de Horarios</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => setNewFolderLink('Admin > Settings > Académico > Reglas')}>Reglas y Restricciones</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => setNewFolderLink('Admin > Settings > Académico > Horarios Fijos')}>Horarios Fijos</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => setNewFolderLink('Admin > Settings > Académico > Horario')}>Generador de Horario</DropdownMenuItem>
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuSub>
                                                    <DropdownMenuItem onClick={() => setNewFolderLink('Admin > Settings > Data Lake')}>Data Lake</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setNewFolderLink('Admin > Settings > Plantillas')}>Plantillas</DropdownMenuItem>
                                                </DropdownMenuSubContent>
                                                </DropdownMenuSub>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger><BookUser className="mr-2 h-4 w-4" /><span>Portal Docente</span></DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuItem onClick={() => setNewFolderLink('Docente > Mis Grupos')}><Users className="mr-2 h-4 w-4" /> Mis Grupos</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setNewFolderLink('Docente > Circulares')}><FileSignature className="mr-2 h-4 w-4" /> Circulares</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setNewFolderLink('Docente > Tareas')}><BookCheck className="mr-2 h-4 w-4" /> Tareas</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setNewFolderLink('Docente > Calificaciones')}><ClipboardList className="mr-2 h-4 w-4" /> Calificaciones</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setNewFolderLink('Docente > Asistencias')}><CalendarCheck className="mr-2 h-4 w-4" /> Asistencias</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setNewFolderLink('Docente > Mi Horario')}><Calendar className="mr-2 h-4 w-4" /> Mi Horario</DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger><GraduationCap className="mr-2 h-4 w-4" /><span>Portal Alumno</span></DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuItem onClick={() => setNewFolderLink('Alumno > Tareas')}>Mis Tareas</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setNewFolderLink('Alumno > Calificaciones')}>Calificaciones</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setNewFolderLink('Alumno > Asistencias')}>Asistencias</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setNewFolderLink('Alumno > Horario')}>Mi Horario</DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger><User className="mr-2 h-4 w-4" /><span>Portal Tutor</span></DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuItem onClick={() => setNewFolderLink('Tutor > Rendimiento por Hijo')}>Rendimiento por Hijo</DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                         <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancelar</Button>
                            </DialogClose>
                            <Button type="button" onClick={handleAddFolder}>Guardar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {(dataLakeFolders || []).filter(f => (f?.name || "").toLowerCase().includes((dataLakeSearchTerm || "").toLowerCase())).map((folder) => (
                 <Collapsible key={folder.id} className="border-b last:border-b-0">
                 <div className="flex w-full items-center justify-between py-2 group">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 cursor-pointer">
                          <Folder className="h-4 w-4 text-muted-foreground" />
                          <span className="text-base font-semibold capitalize">{(folder?.name || "").replace(/-/g, " ")}</span>
                      </div>
                    </div>
                   <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon"><ChevronDown className="h-4 w-4 shrink-0"/></Button>
                     </CollapsibleTrigger>
                     <Button
                       variant="ghost"
                       size="icon"
                       onClick={(e) => e.stopPropagation()}
                     >
                       <Pencil className="h-4 w-4" />
                       <span className="sr-only">Edit folder</span>
                     </Button>
                     <Button
                       variant="ghost"
                       size="icon"
                       onClick={(e) => {
                         e.stopPropagation();
                         setDataLakeFolders(prev => prev.filter(f => f.id !== folder.id));
                       }}
                     >
                       <Trash2 className="h-4 w-4" />
                       <span className="sr-only">Delete folder</span>
                     </Button>
                   </div>
                 </div>
                 <CollapsibleContent>
                   <div className="pl-6 pb-4 pt-0">
                     <p className="text-muted-foreground text-sm">
                       Contenido de la carpeta "{folder.name}" aparecerá aquí.
                     </p>
                   </div>
                 </CollapsibleContent>
               </Collapsible>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="templates">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <CardTitle>Gestión de Plantillas de Documentos</CardTitle>
                        <CardDescription>
                            Crea y gestiona las plantillas para oficios, circulares y otros documentos oficiales, organizadas por departamento.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Dialog open={isDocTypeManagerOpen} onOpenChange={setDocTypeManagerOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1 flex-1 sm:flex-initial">
                                    <Pencil className="h-4 w-4" />
                                    Gestionar Tipos
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Gestionar Tipos de Documento</DialogTitle>
                                    <DialogDescription>Añada, edite o elimine los tipos de documentos disponibles.</DialogDescription>
                                </DialogHeader>
                                <div className="py-4 space-y-4">
                                    <div className="flex gap-2">
                                        <Input placeholder="Nuevo tipo de documento" value={newDocTypeName} onChange={(e) => setNewDocTypeName(e.target.value)} />
                                        <Button onClick={handleAddDocType}>Agregar</Button>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                                        {documentTypes.map(dt => (
                                            <div key={dt.id} className="flex items-center justify-between gap-2 p-2 border rounded-md">
                                                {editingDocType?.id === dt.id ? (
                                                    <Input value={editingDocType.name} onChange={(e) => setEditingDocType({ ...editingDocType, name: e.target.value })} autoFocus />
                                                ) : (
                                                    <span>{dt.name}</span>
                                                )}
                                                <div className="flex gap-1">
                                                    {editingDocType?.id === dt.id ? (
                                                        <>
                                                            <Button size="sm" onClick={handleUpdateDocType}>Guardar</Button>
                                                            <Button size="sm" variant="ghost" onClick={() => setEditingDocType(null)}>Cancelar</Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingDocType(dt)}>
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción eliminará el tipo de documento "{dt.name}".</AlertDialogDescription></AlertDialogHeader>
                                                                    <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => removeDocumentType(dt.id)}>Eliminar</AlertDialogAction></AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                         <Button onClick={handleCreateTemplate} className="gap-1 flex-1 sm:flex-initial">
                            <PlusCircle className="h-4 w-4" />
                            Crear Plantilla
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {(institution?.departments || []).map(dep => (
                            <AccordionItem value={dep.id} key={dep.id}>
                                <AccordionTrigger>
                                    <div className="flex items-center gap-3">
                                        <Folder className="h-5 w-5 text-muted-foreground" />
                                        <span>{dep.name}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 bg-muted/30">
                                    {allTemplates.filter(t => t.departmentId === dep.id).length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
                                            {allTemplates.filter(t => t.departmentId === dep.id).map(template => (
                                                <Card key={template.id} className="hover:shadow-md transition-shadow flex flex-col">
                                                    <CardHeader>
                                                        <FileText className="h-8 w-8 text-muted-foreground" />
                                                        <CardTitle className="text-base leading-tight pt-2">{template.name}</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="flex-grow">
                                                        <Badge variant="outline">{template.docType}</Badge>
                                                    </CardContent>
                                                    <CardFooter className="flex flex-col gap-2 !p-4">
                                                        <Button className="w-full" onClick={() => handleEditTemplate(template)}>
                                                            <Edit className="h-4 w-4 mr-2"/>
                                                            Editar / Usar Plantilla
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="destructive" className="w-full">
                                                                    <Trash2 className="h-4 w-4 mr-2"/>
                                                                    Borrar
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Esta acción eliminará la plantilla "{template.name}" permanentemente. No se puede deshacer.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteTemplate(template.id)}>
                                                                        Eliminar
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-4">No hay plantillas para este departamento.</p>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="asistente-ai">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <CardTitle>Asistente AI - Perfiles de Comportamiento</CardTitle>
                        <CardDescription>
                            Configura y gestiona las capacidades del asistente de inteligencia artificial para cada tipo de usuario.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <ConnectionStatus />
                       <Button variant="outline" size="sm" className='flex-1 sm:flex-initial'>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Crear Nuevo Perfil
                      </Button>
                    </div>
                </CardHeader>
                <CardContent>
                     <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>1. Público general / Aspirantes (Nivel 1)</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                <p className="text-sm text-muted-foreground"><strong>Rol:</strong> Atención general y orientación vocacional.</p>
                                <div className="space-y-2">
                                    <Label htmlFor="train-publico">Recuadro de entrenamiento / instrucciones</Label>
                                    <Textarea id="train-publico" rows={5} defaultValue="Proporciona información pública sobre el CBTis 55. Usa un tono juvenil, empático y motivador. Incluye un quiz vocacional divertido que ayude al usuario a descubrir qué carrera técnica podría estudiar. No menciones datos internos." />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="func-publico">Funciones especiales</Label>
                                    <Textarea id="func-publico" rows={2} defaultValue="Activar formulario vocacional interactivo." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="restr-publico">Restricciones</Label>
                                    <Textarea id="restr-publico" rows={2} defaultValue="No revelar información de contacto privada. No dar acceso a sistemas internos." />
                                </div>
                                <Button size="sm">Guardar Cambios</Button>
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="item-administrativo">
                            <AccordionTrigger>2. Personal administrativo (Nivel 4)</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                               <p className="text-sm text-muted-foreground"><strong>Rol:</strong> Gestión documental, de personal y procesos internos.</p>
                               <div className="space-y-2">
                                    <Label htmlFor="train-admin">Recuadro de entrenamiento / instrucciones</Label>
                                    <Textarea id="train-admin" rows={5} defaultValue="Apoya en la creación de oficios, constancias, gestión de usuarios (altas/bajas) y reportes de actividad. Proporciona acceso a reglamentos y calendarios. Usa un tono formal, administrativo y conciso." />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="func-admin">Funciones especiales</Label>
                                    <Textarea id="func-admin" rows={2} defaultValue="Generación de documentos a partir de plantillas. Búsqueda en base de datos de normativas. Gestión básica de usuarios (CRUD)." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="restr-admin">Restricciones</Label>
                                    <Textarea id="restr-admin" rows={2} defaultValue="No modificar archivos sin autorización explícita. No acceder a datos financieros o de configuración crítica." />
                                </div>
                                <Button size="sm">Guardar Cambios</Button>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>3. Padres de familia (Nivel 2)</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                <p className="text-sm text-muted-foreground"><strong>Rol:</strong> Supervisión y comunicación con la escuela.</p>
                                <div className="space-y-2">
                                    <Label htmlFor="train-padres">Recuadro de entrenamiento / instrucciones</Label>
                                    <Textarea id="train-padres" rows={5} defaultValue="Informa a los padres sobre el rendimiento, conducta, asistencias y calificaciones de su hijo. Muestra reportes claros y mensajes empáticos." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="restr-padres">Restricciones</Label>
                                    <Textarea id="restr-padres" rows={2} defaultValue="No compartir información de otros alumnos. No permitir edición de datos." />
                                </div>
                                <Button size="sm">Guardar Cambios</Button>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>4. Docentes (Nivel 3)</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                <p className="text-sm text-muted-foreground"><strong>Rol:</strong> Asistente académico.</p>
                                <div className="space-y-2">
                                    <Label htmlFor="train-docentes">Recuadro de entrenamiento / instrucciones</Label>
                                    <Textarea id="train-docentes" rows={5} defaultValue="Proporciona planeaciones, actividades y recursos basados en la planeación oficial de 16 semanas. Facilita registros de calificaciones y asistencia. Genera reportes por grupo o alumno." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="restr-docentes">Restricciones</Label>
                                    <Textarea id="restr-docentes" rows={2} defaultValue="No mostrar información de otros docentes. Mantén un tono colaborativo y profesional." />
                                </div>
                                <Button size="sm">Guardar Cambios</Button>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>5. Alumnos (Nivel 2)</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                <p className="text-sm text-muted-foreground"><strong>Rol:</strong> Guía académico y acompañante de estudio.</p>
                                <div className="space-y-2">
                                    <Label htmlFor="train-alumnos">Recuadro de entrenamiento / instrucciones</Label>
                                    <Textarea id="train-alumnos" rows={5} defaultValue="Ayuda al alumno a resolver dudas, entregar tareas y prepararse para exámenes. Usa lenguaje motivador y juvenil." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="restr-alumnos">Restricciones</Label>
                                    <Textarea id="restr-alumnos" rows={2} defaultValue="No modificar calificaciones. No revelar información de otros estudiantes." />
                                </div>
                                <Button size="sm">Guardar Cambios</Button>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-6">
                            <AccordionTrigger>6. Tutor académico (Nivel 3)</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                <p className="text-sm text-muted-foreground"><strong>Rol:</strong> Análisis individual del progreso.</p>
                                <div className="space-y-2">
                                    <Label htmlFor="train-tutor">Recuadro de entrenamiento / instrucciones</Label>
                                    <Textarea id="train-tutor" rows={5} defaultValue='Al presionar el botón “Analizador de Progreso”, analiza el desempeño del alumno (calificaciones, conducta, tareas, etc.). Genera un pronóstico del rendimiento y conducta comparado con la planeación oficial de 16 semanas. Sugiere acciones de mejora o apoyo.' />
                                </div>
                                <Button size="sm">Guardar Cambios</Button>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-7">
                            <AccordionTrigger>7. Transcriptor institucional (Nivel 5)</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                <p className="text-sm text-muted-foreground"><strong>Rol:</strong> Transcripción y análisis de reuniones.</p>
                                <div className="space-y-2">
                                    <Label htmlFor="train-transcriptor">Recuadro de entrenamiento / instrucciones</Label>
                                    <Textarea id="train-transcriptor" rows={5} defaultValue="Transcrive audios institucionales de reuniones. Resume los puntos clave, clasificando por tema y participantes. Genera reportes resumidos para el director." />
                                </div>
                                <Button size="sm">Guardar Cambios</Button>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-8">
                            <AccordionTrigger>8. Director / Administrador (Nivel 6)</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                <p className="text-sm text-muted-foreground"><strong>Rol:</strong> Control total y analista general.</p>
                                <div className="space-y-2">
                                    <Label htmlFor="train-director">Recuadro de entrenamiento / instrucciones</Label>
                                    <Textarea id="train-director" rows={5} defaultValue="Puedes ver y editar las instrucciones de todos los perfiles. Analiza bases de datos completas. Puedes solicitar resúmenes, reportes, comparativos, gráficos o conclusiones. Tono: directivo, técnico y estratégico." />
                                </div>
                                <Button size="sm">Guardar Cambios</Button>
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="item-9">
                            <AccordionTrigger>9. REACTIVO</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                <p className="text-sm text-muted-foreground"><strong>Rol:</strong> Asistente proactivo para padres/tutores.</p>
                                <div className="space-y-2">
                                    <Label htmlFor="train-reactivo">Recuadro de entrenamiento / instrucciones</Label>
                                    <Textarea id="train-reactivo" rows={12} defaultValue='Eres REACTIVO, un asistente AI educativo integrado en el dashboard de padres/tutores de SKOOL KITS. Activaste solo al presionar el botón "Analizar al alumno". Extrae datos read-only del dashboard del alumno (conducta, calificaciones, asistencias por clase/diarias, premios/reconocimientos, exámenes/tareas/trabajos especiales) y compáralos con la planificación por asignatura (dividida en 16 semanas, administrada gradualmente por el docente).
Flujo principal (siempre secuencial):
1. Análisis y comparación: Evalúa progreso real vs. esperado (ej. % avance semanal: >100% = avanzado, 80-100% = en tiempo, <80% = retrasado; calificaciones >70%, asistencias >80%). Usa evidencias del dashboard (ej. "Semana 4 de Español: 3/5 temas completados (60%), calificación 55% en tarea, 1 inasistencia").
2. Respuesta estructurada en 3 categorías (formato visual: encabezados en negrita, viñetas, gráfico simple ASCII o sugerencia de dashboard):
   1. Resumen general con evidencias: Overview por asignatura (ej. "Español: Retraso del 20% en 4 semanas. Evidencias: 2 premios por conducta, pero 40% en examen y 3 tareas pendientes").
   2. Proyección futura del período escolar: Análisis corto (1-2 oraciones, directo): (ej. "Con este ritmo, el promedio final podría bajar a 65%, afectando la promoción; intervención temprana lo elevaría a 85% para fin de semestre").
   3. Propuestas de apoyo: Lista categorizada solo si hay rezago (ej. "Bajo en exámenes: Refuerzo conceptual; Inasistencias: Sesiones grabadas; Tareas pendientes: Checklist diaria").

Bifurcación interactiva: Al final, presenta opciones claras: "¿Quieres que REACTIVO (AI proactiva) ayude al alumno, o prefieres ayudarlo tú? [Botón 1: AI ayuda] [Botón 2: Yo ayudo]".
- Si "Yo ayudo": Entrega lista de recursos por tema rezagado (ej. "Español - Gramática: Enlaces a Khan Academy (videos de sujeto/predicado), PDF con 5 ejercicios descargables, temas relacionados: Concordancia y puntuación").
- Si "AI ayuda": Genera un plan de lecciones personalizado (1-3 lecciones por rezago, inspirado en estructuras pedagógicas estándar: objetivos, introducción, desarrollo, práctica, evaluación). Como docente particular, hazlo interactivo y adaptativo. Culmina con quiz de 15 preguntas (múltiples choice/abiertas, >80% para aprobar).'/>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="func-reactivo">Funciones especiales</Label>
                                    <Textarea id="func-reactivo" rows={5} defaultValue='Pull de datos: Integra API/dashboard para comparar % avance semanal vs. planificación de 16 semanas (ej. gráfico: barras real vs. esperado).
Generación visual: Resúmenes con tablas/simple charts (ej. | Asignatura | Avance % | Evidencia |).
Alertas/notificaciones: Push/email condicionales (ej. post-quiz, con enlaces a planes/recursos).
Modo interactivo: Maneja bifurcación y lecciones (genera quizzes dinámicos; trackea respuestas del alumno).
Logging: Registra acciones completas (inputs: datos; outputs: planes; métricas: % aprobación en quizzes).
Reinicio adaptativo: Si quiz <80%, loopa con personalización (ej. basados en errores comunes).'/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="restr-reactivo">Restricciones</Label>
                                    <Textarea id="restr-reactivo" rows={4} defaultValue='Read-only estricto: No edites datos del dashboard; solo analiza/visualiza en contexto autorizado (padres verificados).
Sin sesgos: Hechos puros (ej. "Rezago del 20%" vs. "Falta motivación"); evita juicios emocionales.
Evidencia-based: Planes basados en estándares educativos (ej. MEC/UNESCO para gramática); no inventes – usa estructuras probadas.
Control de flujo: Espera respuesta en bifurcación (default: "Yo ayudo" si timeout); limítate a 1-2 temas por sesión para no abrumar.'/>
                                </div>
                                <Button size="sm">Guardar Cambios</Button>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={isCareerModalOpen} onOpenChange={setCareerModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingCareer ? 'Editar Carrera' : 'Nueva Carrera'}</DialogTitle>
                <DialogDescription>
                    {editingCareer ? 'Actualice el nombre de la carrera.' : 'Añada una nueva carrera técnica al plan de estudios.'}
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Label htmlFor="career-name">Nombre de la Carrera</Label>
                <Input 
                    id="career-name" 
                    value={careerName} 
                    onChange={(e) => setCareerName(e.target.value)} 
                    placeholder="Ej: Programación"
                />
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                <Button onClick={handleSaveCareer}>Guardar</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={departmentModalOpen} onOpenChange={setDepartmentModalOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>{editingDepartment ? 'Editar Departamento' : 'Nuevo Departamento'}</DialogTitle>
                  <DialogDescription>
                      {editingDepartment ? 'Actualice el nombre del departamento.' : 'Añada un nuevo departamento.'}
                  </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                  <Label htmlFor="department-name">Nombre del Departamento</Label>
                  <Input 
                      id="department-name" 
                      value={departmentName} 
                      onChange={(e) => setDepartmentName(e.target.value)} 
                      placeholder="Ej: Recursos Humanos"
                  />
              </div>
              <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                  <Button onClick={handleSaveDepartment}>Guardar</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
       <Dialog open={isDocTypeManagerOpen} onOpenChange={setDocTypeManagerOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Gestionar Tipos de Documento</DialogTitle>
                <DialogDescription>Añada, edite o elimine los tipos de documentos disponibles.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="flex gap-2">
                    <Input placeholder="Nuevo tipo de documento" value={newDocTypeName} onChange={(e) => setNewDocTypeName(e.target.value)} />
                    <Button onClick={handleAddDocType}>Agregar</Button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                    {documentTypes.map(dt => (
                        <div key={dt.id} className="flex items-center justify-between gap-2 p-2 border rounded-md">
                            {editingDocType?.id === dt.id ? (
                                <Input value={editingDocType.name} onChange={(e) => setEditingDocType({ ...editingDocType, name: e.target.value })} autoFocus />
                            ) : (
                                <span>{dt.name}</span>
                            )}
                            <div className="flex gap-1">
                                {editingDocType?.id === dt.id ? (
                                    <>
                                        <Button size="sm" onClick={handleUpdateDocType}>Guardar</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setEditingDocType(null)}>Cancelar</Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingDocType(dt)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>Esta acción eliminará el tipo de documento "{dt.name}".</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => removeDocumentType(dt.id)}>Eliminar</AlertDialogAction></AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isTemplateModalOpen} onOpenChange={setTemplateModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{templateModalAction === 'create' ? 'Crear Nuevo Turno' : 'Renombrar Turno'}</DialogTitle>
                <DialogDescription>
                    {templateModalAction === 'create'
                        ? 'Ingrese el nombre para la nueva plantilla de turno (ej: Nocturno).'
                        : `Ingrese el nuevo nombre para el turno "${scheduleTemplates.find(t => t.id === activeTemplateId)?.name}".`}
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Label htmlFor="template-name-input">Nombre del Turno</Label>
                <Input
                    id="template-name-input"
                    value={templateNameInput}
                    onChange={(e) => setTemplateNameInput(e.target.value)}
                />
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                <Button onClick={handleTemplateAction}>Guardar</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

    

