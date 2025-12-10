
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
import { PlusCircle, Edit, Trash2, Search, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AcademicContext } from "@/context/AcademicContext";

// Componente para el formulario de creación/edición de Alumno
function StudentForm({
  student,
  onSave,
}: {
  student: Partial<User> | null;
  onSave: (data: Partial<User>) => void;
}) {
  const { visibleUsers: users, currentUser } = useContext(UserContext);
  const [username, setUsername] = useState(student?.username || "");
  const [email, setEmail] = useState(student?.email || "");
  const [careerId, setCareerId] = useState(student?.careerId || "");
  const [level, setLevel] = useState(student?.level || "");
  const [group, setGroup] = useState(student?.group || "");
  const { toast } = useToast();
  const { careers, academicPeriodOptions, groups } = useContext(AcademicContext);

  const handleSubmit = () => {
    if (!username.trim() || !email.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El nombre y el email son obligatorios.",
      });
      return;
    }
    onSave({ id: student?.id, username, email, careerId, level, group, role: 'alumno', tenantId: currentUser?.role === 'administrador' ? currentUser.id : currentUser?.tenantId });
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="username">Nombre Completo del Alumno</Label>
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
          disabled={!!student?.email}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
            <Label htmlFor="career">Carrera</Label>
             <Select value={careerId} onValueChange={setCareerId}>
                <SelectTrigger id="career"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                    {careers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
         <div className="space-y-2">
            <Label htmlFor="level">Semestre</Label>
            <Select value={level} onValueChange={setLevel}>
                <SelectTrigger id="level"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                    {academicPeriodOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
         <div className="space-y-2">
            <Label htmlFor="group">Grupo</Label>
            <Select value={group} onValueChange={setGroup}>
                <SelectTrigger id="group"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                    {groups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
        <Button onClick={handleSubmit}>
          {student ? "Guardar Cambios" : "Crear Alumno"}
        </Button>
      </DialogFooter>
    </div>
  );
}


export default function AlumnosPage() {
  const { visibleUsers, addUser, updateUser, removeUser, currentUser } = useContext(UserContext);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);

  const students = useMemo(() => {
    return visibleUsers.filter(
      (user) =>
        user.role === "alumno" &&
        (user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [visibleUsers, searchTerm]);
  
  const getTutorName = (student: User) => {
    const tutor = visibleUsers.find(u => u.role === 'padre' && u.childrenIds?.includes(student.id));
    return tutor?.username || 'No vinculado';
  };

  const handleSaveStudent = (data: Partial<User>) => {
    try {
      if (editingStudent && data.id) {
        updateUser(data.id, data, 'id');
        toast({ title: "Alumno actualizado exitosamente." });
      } else {
        addUser({ ...data, role: "alumno" } as Omit<User, 'id'>);
        toast({ title: "Alumno creado exitosamente." });
      }
      setIsFormOpen(false);
      setEditingStudent(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Gestión de Alumnos</CardTitle>
          <CardDescription>
            Administra los perfiles de los alumnos, sus datos y documentos.
          </CardDescription>
        </div>
        {currentUser?.role === 'administrador' && (
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => setEditingStudent(null)} disabled={currentUser.role !== 'administrador'}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear Alumno
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                <DialogTitle>
                    {editingStudent ? "Editar Alumno" : "Crear Nuevo Alumno"}
                </DialogTitle>
                </DialogHeader>
                <StudentForm
                student={editingStudent}
                onSave={handleSaveStudent}
                />
            </DialogContent>
            </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, ID o email..."
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
                <TableHead>Nombre del Alumno</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Grupo/Carrera</TableHead>
                <TableHead>Tutor Vinculado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length > 0 ? (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.username}</TableCell>
                    <TableCell><Badge variant="outline">{student.id}</Badge></TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                          <span className="font-semibold">{student.careerId || 'N/A'}</span>
                          <span className="text-xs text-muted-foreground">Semestre: {student.level || 'N/A'} - Grupo: {student.group || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTutorName(student) === 'No vinculado' ? "secondary" : "default"}>{getTutorName(student)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="outline" size="sm">
                          <FileText className="mr-2 h-4 w-4" /> Documentos
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setEditingStudent(student); setIsFormOpen(true); }} >
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
                                  Esta acción eliminará al alumno "{student.username}" permanentemente.
                              </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeUser(student.email)}>
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
                  <TableCell colSpan={5} className="h-24 text-center">
                    No se encontraron alumnos.
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
