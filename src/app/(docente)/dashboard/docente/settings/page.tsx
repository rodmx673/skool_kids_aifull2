
"use client";

import { useContext, useEffect, useMemo, useState } from "react";
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
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserContext } from "@/context/UserContext";
import { TeacherContext } from "@/context/TeacherContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
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


export default function DocenteSettingsPage() {
  const { currentUser, updateUser, updatePassword } = useContext(UserContext);
  const { teachers, updateTeacher } = useContext(TeacherContext);
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

  const teacherDetails = useMemo(() => {
      if (!currentUser) return null;
      return teachers.find(t => t.id === currentUser.id);
  }, [currentUser, teachers]);

  useEffect(() => {
    if (currentUser) {
      profileForm.reset({
        username: currentUser.username,
      });
    }
  }, [currentUser, profileForm]);

  const onProfileSubmit = (data: ProfileFormValues) => {
    if (!currentUser || !teacherDetails) return;
    
    // Update both contexts
    updateUser(currentUser.email, { username: data.username });
    updateTeacher(teacherDetails.id, { name: data.username });

    toast({
      title: "¡Perfil Actualizado!",
      description: "Tu nombre ha sido guardado correctamente.",
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

  if (!currentUser || !teacherDetails) {
    return (
        <div className="flex h-full w-full items-center justify-center bg-background">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando configuración del docente...
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuración del Perfil</h1>
          <p className="text-muted-foreground">
            Gestiona tus datos personales y de seguridad.
          </p>
        </div>
        
        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>
                    Actualiza tu nombre de usuario. El ID y email no se pueden modificar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormItem>
                        <FormLabel>ID de Docente</FormLabel>
                        <FormControl>
                            <Input value={currentUser.id} disabled />
                        </FormControl>
                    </FormItem>
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input value={currentUser.email} disabled />
                        </FormControl>
                    </FormItem>
                 </div>
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
              </CardContent>
               <CardFooter>
                 <Button type="submit"><Save className="mr-2 h-4 w-4"/>Guardar Cambios</Button>
               </CardFooter>
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
                     <CardFooter>
                        <Button type="submit" className="ml-auto">Establecer Nueva Contraseña</Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
      </div>
  );
}
