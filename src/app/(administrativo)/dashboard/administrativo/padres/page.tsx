
"use client";

import { useState, useContext, useMemo } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserContext, User } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2, Search, Link as LinkIcon, UserCheck } from "lucide-react";

// Componente para el formulario de creación/edición de Tutor
function TutorForm({
  tutor,
  onSave,
}: {
  tutor: Partial<User> | null;
  onSave: (data: { username: string; email: string }) => void;
}) {
  const { visibleUsers: users, currentUser } = useContext(UserContext);
  const [username, setUsername] = useState(tutor?.username || "");
  const [email, setEmail] = useState(tutor?.email || "");
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!username.trim() || !email.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El nombre y el email son obligatorios.",
      });
      return;
    }
    // onSave({ username, email });
    onSave({ username, email, tenantId: currentUser?.role === 'administrador' ? currentUser.id : currentUser?.tenantId } as any);
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="username">Nombre Completo del Tutor</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!!tutor} // Disable email editing for existing users
        />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <Button onClick={handleSubmit}>
          {tutor ? "Guardar Cambios" : "Crear Tutor"}
        </Button>
      </DialogFooter>
    </div>
  );
}

// Componente para el diálogo de vinculación de alumnos
function LinkStudentDialog({
  tutor,
  onLink,
}: {
  tutor: User;
  onLink: (studentId: string) => void;
}) {
    const [studentId, setStudentId] = useState('');

    const handleLink = () => {
        onLink(studentId);
        setStudentId('');
    };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Vincular Alumno a {tutor.username}</DialogTitle>
        <DialogDescription>
          Ingrese el ID del alumno para vincularlo a este tutor.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <Label htmlFor="student-id">ID del Alumno</Label>
        <Input id="student-id" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
      </div>
      <DialogFooter>
        <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <DialogClose asChild>
            <Button onClick={handleLink}>Vincular Alumno</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}

export default function PadresPage() {
  const { visibleUsers: users, addUser, updateUser, removeUser, linkStudentToTutor } =
    useContext(UserContext);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTutor, setEditingTutor] = useState<User | null>(null);
  const [linkingTutor, setLinkingTutor] = useState<User | null>(null);

  const tutors = useMemo(() => {
    return users.filter(
      (user) =>
        user.role === "padre" &&
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const getStudentName = (studentId: string) => {
    return users.find(u => u.id === studentId)?.username || studentId;
  };

  const handleSaveTutor = (data: { username: string; email: string }) => {
    try {
      if (editingTutor) {
        updateUser(editingTutor.email, { username: data.username });
        toast({ title: "Tutor actualizado exitosamente." });
      } else {
        addUser({ ...data, role: "padre" });
        toast({ title: "Tutor creado exitosamente." });
      }
      setIsFormOpen(false);
      setEditingTutor(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };
  
  const handleLinkStudent = (studentId: string) => {
      if (!linkingTutor) return;
      const result = linkStudentToTutor(linkingTutor.id, studentId);
      if (result.success) {
          toast({ title: "Éxito", description: result.message });
      } else {
          toast({ variant: "destructive", title: "Error", description: result.message });
      }
      setLinkingTutor(null);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Gestión de Padres de Familia</CardTitle>
          <CardDescription>
            Administra los tutores, sus datos y los alumnos que tienen vinculados.
          </CardDescription>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTutor(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Tutor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTutor ? "Editar Tutor" : "Crear Nuevo Tutor"}
              </DialogTitle>
            </DialogHeader>
            <TutorForm
              tutor={editingTutor}
              onSave={handleSaveTutor}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre del Tutor</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Hijos Vinculados</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tutors.length > 0 ? (
                tutors.map((tutor) => (
                  <TableRow key={tutor.id}>
                    <TableCell className="font-medium">{tutor.username}</TableCell>
                    <TableCell>{tutor.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                          {tutor.childrenIds && tutor.childrenIds.length > 0 ? (
                              tutor.childrenIds.map(id => (
                                  <Badge key={id} variant="secondary">{getStudentName(id)}</Badge>
                              ))
                          ) : (
                              <span className="text-xs text-muted-foreground">Ninguno</span>
                          )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                       <Dialog>
                          <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setLinkingTutor(tutor)}>
                                  <LinkIcon className="mr-2 h-4 w-4" /> Vincular Alumno
                              </Button>
                          </DialogTrigger>
                          {linkingTutor?.id === tutor.id && <LinkStudentDialog tutor={tutor} onLink={handleLinkStudent}/>}
                       </Dialog>
                      <Button variant="ghost" size="icon" onClick={() => { setEditingTutor(tutor); setIsFormOpen(true); }} >
                        <Edit className="h-4 w-4" />
                      </Button>
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" >
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                              <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                  Esta acción eliminará al tutor "{tutor.username}" permanentemente.
                              </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeUser(tutor.email)}>
                                  Eliminar
                              </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No se encontraron tutores.
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
