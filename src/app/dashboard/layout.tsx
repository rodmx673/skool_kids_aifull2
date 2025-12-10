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
  Presentation,
  BookOpen,
  Search,
  UserPlus,
  Library,
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
import { useContext, useEffect, useState, useMemo } from "react";
import { UserContext } from "@/context/UserContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProfilePictureChanger } from "@/components/profile-picture-changer";
import { MessagingContext } from "@/context/MessagingContext";


export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const { getUnreadConversationsCount } = useContext(MessagingContext);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [initials, setInitials] = useState("");
  const [isClient, setIsClient] = useState(false);
  
  const unreadMessagesCount = currentUser ? getUnreadConversationsCount(currentUser.id) : 0;

  // Memoize the tab parameter to prevent infinite re-renders
  const currentTab = useMemo(() => searchParams.get('tab'), [searchParams]);

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
      } else if (currentUser.role !== 'administrador' && currentUser.role !== 'superadmin') {
         router.push('/login'); 
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
  
  if (!isClient || !currentUser || (currentUser.role !== 'administrador' && currentUser.role !== 'superadmin')) {
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
            <h2 className="text-xl font-bold text-sidebar-foreground tracking-tight">Portal Administrador</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard">
                <SidebarMenuButton tooltip="Inicio" isActive={pathname === '/dashboard'}>
                  <LayoutDashboard />
                  <span>Dashboard</span>
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
              <Link href="/dashboard/gestion-escolar?tab=nuevo-ingreso">
                <SidebarMenuButton tooltip="Nuevos Ingresos" isActive={pathname === '/dashboard/gestion-escolar' && currentTab === 'nuevo-ingreso'}>
                  <UserPlus />
                  <span>Nuevos Ingresos</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/gestion-escolar">
                <SidebarMenuButton tooltip="Gestión Escolar" isActive={pathname === '/dashboard/gestion-escolar' && currentTab !== 'nuevo-ingreso'}>
                  <Users />
                  <span>Gestión Escolar</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/academicos">
                <SidebarMenuButton tooltip="Académicos" isActive={pathname.startsWith('/dashboard/academicos')}>
                  <BookOpen />
                  <span>ACADEMICOS</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/messaging">
                <SidebarMenuButton tooltip="Mensajería" isActive={pathname.startsWith('/dashboard/messaging')}>
                  <MessageCircle />
                  <span>Mensajería</span>
                  {unreadMessagesCount > 0 && <span className="absolute right-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-red-500" />}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/externos">
                <SidebarMenuButton tooltip="Externos" isActive={pathname.startsWith('/dashboard/externos')}>
                  <GraduationCap />
                  <span>Externos</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/circulares">
                <SidebarMenuButton tooltip="Circulares" isActive={pathname.startsWith('/dashboard/circulares')}>
                  <Bell />
                  <span>Circulares</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/dashboard/oficios">
                <SidebarMenuButton tooltip="Oficios" isActive={pathname.startsWith('/dashboard/oficios')}>
                  <FileText />
                  <span>Oficios</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/dashboard/documentos-foliados">
                <SidebarMenuButton tooltip="Documentos Foliados" isActive={pathname.startsWith('/dashboard/documentos-foliados')}>
                  <FileText />
                  <span>Documentos Foliados</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/dashboard/minutas">
                <SidebarMenuButton tooltip="Minutas" isActive={pathname.startsWith('/dashboard/minutas')}>
                  <FileText />
                  <span>Minutas</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/planeacion">
                <SidebarMenuButton tooltip="Planeación" isActive={pathname.startsWith('/dashboard/planeacion')}>
                  <Calendar />
                  <span>Planeación</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/dashboard/presentaciones">
                <SidebarMenuButton tooltip="Presentaciones" isActive={pathname.startsWith('/dashboard/presentaciones')}>
                  <Presentation />
                  <span>Presentaciones</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/libreria">
                <SidebarMenuButton tooltip="Librería" isActive={pathname.startsWith('/dashboard/libreria')}>
                  <Library />
                  <span>Librería</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/nuevos">
                <SidebarMenuButton tooltip="Skool kits Usuarios" isActive={pathname.startsWith('/dashboard/nuevos')}>
                  <Users />
                  <span>Skool kits Usuarios</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/dashboard/paneles">
                <SidebarMenuButton tooltip="Paneles" isActive={pathname.startsWith('/dashboard/paneles')}>
                  <LayoutDashboard />
                  <span>Paneles</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/calendario">
                <SidebarMenuButton tooltip="Calendario" isActive={pathname.startsWith('/dashboard/calendario')}>
                  <Calendar />
                  <span>Calendario</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/certified-schedules">
                <SidebarMenuButton tooltip="Horarios Certificados" isActive={pathname.startsWith('/dashboard/certified-schedules')}>
                  <Calendar />
                  <span>Horarios Certificados</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/reportes">
                <SidebarMenuButton tooltip="Reportes" isActive={pathname.startsWith('/dashboard/reportes')}>
                  <FileText />
                  <span>Reportes</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/reconocimientos">
                <SidebarMenuButton tooltip="Reconocimientos" isActive={pathname.startsWith('/dashboard/reconocimientos')}>
                  <CreditCard />
                  <span>Reconocimientos</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/webpage/edit">
                <SidebarMenuButton tooltip="Editor Web" isActive={pathname.startsWith('/dashboard/webpage/edit')}>
                  <FileText />
                  <span>Editor Web</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <Link href="/dashboard/settings">
                <SidebarMenuButton tooltip="Configuración" isActive={pathname.startsWith('/dashboard/settings')}>
                  <Settings />
                  <span>Settings</span>
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
              <Link href="/dashboard/settings">
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
