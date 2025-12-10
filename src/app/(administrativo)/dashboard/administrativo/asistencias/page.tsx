
"use client";

import { useState, useContext, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, LogIn, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AccessLogContext } from "@/context/AccessLogContext";
import { UserContext } from "@/context/UserContext";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminAsistenciasPage() {
    const { accessLogs } = useContext(AccessLogContext);
    const { users } = useContext(UserContext);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');
    const [date, setDate] = useState<Date | undefined>();

    const getUserName = (userId: string) => {
        return users.find(u => u.id === userId)?.username || userId;
    };
    
    const filteredLogs = useMemo(() => {
        return accessLogs
            .filter(log => {
                const userName = getUserName(log.userId).toLowerCase();
                const searchLower = searchTerm.toLowerCase();
                return userName.includes(searchLower) || log.userId.toLowerCase().includes(searchLower);
            })
            .filter(log => filterType === 'all' || log.type === filterType)
            .filter(log => !date || format(new Date(log.timestamp), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [accessLogs, searchTerm, filterType, date, users]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Registro Global de Asistencia</CardTitle>
                <CardDescription>Historial de todas las entradas y salidas registradas mediante el escáner QR.</CardDescription>
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar por nombre o ID de usuario..." 
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full sm:w-[280px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP", { locale: es }) : <span>Filtrar por fecha...</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={es}/>
                        </PopoverContent>
                    </Popover>
                     <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filtrar por tipo..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="in">Entradas</SelectItem>
                            <SelectItem value="out">Salidas</SelectItem>
                        </SelectContent>
                    </Select>
                    {date && <Button variant="ghost" onClick={() => setDate(undefined)}>Limpiar Fecha</Button>}
                </div>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Fecha y Hora</TableHead>
                                <TableHead className="text-right">Movimiento</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map((log, index) => (
                                    <TableRow key={`${log.userId}-${log.timestamp}-${index}`}>
                                        <TableCell className="font-medium">
                                            {getUserName(log.userId)}
                                            <span className="text-xs text-muted-foreground ml-2">({log.userId})</span>
                                        </TableCell>
                                        <TableCell>{format(new Date(log.timestamp), 'PPP p', { locale: es })}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={log.type === 'in' ? 'default' : 'secondary'} className={log.type === 'in' ? "bg-green-600" : ""}>
                                                {log.type === 'in' ? <LogIn className="h-3 w-3 mr-1"/> : <LogOut className="h-3 w-3 mr-1"/>}
                                                {log.type === 'in' ? 'Entrada' : 'Salida'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        No hay registros que coincidan con los filtros seleccionados.
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
