

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
  SidebarFooter
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  BookCheck,
  ClipboardList,
  CalendarCheck,
  FileText,
  Calendar,
  ArrowLeft,
  Medal,
  User,
  Users,
  MessageSquare,
  Settings,
  Search,
} from "lucide-react";
import { useContext } from "react";
import { UserContext } from "@/context/UserContext";
import { usePathname, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function StudentMirrorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { visibleUsers: users } = useContext(UserContext);
  const pathname = usePathname();
  const params = useParams();
  const studentId = params.studentId as string;

  const student = users.find(u => u.id === studentId);

  const menuItems = [
      { href: `/dashboard/padre/hijos/${studentId}/inicio`, label: "Inicio", icon: LayoutDashboard },
      { href: `/buscador`, label: "Buscador", icon: Search },
      { href: `/dashboard/padre/hijos/${studentId}/perfil`, label: "Mi Perfil", icon: User },
      { href: `/dashboard/padre/hijos/${studentId}/tareas`, label: "Tareas", icon: BookCheck },
      { href: `/dashboard/padre/hijos/${studentId}/calificaciones`, label: "Calificaciones", icon: ClipboardList },
      { href: `/dashboard/padre/hijos/${studentId}/conducta`, label: "Conducta", icon: Medal },
      { href: `/dashboard/padre/hijos/${studentId}/asistencias`, label: "Asistencias", icon: CalendarCheck },
      { href: `/dashboard/padre/hijos/${studentId}/examenes`, label: "Exámenes", icon: FileText },
      { href: `/dashboard/padre/hijos/${studentId}/horarios`, label: "Horario", icon: Calendar },
      { href: `/dashboard/padre/hijos/${studentId}/mensajeria`, label: "Mensajería", icon: MessageSquare },
      { href: `/dashboard/padre/hijos/${studentId}/grupo`, label: "Mi Grupo", icon: Users },
      { href: `/dashboard/padre/hijos/${studentId}/calendario`, label: "Calendario Escolar", icon: Calendar },
      { href: `/dashboard/padre/hijos/${studentId}/settings`, label: "Configuración", icon: Settings },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
             <Link href="/dashboard/padre/hijos" className="w-full">
                <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver a Mis Hijos</span>
                </Button>
            </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map(item => (
                 <SidebarMenuItem key={item.href}>
                    <Link href={item.href}>
                        <SidebarMenuButton tooltip={item.label} isActive={pathname === item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
         <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-2">
            <SidebarTrigger className="md:hidden"/>
            <div className="flex-1" />
            <div className="text-sm font-semibold">
                Vista de solo lectura para: <span className="font-bold text-primary">{student?.username}</span>
            </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
