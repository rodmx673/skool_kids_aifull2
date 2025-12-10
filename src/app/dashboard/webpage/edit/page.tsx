
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Newspaper, LayoutTemplate, MessageSquareQuote, Users, FileImage, PlusCircle, Edit, Trash2, Save } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useContext, useState, useEffect } from "react";
import { WebpageContext, NewsItem, HeroContent, InstitutionContent, ContactContent } from "@/context/WebpageContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AcademicContext } from "@/context/AcademicContext";


function NewsItemForm({ item, onSave, onCancel }: { item: Partial<NewsItem> | null, onSave: (data: Omit<NewsItem, 'id'>) => void, onCancel: () => void }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageHint, setImageHint] = useState('');
    const [date, setDate] = useState('');
    const { toast } = useToast();
    
    useEffect(() => {
        setTitle(item?.title || '');
        setDescription(item?.description || '');
        setImageUrl(item?.imageUrl || '');
        setImageHint(item?.imageHint || '');
        setDate(item?.date || new Date().toISOString().split('T')[0]);
    }, [item]);


    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
                toast({ title: "Imagen Cargada", description: "La imagen está lista para ser guardada." });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = () => {
        if (!title || !description || !date) {
            toast({ variant: "destructive", title: "Campos Incompletos", description: "El título, la descripción y la fecha son obligatorios." });
            return;
        }
        
        const finalImageUrl = imageUrl || `https://picsum.photos/seed/${title.replace(/\s+/g, '-')}/600/400`;

        onSave({ title, description, date, imageUrl: finalImageUrl, imageHint });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="news-title">Título</Label>
                <Input id="news-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="news-date">Fecha</Label>
                <Input id="news-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="news-description">Descripción</Label>
                <Textarea id="news-description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label>Imagen</Label>
                 <div className="flex items-center gap-4">
                    <Input id="picture" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <Button asChild variant="outline">
                        <Label htmlFor="picture" className="cursor-pointer">Seleccionar Archivo</Label>
                    </Button>
                    {imageUrl && (
                        <div className="relative w-20 h-12 rounded-md overflow-hidden border">
                            <Image src={imageUrl} alt="Vista previa" layout="fill" objectFit="cover" />
                        </div>
                    )}
                 </div>
            </div>
             <div className="space-y-2">
                <Label htmlFor="news-image-hint">Palabras Clave de la Imagen (para IA)</Label>
                <Input id="news-image-hint" placeholder="Ej: students robotics" value={imageHint} onChange={(e) => setImageHint(e.target.value)} />
                 <p className="text-xs text-muted-foreground">Ayuda a la IA a entender la imagen. Máximo dos palabras.</p>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline" onClick={onCancel}>Cancelar</Button></DialogClose>
                <Button onClick={handleSubmit}>Guardar Noticia</Button>
            </DialogFooter>
        </div>
    );
}

