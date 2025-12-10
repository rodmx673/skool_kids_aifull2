
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserContext, User } from "@/context/UserContext";
import { CircularContext, Circular, CircularRecipient } from "@/context/CircularContext";
import { useContext, useState, useMemo, Fragment, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Send, Search, ChevronDown, Eye, Clock, CheckCircle, Wand2, Loader2, Printer, Save, FileCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { rewriteDocument } from "@/ai/flows/rewrite-document-flow";
import { InstitutionContext } from "@/context/InstitutionContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Template } from "@/context/TemplateContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import Image from "next/image";

function CircularsHistory() {
    const { circulars } = useContext(CircularContext);
    const { allUsers: users } = useContext(UserContext); // CORRECCIÓN: Usar allUsers
    const [openCollapsibleId, setOpenCollapsibleId] = useState<string | null>(null);

    // CORRECCIÓN: Añadir guarda de seguridad para evitar error si users es undefined
    const getUserName = (userId: string) => {
        if (!users) return 'Cargando...';
        return users.find(u => u.id === userId)?.username || 'Usuario Desconocido';
    };

    const formatDate = (isoString: string) => new Date(isoString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    const formatDateTime = (isoString: string) => new Date(isoString).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
    
    const handleViewSignature = (recipient: CircularRecipient, circular: Circular) => {
        if (recipient.signatureDataUrl) {
            const newWindow = window.open();
            newWindow?.document.write(`
                <html>
                    <head><title>Acuse de Recibo</title></head>
                    <body style="display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f0f0f0;">
                        <div style="text-align: center; background-color: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <h2>Acuse de Recibo</h2>
                            <p><strong>Documento:</strong> ${circular.title}</p>
                            <p><strong>Firmado por:</strong> ${getUserName(recipient.recipientId)}</p>
                            <p><strong>Fecha:</strong> ${recipient.signedAt ? formatDateTime(recipient.signedAt) : 'N/A'}</p>
                            <img src="${recipient.signatureDataUrl}" alt="Firma Digital" style="border: 1px solid #ccc; margin-top: 1rem;"/>
                        </div>
                    </body>
                </html>
            `);
        }
    };


    return (
        <Card>
            <CardHeader>
                <CardTitle>Historial de Circulares Enviadas</CardTitle>
                <CardDescription>Monitorea el estado de las firmas de los documentos enviados.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    {circulars.length > 0 ? (
                        circulars.map(circular => {
                             const signedCount = circular.recipients.filter(r => r.status === 'signed').length;
                             const totalRecipients = circular.recipients.length;
                            return (
                                <Collapsible 
                                    key={circular.id}
                                    asChild
                                    open={openCollapsibleId === circular.id}
                                    onOpenChange={() => setOpenCollapsibleId(prev => prev === circular.id ? null : circular.id)}
                                >
                                    <Fragment>
                                        <div className="flex items-center px-4 py-2 border-b last:border-b-0">
                                            <CollapsibleTrigger asChild>
                                                <button className="flex-1 text-left flex items-center gap-4">
                                                    <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                                                    <div className="flex-1">
                                                        <p className="font-semibold">{circular.title}</p>
                                                        <p className="text-sm text-muted-foreground">Enviada el {formatDate(circular.createdAt)}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={signedCount === totalRecipients ? "default" : "secondary"} className={signedCount === totalRecipients ? "bg-green-600" : ""}>
                                                            {signedCount} / {totalRecipients} Firmadas
                                                        </Badge>
                                                    </div>
                                                </button>
                                            </CollapsibleTrigger>
                                        </div>
                                        <CollapsibleContent asChild>
                                            <div className="bg-muted/50 p-4">
                                                <h4 className="font-semibold mb-2">Detalles de Firmas:</h4>
                                                <div className="overflow-x-auto">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Destinatario</TableHead>
                                                                <TableHead>Estado</TableHead>
                                                                <TableHead>Fecha de Firma</TableHead>
                                                                <TableHead className="text-right">Acción</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {circular.recipients.map(recipient => (
                                                                <TableRow key={recipient.recipientId}>
                                                                    <TableCell>{getUserName(recipient.recipientId)}</TableCell>
                                                                    <TableCell>
                                                                        {recipient.status === 'signed' ? (
                                                                            <span className="flex items-center gap-1 text-green-600"><CheckCircle className="h-4 w-4"/> Firmado</span>
                                                                        ) : (
                                                                            <span className="flex items-center gap-1 text-yellow-600"><Clock className="h-4 w-4"/> Pendiente</span>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell>{recipient.signedAt ? formatDateTime(recipient.signedAt) : 'N/A'}</TableCell>
                                                                    <TableCell className="text-right">
                                                                        {recipient.status === 'signed' && (
                                                                            <Button variant="ghost" size="sm" onClick={() => handleViewSignature(recipient, circular)}><Eye className="mr-2 h-4 w-4"/>Ver Firma</Button>
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        </CollapsibleContent>
                                    </Fragment>
                                </Collapsible>
                            )
                        })
                    ) : (
                         <div className="text-center p-8 text-muted-foreground">
                            No se han enviado circulares todavía.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}


export default function ComunicadosPage() {
    const { currentUser, allUsers: users } = useContext(UserContext); // CORRECCIÓN: Usar allUsers
    const { createCircular } = useContext(CircularContext);
    const { institution, getNextFolio, consumeNextFolio } = useContext(InstitutionContext);
    const { toast } = useToast();
    const router = useRouter();

    const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [circularTitle, setCircularTitle] = useState('');
    const [circularContent, setCircularContent] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [isRewriting, setIsRewriting] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    useEffect(() => {
        const storedTemplate = localStorage.getItem('templateToEdit');
        if (storedTemplate) {
            const template: Template = JSON.parse(storedTemplate);
            setCircularTitle(template.name);
            setCircularContent(template.body);
            setDepartmentId(template.departmentId);
            toast({
                title: "Plantilla Cargada",
                description: `Contenido de "${template.name}" listo para ser enviado.`
            });
            localStorage.removeItem('templateToEdit');
        }
    }, [toast]);

    const filteredRecipients = useMemo(() => {
        if (!users) return [];
        return users.filter(user =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) && user.id !== currentUser?.id
        );
    }, [users, searchTerm, currentUser]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRecipientIds(filteredRecipients.map(u => u.id));
        } else {
            setSelectedRecipientIds([]);
        }
    };

    const handleSelectRecipient = (userId: string, checked: boolean) => {
        if (checked) {
            setSelectedRecipientIds(prev => [...prev, userId]);
        } else {
            setSelectedRecipientIds(prev => prev.filter(id => id !== userId));
        }
    };

    const handleRewriteContent = async () => {
        if (!circularContent.trim()) {
            toast({ variant: "destructive", title: "Contenido Vacío", description: "No hay texto que formatear." });
            return;
        }
        setIsRewriting(true);
        try {
            const rewrittenBody = await rewriteDocument({ documentBody: circularContent });
            setCircularContent(rewrittenBody);
            toast({ title: "Contenido Mejorado", description: "El cuerpo de la circular ha sido mejorado por la IA." });
        } catch (error) {
            console.error("Error formatting document:", error);
            toast({ variant: "destructive", title: "Error de IA", description: "No se pudo conectar con el servicio de IA. Inténtelo de nuevo." });
        } finally {
            setIsRewriting(false);
        }
    };

    const validateForm = () => {
        if (!circularTitle.trim() || !circularContent.trim() || !departmentId) {
            toast({ variant: "destructive", title: "Error", description: "El título, contenido y departamento son obligatorios." });
            return false;
        }
        if (selectedRecipientIds.length === 0) {
            toast({ variant: "destructive", title: "Error", description: "Debe seleccionar al menos un destinatario." });
            return false;
        }
        if (!currentUser) {
            toast({ variant: "destructive", title: "Error", description: "No se pudo identificar al remitente." });
            return false;
        }
        return true;
    }

    const handleCreateCircular = () => {
        if (!validateForm()) return;

        const newFolio = getNextFolio();
        
        createCircular(
            { title: circularTitle, content: circularContent, creatorId: currentUser!.id, departmentId, folio: newFolio },
            selectedRecipientIds 
        );
        
        consumeNextFolio();

        toast({
            title: "¡Circular Enviada!",
            description: `El documento "${circularTitle}" con folio ${newFolio} ha sido enviado a ${selectedRecipientIds.length} destinatarios.`,
        });

        // Reset form
        setCircularTitle('');
        setCircularContent('');
        setSelectedRecipientIds([]);
        setDepartmentId('');
        setIsPreviewOpen(false); // Cierra el preview si está abierto
    };
    
    const allSelected = filteredRecipients.length > 0 && selectedRecipientIds.length === filteredRecipients.length;
    const isIndeterminate = selectedRecipientIds.length > 0 && selectedRecipientIds.length < filteredRecipients.length;

    const departmentName = institution?.departments.find(d => d.id === departmentId)?.name || 'Departamento';
    const currentDate = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <div className="space-y-6">
        <div>
            <h1 className="text-lg font-semibold md:text-2xl">Gestión de Circulares</h1>
        </div>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>1. Detalles del Documento</CardTitle>
                    <CardDescription>Escriba el título y el contenido de la circular que desea enviar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="circular-title">Título de la Circular</Label>
                        <Input
                            id="circular-title"
                            placeholder="Ej: Convocatoria a Junta General"
                            value={circularTitle}
                            onChange={(e) => setCircularTitle(e.target.value)}
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="circular-department">Departamento de Origen</Label>
                        <Select value={departmentId} onValueChange={setDepartmentId}>
                            <SelectTrigger id="circular-department">
                                <SelectValue placeholder="Seleccionar departamento..." />
                            </SelectTrigger>
                            <SelectContent>
                                {institution?.departments.map(dep => (
                                    <SelectItem key={dep.id} value={dep.id}>{dep.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="circular-content">Contenido del Mensaje</Label>
                        <Textarea
                            id="circular-content"
                            placeholder="Por medio de la presente se les convoca a..."
                            rows={8}
                            value={circularContent}
                            onChange={(e) => setCircularContent(e.target.value)}
                        />
                    </div>
                     <Button variant="outline" className="w-full" onClick={handleRewriteContent} disabled={isRewriting}>
                        {isRewriting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        {isRewriting ? "Formateando..." : "Auto-formatear con IA"}
                      </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>2. Seleccionar Destinatarios</CardTitle>
                    <CardDescription>Marque los usuarios que deben recibir este documento. Solo los docentes podrán firmarlo digitalmente.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar usuario..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="border rounded-lg max-h-[360px] overflow-y-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-background">
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox 
                                            checked={allSelected}
                                            aria-label="Seleccionar todo"
                                            onCheckedChange={handleSelectAll}
                                            data-state={isIndeterminate ? 'indeterminate' : (allSelected ? 'checked' : 'unchecked')}
                                        />
                                    </TableHead>
                                    <TableHead>Nombre del Usuario</TableHead>
                                    <TableHead>Rol</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRecipients.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedRecipientIds.includes(user.id)}
                                                onCheckedChange={(checked) => handleSelectRecipient(user.id, !!checked)}
                                            />
                                        </TableCell>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell><Badge variant="secondary">{user.role}</Badge></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                        {selectedRecipientIds.length} de {filteredRecipients.length} usuarios seleccionados.
                    </div>
                </CardContent>
            </Card>
       </div>
       <div className="flex flex-col sm:flex-row justify-end mt-4 gap-2">
            <Button variant="outline" onClick={() => setIsPreviewOpen(true)} disabled={!circularTitle || !circularContent || !departmentId} className="w-full sm:w-auto">
                <Eye className="mr-2 h-4 w-4" />
                Vista Previa
            </Button>
            <Button size="lg" onClick={handleCreateCircular} className="w-full sm:w-auto">
                <Send className="mr-2 h-4 w-4" />
                Crear y Enviar Circular
            </Button>
       </div>

        <Separator className="my-8" />
        
        <CircularsHistory />

        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col no-print">
                <DialogHeader>
                    <DialogTitle>Vista Previa del Documento</DialogTitle>
                    <DialogDescription>Así es como se verá la circular para los destinatarios.</DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto p-2 border bg-gray-100">
                    <div id="print-area" className="bg-white p-8 md:p-12 shadow-lg rounded-lg aspect-[8.5/11] max-w-3xl mx-auto flex flex-col text-sm text-black font-serif print-area">
                        <header className="flex justify-between items-start mb-8">
                            <div className="relative w-24 h-24">
                                <Image src="https://picsum.photos/seed/logo1/200/200" alt="Logo Izquierdo" layout="fill" objectFit="contain" data-ai-hint="logo institucional"/>
                            </div>
                             <div className="text-center text-[10px] leading-tight">
                                <p className="font-bold">Secretaría de Educación Pública</p>
                                <p>Subsecretaría de Educación Media Superior</p>
                                <p>Dirección General de Educación Tecnológica Industrial y de Servicios</p>
                                <p className="font-bold mt-2">Centro de Bachillerato Tecnológico Industrial y de Servicios No. 55</p>
                            </div>
                            <div className="relative w-24 h-24">
                                <Image src="https://picsum.photos/seed/logo2/200/200" alt="Logo Derecho" layout="fill" objectFit="contain" data-ai-hint="emblema" />
                            </div>
                        </header>
                         <div className="flex-1 overflow-y-auto flex flex-col">
                            <div className="flex justify-between mb-8 text-xs">
                                <p className="font-bold">{departmentName}</p>
                                <div className="text-right">
                                    <p className="font-bold">Circular No. {getNextFolio()}</p>
                                    <p>Pánuco, Veracruz, a {currentDate}</p>
                                </div>
                            </div>
                            <div className="mb-4 text-xs font-bold">
                                <p>A TODO EL PERSONAL</p>
                                <p>PRESENTE</p>
                            </div>
                             <h3 className="text-center font-bold text-base mb-4">{circularTitle}</h3>
                            <div className="text-xs leading-relaxed text-justify whitespace-pre-wrap flex-grow">
                                <p>{circularContent}</p>
                            </div>
                             <div className="mt-20 text-center text-xs">
                                <p className="font-bold">Atentamente</p>
                                <div className="relative w-28 h-12 mx-auto my-4">
                                    <Image src="https://picsum.photos/seed/firma/200/100" alt="Firma" layout="fill" objectFit="contain" data-ai-hint="signature"/>
                                </div>
                                <p className="font-bold">{currentUser?.username || "Nombre del Remitente"}</p>
                                <p>{departmentName}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => {toast({title: 'Guardado como borrador (simulado).'})}}><Save className="mr-2 h-4 w-4"/> Guardar como Pendiente</Button>
                    <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4"/> Imprimir / PDF</Button>
                    <Button onClick={handleCreateCircular}><FileCheck className="mr-2 h-4 w-4"/> Enviar Circular</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
