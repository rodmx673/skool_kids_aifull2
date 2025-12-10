
"use client";

import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserContext } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Schema for profile info
const profileFormSchema = z.object({
  username: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Schema for password change
const passwordFormSchema = z.object({
    newPassword: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
});
type PasswordFormValues = z.infer<typeof passwordFormSchema>;


export default function PadreSettingsPage() {
  const { currentUser, updateUser, updatePassword } = useContext(UserContext);
  const { toast } = useToast();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (currentUser) {
      profileForm.reset({
        username: currentUser.username,
      });
    }
  }, [currentUser, profileForm]);

  const onProfileSubmit = (data: ProfileFormValues) => {
    if (!currentUser) return;
    
    updateUser(currentUser.email, data);

    toast({
      title: "¡Perfil Actualizado!",
      description: "Tu información ha sido guardada.",
    });
  };

  const onPasswordSubmit = (data: PasswordFormValues) => {
    if (!currentUser) return;

    if (updatePassword(currentUser.email, data.newPassword)) {
        toast({
            title: "¡Contraseña Cambiada!",
            description: "Tu nueva contraseña ha sido establecida.",
        });
        passwordForm.reset();
    } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo cambiar la contraseña.",
        });
    }
  }

  if (!currentUser) {
    return (
        <div className="flex h-full w-full items-center justify-center bg-background">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando configuración...
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuración de la Cuenta</h1>
          <p className="text-muted-foreground">
            Gestiona tus datos personales.
          </p>
        </div>
        
        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                    Actualiza tus datos de contacto.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={profileForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu nombre completo..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input placeholder="Tu email..." value={currentUser.email} disabled />
                    </FormControl>
                </FormItem>
              </CardContent>
               <CardContent>
                <Button type="submit">Guardar Cambios de Perfil</Button>
            </CardContent>
            </Card>
          </form>
        </Form>

        <Separator />

        <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Cambiar Contraseña</CardTitle>
                        <CardDescription>Establece una nueva contraseña para tu cuenta.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nueva Contraseña</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                     <CardContent>
                        <Button type="submit">Establecer Nueva Contraseña</Button>
                    </CardContent>
                </Card>
            </form>
        </Form>
      </div>
  );
}
