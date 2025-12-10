"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Calendar, ArrowRight, BookUser, FileSignature, Edit, PlusCircle, Trash2, GripVertical, Settings, AlertTriangle } from "lucide-react";
import { useContext, useMemo, useState } from "react";
import { UserContext } from "@/context/UserContext";
import { CircularContext } from "@/context/CircularContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DashboardContext, DashboardItem } from "@/context/DashboardContext";
import { DashboardItemEditor } from "@/components/dashboard-item-editor";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";


const iconMap: { [key: string]: React.ElementType } = {
    Users, UserCheck, Calendar, BookUser, FileSignature, Settings, AlertTriangle
};

const DashboardCard = ({ item, isEditMode, onEdit, onDelete }: { item: DashboardItem, isEditMode: boolean, onEdit: () => void, onDelete: () => void }) => {
    const { toast } = useToast();
    const Icon = iconMap[item.icon] || Settings;

    const confirmPanicAction = () => {
        toast({
            variant: "destructive",
            title: "Protocolos de Emergencia Activados",
            description: "Se han enviado notificaciones a las autoridades y personal de seguridad.",
            duration: 10000,
        });
    };

    const cardContent = (
      <Card className={cn(
          "group relative transition-all h-full",
          item.highlight && item.variant !== 'destructive' && "bg-primary text-primary-foreground",
          item.variant === 'destructive' ? "bg-destructive text-destructive-foreground" : "hover:border-primary",
          isEditMode && "border-2 border-dashed"
      )}>
          {isEditMode && (
            <div className="absolute -top-3 -right-3 flex items-center gap-1 z-10">
                <Button size="icon" variant="secondary" className="h-7 w-7 rounded-full" onClick={(e) => { e.preventDefault(); onEdit(); }}>
                    <Edit className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="destructive" className="h-7 w-7 rounded-full" onClick={(e) => { e.preventDefault(); onDelete(); }}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
          )}
          <div className="h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                  <Icon className={cn("h-4 w-4", (item.highlight || item.variant === 'destructive') ? "text-primary-foreground/70" : "text-muted-foreground")} />
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                  <div>
                      <div className={cn("text-2xl font-bold")}>{item.mainStat}</div>
                      <p className={cn("text-xs", (item.highlight || item.variant === 'destructive') ? "text-primary-foreground/80" : "text-muted-foreground")}>
                          {item.description}
                      </p>
                  </div>
                  {item.showButton && (
                    <Button variant={item.highlight || item.variant === 'destructive' ? "secondary": "outline"} size="sm" className="w-full mt-4">
                        {item.buttonText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
              </CardContent>
          </div>
      </Card>
    );

    if (item.variant === 'destructive') {
        return (
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <button className="w-full h-full text-left">
                        {cardContent}
                    </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-destructive border-destructive text-destructive-foreground">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Está seguro de activar el Botón de Pánico?</AlertDialogTitle>
                        <AlertDialogDescription className="text-destructive-foreground/90">
                            Esta acción es irreversible y activará protocolos de emergencia. Describa brevemente la situación antes de confirmar.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-2">
                        <Label htmlFor="emergency-description" className="text-destructive-foreground/90">Descripción de la Emergencia</Label>
                        <Textarea id="emergency-description" placeholder="Ej: Pelea entre alumnos en el patio central..." className="bg-destructive-foreground/10 text-destructive-foreground placeholder:text-destructive-foreground/50 mt-2" />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent text-destructive-foreground hover:bg-destructive-foreground/10">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmPanicAction} className="bg-white text-destructive hover:bg-white/90">
                            Sí, Activar Protocolo
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        );
    }

    return (
        <Link href={item.link} passHref className="h-full">
           <div className="h-full">
             {cardContent}
           </div>
        </Link>
    );
};

function DashboardContent() {
  const { circulars } = useContext(CircularContext);
  const { dashboardItems, setDashboardItems, addItem, updateItem, deleteItem } = useContext(DashboardContext);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<DashboardItem | null>(null);

  const recentActivity = useMemo(() => {
    return circulars
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [circulars]);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
            {isEditMode && (
                <Button size="sm" variant="destructive" onClick={() => setIsEditMode(false)} className="flex-1 sm:flex-initial">
                    Finalizar Edición
                </Button>
            )}
             <DashboardItemEditor 
                item={editingItem} 
                onSave={(itemData) => {
                    if (editingItem) {
                        updateItem(editingItem.id, itemData);
                    } else {
                        addItem(itemData);
                    }
                    setEditingItem(null);
                }}
                trigger={
                    <Button size="sm" variant={isEditMode ? "default" : "outline"} onClick={() => {
                        if (isEditMode) {
                            setEditingItem(null); // Abre el editor para un nuevo item
                        } else {
                            setIsEditMode(true);
                        }
                    }} className="flex-1 sm:flex-initial">
                        {isEditMode ? <PlusCircle className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
                        {isEditMode ? "Añadir Tarjeta" : "Personalizar Dashboard"}
                    </Button>
                }
             />
        </div>
      </div>
      <div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {dashboardItems.map(item => (
            <DashboardCard 
                key={item.id} 
                item={item} 
                isEditMode={isEditMode}
                onEdit={() => setEditingItem(item)}
                onDelete={() => deleteItem(item.id)}
            />
        ))}
      </div>
      
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Actividad Reciente
            </CardTitle>
          <CardDescription>Últimos documentos (circulares y oficios) enviados a través del sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Folio</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Fecha de Envío</TableHead>
                  <TableHead className="text-center">Destinatarios</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivity.length > 0 ? (
                  recentActivity.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant="secondary">{item.folio || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{item.departmentId}</TableCell>
                      <TableCell>{new Date(item.createdAt).toLocaleDateString('es-MX')}</TableCell>
                      <TableCell className="text-center">{item.recipients.length}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No hay actividad reciente.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}


export default function DashboardPage() {
    return (
        <DashboardContent />
    )
}
