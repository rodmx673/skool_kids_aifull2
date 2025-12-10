
"use client";

import { useState, useEffect, useRef, useContext } from 'react';
import Link from 'next/link';
import QrScanner from 'qr-scanner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { QrCode, User, Mail, Shield, AlertCircle, CheckCircle, XCircle, LogIn, LogOut, Globe, GraduationCap, UserPlus, FileText } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { User as UserType, UserContext } from '@/context/UserContext';
import { cn } from "@/lib/utils";
import { AccessLogContext, AccessLogEntry } from '@/context/AccessLogContext';
import { MessagingContext } from '@/context/MessagingContext';

export default function ExternosPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const { allUsers: users } = useContext(UserContext); // Usar allUsers para encontrar a cualquier usuario
  const { addAccessLog, getTodayLastAccess } = useContext(AccessLogContext);
  const { sendSystemMessage } = useContext(MessagingContext);
  const { toast } = useToast();
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [scannedData, setScannedData] = useState<UserType | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const [scanResultStatus, setScanResultStatus] = useState<'success' | 'error' | null>(null);
  const [scanResultMessage, setScanResultMessage] = useState<string | null>(null);
  
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);
  
  const showFeedback = (status: 'success' | 'error', message: string) => {
    setScanResultStatus(status);
    setScanResultMessage(message);
    setTimeout(() => {
        setScanResultStatus(null);
        setScanResultMessage(null);
    }, 3000);
  };

  const handleScanSuccess = (result: QrScanner.ScanResult) => {
    stopScanning();
    setScanError(null);
    try {
      const parsedData = JSON.parse(result.data);
      
      if (parsedData.id && parsedData.email) {
        
        const foundUser = users.find(u => u.id === parsedData.id && u.email === parsedData.email);
        
        if (foundUser) {
            setScannedData(foundUser);
            
            const lastAccess = getTodayLastAccess(foundUser.id);
            const accessType: 'in' | 'out' = (!lastAccess || lastAccess.type === 'out') ? 'in' : 'out';

            addAccessLog(foundUser.id, accessType);
            
            const actionText = accessType === 'in' ? 'Entrada registrada' : 'Salida registrada';
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const feedbackMessage = `¡Hola, ${foundUser.username.split(' ')[0]}! ${actionText}.`;
            const notificationMessage = `Hola, te informamos que ${foundUser.username} ha registrado su ${accessType === 'in' ? 'ENTRADA' : 'SALIDA'} a la institución a las ${time}.`;
            
            showFeedback('success', feedbackMessage);
            toast({
              title: `Usuario Verificado: ${actionText}`,
              description: `Se registró el movimiento para ${foundUser.username}.`,
            });
            
            // Find and notify the parent/tutor
            if(foundUser.role === 'alumno') {
              const tutor = users.find(u => u.role === 'padre' && u.childrenIds?.includes(foundUser.id));
              if(tutor) {
                sendSystemMessage(tutor.id, notificationMessage);
              }
            }

        } else {
            setScannedData(null);
            showFeedback('error', 'Usuario no reconocido por la institución.');
            toast({
                variant: 'destructive',
                title: "Usuario No Verificado",
                description: `Los datos del QR son válidos, pero no coinciden con un usuario actual del sistema.`,
            });
        }
      } else {
        throw new Error("El QR no contiene los campos 'id' y 'email' requeridos.");
      }
    } catch (error) {
      setScannedData(null);
      showFeedback('error', 'El formato del código QR es incorrecto o inválido.');
      toast({
        variant: "destructive",
        title: "Error de Escaneo",
        description: "El formato del código QR es incorrecto o inválido.",
      });
    }
  };

  const handleScanError = (error: any) => {
    const errorMessage = String(error);
    if (error instanceof Error && error.name === 'NotAllowedError') {
      setHasCameraPermission(false);
      setScanError('El permiso para acceder a la cámara fue denegado. Por favor, habilítelo en la configuración de su navegador.');
      setIsScanning(false);
    } else if (errorMessage.includes('No QR code found')) {
      // This is expected when the camera is on but no QR is detected, do nothing.
    } else if (errorMessage.includes('Camera not found')) {
      setHasCameraPermission(false);
      setScanError('No se encontró una cámara. Asegúrese de que esté conectada y habilitada.');
      setIsScanning(false);
    } else {
      console.error('QR Scan Error:', error);
      showFeedback('error', 'Ocurrió un error durante el escaneo.');
      setIsScanning(false);
    }
  };

  const startScanning = async () => {
    if (isScanning || !videoRef.current) return;

    setScannedData(null);
    setScanError(null);
    setScanResultStatus(null);
    setScanResultMessage(null);

    try {
        await QrScanner.hasCamera();
        setHasCameraPermission(true);
    } catch (error) {
        setHasCameraPermission(false);
        handleScanError(error);
        return;
    }

    setIsScanning(true);
    
    scannerRef.current = new QrScanner(
      videoRef.current,
      handleScanSuccess,
      {
        onDecodeError: handleScanError,
        highlightScanRegion: true,
        highlightCodeOutline: true,
        preferredCamera: 'environment'
      }
    );
    
    try {
        await scannerRef.current.start();
    } catch (error) {
        handleScanError(error);
        setIsScanning(false);
    }
  };
  
  const stopScanning = () => {
    if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const toggleScanner = () => {
    if (isScanning) {
        stopScanning();
    } else {
        startScanning();
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl font-semibold md:text-2xl">Control de Acceso</h1>
        <div className="flex flex-wrap w-full sm:w-auto gap-2">
            <Link href="/dashboard/docente" passHref>
                <Button variant="outline" className="flex-1 justify-start gap-2">
                    <User className="h-4 w-4" />
                    Portal Docente
                </Button>
            </Link>
            <a href="https://comfy-fenglisu-6831dd.netlify.app/" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="flex-1 justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    Constancias
                </Button>
            </a>
            <Link href="/dashboard/externos/documentos-oficiales" passHref>
                <Button variant="outline" className="flex-1 justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    Documentos Oficiales
                </Button>
            </Link>
             <Link href="/dashboard/externos/inscripciones" passHref>
                <Button variant="outline" className="flex-1 justify-start gap-2">
                    <UserPlus className="h-4 w-4" />
                    Inscripciones
                </Button>
            </Link>
            <Link href="/dashboard/webpage" passHref>
                <Button variant="outline" className="flex-1 justify-start gap-2">
                    <Globe className="h-4 w-4" />
                    Página Web
                </Button>
            </Link>
        </div>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Lector de Código QR</CardTitle>
          <CardDescription>
            Presione "Iniciar Escáner" para activar la cámara y registrar automáticamente entradas o salidas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <Button onClick={toggleScanner} variant={isScanning ? "destructive" : "default"} className="w-full gap-2">
                {isScanning ? <XCircle className="h-4 w-4" /> : <QrCode className="h-4 w-4" />}
                {isScanning ? 'Detener Escáner' : 'Iniciar Escáner'}
            </Button>
            <div className={cn(
                "relative aspect-video w-full max-w-md mx-auto bg-slate-200 rounded-md overflow-hidden border-4 transition-colors",
                scanResultStatus === 'success' && 'border-green-500',
                scanResultStatus === 'error' && 'border-red-500',
                !scanResultStatus && 'border-transparent'
            )}>
                <video ref={videoRef} className="w-full h-full object-cover" />
                
                {scanResultStatus && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white p-4 z-10">
                        {scanResultStatus === 'success' ? (
                            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                        ) : (
                            <XCircle className="h-16 w-16 text-red-500 mb-4" />
                        )}
                        <p className="text-lg font-semibold text-center">{scanResultMessage}</p>
                    </div>
                )}
                
                {!isScanning && !scanResultStatus && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4">
                        <QrCode className="h-16 w-16 mb-4"/>
                        <p className="text-lg font-semibold">El escáner está listo</p>
                        <p className="text-sm text-center">La vista de la cámara aparecerá aquí.</p>
                    </div>
                )}
            </div>
            
            {hasCameraPermission === false && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Acceso a la Cámara Denegado</AlertTitle>
                    <AlertDescription>
                        Por favor, habilite el permiso de cámara en su navegador para usar el lector de QR.
                    </AlertDescription>
                </Alert>
            )}

            {scanError && (
                 <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {scanError}
                    </AlertDescription>
                </Alert>
            )}
            
            {scannedData && (
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>Último Usuario Escaneado</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <p><span className="font-semibold">Nombre:</span> {scannedData.username}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <p><span className="font-semibold">Email:</span> {scannedData.email}</p>
                        </div>
                         <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-muted-foreground" />
                            <p><span className="font-semibold">Rol:</span> {scannedData.role}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <QrCode className="h-5 w-5 text-muted-foreground" />
                            <p><span className="font-semibold">ID:</span> {scannedData.id}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </CardContent>
      </Card>
    </>
  );
}
