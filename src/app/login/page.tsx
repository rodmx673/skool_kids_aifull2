
"use client";

import Link from "next/link"
import { useState, useContext } from "react";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Copy } from "lucide-react";
import { ConnectionStatus } from "@/components/connection-status";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { allUsers: users, setCurrentUser } = useContext(UserContext);
  const { toast } = useToast();

  const handleLogin = () => {
    setError(null);
    if (!email || !password) {
      setError("Por favor, ingrese email y contraseña.");
      return;
    }

    const lowerCaseEmail = email.toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === lowerCaseEmail);

    if (user && user.password === password) {
      setCurrentUser(user);
      toast({
        title: "Inicio de Sesión Exitoso",
        description: `Bienvenido de nuevo, ${user.username}.`,
      });

      // Redirection based on role
      switch (user.role) {
        case "administrador":
          router.push("/dashboard");
          break;
        case "docente":
          router.push("/dashboard/docente");
          break;
        case "alumno":
          router.push("/dashboard/alumno");
          break;
        case "padre":
          router.push("/dashboard/padre");
          break;
        case "administrativo":
          router.push("/dashboard/administrativo");
          break;
        default:
          router.push("/dashboard");
      }
    } else {
      setError("Email o contraseña incorrectos.");
    }
  };
  
  const handleCopyPassword = () => {
    navigator.clipboard.writeText("password123");
    toast({
        title: "Contraseña Copiada",
        description: "La contraseña por defecto 'password123' ha sido copiada.",
    });
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
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Ingresa a tu cuenta. La contraseña por defecto para nuevos usuarios es "password123".
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
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
            <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Button variant="ghost" size="sm" onClick={handleCopyPassword} className="h-auto px-2 py-1 text-xs">
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar Default
                </Button>
            </div>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardContent className="flex flex-col gap-4">
          <Button onClick={handleLogin} className="w-full">
            Iniciar Sesión
          </Button>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="underline text-primary">
              Regístrate
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
