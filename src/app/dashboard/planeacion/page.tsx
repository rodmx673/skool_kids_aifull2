
"use client";

import { useContext } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AcademicContext, Career } from "@/context/AcademicContext";
import { Folder, ChevronRight, BookOpen, FileCheck2 } from "lucide-react";
import Link from "next/link";

export default function PlaneacionAcademicaPage() {
    const { careers } = useContext(AcademicContext);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Planeación Académica</h1>
                <p className="text-muted-foreground">Explora las planeaciones académicas por carrera y consulta los documentos certificados.</p>
            </div>
            
            <Tabs defaultValue="carreras" className="w-full">
                <TabsList>
                    <TabsTrigger value="carreras">Carreras</TabsTrigger>
                    <TabsTrigger value="certificadas">Planeaciones Certificadas</TabsTrigger>
                </TabsList>
                <TabsContent value="carreras">
                    <Card>
                        <CardHeader>
                            <CardTitle>Carreras</CardTitle>
                            <CardDescription>Selecciona una carrera para ver sus asignaturas y generar sus planeaciones didácticas.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {careers.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {careers.map((career: Career) => (
                                        <Link key={career.id} href={`/dashboard/planeacion/${career.id}`} passHref>
                                            <Card className="hover:border-primary hover:shadow-lg transition-all cursor-pointer group">
                                                <CardContent className="p-6 flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <Folder className="h-10 w-10 text-primary" />
                                                        <div>
                                                            <h3 className="font-semibold">{career.name}</h3>
                                                            <p className="text-sm text-muted-foreground">Ver asignaturas</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-semibold">No hay Carreras Definidas</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Para empezar, crea una carrera en la sección de <Link href="/dashboard/settings?tab=academico" className="text-primary underline">configuración académica</Link>.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="certificadas">
                    <Card>
                        <CardHeader>
                            <CardTitle>Planeaciones Certificadas</CardTitle>
                            <CardDescription>Aquí se mostrarán los documentos de planeación finalizados y certificados.</CardDescription>
                        </CardHeader>
                         <CardContent>
                            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                                <FileCheck2 className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">Aún no hay planeaciones certificadas</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Cuando una planeación se guarde como "certificada", aparecerá en esta sección.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
