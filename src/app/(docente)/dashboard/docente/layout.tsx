
"use client";

import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  User,
  Users,
  BookCheck,
  ClipboardList,
  FileSignature,
  MessageSquare,
  CalendarCheck,
  Calendar,
  BookUser,
  Medal,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/context/UserContext";
import { usePathname, useRouter } from "next/navigation";
import { ProfilePictureChanger } from "@/components/profile-picture-changer";
import { Loader2 } from "lucide-react";
import { MessagingContext } from "@/context/MessagingContext";


export default function DocenteDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, setCurrentUser, isInitialLoad } = useContext(UserContext);
  const { getUnreadConversationsCount } = useContext(MessagingContext);
  const router = useRouter();
  const pathname = usePathname();
  const [initials, setInitials] = useState("");
  
  const unreadMessagesCount = currentUser ? getUnreadConversationsCount(currentUser.id) : 0;
  
  const getInitials = (name: string | undefined) => {
    if (!name) return "DO";
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  useEffect(() => {
    // No hacer nada hasta que la carga inicial desde localStorage haya terminado
    if (!isInitialLoad) {
      if (!currentUser) {
          // Si después de la carga no hay usuario, redirigir al login
          router.push('/');
      } else if (currentUser.role !== 'docente') {
          // Si el usuario no tiene el rol correcto, redirigir al dashboard general
          router.push('/dashboard'); 
      }
    }

    if (currentUser?.username) {
        setInitials(getInitials(currentUser.username));
    }
  }, [currentUser, isInitialLoad, router]);


  const handleLogout = () => {
    setCurrentUser(null);
    router.push("/");
  };
  
    const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  );

  // Muestra una pantalla de carga mientras se verifica el estado de autenticación
  if (isInitialLoad || !currentUser) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Cargando y verificando acceso...</p>
            </div>
        </div>
    );
  }
  
  if (currentUser.role !== 'docente') {
      // Este es un fallback en caso de que la redirección tarde.
      return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <p>Acceso no autorizado. Redirigiendo...</p>
            </div>
        </div>
      )
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <BookUser className="h-8 w-8 text-sidebar-foreground" />
            <h2 className="text-xl font-bold text-sidebar-foreground tracking-tight">Portal Docente</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard/docente">
                <SidebarMenuButton tooltip="Inicio" isActive={pathname === '/dashboard/docente'}>
                  <LayoutDashboard />
                  <span>Inicio</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/buscador">
                <SidebarMenuButton tooltip="Buscador" isActive={pathname.startsWith('/buscador')}>
                  <Search />
                  <span>Buscador</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/docente/perfil">
                <SidebarMenuButton tooltip="Mi Perfil" isActive={pathname === '/dashboard/docente/perfil'}>
                  <User />
                  <span>Mi Perfil</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/docente/mis-grupos">
                <SidebarMenuButton tooltip="Mis Grupos" isActive={pathname.startsWith('/dashboard/docente/mis-grupos')}>
                  <Users />
                  <span>Mis Grupos</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/docente/circulares">
                <SidebarMenuButton tooltip="Circulares" isActive={pathname.startsWith('/dashboard/docente/circulares')}>
                  <FileSignature />
                  <span>Circulares</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/dashboard/docente/tareas">
                <SidebarMenuButton tooltip="Tareas y Exámenes" isActive={pathname.startsWith('/dashboard/docente/tareas')}>
                  <BookCheck />
                  <span>Tareas y Exámenes</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/docente/calificaciones">
                <SidebarMenuButton tooltip="Calificaciones" isActive={pathname.startsWith('/dashboard/docente/calificaciones')}>
                  <ClipboardList />
                  <span>Calificaciones</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/dashboard/docente/asistencias">
                <SidebarMenuButton tooltip="Asistencias" isActive={pathname.startsWith('/dashboard/docente/asistencias')}>
                  <CalendarCheck />
                  <span>Asistencias</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/dashboard/docente/conducta">
                <SidebarMenuButton tooltip="Conducta" isActive={pathname.startsWith('/dashboard/docente/conducta')}>
                  <Medal />
                  <span>Conducta</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/dashboard/docente/horarios">
                <SidebarMenuButton tooltip="Mi Horario" isActive={pathname.startsWith('/dashboard/docente/horarios')}>
                  <Calendar />
                  <span>Mi Horario</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/dashboard/docente/mensajeria">
                <SidebarMenuButton tooltip="Mensajería" isActive={pathname.startsWith('/dashboard/docente/mensajeria')}>
                  <MessageSquare />
                  <span>Mensajería</span>
                  {unreadMessagesCount > 0 && <span className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-red-500" />}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/docente/settings">
                <SidebarMenuButton tooltip="Configuración" isActive={pathname.startsWith('/dashboard/docente/settings')}>
                  <Settings />
                  <span>Configuración</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-2">
          <SidebarTrigger className="md:hidden"/>
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                 <Avatar>
                  <AvatarImage src={currentUser.profilePictureUrl || `https://picsum.photos/seed/${currentUser.id}/40/40`} alt="User Avatar" data-ai-hint="teacher face" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{currentUser?.username || "Docente"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/dashboard/docente/perfil">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/dashboard/docente/settings">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
              </Link>
              <ProfilePictureChanger />
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
        <footer className="p-6 pt-0 text-center text-xs text-muted-foreground">
            CONCEPTOS AI MX | PANUCO VER 2025 | 
            <a href="https://wa.me/528332892730" target="_blank" rel="noopener noreferrer" className="inline-flex items-center hover:text-primary">
                <WhatsAppIcon /> +52 833 289 2730
            </a>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
