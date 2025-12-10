

"use client";

import { useMemo, useContext, useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserContext, User } from '@/context/UserContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2, Copy, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

// Componente reutilizable para el formulario de usuario
function UserForm({ user, onSave, onCancel, roleToSet }: { user: Partial<User> | null, onSave: (data: Partial<User>) => void, onCancel: () => void, roleToSet: string }) {
    const { visibleUsers: users, currentUser } = useContext(UserContext);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        setUsername(user?.username || '');
        setEmail(user?.email || '');
    }, [user]);

    const handleSubmit = () => {
        const lowerCaseEmail = email.toLowerCase();
        if (!username || !email) {
            toast({ variant: "destructive", title: "Error", description: "Nombre y email son obligatorios." });
            return;
        }

        const emailExists = users.some(u => u.email.toLowerCase() === lowerCaseEmail && u.email !== user?.email);
        if (emailExists) {
            toast({ variant: "destructive", title: "Error", description: "El email ya está registrado." });
            return;
        }

        onSave({
            username,
            email: lowerCaseEmail,
            role: roleToSet, // <-- Aquí se usa el rol pasado desde la pestaña
            tenantId: currentUser?.role === 'administrador' ? currentUser.id : currentUser?.tenantId
        });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="username">Nombre Completo</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!!user?.email} />
            </div>
            <DialogFooter>
                 <DialogClose asChild>
                    <Button variant="outline" onClick={onCancel}>Cancelar</Button>
                </DialogClose>
                <Button onClick={handleSubmit}>{user ? 'Guardar Cambios' : 'Crear Usuario'}</Button>
            </DialogFooter>
        </div>
    );
}

// Componente reutilizable para renderizar la tabla de usuarios para un rol específico
function UserDisplayTable({ role, roleLabel }: { role: string, roleLabel: string }) {
  const { visibleUsers, addUser, updateUser, removeUser } = useContext(UserContext);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  const filteredUsers = useMemo(() => {
    return visibleUsers.filter(user => user.role === role);
  }, [visibleUsers, role]);

  const handleSave = (userData: Partial<User>) => {
    if (editingUser) {
        updateUser(editingUser.email, userData);
        toast({ title: 'Usuario actualizado', description: `Los datos de ${userData.username} se guardaron.` });
    } else {
        addUser(userData as Omit<User, 'id'>);
        toast({ title: 'Usuario creado', description: `El usuario ${userData.username} ha sido añadido.` });
    }
    closeDialog();
  };
  
  const openDialog = (user: User | null = null) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };
  
  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
  };

  const handleCopyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    toast({
        title: "Contraseña Copiada",
        description: "La contraseña por defecto ha sido copiada al portapapeles.",
    });
  }

  // --- Caso especial para Docentes ---
  if (role === 'docente') {
      return (
        <Card>
            <CardHeader>
                <CardTitle>Gestión de Docentes</CardTitle>
                <CardDescription>
                    La gestión detallada de docentes (asignaturas, disponibilidad, etc.) se realiza en la sección de "Gestión Escolar".
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-10">
                <p className="text-muted-foreground mb-4">Para crear, editar o ver la lista completa de docentes, por favor diríjase a la sección correcta.</p>
                <Link href="/dashboard/gestion-escolar?tab=docente" passHref>
                    <Button>
                        Ir a Gestión Escolar de Docentes
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
      )
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
            <CardTitle>Usuarios de tipo: <span className='capitalize'>{roleLabel}</span></CardTitle>
            <CardDescription>Lista de todos los usuarios registrados con este rol en el Data Lake.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => openDialog(null)} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear {roleLabel}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingUser ? `Editar ${roleLabel}` : `Crear Nuevo ${roleLabel}`}</DialogTitle>
                </DialogHeader>
                <UserForm 
                    user={editingUser} 
                    onSave={handleSave} 
                    onCancel={closeDialog} 
                    roleToSet={role}
                />
            </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Contraseña</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell><Badge variant="secondary">{user.id}</Badge></TableCell>
                    <TableCell className='font-medium'>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell><Badge variant="outline" className='capitalize'>{user.role}</Badge></TableCell>
                    <TableCell className="font-mono">
                      <div className="flex items-center gap-2">
                        <span>{user.password}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopyPassword(user.password || '')}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openDialog(user)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>¿Está seguro de eliminar?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Se eliminará permanentemente al usuario <strong>{user.username}</strong>.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => removeUser(user.email)}>Eliminar</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No hay usuarios de tipo <span className='capitalize font-semibold'>{roleLabel}</span> registrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

const displayRoles = [
    { key: 'administrador', label: 'Administrador' },
    { key: 'docente', label: 'Docente' },
    { key: 'alumno', label: 'Alumno' },
    { key: 'padre', label: 'Tutor' },
    { key: 'administrativo', label: 'Administrativo' },
];

export default function NuevosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Skool kits Usuarios
        </h1>
        <p className="text-muted-foreground">
          Visualización y gestión de los usuarios registrados en el Data Lake.
        </p>
      </div>
      
      <Tabs defaultValue={displayRoles[0].key} className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex h-auto">
            {displayRoles.map(role => (
              <TabsTrigger key={role.key} value={role.key}>{role.label}</TabsTrigger>
            ))}
          </TabsList>
        </div>
          {displayRoles.map(role => (
            <TabsContent key={role.key} value={role.key} className='mt-4'>
              <UserDisplayTable role={role.key} roleLabel={role.label} />
            </TabsContent>
          ))}
      </Tabs>
    </div>
  );
}
