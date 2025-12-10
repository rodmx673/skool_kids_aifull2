
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Search, PlusCircle, Download, Eye, Printer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useContext, useMemo, useState } from "react";
import { CircularContext, Circular } from "@/context/CircularContext";
import { InstitutionContext } from "@/context/InstitutionContext";
import { UserContext } from "@/context/UserContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import Image from "next/image";

// Componente para visualizar la circular
function CircularViewer({ circular }: { circular: Circular }) {
    const { allUsers: users } = useContext(UserContext);
    const { institution } = useContext(InstitutionContext);
    
    // Add guard clause to prevent rendering if data is not ready
    if (!users || !institution) {
        return <div className="flex items-center justify-center h-full"><p>Cargando datos...</p></div>;
    }

    const departmentName = institution.departments.find(d => d.id === circular.departmentId)?.name || 'Departamento Desconocido';
    const creatorName = users.find(u => u.id === circular.creatorId)?.username || 'Remitente Desconocido';

    return (
        <div className="bg-white p-8 shadow-lg rounded-lg aspect-[8.5/11] max-w-3xl mx-auto flex flex-col text-sm text-black font-serif print-area">
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
                        <p className="font-bold">Circular No. {circular.folio}</p>
                        <p>Pánuco, Veracruz, a {new Date(circular.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>
                <div className="mb-4 text-xs font-bold">
                    <p>A TODO EL PERSONAL</p>
                    <p>PRESENTE</p>
                </div>
                <h3 className="text-center font-bold text-base mb-4">{circular.title}</h3>
                <div className="text-xs leading-relaxed text-justify whitespace-pre-wrap flex-grow">
                    <p>{circular.content}</p>
                </div>
                <div className="mt-20 text-center text-xs">
                    <p className="font-bold">Atentamente</p>
                    <div className="relative w-28 h-12 mx-auto my-4">
                        <Image src="https://picsum.photos/seed/firma/200/100" alt="Firma" layout="fill" objectFit="contain" data-ai-hint="signature"/>
                    </div>
                    <p className="font-bold">{creatorName}</p>
                    <p>{departmentName}</p>
                </div>
            </div>
        </div>
    )
}

export default function DocumentosFoliadosPage() {
  const { circulars } = useContext(CircularContext);
  const { institution } = useContext(InstitutionContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingCircular, setViewingCircular] = useState<Circular | null>(null);

  const foliatedDocs = useMemo(() => {
    return circulars
      .filter(doc => doc.folio)
      .filter(doc => 
        doc.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => (b.folio || "").localeCompare(a.folio || ""));
  }, [circulars, searchTerm]);
  
  const getDepartmentName = (id: string) => {
    return institution?.departments.find(d => d.id === id)?.name || id;
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Documentos Foliados
            </h1>
            <p className="text-muted-foreground">
              Consulta y gestiona todos los documentos oficiales generados.
            </p>
          </div>
          <Button className="w-full sm:w-auto" disabled>
            <PlusCircle className="mr-2 h-4 w-4" />
            Generar Nuevo Documento
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Documentos</CardTitle>
            <CardDescription>
                Aquí se listan todos los oficios y circulares con su folio asignado.
            </CardDescription>
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <div className="relative w-full flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                    placeholder="Buscar por folio, título o destinatario..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px]">Folio</TableHead>
                            <TableHead>Departamento</TableHead>
                            <TableHead>Título</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {foliatedDocs.length > 0 ? (
                            foliatedDocs.map(doc => (
                                <TableRow key={doc.id}>
                                    <TableCell className="font-mono">{doc.folio}</TableCell>
                                    <TableCell><Badge variant="secondary">{getDepartmentName(doc.departmentId)}</Badge></TableCell>
                                    <TableCell className="font-medium">{doc.title}</TableCell>
                                    <TableCell>{new Date(doc.createdAt).toLocaleDateString('es-MX')}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => setViewingCircular(doc)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            Ver PDF
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No se han generado documentos foliados todavía.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
          </CardContent>
        </Card>
      </div>

       <Dialog open={!!viewingCircular} onOpenChange={(isOpen) => !isOpen && setViewingCircular(null)}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col no-print">
          <DialogHeader>
            <DialogTitle>Vista Previa del Documento</DialogTitle>
            <DialogDescription>Folio: {viewingCircular?.folio}</DialogDescription>
          </DialogHeader>
          {viewingCircular && (
            <div className="flex-1 overflow-y-auto p-2 border bg-gray-100">
                <CircularViewer circular={viewingCircular} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4"/> Imprimir / PDF</Button>
            <DialogClose asChild>
              <Button>Cerrar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
