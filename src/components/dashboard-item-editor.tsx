"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DashboardItem } from "@/context/DashboardContext";
import { Users, UserCheck, Calendar, BookUser, FileSignature, Settings, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const iconOptions = [
    { value: 'Users', label: 'Grupo de Usuarios (Users)' },
    { value: 'UserCheck', label: 'Gestión de Usuarios (UserCheck)' },
    { value: 'Calendar', label: 'Calendario (Calendar)' },
    { value: 'BookUser', label: 'Docentes (BookUser)' },
    { value: 'FileSignature', label: 'Documentos (FileSignature)' },
    { value: 'Settings', label: 'Configuración (Settings)' },
    { value: 'AlertTriangle', label: 'Alerta (AlertTriangle)' },
];

const linkOptions = [
    { value: '/dashboard', label: 'Dashboard' },
    { value: '/dashboard/gestion-escolar', label: 'Gestión Escolar' },
    { value: '/dashboard/messaging', label: 'Mensajería' },
    { value: '/dashboard/externos', label: 'Externos' },
    { value: '/dashboard/circulares', label: 'Circulares' },
    { value: '/dashboard/oficios', label: 'Oficios' },
    { value: '/dashboard/documentos-foliados', label: 'Documentos Foliados' },
    { value: '/dashboard/minutas', label: 'Minutas' },
    { value: '/dashboard/planeacion', label: 'Planeación' },
    { value: '/dashboard/nuevos', label: 'Skool kits Usuarios' },
    { value: '/dashboard/paneles', label: 'Paneles' },
    { value: '/dashboard/calendario', label: 'Calendario' },
    { value: '/dashboard/certified-schedules', label: 'Horarios Certificados' },
    { value: '/dashboard/settings', label: 'Settings' },
    { value: '#', label: 'Ninguno (para acciones)' },
];

type EditorProps = {
    item: DashboardItem | null;
    onSave: (item: Omit<DashboardItem, 'id'>) => void;
    trigger: React.ReactNode;
};

export function DashboardItemEditor({ item, onSave, trigger }: EditorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('Users');
    const [link, setLink] = useState('');
    const [mainStat, setMainStat] = useState('');
    const [highlight, setHighlight] = useState(false);
    const [showButton, setShowButton] = useState(false);
    const [buttonText, setButtonText] = useState('');
    const [variant, setVariant] = useState<'default' | 'destructive'>('default');
    const { toast } = useToast();
    const loadedItemIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            const currentItemId = item ? item.id : null;
            if (currentItemId !== loadedItemIdRef.current) {
                if (item) {
                    setTitle(item.title);
                    setDescription(item.description);
                    setIcon(item.icon);
                    setLink(item.link);
                    setMainStat(item.mainStat);
                    setHighlight(item.highlight);
                    setShowButton(item.showButton);
                    setButtonText(item.buttonText || '');
                    setVariant(item.variant || 'default');
                } else {
                    // Reset for new item
                    setTitle('');
                    setDescription('');
                    setIcon('Users');
                    setLink('');
                    setMainStat('');
                    setHighlight(false);
                    setShowButton(false);
                    setButtonText('');
                    setVariant('default');
                }
                loadedItemIdRef.current = currentItemId;
            }
        }
    }, [item, isOpen]);

    const handleSave = () => {
        if (!title || !link) {
            toast({
                variant: "destructive",
                title: "Campos requeridos",
                description: "El título y el enlace son obligatorios.",
            });
            return;
        }

        onSave({
            title, description, icon, link, mainStat, highlight, showButton, buttonText, variant
        });
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{item ? 'Editar Tarjeta' : 'Añadir Nueva Tarjeta'}</DialogTitle>
                    <DialogDescription>
                        Personaliza la información y la apariencia de la tarjeta del dashboard.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="link">Enlace (URL)</Label>
                        <Select value={link} onValueChange={setLink}>
                            <SelectTrigger id="link">
                                <SelectValue placeholder="Seleccionar una sección..." />
                            </SelectTrigger>
                            <SelectContent>
                                {linkOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="icon">Ícono</Label>
                        <Select value={icon} onValueChange={setIcon}>
                            <SelectTrigger id="icon">
                                <SelectValue placeholder="Seleccionar ícono" />
                            </SelectTrigger>
                            <SelectContent>
                                {iconOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="variant">Variante de Estilo</Label>
                        <Select value={variant} onValueChange={(v) => setVariant(v as 'default' | 'destructive')}>
                            <SelectTrigger id="variant">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default">Default (Normal)</SelectItem>
                                <SelectItem value="destructive">Destructive (Alerta/Pánico)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="main-stat">Estadística Principal (Opcional)</Label>
                        <Input id="main-stat" value={mainStat} onChange={(e) => setMainStat(e.target.value)} placeholder="Ej: 42, 98%..." />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                         <div className="space-y-0.5">
                            <Label>Resaltar Tarjeta</Label>
                            <p className="text-xs text-muted-foreground">Aplica el color primario a la tarjeta.</p>
                         </div>
                        <Switch checked={highlight} onCheckedChange={setHighlight} />
                    </div>
                     <div className="flex items-center justify-between rounded-lg border p-3">
                         <div className="space-y-0.5">
                            <Label>Mostrar Botón de Acción</Label>
                             <p className="text-xs text-muted-foreground">Muestra un botón en la parte inferior.</p>
                         </div>
                        <Switch checked={showButton} onCheckedChange={setShowButton} />
                    </div>
                    {showButton && (
                        <div className="space-y-2">
                            <Label htmlFor="button-text">Texto del Botón</Label>
                            <Input id="button-text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleSave}>Guardar Cambios</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
