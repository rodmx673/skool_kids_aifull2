
"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronRight, LogIn, Calendar, ExternalLink } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { WebpageContext } from '@/context/WebpageContext';
import { CalendarContext } from '@/context/CalendarContext';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { VocationalQuiz } from '@/components/VocationalQuiz';


export default function WebpagePage() {
  const { news, hero, institution, contact } = useContext(WebpageContext);
  const { events } = useContext(CalendarContext);
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="bg-background text-gray-800">
      {/* Top Bar */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center text-xs text-gray-600">
          <div className="flex gap-4 overflow-x-auto">
             <Dialog>
                <DialogTrigger asChild>
                    <button className="hover:text-primary whitespace-nowrap font-semibold text-primary">ORIENTADOR VOCACIONAL</button>
                </DialogTrigger>
                <DialogContent className="max-w-xl h-[80vh]">
                     <DialogHeader>
                        <DialogTitle>Asistente Vocacional de IA</DialogTitle>
                        <DialogDescription>
                          Responde este divertido quiz para descubrir qué carrera se alinea mejor con tus pasiones e intereses.
                        </DialogDescription>
                    </DialogHeader>
                    <VocationalQuiz />
                </DialogContent>
            </Dialog>
            <a href="#" className="hidden sm:inline hover:text-primary">BECAS</a>
            <a href="#" className="hidden md:inline hover:text-primary">DESCUENTOS</a>
            <a href="#" className="hidden lg:inline hover:text-primary">INTERCAMBIOS</a>
            <a href="#" className="hidden sm:inline hover:text-primary">NOTICIAS</a>
          </div>
          <div className="hidden md:flex gap-4 items-center">
             <a href="#" className="hover:text-primary">NOSOTROS</a>
             <a href="#" className="hover:text-primary">VIDA IEST</a>
             <a href="#" className="hover:text-primary">CONTACTO</a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-40 border-b">
        <div className="container mx-auto flex justify-between items-center py-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
             <Image src="https://cbtis055.edu.mx/img/logo-cbtis.png" alt="CBTIS 55 Logo" width={40} height={40} className="sm:w-[50px] sm:h-[50px]" />
            <span className="font-bold text-lg sm:text-xl text-gray-800 hidden sm:block">
              CBTIS No. 55
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-700">
            <a href="#" className="hover:text-primary">PREPARATORIA</a>
            <a href="#" className="hover:text-primary">LICENCIATURA</a>
            <a href="#" className="hover:text-primary">POSGRADOS</a>
            <a href="#" className="hover:text-primary">EDUCACIÓN CONTINUA</a>
          </nav>
           <Link href="/login" passHref>
            <Button size="sm" className="whitespace-nowrap">
              <LogIn className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Plataforma Skool Kits IA</span>
              <span className="sm:hidden">Plataforma</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[450px] sm:h-[70vh] flex items-center justify-center text-center text-white">
        <Image
          src={hero.imageUrl}
          alt="Campus del CBTIS 55"
          fill
          className="object-cover -z-10"
          data-ai-hint="students studying campus"
        />
        <div className="absolute inset-0 bg-black/60 -z-10" />
        <div className="max-w-3xl px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">{hero.title}</h1>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-white/90">
            {hero.description}
          </p>
          <Link href="/dashboard/externos/inscripciones" passHref>
            <Button size="lg" className="mt-8 bg-white text-primary hover:bg-gray-200 font-bold py-3 px-6 text-sm sm:text-base">
              {hero.buttonText} <ChevronRight className="ml-2 h-5 w-5"/>
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-800 text-white py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold">5 Carreras</h3>
              <p className="text-gray-300 mt-2 text-sm sm:text-base">Conoce nuestra oferta académica y elige el programa perfecto para ti.</p>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold">+70% de Alumnos</h3>
              <p className="text-gray-300 mt-2 text-sm sm:text-base">Cuentan con una beca para apoyar a su educación.</p>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold">+30 Convenios</h3>
              <p className="text-gray-300 mt-2 text-sm sm:text-base">Excelencia académica y la preparación que requieres para tu desarrollo profesional.</p>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold">+45 Años</h3>
              <p className="text-gray-300 mt-2 text-sm sm:text-base">De trayectoria y excelencia académica formando a los mejores técnicos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mision y Vision Section */}
       <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
           <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight">Nuestra Institución</h2>
                <p className="text-muted-foreground mt-2">Conoce los pilares que nos guían.</p>
            </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="shadow-lg hover:shadow-xl transition-shadow">
                   <CardContent className="pt-8">
                       <CardTitle className="mb-4 text-primary">Misión</CardTitle>
                       <CardDescription className="text-base leading-relaxed">
                           {institution.mission}
                       </CardDescription>
                   </CardContent>
               </Card>
                <Card className="shadow-lg hover:shadow-xl transition-shadow">
                   <CardContent className="pt-8">
                       <CardTitle className="mb-4 text-primary">Visión</CardTitle>
                       <CardDescription className="text-base leading-relaxed">
                           {institution.vision}
                       </CardDescription>
                   </CardContent>
               </Card>
           </div>
        </div>
       </section>

        {/* Upcoming Events Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
           <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight">Próximos Eventos</h2>
                <p className="text-muted-foreground mt-2">No te pierdas nuestras próximas actividades y fechas importantes.</p>
            </div>
            {upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {upcomingEvents.map((event) => (
                        <Card key={event.id} className="border-l-4 border-primary">
                            <CardContent className="p-6">
                                <p className="text-sm font-semibold text-primary mb-1">
                                    {new Date(event.date + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    {event.time !== '00:00' && ` - ${event.time}`}
                                </p>
                                <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                                <p className="text-muted-foreground text-sm">{event.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                 <p className="text-center text-muted-foreground">No hay eventos próximos en el calendario.</p>
            )}
             <div className="text-center mt-12">
                <Button variant="outline">Ver Calendario Completo <ExternalLink className="ml-2 h-4 w-4"/></Button>
            </div>
        </div>
      </section>

       {/* News Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Últimas Noticias</h2>
            <p className="text-muted-foreground mt-2">Mantente al día con los últimos acontecimientos y logros de nuestra comunidad.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item) => (
              <Card key={item.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  width={600}
                  height={400}
                  className="w-full h-48 object-cover"
                  data-ai-hint={item.imageHint}
                />
                <CardContent className="p-6">
                  <CardDescription className="text-sm mb-2">{new Date(item.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                  <CardTitle className="text-xl mb-3">{item.title}</CardTitle>
                  <p className="text-muted-foreground text-sm mb-4">
                    {item.description}
                  </p>
                  <Button variant="outline">Leer más</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-1">
                <h3 className="font-bold text-lg mb-4">CBTIS No. 55</h3>
                <p className="text-gray-400">"Técnica, Crisol de Voluntades"</p>
                <p className="text-gray-400 mt-2">Pánuco, Veracruz, México.</p>
            </div>
             <div className="md:col-span-1">
                <h3 className="font-bold text-lg mb-4">Contacto</h3>
                <ul className="space-y-3 text-gray-400 text-sm sm:text-base">
                    <li className="flex items-start gap-3"><span>{contact.address}</span></li>
                    <li className="flex items-center gap-3"><span>{contact.phone}</span></li>
                    <li className="flex items-center gap-3"><span>{contact.email}</span></li>
                </ul>
            </div>
             <div className="md:col-span-1">
                <h3 className="font-bold text-lg mb-4">Síguenos</h3>
                <p className="text-gray-400">Encuéntranos en nuestras redes sociales para estar al día de los últimos eventos y noticias.</p>
                 {/* Social media links could go here */}
            </div>
        </div>
         <div className="container mx-auto px-4 sm:px-6 mt-12 pt-8 border-t border-gray-700 text-center text-gray-500 text-sm">
            <p>&copy; {year} CBTIS No. 55. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
