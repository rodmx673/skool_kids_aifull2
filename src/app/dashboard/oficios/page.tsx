
"use client";

import { useState, useRef, useContext, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FilePlus, Wand2, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CircularContext } from "@/context/CircularContext";
import { useToast } from "@/hooks/use-toast";
import { rewriteDocument } from "@/ai/flows/rewrite-document-flow";
import { InstitutionContext } from "@/context/InstitutionContext";

export default function OficioCreatorPage() {
  const { templateToApply, setTemplateToApply } = useContext(CircularContext);
  const { getNextFolio } = useContext(InstitutionContext);
  const { toast } = useToast();

  const [isBold, setIsBold] = useState(false);
  const [recipientTitle, setRecipientTitle] = useState("C.P. Juan Pérez");
  const [recipientCompany, setRecipientCompany] = useState("Gerencia General");
  const [docLocation, setDocLocation] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("ejemplo@dominio.com");
  const [docBody, setDocBody] = useState(
    "Por medio del presente, me permito solicitar su valiosa intervención para...\n\nSin otro particular por el momento, agradezco de antemano su atención y quedo a sus órdenes para cualquier aclaración."
  );
  const [ccEmail, setCcEmail] = useState("asistenteaicbtispanuco@gmail.com");
  const [signerName, setSignerName] = useState("ING. ADRIAN BARUCH ZUNIGA SANJUAN");
  const [signerTitle, setSignerTitle] = useState("ENCARGADO DE LA DIRECCION DEL PLANTEL");
  const [headerLogo1Url, setHeaderLogo1Url] = useState("https://picsum.photos/seed/logo1/200/200");
  const [headerLogo2Url, setHeaderLogo2Url] = useState("https://picsum.photos/seed/logo2/200/200");
  const [footerLogo1Url, setFooterLogo1Url] = useState("https://picsum.photos/seed/logo3/100/100");
  const [footerLogo2Url, setFooterLogo2Url] = useState("https://picsum.photos/seed/logo4/100/100");
  const [signatureUrl, setSignatureUrl] = useState("https://picsum.photos/seed/firma/200/100");
  const [isFormatting, setIsFormatting] = useState(false);
  const [folioNumber, setFolioNumber] = useState("______");


  useEffect(() => {
    // Set date only on client side to avoid hydration error
    setDocLocation(`Pánuco, Veracruz, a ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`);

    if (templateToApply) {
      setDocBody(templateToApply.body);
      setSignerName(templateToApply.signerName);
      setSignerTitle(templateToApply.signerTitle);
      setCcEmail(templateToApply.ccEmail);
      setHeaderLogo1Url(templateToApply.headerLogo1Url);
      setHeaderLogo2Url(templateToApply.headerLogo2Url);
      setFooterLogo1Url(templateToApply.footerLogo1Url);
      setFooterLogo2Url(templateToApply.footerLogo2Url);
      setSignatureUrl(templateToApply.signatureUrl);
      
      toast({
        title: "Plantilla Cargada",
        description: `Contenido de "${templateToApply.name}" listo para ser usado.`,
      });
      setTemplateToApply(null);
    }
  }, [templateToApply, setTemplateToApply, toast]);

  const handleAutoFormat = async () => {
    if (!docBody.trim()) {
        toast({ variant: "destructive", title: "Contenido Vacío", description: "No hay texto que formatear." });
        return;
    }
    setIsFormatting(true);
    try {
        const rewrittenBody = await rewriteDocument({ documentBody: docBody });
        setDocBody(rewrittenBody);
        toast({ title: "Documento Reformateado", description: "El cuerpo del documento ha sido mejorado por la IA." });
    } catch (error) {
        console.error("Error formatting document:", error);
        toast({ variant: "destructive", title: "Error de IA", description: "No se pudo conectar con el servicio de IA. Inténtelo de nuevo." });
    } finally {
        setIsFormatting(false);
    }
  };
  
  const handleGenerateDocument = () => {
    const newFolio = getNextFolio();
    setFolioNumber(newFolio);
    toast({
        title: "Documento Foliado",
        description: `Se ha asignado el folio ${newFolio} a este documento.`
    });
  }


  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">OFICIO DIRECCION</h1>
            <p className="text-muted-foreground">
                Liena los campos para generar el documento.
            </p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline">
                <FilePlus className="mr-2 h-4 w-4" />
                Nuevo
            </Button>
             <Link href="/dashboard/templates/direccion" passHref>
                <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                </Button>
            </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Editor */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estilo del Documento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Letra</Label>
                  <Select defaultValue="serif">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serif">Times New Roman (Serif)</SelectItem>
                      <SelectItem value="sans">Arial (Sans-serif)</SelectItem>
                      <SelectItem value="mono">Courier New (Monospace)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tamaño de Letra</Label>
                  <Select defaultValue="12">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 pt</SelectItem>
                      <SelectItem value="11">11 pt</SelectItem>
                      <SelectItem value="12">12 pt</SelectItem>
                      <SelectItem value="14">14 pt</SelectItem>
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

          <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="recipient-title">Título/Cargo del Destinatario</Label>
                <Input id="recipient-title" value={recipientTitle} onChange={e => setRecipientTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="recipient-company">Nombre de la Empresa/Dependencia</Label>
                <Input id="recipient-company" value={recipientCompany} onChange={e => setRecipientCompany(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="doc-location">Lugar y Fecha</Label>
                <Input id="doc-location" value={docLocation} onChange={e => setDocLocation(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="recipient-email">Email del Destinatario</Label>
                <Input id="recipient-email" type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} />
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cuerpo del Documento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                rows={8}
                value={docBody}
                onChange={e => setDocBody(e.target.value)}
              />
              <Button variant="outline" className="w-full" onClick={handleAutoFormat} disabled={isFormatting}>
                {isFormatting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                )}
                {isFormatting ? "Formateando..." : "Auto-formatear con IA"}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="cc-email">Email en Copia (para archivo)</Label>
            <Input id="cc-email" type="email" value={ccEmail} onChange={e => setCcEmail(e.target.value)} />
          </div>

          <Button size="lg" className="w-full" onClick={handleGenerateDocument}>Generar y Guardar PDF</Button>
        </div>

        {/* Columna Derecha: Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 md:p-16 shadow-lg rounded-lg aspect-[8.5/11]">
            <div className="h-full flex flex-col text-sm text-black font-serif" style={{ fontFamily: "'Times New Roman', serif", fontWeight: isBold ? 'bold' : 'normal' }}>
              <header className="flex justify-between items-start mb-8">
                <div className="relative w-24 h-24">
                  <Image
                    src={headerLogo1Url}
                    alt="Logo Izquierdo"
                    layout="fill"
                    objectFit="contain"
                    data-ai-hint="logo institucional"
                  />
                </div>
                <div className="text-center text-[10px] leading-tight">
                  <p className="font-bold">Secretaría de Educación Pública</p>
                  <p>Subsecretaría de Educación Media Superior</p>
                  <p>Dirección General de Educación Tecnológica Industrial y de Servicios</p>
                  <p>DIRECO EstatalesEstadside Veracruz</p>
                  <p className="font-bold mt-2">
                    Centro de Bachillerato Tecnológico Industrial y de Servicios No. 55
                  </p>
                  <p>"Francisco Javier Mina" C. C. T. 30DCT0221M</p>
                </div>
                <div className="relative w-24 h-24">
                  <Image
                    src={headerLogo2Url}
                    alt="Logo Derecho"
                    layout="fill"
                    objectFit="contain"
                    data-ai-hint="emblema"
                  />
                </div>
              </header>

              <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="flex justify-end mb-8 text-xs">
                  <div>
                    <p className="font-bold">Oficio No. {folioNumber}</p>
                    <p>{docLocation}</p>
                  </div>
                </div>
                <div className="mb-8 text-xs font-bold">
                  <p>{recipientTitle}</p>
                  <p>{recipientCompany}</p>
                  <p>PRESENTE</p>
                </div>
                <div className="space-y-6 text-xs leading-relaxed text-justify whitespace-pre-wrap flex-grow">
                  <p>{docBody}</p>
                </div>

                <div className="mt-auto pt-20 text-center text-xs">
                  <p className="font-bold">Atentamente</p>
                  <div className="relative w-28 h-12 mx-auto my-8">
                    <Image
                      src={signatureUrl}
                      alt="Firma"
                      layout="fill"
                      objectFit="contain"
                      data-ai-hint="signature"
                    />
                  </div>
                  <p className="font-bold">{signerName}</p>
                  <p>{signerTitle}</p>
                  <p>CBTIS No 55 de Pánuco, Veracruz</p>
                </div>
              </div>

              <footer className="mt-auto border-t-2 border-black pt-4 text-[9px] flex justify-between items-center">
                <div className="relative w-16 h-16">
                  <Image
                    src={footerLogo1Url}
                    alt="Logo Footer 1"
                    layout="fill"
                    objectFit="contain"
                    data-ai-hint="logo pequeño"
                  />
                </div>
                <div className="text-center">
                  <p>"CBTIS 55 - Forjando el Futuro de México"</p>
                  <p>Prolongación Carranza S/N, Col. Electricistas, C. P. 93994, Pánuco, Veracruz</p>
                  <p>Tel. 8462662696, correo electrónico: cbtis55.dir@dgeti.sems.gob.mx</p>
                </div>
                <div className="relative w-16 h-16">
                  <Image
                    src={footerLogo2Url}
                    alt="Logo Footer 2"
                    layout="fill"
                    objectFit="contain"
                    data-ai-hint="logo pequeño"
                  />
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
