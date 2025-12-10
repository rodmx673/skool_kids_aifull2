

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
import { Send, Search, ChevronDown, Eye, Clock, CheckCircle, Wand2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { rewriteDocument } from "@/ai/flows/rewrite-document-flow";
import { InstitutionContext } from "@/context/InstitutionContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Template } from "@/context/TemplateContext";

function CircularsHistory() {
    const { circulars } = useContext(CircularContext);
    const { visibleUsers: users } = useContext(UserContext);
    const [openCollapsibleId, setOpenCollapsibleId] = useState<string | null>(null);

    const getUserName = (userId: string) => users.find(u => u.id === userId)?.username || 'Usuario Desconocido';

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
                <CardTitle>Historial de Comunicados Enviados</CardTitle>
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
                                        </CollapsibleContent>
                                    </Fragment>
                                </Collapsible>
                            )
                        })
                    ) : (
                         <div className="text-center p-8 text-muted-foreground">
                            No se han enviado comunicados todavía.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}


export default function ComunicadosPage() {
    const { currentUser, visibleUsers: users } = useContext(UserContext);
    const { createCircular } = useContext(CircularContext);
    const { institution, getNextFolio } = useContext(InstitutionContext);
    const { toast } = useToast();
    const router = useRouter();

    const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [circularTitle, setCircularTitle] = useState('');
    const [circularContent, setCircularContent] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [isRewriting, setIsRewriting] = useState(false);

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
            toast({ title: "Contenido Mejorado", description: "El cuerpo del comunicado ha sido mejorado por la IA." });
        } catch (error) {
            console.error("Error formatting document:", error);
            toast({ variant: "destructive", title: "Error de IA", description: "No se pudo conectar con el servicio de IA. Inténtelo de nuevo." });
        } finally {
            setIsRewriting(false);
        }
    };

    const handleCreateCircular = () => {
        if (!circularTitle.trim() || !circularContent.trim() || !departmentId) {
            toast({ variant: "destructive", title: "Error", description: "El título, contenido y departamento son obligatorios." });
            return;
        }
        if (selectedRecipientIds.length === 0) {
            toast({ variant: "destructive", title: "Error", description: "Debe seleccionar al menos un destinatario." });
            return;
        }
        if (!currentUser) {
            toast({ variant: "destructive", title: "Error", description: "No se pudo identificar al remitente." });
            return;
        }

        const newFolio = getNextFolio();
        
        createCircular(
            { title: circularTitle, content: circularContent, creatorId: currentUser.id, departmentId, folio: newFolio },
            selectedRecipientIds 
        );
        
        toast({
            title: "¡Comunicado Enviado!",
            description: `El documento "${circularTitle}" con folio ${newFolio} ha sido enviado a ${selectedRecipientIds.length} destinatarios.`,
        });

        // Reset form
        setCircularTitle('');
        setCircularContent('');
        setSelectedRecipientIds([]);
        setDepartmentId('');
    };
    
    const allSelected = filteredRecipients.length > 0 && selectedRecipientIds.length === filteredRecipients.length;
    const isIndeterminate = selectedRecipientIds.length > 0 && selectedRecipientIds.length < filteredRecipients.length;

  return (
    <div className="space-y-6">
      <div>
          <h1 className="text-lg font-semibold md:text-2xl">Gestión de Comunicados</h1>
      </div>
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
              <CardHeader>
                  <CardTitle>1. Detalles del Documento</CardTitle>
                  <CardDescription>Escriba el título y el contenido del comunicado que desea enviar.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="circular-title">Título del Comunicado</Label>
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
     <div className="flex justify-end mt-4">
          <Button size="lg" onClick={handleCreateCircular}>
              <Send className="mr-2 h-4 w-4" />
              Crear y Enviar Comunicado
          </Button>
     </div>

      <Separator className="my-8" />
      
      <CircularsHistory />
    </div>
  );
}