function NewsTab() {
    const { news, addNewsItem, updateNewsItem, deleteNewsItem } = useContext(WebpageContext);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
    const { toast } = useToast();

    const handleSave = (data: Omit<NewsItem, 'id'>) => {
        if (editingItem) {
            updateNewsItem(editingItem.id, data);
            toast({ title: "Noticia Actualizada" });
        } else {
            addNewsItem(data);
            toast({ title: "Noticia Creada" });
        }
        setIsDialogOpen(false);
        setEditingItem(null);
    };

    const openDialog = (item: NewsItem | null) => {
        setEditingItem(item);
        setIsDialogOpen(true);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Gestionar Noticias</CardTitle>
                    <CardDescription>Añade, edita o elimina las noticias que aparecen en la página principal.</CardDescription>
                </div>
                <Button onClick={() => openDialog(null)}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Añadir Noticia
                </Button>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Imagen</TableHead>
                                <TableHead>Título</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {news.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <Image src={item.imageUrl} alt={item.title} width={64} height={40} className="rounded-md object-cover" data-ai-hint={item.imageHint}/>
                                    </TableCell>
                                    <TableCell className="font-medium">{item.title}</TableCell>
                                    <TableCell>{new Date(item.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => openDialog(item)}><Edit className="h-4 w-4"/></Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                                                    <AlertDialogDescription>Esta acción eliminará la noticia permanentemente.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => deleteNewsItem(item.id)}>Eliminar</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? 'Editar Noticia' : 'Crear Nueva Noticia'}</DialogTitle>
                        </DialogHeader>
                        <NewsItemForm item={editingItem} onSave={handleSave} onCancel={() => setIsDialogOpen(false)} />
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}

function HeroTab() {
    const { hero, setHero } = useContext(WebpageContext);
    const [localHero, setLocalHero] = useState<HeroContent>(hero);
    const { toast } = useToast();
    
    useEffect(() => {
        setLocalHero(hero);
    }, [hero]);

    const handleSave = () => {
        setHero(localHero);
        toast({ title: "Sección Hero Actualizada" });
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalHero(prev => ({...prev, imageUrl: reader.result as string}));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sección Principal (Hero)</CardTitle>
                <CardDescription>Edita el contenido principal que se muestra al inicio de la página.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="hero-title">Título Principal</Label>
                    <Input id="hero-title" value={localHero.title} onChange={(e) => setLocalHero(prev => ({...prev, title: e.target.value}))}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="hero-description">Descripción</Label>
                    <Textarea id="hero-description" value={localHero.description} onChange={(e) => setLocalHero(prev => ({...prev, description: e.target.value}))} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="hero-button-text">Texto del Botón</Label>
                    <Input id="hero-button-text" value={localHero.buttonText} onChange={(e) => setLocalHero(prev => ({...prev, buttonText: e.target.value}))}/>
                </div>
                <div className="space-y-2">
                    <Label>Imagen de Fondo</Label>
                    <div className="flex items-center gap-4">
                        <Input id="hero-image" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        <Button asChild variant="outline">
                            <Label htmlFor="hero-image" className="cursor-pointer">Cambiar Imagen</Label>
                        </Button>
                        <Image src={localHero.imageUrl} alt="Hero Background" width={128} height={72} className="rounded-md object-cover border" />
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/>Guardar Cambios</Button>
            </CardFooter>
        </Card>
    );
}

function InstitutionTab() {
    const { institution, setInstitution } = useContext(WebpageContext);
    const [localInstitution, setLocalInstitution] = useState<InstitutionContent>(institution);
    const { toast } = useToast();

    useEffect(() => {
        setLocalInstitution(institution);
    }, [institution]);
    
    const handleSave = () => {
        setInstitution(localInstitution);
        toast({ title: "Sección Institución Actualizada" });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sección Institución (Misión y Visión)</CardTitle>
                <CardDescription>Edita la misión y visión de la institución.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="institution-mission">Misión</Label>
                    <Textarea id="institution-mission" value={localInstitution.mission} onChange={(e) => setLocalInstitution(prev => ({...prev, mission: e.target.value}))} rows={4} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="institution-vision">Visión</Label>
                    <Textarea id="institution-vision" value={localInstitution.vision} onChange={(e) => setLocalInstitution(prev => ({...prev, vision: e.target.value}))} rows={4} />
                </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/>Guardar Cambios</Button>
            </CardFooter>
        </Card>
    );
}

function OffersTab() {
    const { careers } = useContext(AcademicContext);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Oferta Académica</CardTitle>
                <CardDescription>
                    Esta sección muestra las carreras técnicas disponibles. Para editarla, ve a <a href="/dashboard/settings?tab=academico" className="text-primary underline">Configuración Académica</a>.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {careers.map(career => (
                        <div key={career.id} className="p-3 border rounded-md bg-muted/50 font-medium">
                            {career.name}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function ContactTab() {
    const { contact, setContact } = useContext(WebpageContext);
    const [localContact, setLocalContact] = useState<ContactContent>(contact);
    const { toast } = useToast();

    useEffect(() => {
        setLocalContact(contact);
    }, [contact]);
    
    const handleSave = () => {
        setContact(localContact);
        toast({ title: "Sección Contacto Actualizada" });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sección de Contacto</CardTitle>
                <CardDescription>Edita la información de contacto que se muestra en el pie de página.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="contact-address">Dirección</Label>
                    <Input id="contact-address" value={localContact.address} onChange={(e) => setLocalContact(prev => ({...prev, address: e.target.value}))}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="contact-phone">Teléfono</Label>
                    <Input id="contact-phone" value={localContact.phone} onChange={(e) => setLocalContact(prev => ({...prev, phone: e.target.value}))}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="contact-email">Email</Label>
                    <Input id="contact-email" type="email" value={localContact.email} onChange={(e) => setLocalContact(prev => ({...prev, email: e.target.value}))}/>
                </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/>Guardar Cambios</Button>
            </CardFooter>
        </Card>
    );
}

export default function WebpageEditorPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Editor de Página Web</h1>
                <p className="text-muted-foreground">Modifica el contenido de la página web institucional desde este panel.</p>
            </div>

            <Tabs defaultValue="noticias" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="hero"><FileImage className="mr-2 h-4 w-4"/>Hero</TabsTrigger>
                    <TabsTrigger value="institucion"><MessageSquareQuote className="mr-2 h-4 w-4"/>Institución</TabsTrigger>
                    <TabsTrigger value="noticias"><Newspaper className="mr-2 h-4 w-4"/>Noticias</TabsTrigger>
                    <TabsTrigger value="oferta"><LayoutTemplate className="mr-2 h-4 w-4"/>Oferta Académica</TabsTrigger>
                    <TabsTrigger value="contacto"><Users className="mr-2 h-4 w-4"/>Contacto</TabsTrigger>
                </TabsList>
                
                <TabsContent value="hero" className="mt-4">
                   <HeroTab />
                </TabsContent>
                <TabsContent value="institucion" className="mt-4">
                   <InstitutionTab />
                </TabsContent>
                <TabsContent value="noticias" className="mt-4">
                   <NewsTab />
                </TabsContent>
                <TabsContent value="oferta" className="mt-4">
                    <OffersTab />
                </TabsContent>
                <TabsContent value="contacto" className="mt-4">
                   <ContactTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
