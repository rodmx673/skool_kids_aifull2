
"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, Play, Trash2, List, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { transcribeAndAnalyzeAudio, TranscribeAudioOutput } from "@/ai/flows/transcribe-audio-flow";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

type Recording = {
  id: string;
  name: string;
  url: string;
  date: string;
  blob: Blob;
};

export default function MinutasPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const [isTranscribing, setIsTranscribing] = useState<string | null>(null);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscribeAudioOutput | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);


  useEffect(() => {
    // We cannot store blobs in localStorage, so this logic is simplified.
    // A real-world app would load metadata from a DB and blobs from a file storage.
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        const newRecording: Recording = {
          id: `minuta-${Date.now()}`,
          name: `Grabación ${new Date().toLocaleString('es-MX')}`,
          url: url,
          date: new Date().toISOString(),
          blob: audioBlob,
        };
        setRecordings(prev => [newRecording, ...prev]);

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioURL(null);
      toast({
        title: "Grabación iniciada",
        description: "El micrófono está activo.",
      });
    } catch (error) {
      console.error("Error accessing media devices.", error);
      toast({
        variant: "destructive",
        title: "Error de Micrófono",
        description: "No se pudo acceder al micrófono. Por favor, revise los permisos.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({
        title: "Grabación detenida",
        description: "La minuta ha sido guardada en la lista.",
      });
    }
  };
  
  const deleteRecording = (id: string) => {
      const recordingToDelete = recordings.find(rec => rec.id === id);
      if (recordingToDelete) {
          URL.revokeObjectURL(recordingToDelete.url);
      }
      setRecordings(prev => prev.filter(rec => rec.id !== id));
      toast({
          title: "Grabación eliminada"
      });
  }

  const handleTranscribe = async (recording: Recording) => {
    setIsTranscribing(recording.id);
    setTranscriptionResult(null);

    try {
        const reader = new FileReader();
        reader.readAsDataURL(recording.blob);
        reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            const result = await transcribeAndAnalyzeAudio({ audioDataUri: base64Audio });
            setTranscriptionResult(result);
            setIsResultOpen(true);
            toast({
                title: "Transcripción Exitosa",
                description: `Se ha procesado la grabación "${recording.name}".`
            });
        };
    } catch (error) {
        console.error("Error transcribing audio:", error);
        toast({
            variant: "destructive",
            title: "Error de Transcripción",
            description: "No se pudo procesar el audio con la IA."
        });
    } finally {
        setIsTranscribing(null);
    }
  }


  const formatRecordingDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleString('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Grabación de Minutas</h1>
          <p className="text-muted-foreground">
            Graba el audio de tus reuniones y guárdalo para futuras referencias.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Grabadora de Audio</CardTitle>
              <CardDescription>
                Usa los controles para iniciar, detener y reproducir la grabación de la reunión.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-6 p-8">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button
                  size="lg"
                  onClick={startRecording}
                  disabled={isRecording}
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                >
                  <Mic className="mr-2 h-5 w-5" />
                  Iniciar Grabación
                </Button>
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={stopRecording}
                  disabled={!isRecording}
                  className="w-full sm:w-auto"
                >
                  <StopCircle className="mr-2 h-5 w-5" />
                  Detener
                </Button>
              </div>
              {isRecording && (
                <div className="flex items-center gap-2 text-red-500 animate-pulse">
                  <Badge variant="destructive">Grabando...</Badge>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                </div>
              )}
              {audioURL && (
                <div className="w-full pt-4 border-t mt-4">
                    <h3 className="font-semibold mb-2 text-center">Última Grabación</h3>
                    <audio src={audioURL} controls className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <List className="h-5 w-5"/>
                    Historial de Grabaciones
                </CardTitle>
                <CardDescription>
                    Aquí se listan todas las minutas grabadas.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {recordings.length > 0 ? (
                        recordings.map(rec => (
                            <div key={rec.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-md border bg-muted/50">
                               <div className="flex-1 overflow-hidden">
                                 <p className="font-medium truncate">{rec.name}</p>
                                 <p className="text-xs text-muted-foreground">{formatRecordingDate(rec.date)}</p>
                               </div>
                               <div className="flex items-center gap-1 self-end sm:self-center">
                                <Button variant="outline" size="sm" onClick={() => handleTranscribe(rec)} disabled={!!isTranscribing}>
                                    {isTranscribing === rec.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <FileText className="h-4 w-4" />}
                                </Button>
                                <a href={rec.url} target="_blank" rel="noopener noreferrer">
                                 <Button variant="ghost" size="icon">
                                    <Play className="h-4 w-4"/>
                                 </Button>
                                 </a>
                                 <Button variant="destructive" size="icon" onClick={() => deleteRecording(rec.id)}>
                                    <Trash2 className="h-4 w-4"/>
                                 </Button>
                               </div>
                            </div>
                        ))
                    ) : (
                         <div className="text-center py-10 text-muted-foreground">
                            No hay grabaciones todavía.
                        </div>
                    )}
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Resultado de la Transcripción</DialogTitle>
                <DialogDescription>
                    Transcripción completa y análisis de la grabación.
                </DialogDescription>
            </DialogHeader>
            {transcriptionResult ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh]">
                   <div className="space-y-4">
                       <h3 className="font-semibold text-lg">Análisis de la Minuta</h3>
                       <ScrollArea className="h-96 rounded-md border p-4">
                           <p className="text-sm whitespace-pre-wrap">{transcriptionResult.analysis}</p>
                       </ScrollArea>
                   </div>
                    <div className="space-y-4">
                       <h3 className="font-semibold text-lg">Transcripción Completa</h3>
                       <ScrollArea className="h-96 rounded-md border p-4">
                           <p className="text-sm whitespace-pre-wrap">{transcriptionResult.transcription}</p>
                       </ScrollArea>
                   </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )}
        </DialogContent>
      </Dialog>
    </>
  );
}
