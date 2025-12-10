
"use client";

import { useContext, useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Paperclip, Upload, CheckCircle } from "lucide-react";
import { AcademicContext } from '@/context/AcademicContext';
import { useToast } from '@/hooks/use-toast';
import { UserContext } from '@/context/UserContext';
import { InstitutionContext } from '@/context/InstitutionContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';


function FileUploader({ label, name, onFileChange, isUploaded }: { label: string; name: string, onFileChange: (name: string, fileDataUrl: string | null, fileName: string | null) => void, isUploaded: boolean }) {
    const [fileName, setFileName] = useState('');
    const { toast } = useToast();
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            onFileChange(name, null, file.name); 
             toast({
                title: "Archivo Seleccionado",
                description: `${file.name} está listo para ser enviado.`,
            });
        } else {
            setFileName('');
            onFileChange(name, null, null);
        }
    };
    
    return (
        <div className="space-y-2">
            <Label htmlFor={name}>{label}</Label>
            <div className="flex items-center gap-2">
                <Input id={name} name={name} type="file" onChange={handleFileChange} className="hidden" />
                <Label htmlFor={name} className="flex-1 cursor-pointer w-full">
                    <Button 
                        asChild 
                        variant="outline" 
                        className={cn(
                            "w-full justify-start text-left",
                            isUploaded && "border-green-500 bg-green-50 text-green-700 hover:bg-green-100"
                        )}
                    >
                        <div className="flex items-center w-full">
                             {isUploaded ? <CheckCircle className="mr-2 h-4 w-4 flex-shrink-0" /> : <Upload className="mr-2 h-4 w-4 flex-shrink-0" />}
                            <span className="truncate flex-1">
                                {fileName ? `${fileName}` : 'Seleccionar archivo...'}
                            </span>
                        </div>
                    </Button>
                </Label>
            </div>
        </div>
    );
}

const requiredDocs = [
    'doc_acta_nacimiento',
    'doc_curp',
    'doc_certificado_sec',
    'doc_constancia_estudios',
    'doc_comprobante_dom',
    'doc_fotografia',
    'doc_nss',
];

