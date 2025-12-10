
"use client";

import Link from "next/link"
import { useState, useContext, useEffect } from "react";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Icons } from "@/components/icons"
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/UserContext";
import { TeacherContext } from "@/context/TeacherContext";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { ConnectionStatus } from "@/components/connection-status";

// Solución Diferente: Se define la lista de roles directamente aquí para evitar problemas de carga.
const availableRoles = ["administrador", "docente", "alumno", "administrativo", "padre"];

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { allUsers: users, addUser } = useContext(UserContext); // CORRECCIÓN: Usar allUsers
  const { addTeacher } = useContext(TeacherContext);
  const { toast } = useToast();

  const handleCreateAccount = () => {
    setError(null);
    if (!username || !email || !role) {
      setError("Por favor, complete todos los campos obligatorios.");
      return;
    }
    
    if (role !== 'administrador' && !tenantId) {
        setError("Para este rol, es obligatorio proporcionar el 'Código de Administrador'.");
        return;
    }

    const lowerCaseEmail = email.toLowerCase();

    const emailExists = users.some(
      (user) => user.email.toLowerCase() === lowerCaseEmail
    );

    if (emailExists) {
      setError("El email ya está registrado.");
      return;
    }
    
    const newUser = addUser({ 
      username: username,
      email: lowerCaseEmail, 
      role,
      tenantId: role !== 'administrador' ? tenantId : undefined,
    });

    if (newUser) {
        // If the user is a teacher, also add them to the TeacherContext
        if (newUser.role === 'docente') {
            addTeacher({ 
                id: newUser.id, 
                name: newUser.username, 
                maxHours: 40, 
                qualifiedSubjects: [],
                rfc: '',
                curp: '',
                clave: '',
                folio: '',
                puestosAdicionales: [],
            });
        }
        
        toast({
            title: "¡Cuenta creada!",
            description: `El usuario ${newUser.username} ha sido creado. Ahora puedes iniciar sesión.`,
        });
        router.push("/login");
    } else {
        setError("Ocurrió un error al crear el usuario. El email podría ya existir o el ID de Administrador es inválido.");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ConnectionStatus />
      </div>
      <div className="flex flex-col items-center justify-center space-y-4">
        <Icons.logo className="h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          SKOOL KITS AI
        </h1>
      </div>
      <Card className="w-full max-w-sm mt-8">
        <CardHeader>
          <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
          <CardDescription>
            Ingresa tu información para crear una cuenta de usuario.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          <div className="grid gap-2">
            <Label htmlFor="username">Nombre completo</Label>
            <Input 
              id="username" 
              placeholder="Tu Nombre Completo" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email"
              placeholder="tu@email.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmail(email.toLowerCase())}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Tipo de Usuario</Label>
            <Select required onValueChange={setRole} value={role}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           {role && role !== 'administrador' && (
              <div className="grid gap-2">
                <Label htmlFor="tenantId">Código de Administrador</Label>
                <Input 
                  id="tenantId" 
                  placeholder="ID del administrador a vincular" 
                  required 
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                />
              </div>
            )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleCreateAccount} className="w-full">
            Crear Cuenta
          </Button>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="underline text-primary">
              Inicia Sesión
            </Link>
          </div>
        </CardFooter>
      </Card>
    </main>
  )
}
