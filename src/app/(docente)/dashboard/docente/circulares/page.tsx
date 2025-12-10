
"use client";

import * as React from "react";
import { useContext, useState, useMemo } from "react";
import Image from "next/image";
import { CircularContext, Circular } from "@/context/CircularContext";
import { UserContext } from "@/context/UserContext";
import { InstitutionContext } from "@/context/InstitutionContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Check, Clock, FileText, FileSignature, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function SignaturePad({ onSign }: { onSign: (signatureDataUrl: string) => void }) {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        isDrawing = true;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        
        let x, y;
        if (e.nativeEvent instanceof MouseEvent) {
            x = e.nativeEvent.clientX - rect.left;
            y = e.nativeEvent.clientY - rect.top;
        } else { // TouchEvent
            x = e.nativeEvent.touches[0].clientX - rect.left;
            y = e.nativeEvent.touches[0].clientY - rect.top;
        }
        [lastX, lastY] = [x, y];
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !canvasRef.current) return;
        e.preventDefault();
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const rect = canvas.getBoundingClientRect();
        let x, y;
        if (e.nativeEvent instanceof MouseEvent) {
            x = e.nativeEvent.clientX - rect.left;
            y = e.nativeEvent.clientY - rect.top;
        } else { // TouchEvent
            x = e.nativeEvent.touches[0].clientX - rect.left;
            y = e.nativeEvent.touches[0].clientY - rect.top;
        }

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        [lastX, lastY] = [x, y];
    };
    
    const stopDrawing = () => isDrawing = false;

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
    };

    const handleSign = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            onSign(dataUrl);
            clearCanvas();
        }
    };
    
    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
            }
        }
    }, []);

    return (
        <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Dibuja tu firma en el recuadro:</p>
            <canvas
                ref={canvasRef}
                width={400}
                height={200}
                className="border rounded-md bg-white w-full cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
            <div className="flex gap-2">
                <Button variant="outline" onClick={clearCanvas} className="w-full">Limpiar</Button>
                <Button onClick={handleSign} className="w-full">Firmar Documento</Button>
            </div>
        </div>
    );
}

function CircularViewer({ circular }: { circular: Circular }) {
    const { currentUser } = useContext(UserContext);
    const { institution } = useContext(InstitutionContext);
    const departmentName = institution?.departments.find(d => d.id === circular.departmentId)?.name || 'Departamento Desconocido';
    const creatorName = currentUser?.username;

    return (
        <div id="print-area" className="bg-white p-8 shadow-lg rounded-lg aspect-[8.5/11] max-w-3xl mx-auto flex flex-col text-sm text-black font-serif print-area">
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

export default function DocenteCircularesPage() {
  const { currentUser } = useContext(UserContext);
  const { getCircularsForTeacher, signCircular } = useContext(CircularContext);
  const [selectedCircular, setSelectedCircular] = useState<Circular | null>(null);
  const { toast } = useToast();
  
  const myCirculars = useMemo(() => {
    if (!currentUser) return [];
    return getCircularsForTeacher(currentUser.id);
  }, [currentUser, getCircularsForTeacher]);

  const pendingCirculars = myCirculars.filter(c => c.recipients.find(r => r.recipientId === currentUser?.id)?.status === 'pending');
  const signedCirculars = myCirculars.filter(c => c.recipients.find(r => r.recipientId === currentUser?.id)?.status === 'signed');
  
  const handleSign = (signatureDataUrl: string) => {
    if (selectedCircular && currentUser) {
        signCircular(selectedCircular.id, currentUser.id, signatureDataUrl);
        toast({ title: "¡Documento Firmado!", description: `Has firmado la circular "${selectedCircular.title}".` });
        setSelectedCircular(null);
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Circulares y Comunicados</h1>
          <p className="text-muted-foreground">Aquí encontrarás los documentos que requieren tu firma o revisión.</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Bandeja de Entrada de Circulares</CardTitle>
            <CardDescription>Visualiza y firma los documentos pendientes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pendientes" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pendientes">Pendientes de Firma ({pendingCirculars.length})</TabsTrigger>
                <TabsTrigger value="firmados">Firmados</TabsTrigger>
              </TabsList>
              <TabsContent value="pendientes" className="mt-4">
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título del Documento</TableHead>
                        <TableHead>Fecha de Envío</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pendingCirculars.length > 0 ? (
                            pendingCirculars.map(circular => (
                                <TableRow key={circular.id}>
                                    <TableCell className="font-medium">{circular.title}</TableCell>
                                    <TableCell>{new Date(circular.createdAt).toLocaleDateString('es-MX')}</TableCell>
                                    <TableCell><Badge variant="destructive"><Clock className="mr-1 h-3 w-3"/>Pendiente</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" onClick={() => setSelectedCircular(circular)}>
                                            <FileSignature className="mr-2 h-4 w-4"/>Ver y Firmar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">¡Felicidades! No tienes documentos pendientes.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
               <TabsContent value="firmados" className="mt-4">
                 <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Título</TableHead>
                                <TableHead>Fecha de Firma</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {signedCirculars.length > 0 ? (
                                signedCirculars.map(circular => {
                                    const recipientData = circular.recipients.find(r => r.recipientId === currentUser?.id);
                                    return (
                                        <TableRow key={circular.id}>
                                            <TableCell className="font-medium">{circular.title}</TableCell>
                                            <TableCell>{recipientData?.signedAt ? new Date(recipientData.signedAt).toLocaleString('es-MX') : 'N/A'}</TableCell>
                                            <TableCell><Badge className="bg-green-600"><Check className="mr-1 h-3 w-3"/>Firmado</Badge></TableCell>
                                        </TableRow>
                                    )
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No has firmado ningún documento.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

       <Dialog open={!!selectedCircular} onOpenChange={(isOpen) => !isOpen && setSelectedCircular(null)}>
            <DialogContent className="max-w-4xl h-[95vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Revisión y Firma de Documento</DialogTitle>
                    <DialogDescription>
                        Por favor, revise el documento completo antes de firmar.
                    </DialogDescription>
                </DialogHeader>
                {selectedCircular && (
                    <div className="flex-1 overflow-y-auto p-2 -m-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-1 p-4 overflow-y-auto">
                            <CircularViewer circular={selectedCircular} />
                        </div>
                        <div className="md:col-span-1 p-4 flex flex-col justify-center">
                            <div className="p-4 border rounded-lg bg-background">
                                <h3 className="font-semibold mb-2">Acuse de Recibo y Enterado</h3>
                                <SignaturePad onSign={handleSign} />
                            </div>
                        </div>
                    </div>
                )}
                 <DialogFooter className="mt-auto pt-4 border-t">
                    <DialogClose asChild>
                        <Button variant="outline">Cerrar</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}
