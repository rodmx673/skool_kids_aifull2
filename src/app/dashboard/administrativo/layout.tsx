
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
  Briefcase,
  MessageCircle,
  Calendar,
  CreditCard,
  FileText,
  Bell,
  GraduationCap,
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


export default function AdministrativoDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const router = useRouter();
  const pathname = usePathname();
  const [initials, setInitials] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getInitials = (name: string | undefined) => {
    if (!name) return "AD";
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  useEffect(() => {
    if (isClient) {
      if (!currentUser) {
        router.push('/');
      } else if (currentUser.role !== 'administrativo') {
         router.push('/dashboard'); 
      }
    }
    if (currentUser?.username) {
        setInitials(getInitials(currentUser.username));
    }
  }, [currentUser, isClient, router]);

  const handleLogout = () => {
    setCurrentUser(null);
    router.push("/");
  };

  const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  );
  
  if (!isClient || !currentUser || currentUser.role !== 'administrativo') {
    return (
        <div className="flex items-center justify-center h-screen">
            <p className="text-muted-foreground">Cargando y verificando acceso...</p>
        </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-sidebar-foreground" />
            <h2 className="text-xl font-bold text-sidebar-foreground tracking-tight">Portal Administrativo</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard/administrativo">
                <SidebarMenuButton tooltip="Inicio" isActive={pathname === '/dashboard/administrativo'}>
                  <LayoutDashboard />
                  <span>Inicio</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/administrativo/padres">
                <SidebarMenuButton tooltip="Padres de Familia" isActive={pathname.startsWith('/dashboard/administrativo/padres')}>
                  <Users />
                  <span>Padres de Familia</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/dashboard/administrativo/alumnos">
                <SidebarMenuButton tooltip="Alumnos" isActive={pathname.startsWith('/dashboard/administrativo/alumnos')}>
                  <GraduationCap />
                  <span>Alumnos</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/administrativo/agenda">
                <SidebarMenuButton tooltip="Agenda / Citas" isActive={pathname.startsWith('/dashboard/administrativo/agenda')}>
                  <Calendar />
                  <span>Agenda / Citas</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/dashboard/administrativo/pagos">
                <SidebarMenuButton tooltip="Pagos" isActive={pathname.startsWith('/dashboard/administrativo/pagos')}>
                  <CreditCard />
                  <span>Pagos</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/administrativo/documentos">
                <SidebarMenuButton tooltip="Documentos" isActive={pathname.startsWith('/dashboard/administrativo/documentos')}>
                  <FileText />
                  <span>Documentos</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/administrativo/comunicados">
                <SidebarMenuButton tooltip="Comunicados" isActive={pathname.startsWith('/dashboard/administrativo/comunicados')}>
                  <Bell />
                  <span>Comunicados</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/dashboard/administrativo/mensajeria">
                <SidebarMenuButton tooltip="Mensajería" isActive={pathname.startsWith('/dashboard/administrativo/mensajeria')}>
                  <MessageCircle />
                  <span>Mensajería</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/administrativo/calendario">
                <SidebarMenuButton tooltip="Calendario" isActive={pathname.startsWith('/dashboard/administrativo/calendario')}>
                  <Calendar />
                  <span>Calendario</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/administrativo/settings">
                <SidebarMenuButton tooltip="Configuración" isActive={pathname.startsWith('/dashboard/administrativo/settings')}>
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
                  <AvatarImage src={currentUser.profilePictureUrl || `https://picsum.photos/seed/${currentUser.id}/40/40`} alt="User Avatar" data-ai-hint="administrative person face" />
                  <AvatarFallback>{isClient ? initials : ''}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{currentUser?.username || "Mi Cuenta"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/dashboard/administrativo/settings">
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