function NewStudentForm() {
    const { careers } = useContext(AcademicContext);
    const { allUsers: users } = useContext(UserContext);
    const { institution } = useContext(InstitutionContext);
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSocioeconomic, setShowSocioeconomic] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<Record<string, { dataUrl: string | null, fileName: string } | null>>({});
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    
    const [careerPreferences, setCareerPreferences] = useState<Record<string, string>>({
        opcion_1: '',
        opcion_2: '',
        opcion_3: '',
        opcion_4: '',
        opcion_5: '',
    });

    const handlePreferenceChange = (optionKey: string, value: string) => {
        setCareerPreferences(prev => ({
            ...prev,
            [optionKey]: value,
        }));
    };

    const getAvailableCareers = (currentOptionKey: string) => {
        const selectedValues = Object.values(careerPreferences).filter(Boolean);
        const currentValue = careerPreferences[currentOptionKey];
        return careers.filter(
            career => !selectedValues.includes(career.id) || career.id === currentValue
        );
    };

    const handleFileChange = (fieldName: string, fileDataUrl: string | null, fileName: string | null) => {
        setUploadedFiles(prev => ({
            ...prev,
            [fieldName]: fileDataUrl && fileName ? { dataUrl: fileDataUrl, fileName } : (fileName ? { dataUrl: null, fileName } : null),
        }));
    };
    
    const isFormComplete = useMemo(() => {
        const requiredTextInputs = ['nombre', 'apellidoPaterno', 'apellidoMaterno', 'curp', 'email', 'calle', 'colonia', 'codigoPostal', 'telefonoCelular'];
        const allTextInputsFilled = requiredTextInputs.every(field => formValues[field]?.trim());
        const allDocsUploaded = requiredDocs.every(docKey => !!uploadedFiles[docKey]);
        return allTextInputsFilled && allDocsUploaded;
    }, [formValues, uploadedFiles]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
    };
    
    const estadosMexico = [
        "Veracruz", "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", 
        "Chiapas", "Chihuahua", "Coahuila", "Colima", "Durango", "Guanajuato", "Guerrero", 
        "Hidalgo", "Jalisco", "México", "Michoacán", "Morelos", "Nayarit", "Nuevo León", 
        "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", 
        "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Yucatán", "Zacatecas", 
        "Ciudad de México"
    ].sort((a, b) => {
        if (a === 'Veracruz') return -1;
        if (b === 'Veracruz') return 1;
        return a.localeCompare(b);
    });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Double-check validation on submit
        if (!isFormComplete) {
            toast({
                variant: 'destructive',
                title: "Formulario Incompleto",
                description: 'Por favor, rellene todos los campos obligatorios y suba todos los documentos requeridos.',
            });
            return;
        }

        setIsSubmitting(true);
        
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const uppercasedData: { [key: string]: any } = {};
        for (const key in data) {
            const value = data[key];
            if (typeof value === 'string' && key !== 'email') {
                uppercasedData[key] = value.toUpperCase();
            } else {
                uppercasedData[key] = value;
            }
        }

        const emailExists = users.some(u => u.email === data.email);
        const curpExists = users.some(u => u.curp && u.curp === uppercasedData.curp);

        if (emailExists || curpExists) {
            toast({
                variant: 'destructive',
                title: "Aspirante ya Registrado",
                description: `El ${emailExists ? 'email' : 'CURP'} proporcionado ya se encuentra en el sistema.`,
            });
            setIsSubmitting(false);
            return;
        }
        
        const submissionData: any = { ...uppercasedData, id: `new-${Date.now()}`, status: 'pending' };
        
        for (const key in uploadedFiles) {
            if (uploadedFiles[key]) {
                submissionData[key] = uploadedFiles[key]!.fileName;
            }
        }

        const admin = users.find(u => u.role === 'administrador');
        if (admin) {
            submissionData.tenantId = admin.id;
        }

        try {
            const existingSubmissions = JSON.parse(window.localStorage.getItem('datalake-inscripciones') || '[]');
            existingSubmissions.push(submissionData);
            window.localStorage.setItem('datalake-inscripciones', JSON.stringify(existingSubmissions));

            toast({ title: "Solicitud Recibida", description: "Tu solicitud de inscripción ha sido enviada para revisión." });
            (event.target as HTMLFormElement).reset();
            setShowSocioeconomic(false);
            setUploadedFiles({});
            setFormValues({});
            setCareerPreferences({ opcion_1: '', opcion_2: '', opcion_3: '', opcion_4: '', opcion_5: '' });
        } catch (error) {
            console.error("Error saving submission to localStorage", error);
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                 toast({ variant: 'destructive', title: "Error de Almacenamiento", description: `El tamaño de los archivos es demasiado grande. Por favor, intente con imágenes de menor resolución.` });
            } else {
                toast({ variant: 'destructive', title: "Error de Guardado", description: `No se pudo guardar la solicitud localmente.` });
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
         <form onSubmit={handleSubmit}>
            <div className="space-y-8">
                <div className="text-center space-y-1">
                    <p className="font-semibold text-muted-foreground">{institution?.headerLine1}</p>
                    <p className="text-xl font-bold">{institution?.headerLine2}</p>
                    <p className="text-lg font-semibold">{institution?.headerLine3}</p>
                    <p className="text-md text-primary font-bold">Ciclo Escolar {institution?.schoolCycle}</p>
                </div>
            
                <Card>
                    <CardHeader><CardTitle>Datos Personales</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2"><Label htmlFor="nombre">Nombre(s)</Label><Input id="nombre" name="nombre" required onChange={handleInputChange}/></div>
                            <div className="space-y-2"><Label htmlFor="apellidoPaterno">Apellido Paterno</Label><Input id="apellidoPaterno" name="apellidoPaterno" required onChange={handleInputChange} /></div>
                            <div className="space-y-2"><Label htmlFor="apellidoMaterno">Apellido Materno</Label><Input id="apellidoMaterno" name="apellidoMaterno" required onChange={handleInputChange}/></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2"><Label htmlFor="curp">CURP</Label><Input id="curp" name="curp" required onChange={handleInputChange}/></div>
                            <div className="space-y-2"><Label htmlFor="email">Correo electrónico</Label><Input id="email" name="email" type="email" required onChange={handleInputChange}/></div>
                             <div className="space-y-2"><Label>Sexo</Label><RadioGroup name="sexo" className="flex items-center space-x-4 pt-2"><div className="flex items-center space-x-2"><RadioGroupItem value="mujer" id="r-mujer" /><Label htmlFor="r-mujer">Mujer</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="hombre" id="r-hombre" /><Label htmlFor="r-hombre">Hombre</Label></div></RadioGroup></div>
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2"><Label htmlFor="estadoNacimiento">Estado de Nacimiento</Label><Select name="estadoNacimiento"><SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger><SelectContent>{estadosMexico.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select></div>
                            <div className="space-y-2"><Label htmlFor="municipioNacimiento">Municipio de Nacimiento</Label><Input id="municipioNacimiento" name="municipioNacimiento"/></div>
                            <div className="space-y-2"><Label htmlFor="localidadNacimiento">Localidad de Nacimiento</Label><Input id="localidadNacimiento" name="localidadNacimiento"/></div>
                        </div>
                         <div className="space-y-2"><Label>Fecha de Nacimiento</Label><div className="grid grid-cols-3 gap-2"><Select name="diaNacimiento"><SelectTrigger><SelectValue placeholder="Día" /></SelectTrigger><SelectContent>{Array.from({length: 31}, (_, i) => i + 1).map(d => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}</SelectContent></Select><Select name="mesNacimiento"><SelectTrigger><SelectValue placeholder="Mes" /></SelectTrigger><SelectContent>{["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((m, i) => <SelectItem key={m} value={String(i+1)}>{m}</SelectItem>)}</SelectContent></Select><Select name="anoNacimiento"><SelectTrigger><SelectValue placeholder="Año" /></SelectTrigger><SelectContent>{Array.from({length: 20}, (_, i) => new Date().getFullYear() - 15 - i).map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent></Select></div></div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Domicilio del Aspirante</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                             <div className="space-y-2"><Label htmlFor="domicilioEstado">Estado</Label><Select name="domicilioEstado"><SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger><SelectContent>{estadosMexico.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select></div>
                            <div className="space-y-2"><Label htmlFor="domicilioMunicipio">Municipio</Label><Input id="domicilioMunicipio" name="domicilioMunicipio"/></div>
                            <div className="space-y-2"><Label htmlFor="domicilioLocalidad">Localidad</Label><Input id="domicilioLocalidad" name="domicilioLocalidad"/></div>
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2"><Label htmlFor="calle">Calle</Label><Input id="calle" name="calle" required onChange={handleInputChange} /></div>
                            <div className="space-y-2"><Label htmlFor="numeroExterior">No. Exterior</Label><Input id="numeroExterior" name="numeroExterior" /></div>
                            <div className="space-y-2"><Label htmlFor="numeroInterior">No. Interior (opcional)</Label><Input id="numeroInterior" name="numeroInterior" /></div>
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2"><Label htmlFor="colonia">Colonia</Label><Input id="colonia" name="colonia" required onChange={handleInputChange}/></div>
                            <div className="space-y-2"><Label htmlFor="entreCalles">Entre Calles</Label><Input id="entreCalles" name="entreCalles" /></div>
                            <div className="space-y-2"><Label htmlFor="codigoPostal">Código Postal</Label><Input id="codigoPostal" name="codigoPostal" type="number" required onChange={handleInputChange}/></div>
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2"><Label htmlFor="telefonoCasa">Teléfono Casa</Label><Input id="telefonoCasa" name="telefonoCasa" type="tel" /></div>
                            <div className="space-y-2"><Label htmlFor="telefonoCelular">Teléfono Celular (Aspirante)</Label><Input id="telefonoCelular" name="telefonoCelular" type="tel" required onChange={handleInputChange}/></div>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader><CardTitle>Escuela de Procedencia</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                             <div className="space-y-2"><Label htmlFor="procedenciaEstado">Estado</Label><Select name="procedenciaEstado"><SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger><SelectContent>{estadosMexico.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select></div>
                            <div className="space-y-2"><Label htmlFor="procedenciaMunicipio">Municipio</Label><Input id="procedenciaMunicipio" name="procedenciaMunicipio"/></div>
                            <div className="space-y-2"><Label htmlFor="procedenciaLocalidad">Localidad</Label><Input id="procedenciaLocalidad" name="procedenciaLocalidad"/></div>
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2"><Label htmlFor="modalidad">Modalidad</Label><Select name="modalidad"><SelectTrigger id="modalidad"><SelectValue placeholder="Seleccionar..." /></SelectTrigger><SelectContent><SelectItem value="telesecundaria">Telesecundaria</SelectItem><SelectItem value="tecnica">Técnica</SelectItem><SelectItem value="general">General</SelectItem><SelectItem value="comunitaria">Comunitaria</SelectItem></SelectContent></Select></div>
                            <div className="space-y-2"><Label htmlFor="regimen">Régimen</Label><Select name="regimen"><SelectTrigger id="regimen"><SelectValue placeholder="Seleccionar..." /></SelectTrigger><SelectContent><SelectItem value="publica">Pública</SelectItem><SelectItem value="privada">Privada</SelectItem></SelectContent></Select></div>
                            <div className="space-y-2"><Label htmlFor="tipoSec">TIPO SEC</Label><Select name="tipoSec"><SelectTrigger id="tipoSec"><SelectValue placeholder="Seleccionar..." /></SelectTrigger><SelectContent><SelectItem value="federal">Federal</SelectItem><SelectItem value="estatal">Estatal</SelectItem><SelectItem value="particular">Particular</SelectItem></SelectContent></Select></div>
                            <div className="space-y-2"><Label htmlFor="claveEscuela">Clave de la escuela</Label><Input id="claveEscuela" name="claveEscuela" /></div>
                        </div>
                        <div className="space-y-2"><Label htmlFor="generacion">Generación</Label><Input id="generacion" name="generacion" placeholder="Ej: 2022-2025" /></div>
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader><CardTitle>Información Académica y Personal</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2"><Label>Constancia de:</Label><RadioGroup defaultValue="certificado_secundaria" name="constanciaDe" className="flex items-center space-x-4 pt-2"><div className="flex items-center space-x-2"><RadioGroupItem value="certificado_secundaria" id="const-cert" /><Label htmlFor="const-cert">Certificado de secundaria</Label></div></RadioGroup></div>
                        <div className="space-y-2"><Label htmlFor="promedio">Promedio</Label><Input id="promedio" name="promedio" type="number" step="0.1" defaultValue="8" /></div>
                        <div className="space-y-2"><Label htmlFor="estadoCivil">Estado civil</Label><Select name="estadoCivil"><SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger><SelectContent><SelectItem value="soltero">Soltero(a)</SelectItem></SelectContent></Select></div>
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader><CardTitle>Orden de Preferencia Educativa</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {['opcion_1', 'opcion_2', 'opcion_3', 'opcion_4', 'opcion_5'].map((key, i) => (
                            <div className="space-y-2" key={key}>
                                <Label htmlFor={key}>{i + 1}ª Opción</Label>
                                <Select name={key} value={careerPreferences[key]} onValueChange={(value) => handlePreferenceChange(key, value)}>
                                    <SelectTrigger><SelectValue placeholder="Seleccionar carrera..." /></SelectTrigger>
                                    <SelectContent>
                                        {getAvailableCareers(key).map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader><CardTitle>Documentación Requerida</CardTitle><CardDescription>Sube los siguientes documentos en formato PDF o imagen.</CardDescription></CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {requiredDocs.map(docKey => {
                            const label = docKey.replace('doc_', '').replace(/_/g, ' ').replace(/^./, str => str.toUpperCase());
                            return (
                                <FileUploader
                                    key={docKey}
                                    label={label}
                                    name={docKey}
                                    onFileChange={handleFileChange}
                                    isUploaded={!!uploadedFiles[docKey]}
                                />
                            );
                        })}
                    </CardContent>
                </Card>

                <div className="items-top flex space-x-2 rounded-lg border p-4">
                    <Checkbox id="show-socioeconomic" checked={showSocioeconomic} onCheckedChange={(checked) => setShowSocioeconomic(!!checked)} />
                    <div className="grid gap-1.5 leading-none">
                        <label htmlFor="show-socioeconomic" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Deseo aplicar a becas o programas de gobierno y autorizo el llenado del estudio socioeconómico.
                        </label>
                        <p className="text-sm text-muted-foreground">Al marcar esta casilla, se mostrarán campos adicionales requeridos.</p>
                    </div>
                </div>

                {showSocioeconomic && (
                    <Card className="animate-in fade-in-50">
                        <CardHeader><CardTitle>Estudio Socio-Económico (Para Becas)</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-2 space-y-2"><Label htmlFor="tutorNombre">Nombre del Padre o Tutor</Label><Input id="tutorNombre" name="tutorNombre" /></div>
                                <div className="space-y-2"><Label htmlFor="parentesco">Parentesco</Label><Input id="parentesco" name="parentesco" /></div>
                            </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-2"><Label htmlFor="tutorNivelEstudios">Nivel de Estudios (Tutor)</Label><Input id="tutorNivelEstudios" name="tutorNivelEstudios" /></div>
                                <div className="space-y-2"><Label htmlFor="tutorOcupacion">Ocupación (Tutor)</Label><Input id="tutorOcupacion" name="tutorOcupacion" /></div>
                                <div className="space-y-2"><Label htmlFor="tutorSalarioMensual">Salario Mensual (Aprox.)</Label><Input id="tutorSalarioMensual" name="tutorSalarioMensual" type="number" /></div>
                            </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label htmlFor="tutorEmpresa">Empresa donde trabaja</Label><Input id="tutorEmpresa" name="tutorEmpresa" /></div>
                                <div className="space-y-2"><Label htmlFor="tutorTelefonoTrabajo">Teléfono del Trabajo</Label><Input id="tutorTelefonoTrabajo" name="tutorTelefonoTrabajo" type="tel" /></div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 <div className="space-y-2"><Label htmlFor="nacionalidad">Nacionalidad (Aspirante)</Label><Input id="nacionalidad" name="nacionalidad" defaultValue="Mexicana" /></div>
                                <div className="space-y-2"><Label htmlFor="telefonoTutor">Teléfono Celular (Padre o Tutor)</Label><Input id="telefonoTutor" name="telefonoTutor" type="tel" /></div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-end pt-4">
                    <Button type="submit" size="lg" disabled={isSubmitting || !isFormComplete}>
                        {isSubmitting ? <><Paperclip className="mr-2 h-4 w-4 animate-spin" />Enviando Solicitud...</> : 'Enviar Solicitud de Inscripción'}
                    </Button>
                </div>
            </div>
        </form>
    );
}

export default function InscripcionesPage() {
    return (
        <div className="space-y-6">
            <NewStudentForm />
        </div>
    );
}

    