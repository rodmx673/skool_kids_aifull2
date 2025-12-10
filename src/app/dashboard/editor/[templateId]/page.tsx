

"use client";

import { useState, useEffect, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Printer, Wand2, Loader2, Save, FilePlus, Upload } from 'lucide-react';
import { TemplateContext, type Template } from '@/context/TemplateContext';
import { useToast } from '@/hooks/use-toast';
import { rewriteDocument } from '@/ai/flows/rewrite-document-flow';
import { InstitutionContext } from '@/context/InstitutionContext';
import { CircularContext } from '@/context/CircularContext';
import { UserContext } from '@/context/UserContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// Componente para un campo de carga de imagen
function ImageUploader({ label, value, onValueChange }: { label: string, value: string, onValueChange: (value: string) => void }) {
    const { toast } = useToast();
    const inputId = `upload-${label.toLowerCase().replace(/\s/g, '-')}`;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onValueChange(reader.result as string);
                toast({ title: "Imagen Cargada", description: `La imagen para "${label}" está lista.` });
            };
            reader.onerror = () => {
                toast({ variant: "destructive", title: "Error", description: "No se pudo leer el archivo de imagen." });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex items-center gap-2">
                <Input
                    id={inputId}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <Button asChild variant="outline" className="flex-1">
                    <Label htmlFor={inputId} className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        Subir Imagen
                    </Label>
                </Button>
                {value && (
                    <div className="relative w-16 h-10 rounded-md overflow-hidden border bg-muted">
                        <Image src={value} alt={`Vista previa de ${label}`} layout="fill" objectFit="contain" />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function EditorPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { currentUser } = useContext(UserContext);
    const { getNextFolio, consumeNextFolio, institution } = useContext(InstitutionContext);
    const { createCircular } = useContext(CircularContext);
    const { templates, addTemplate, updateTemplate, documentTypes } = useContext(TemplateContext);

    const [template, setTemplate] = useState<Template | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [isRewriting, setIsRewriting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Style state
    const [fontFamily, setFontFamily] = useState("'Times New Roman', Times, serif");
    const [fontSize, setFontSize] = useState('12pt');
    const [isBold, setIsBold] = useState(false);


    useEffect(() => {
        setIsClient(true);
        const templateId = params.templateId as string;
        
        let foundTemplate = templates.find(t => t.id === templateId);

        if (!foundTemplate) {
            const storedTemplateRaw = localStorage.getItem('templateToEdit');
            if (storedTemplateRaw) {
                const storedTemplate = JSON.parse(storedTemplateRaw);
                if (storedTemplate.id === templateId) {
                    foundTemplate = storedTemplate;
                }
            }
        }
        
        if (foundTemplate) {
            setTemplate(foundTemplate);
        } else {
            router.push('/dashboard/settings?tab=templates');
        }

    }, [params.templateId, templates, router]);

    const handleFieldChange = (field: keyof Template, value: string) => {
        if (template) {
            setTemplate({ ...template, [field]: value });
        }
    };

    const handleRewrite = async () => {
        if (!template?.body.trim()) return;
        setIsRewriting(true);
        try {
            const rewritten = await rewriteDocument({ documentBody: template.body });
            handleFieldChange('body', rewritten);
            toast({ title: "Contenido reescrito por IA" });
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo reescribir el contenido." });
        } finally {
            setIsRewriting(false);
        }
    };

    const handlePrint = () => window.print();

    const handleSaveTemplate = () => {
        if (!template || !template.departmentId) {
             toast({ variant: "destructive", title: 'Error', description: 'Por favor, seleccione un departamento antes de guardar.' });
            return;
        }
        
        const isNew = template.id.startsWith('new-');
        if (isNew) {
            addTemplate(template);
            localStorage.removeItem('templateToEdit');
        } else {
            updateTemplate(template.id, template);
        }

        toast({ title: 'Plantilla Guardada', description: `La plantilla "${template.name}" ha sido guardada.` });
    };

    const handleCreateAndSend = () => {
        if (!template || !currentUser || !template.departmentId) {
            toast({ variant: "destructive", title: 'Error', description: 'Por favor, complete el nombre, cuerpo y departamento de la plantilla.' });
            return;
        };
        
        setIsSaving(true);
        const currentFolio = getNextFolio();

        createCircular(
            {
                title: template.name,
                content: template.body,
                departmentId: template.departmentId,
                creatorId: currentUser.id,
                folio: currentFolio,
            },
            [] 
        );
        consumeNextFolio();
        
        setIsSaving(false);
        toast({ title: 'Documento Foliado y Enviado', description: `Se ha generado la circular con el folio ${currentFolio}.` });
        router.push(`/dashboard/templates/${template.departmentId}`);
    };

    if (!isClient || !template || !institution) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    .print-area { box-shadow: none !important; margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; }
                }
            `}</style>

            <div className="max-w-7xl mx-auto mb-4 no-print">
                 <div className="flex justify-between items-center gap-4">
                    <Button variant="link" className="p-0 h-auto text-muted-foreground" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Button>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={handleRewrite} disabled={isRewriting}>
                            {isRewriting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                            Reescribir con IA
                        </Button>
                        <Button variant="outline" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" />
                            Imprimir / PDF
                        </Button>
                         <Button variant="outline" onClick={handleSaveTemplate} disabled={!template.departmentId}>
                            <Save className="mr-2 h-4 w-4"/>
                            Guardar Plantilla
                         </Button>
                         <Button onClick={handleCreateAndSend} disabled={isSaving || !template.departmentId}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FilePlus className="mr-2 h-4 w-4"/>}
                            Foliar y Enviar
                         </Button>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6 no-print">
                     <Card>
                        <CardHeader>
                            <CardTitle>Editor de Plantilla</CardTitle>
                            <CardDescription>Modifica los campos de la plantilla. Los cambios se guardarán para futuros usos.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="template-name">Nombre de la Plantilla</Label>
                                <Input id="template-name" value={template.name} onChange={e => handleFieldChange('name', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="department-id">Departamento de Origen</Label>
                                <Select value={template.departmentId} onValueChange={value => handleFieldChange('departmentId', value)}>
                                    <SelectTrigger id="department-id">
                                        <SelectValue placeholder="Seleccione un departamento..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {institution?.departments.map(dep => (
                                            <SelectItem key={dep.id} value={dep.id}>{dep.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="doc-type">Tipo de Documento</Label>
                                <Select value={template.docType} onValueChange={value => handleFieldChange('docType', value)}>
                                    <SelectTrigger id="doc-type"><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        {documentTypes.map(dt => <SelectItem key={dt.id} value={dt.name}>{dt.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Cuerpo del Documento</Label>
                                <Textarea rows={8} value={template.body} onChange={e => handleFieldChange('body', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Estilo del Documento</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Tipo de Letra</Label>
                                  <Select value={fontFamily} onValueChange={setFontFamily}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="'Times New Roman', Times, serif">Times New Roman</SelectItem>
                                      <SelectItem value="'Arial', sans-serif">Arial</SelectItem>
                                      <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Tamaño de Letra</Label>
                                  <Select value={fontSize} onValueChange={setFontSize}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="10pt">10 pt</SelectItem>
                                      <SelectItem value="11pt">11 pt</SelectItem>
                                      <SelectItem value="12pt">12 pt</SelectItem>
                                      <SelectItem value="14pt">14 pt</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch id="bold-text" checked={isBold} onCheckedChange={setIsBold} />
                                <Label htmlFor="bold-text">Texto en Negrita</Label>
                              </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Datos del Firmante</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="signer-name">Nombre del Firmante</Label>
                                <Input id="signer-name" value={template.signerName} onChange={e => handleFieldChange('signerName', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signer-title">Cargo del Firmante</Label>
                                <Input id="signer-title" value={template.signerTitle} onChange={e => handleFieldChange('signerTitle', e.target.value)} />
                            </div>
                             <ImageUploader 
                                label="Imagen de Firma" 
                                value={template.signatureUrl} 
                                onValueChange={(value) => handleFieldChange('signatureUrl', value)}
                             />
                        </CardContent>
                    </Card>
                    <Card>
                         <CardHeader>
                            <CardTitle>Logos del Documento</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ImageUploader 
                                label="Logo Cabecera Izquierda" 
                                value={template.headerLogo1Url} 
                                onValueChange={(value) => handleFieldChange('headerLogo1Url', value)}
                             />
                              <ImageUploader 
                                label="Logo Cabecera Derecha" 
                                value={template.headerLogo2Url} 
                                onValueChange={(value) => handleFieldChange('headerLogo2Url', value)}
                             />
                              <ImageUploader 
                                label="Logo Pie Izquierdo" 
                                value={template.footerLogo1Url} 
                                onValueChange={(value) => handleFieldChange('footerLogo1Url', value)}
                             />
                              <ImageUploader 
                                label="Logo Pie Derecho" 
                                value={template.footerLogo2Url} 
                                onValueChange={(value) => handleFieldChange('footerLogo2Url', value)}
                             />
                        </CardContent>
                    </Card>
                </div>
                
                <div className="lg:col-span-2">
                    <div className="bg-white p-8 md:p-12 shadow-lg rounded-lg aspect-[8.5/11] print-area">
                        <div 
                            className="h-full flex flex-col text-black"
                            style={{ fontFamily: fontFamily, fontSize: fontSize, fontWeight: isBold ? 'bold' : 'normal' }}
                        >
                            <header className="flex justify-between items-start mb-8">
                                <div className="relative w-24 h-24">
                                    <Image src={template.headerLogo1Url} alt="Logo Izquierdo" layout="fill" objectFit="contain" data-ai-hint="logo institucional"/>
                                </div>
                                 <div className="text-center leading-tight" style={{ fontSize: '9pt', whiteSpace: 'pre-line' }}>
                                    {institution.fullName}
                                </div>
                                <div className="relative w-24 h-24">
                                    <Image src={template.headerLogo2Url} alt="Logo Derecho" layout="fill" objectFit="contain" data-ai-hint="emblema" />
                                </div>
                            </header>
                            <div className="flex-1 overflow-y-auto flex flex-col">
                                <div className="flex justify-end mb-8 text-xs">
                                    <div className="text-right space-y-1">
                                        <p className="font-bold">{template.docType} No. {getNextFolio()}</p>
                                        <p>{template.locationAndDate}</p>
                                    </div>
                                </div>
                                <div className="mb-4 font-bold" style={{ fontSize: 'calc(1em * 1.05)' }}>
                                    <p>A QUIEN CORRESPONDA</p>
                                    <p>PRESENTE</p>
                                </div>
                                 <h3 className="text-center font-bold text-base mb-4">{template.name}</h3>
                                <div className="leading-relaxed text-justify whitespace-pre-wrap flex-grow">
                                    <p>{template.body}</p>
                                </div>
                                 <div className="mt-20 text-center">
                                    <p className="font-bold">Atentamente</p>
                                    <div className="relative w-28 h-12 mx-auto my-8">
                                        <Image src={template.signatureUrl} alt="Firma" layout="fill" objectFit="contain" data-ai-hint="signature"/>
                                    </div>
                                    <p className="font-bold">{template.signerName}</p>
                                    <p>{template.signerTitle}</p>
                                    <p>{institution.name}</p>
                                </div>
                            </div>
                            <footer className="mt-auto border-t-2 border-black pt-4 flex justify-between items-center" style={{ fontSize: '8pt' }}>
                                <div className="relative w-16 h-16"><Image src={template.footerLogo1Url} alt="Logo Footer 1" layout="fill" objectFit="contain" data-ai-hint="logo pequeño"/></div>
                                <div className="text-center">
                                    <p>"{institution.name} - {institution.slogan}"</p>
                                    <p>{institution.address}</p>
                                    <p>Tel. {institution.phone}, correo electrónico: {institution.email}</p>
                                </div>
                                <div className="relative w-16 h-16"><Image src={template.footerLogo2Url} alt="Logo Footer 2" layout="fill" objectFit="contain" data-ai-hint="logo pequeño"/></div>
                            </footer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
