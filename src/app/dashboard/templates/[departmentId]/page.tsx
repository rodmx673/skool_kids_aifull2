
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useContext } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TemplateContext, Template } from "@/context/TemplateContext";
import { InstitutionContext } from "@/context/InstitutionContext";
import { FileText, ArrowLeft, PlusCircle, Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function DepartmentTemplatesPage() {
    const params = useParams();
    const router = useRouter();
    const departmentId = params.departmentId as string;
    const { templates, addTemplate, removeTemplate } = useContext(TemplateContext);
    const { institution } = useContext(InstitutionContext);
    const { toast } = useToast();

    const department = institution?.departments.find(d => d.id === departmentId);
    const departmentTemplates = templates.filter(t => t.departmentId === departmentId);

    const handleCreateTemplate = () => {
        const newTemplate: Template = {
            id: `new-${Date.now()}`,
            name: 'Nueva Plantilla',
            departmentId: departmentId,
            body: 'Escribe aquí el cuerpo del documento...',
            signerName: 'ING. ADRIAN BARUCH ZUNIGA SANJUAN',
            signerTitle: 'ENCARGADO DE LA DIRECCION DEL PLANTEL',
            ccEmail: 'asistenteaicbtispanuco@gmail.com',
            headerLogo1Url: "https://picsum.photos/seed/logo1/200/200",
            headerLogo2Url: "https://picsum.photos/seed/logo2/200/200",
            footerLogo1Url: "https://picsum.photos/seed/logo3/100/100",
            footerLogo2Url: "https://picsum.photos/seed/logo4/100/100",
            signatureUrl: "https://picsum.photos/seed/firma/200/100",
            docType: departmentId === 'direccion' ? 'Oficio' : 'Circular',
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
        toast({ title: 'Plantilla Eliminada' });
    };

    if (!department) {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-bold">Departamento no encontrado</h1>
                <p className="text-muted-foreground">Cargando o el departamento no existe.</p>
                <Link href="/dashboard/settings?tab=templates" passHref>
                   <Button variant="link">Volver a Configuración de Plantillas</Button>
                </Link>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <Link href="/dashboard/settings?tab=templates" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Volver a Plantillas
            </Link>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{department.name}</h1>
                    <p className="text-muted-foreground">Gestiona las plantillas de documentos para este departamento.</p>
                </div>
                 <Button onClick={handleCreateTemplate}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Nueva Plantilla
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Plantillas Disponibles</CardTitle>
                    <CardDescription>
                        Selecciona una plantilla para editarla o úsala para crear un nuevo documento.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {departmentTemplates.length > 0 ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
                            {departmentTemplates.map(template => (
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
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteTemplate(template.id)}>
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
                        <div className="text-center py-16 border-2 border-dashed rounded-lg mt-4">
                            <p className="text-muted-foreground">No hay plantillas disponibles para este departamento.</p>
                             <Button variant="link" onClick={handleCreateTemplate}>Crear la primera plantilla</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
