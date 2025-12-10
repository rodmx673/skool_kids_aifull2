

"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Mic, 
  X, 
  Minus, 
  Maximize2, 
  Wifi, 
  Battery, 
  FileText,
  Palette,
  Calculator,
  GraduationCap,
  FolderOpen,
  ArrowRight,
  Image as ImageIcon,
  Sliders,
  Save,
  Trash2,
  MoreHorizontal,
  UserPlus,
} from 'lucide-react';

// --- COMPONENTES DE LAS APPS INTERNAS ---

// 1. App de Notas
const NotesApp = () => {
  const [note, setNote] = useState('Bienvenido a Diurna Notes.\n\nEscribe tus pendientes escolares aquí...');
  return (
    <div className="h-full flex flex-col bg-yellow-50 text-gray-800 animate-in fade-in zoom-in duration-300">
      <div className="p-3 border-b border-yellow-200 flex justify-between items-center bg-yellow-100/80 backdrop-blur-sm">
        <span className="text-xs font-bold text-yellow-800 uppercase tracking-wider flex items-center gap-2">
           <FileText size={14} /> Notas - CBTIS
        </span>
        <span className="text-xs text-yellow-600 font-mono">{new Date().toLocaleDateString()}</span>
      </div>
      <textarea 
        className="flex-1 w-full p-6 bg-transparent resize-none focus:outline-none font-sans text-lg leading-relaxed placeholder-yellow-800/30"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Escribe aquí..."
      />
    </div>
  );
};

// 2. App Calculadora
const CalculatorApp = () => {
  const [display, setDisplay] = useState('0');
  
  const handlePress = (val: string) => {
    if (val === 'C') setDisplay('0');
    else if (val === '=') {
      try { 
        // eslint-disable-next-line no-new-func
        const result = new Function('return ' + display)();
        setDisplay(result.toString()); 
      } catch { 
        setDisplay('Error'); 
      }
    } else {
      setDisplay(display === '0' ? val : display + val);
    }
  };

  const btnClass = "h-12 rounded-lg font-medium text-lg transition-all active:scale-95 flex items-center justify-center shadow-sm";
  
  return (
    <div className="h-full bg-gray-900 p-5 text-white flex flex-col animate-in fade-in zoom-in duration-300">
      <div className="bg-black/40 rounded-2xl mb-4 h-20 flex items-center justify-end px-6 text-4xl font-light tracking-widest border border-white/10 shadow-inner">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-3 flex-1">
        {['7','8','9','/','4','5','6','*','1','2','3','-','C','0','=','+'].map((btn) => (
          <button 
            key={btn}
            onClick={() => handlePress(btn)}
            className={`${btnClass} ${['/','*','-','+','='].includes(btn) ? 'bg-orange-500 hover:bg-orange-400 text-white' : btn === 'C' ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-800 hover:bg-gray-700'}`}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

// 3. App Diurna Studio (Tipo Photoshop Mini)
const DesignApp = () => {
  const [filter, setFilter] = useState({ brightness: 100, contrast: 100, saturate: 100, blur: 0 });
  const [isSaved, setIsSaved] = useState(false);
  
  const updateFilter = (type: keyof typeof filter, val: string) => setFilter(prev => ({ ...prev, [type]: Number(val) }));

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };
  
  return (
    <div className="h-full flex flex-col bg-[#2b2b2b] text-gray-200 font-sans animate-in fade-in zoom-in duration-300">
      {/* Toolbar estilo Photoshop */}
      <div className="h-10 bg-[#1f1f1f] border-b border-gray-700 flex items-center px-4 gap-4 text-xs select-none">
        <span className="font-bold text-blue-400 flex items-center gap-2"><Palette size={14}/> Diurna Studio</span>
        <div className="h-4 w-[1px] bg-gray-600 mx-1"></div>
        <span className="hover:bg-white/10 px-2 py-1 rounded cursor-pointer transition-colors">Archivo</span>
        <span className="hover:bg-white/10 px-2 py-1 rounded cursor-pointer transition-colors">Editar</span>
        <span className="hover:bg-white/10 px-2 py-1 rounded cursor-pointer transition-colors">Imagen</span>
        <span className="hover:bg-white/10 px-2 py-1 rounded cursor-pointer transition-colors">Filtro</span>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Herramientas */}
        <div className="w-14 bg-[#252525] border-r border-gray-700 flex flex-col items-center py-4 gap-6 z-10">
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg"><Sliders size={20} /></div>
          <div className="p-2 hover:bg-white/5 rounded-lg text-gray-400 cursor-pointer"><ImageIcon size={20} /></div>
          <div className="p-2 hover:bg-white/5 rounded-lg text-gray-400 cursor-pointer"><MoreHorizontal size={20} /></div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-[#1a1a1a] flex items-center justify-center p-8 relative overflow-hidden group">
            {/* Grid de fondo transparente */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}></div>
            
            <div className="relative shadow-2xl shadow-black/50 transition-all duration-300 group-hover:scale-[1.02]">
                <img 
                src="https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=1000&auto=format&fit=crop" 
                alt="Edición"
                className="max-h-[60vh] object-contain rounded-sm"
                style={{ 
                    filter: `brightness(${filter.brightness}%) contrast(${filter.contrast}%) saturate(${filter.saturate}%) blur(${filter.blur}px)` 
                }}
                />
                <div className="absolute -bottom-8 left-0 right-0 text-center text-xs text-gray-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    1920 x 1080 px • RGB • 8-bit
                </div>
            </div>
        </div>

        {/* Panel Propiedades */}
        <div className="w-64 bg-[#252525] border-l border-gray-700 p-5 flex flex-col gap-6 overflow-y-auto z-10 shadow-xl">
          <div className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-1 flex justify-between items-center">
             <span>Capas y Ajustes</span>
             <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-300"><span>Brillo</span> <span className="text-gray-500 font-mono">{filter.brightness}%</span></div>
                <input type="range" min="0" max="200" value={filter.brightness} onChange={(e) => updateFilter('brightness', e.target.value)} className="w-full accent-blue-500 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
            </div>
            
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-300"><span>Contraste</span> <span className="text-gray-500 font-mono">{filter.contrast}%</span></div>
                <input type="range" min="0" max="200" value={filter.contrast} onChange={(e) => updateFilter('contrast', e.target.value)} className="w-full accent-blue-500 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
            </div>

            <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-300"><span>Saturación</span> <span className="text-gray-500 font-mono">{filter.saturate}%</span></div>
                <input type="range" min="0" max="200" value={filter.saturate} onChange={(e) => updateFilter('saturate', e.target.value)} className="w-full accent-blue-500 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
            </div>

            <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-300"><span>Desenfoque</span> <span className="text-gray-500 font-mono">{filter.blur}px</span></div>
                <input type="range" min="0" max="10" value={filter.blur} onChange={(e) => updateFilter('blur', e.target.value)} className="w-full accent-blue-500 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
            </div>
          </div>

          <div className="mt-auto">
            <button 
                onClick={handleSave}
                className={`w-full py-2.5 rounded text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${isSaved ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
            >
                {isSaved ? (
                    <> <span className="animate-pulse">¡Guardado!</span> </>
                ) : (
                    <> <Save size={14} /> Guardar Proyecto </>
                )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. App CBTIS / Archivos (Mock)
const FinderApp = ({ type }: { type: 'cbtis' | 'files' | 'inscripciones' }) => {
    const items = type === 'cbtis' 
    ? [
        { name: 'Calificaciones_P1.pdf', type: 'PDF', size: '1.2 MB', date: 'Hoy' },
        { name: 'Horario_2025.png', type: 'IMG', size: '2.4 MB', date: 'Ayer' },
        { name: 'Credencial_Digital.jpg', type: 'IMG', size: '800 KB', date: 'Lun' },
        { name: 'Avisos_Direccion.docx', type: 'DOC', size: '15 KB', date: 'Lun' },
      ]
    : type === 'inscripciones'
    ? [
        { name: 'Formulario_Nuevo_Ingreso.pdf', type: 'PDF', size: '500 KB', date: 'Hoy' },
        { name: 'Requisitos_Inscripcion.docx', type: 'DOC', size: '30 KB', date: 'Hoy' },
      ]
    : [
        { name: 'Proyecto_Final_Verge.psd', type: 'PSD', size: '450 MB', date: 'Hoy' },
        { name: 'Tarea_Matematicas.xlsx', type: 'XLS', size: '12 KB', date: 'Ayer' },
        { name: 'Lista_Musica.txt', type: 'TXT', size: '1 KB', date: '23 Oct' },
        { name: 'Diurna_Logo_Vector.svg', type: 'SVG', size: '2 MB', date: '20 Oct' },
    ];

    const title = type === 'cbtis' ? 'Plataforma CBTIS 55' : type === 'inscripciones' ? 'Inscripciones' : 'Mis Documentos';
    const sidebarColor = type === 'cbtis' ? 'bg-red-50' : type === 'inscripciones' ? 'bg-green-50' : 'bg-blue-50';
    const iconColor = type === 'cbtis' ? 'text-red-600' : type === 'inscripciones' ? 'text-green-600' : 'text-blue-600';
    const icon = type === 'cbtis' ? <GraduationCap size={16} className={iconColor} /> : type === 'inscripciones' ? <UserPlus size={16} className={iconColor} /> : <FolderOpen size={16} className={iconColor} />;

    return (
        <div className="h-full bg-white flex text-sm font-sans animate-in fade-in zoom-in duration-300">
            {/* Sidebar Finder */}
            <div className={`w-48 ${sidebarColor}/50 border-r border-gray-200 p-3 flex-col gap-1 hidden md:flex`}>
                <div className="text-xs font-bold text-gray-400 mb-2 px-2 uppercase tracking-wider">Favoritos</div>
                 <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${type === 'files' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <FolderOpen size={16} className={type==='files' ? 'text-blue-600' : 'text-gray-400'}/> Documentos
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-gray-600 hover:bg-gray-100">
                    <ImageIcon size={16} className="text-gray-400"/> Imágenes
                </div>
                 <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${type === 'cbtis' ? 'bg-red-100 text-red-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <GraduationCap size={16} className={type==='cbtis' ? 'text-red-600' : 'text-gray-400'}/> CBTIS 55
                </div>
                 <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${type === 'inscripciones' ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <UserPlus size={16} className={type==='inscripciones' ? 'text-green-600' : 'text-gray-400'}/> Inscripciones
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-white">
                <div className="p-3 border-b flex items-center gap-2 text-gray-500 bg-gray-50/50">
                    <button className="hover:bg-gray-200 p-1 rounded"><ArrowRight size={14} className="rotate-180"/></button>
                    <button className="hover:bg-gray-200 p-1 rounded"><ArrowRight size={14} /></button>
                    <span className="text-gray-300">|</span>
                    {icon}
                    <span className="font-semibold text-gray-800">{title}</span>
                </div>
                <div className="flex-1 overflow-auto p-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-white shadow-sm z-10">
                            <tr className="text-gray-400 border-b border-gray-100 text-xs">
                                <th className="font-medium p-2 pl-4">Nombre</th>
                                <th className="font-medium p-2">Clase</th>
                                <th className="font-medium p-2">Fecha</th>
                                <th className="font-medium p-2 text-right pr-4">Tamaño</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={idx} className="hover:bg-blue-50 group cursor-default transition-colors">
                                    <td className="p-2 pl-4 flex items-center gap-3 text-gray-700 group-hover:text-blue-700 font-medium">
                                        {item.type === 'PDF' && <FileText size={16} className="text-red-500" />}
                                        {item.type === 'IMG' && <ImageIcon size={16} className="text-purple-500" />}
                                        {(item.type === 'DOC' || item.type === 'TXT') && <FileText size={16} className="text-blue-500" />}
                                        {(item.type === 'XLS') && <FileText size={16} className="text-green-500" />}
                                        {item.type === 'PSD' && <Palette size={16} className="text-blue-900" />}
                                        {item.type === 'SVG' && <Palette size={16} className="text-orange-500" />}
                                        {item.name}
                                    </td>
                                    <td className="p-2 text-gray-400 text-xs">{item.type}</td>
                                    <td className="p-2 text-gray-500 text-xs">{item.date}</td>
                                    <td className="p-2 pr-4 text-gray-400 text-xs font-mono text-right">{item.size}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-2 border-t bg-gray-50 text-[10px] text-gray-400 flex justify-between px-4">
                    <span>{items.length} items</span>
                    <span>{type === 'cbtis' ? 'Servidor Remoto: Conectado' : 'Disco Local SSD'}</span>
                </div>
            </div>
        </div>
    )
}


// --- COMPONENTE PRINCIPAL ---

export default function BuscadorPage() {
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeWindow, setActiveWindow] = useState<string | null>(null); 
  const router = useRouter();

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setIsSearching(true);
    // Simulamos un pequeño delay
    setTimeout(() => {
      setIsSearching(false);
      window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
    }, 800);
  };

  const openApp = (appId: string) => {
    if (appId === 'inscripciones') {
        router.push('/dashboard/externos/inscripciones');
    } else {
        setActiveWindow(appId);
    }
  };
  const closeApp = () => setActiveWindow(null);

  const apps = [
    { 
      id: 'inscripciones', 
      name: 'Inscripciones', 
      icon: <UserPlus size={32} className="text-green-700" />, 
      color: 'bg-green-100',
    },
    { 
      id: 'notes', 
      name: 'Notas', 
      icon: <FileText size={32} className="text-yellow-600" />, 
      color: 'bg-yellow-100',
    },
    { 
      id: 'design', 
      name: 'Diurna Studio', 
      icon: <Palette size={32} className="text-purple-600" />, 
      color: 'bg-purple-100',
    },
    { 
      id: 'calc', 
      name: 'Calc', 
      icon: <Calculator size={32} className="text-orange-600" />, 
      color: 'bg-orange-100',
    },
    { 
      id: 'cbtis', 
      name: 'CBTIS 55', 
      icon: <GraduationCap size={32} className="text-red-800" />, 
      color: 'bg-red-100',
    },
    { 
      id: 'files', 
      name: 'Archivos', 
      icon: <FolderOpen size={32} className="text-blue-600" />, 
      color: 'bg-blue-100',
    },
  ];

  const renderWindowContent = () => {
    switch(activeWindow) {
      case 'notes': return <NotesApp />;
      case 'calc': return <CalculatorApp />;
      case 'design': return <DesignApp />;
      case 'cbtis': return <FinderApp type="cbtis" />;
      case 'files': return <FinderApp type="files" />;
      default: return null;
    }
  };

  return (
    <div className="h-screen w-full bg-cover bg-center overflow-hidden relative font-sans selection:bg-blue-500/30" style={{backgroundImage: "url('https://images.unsplash.com/photo-1487088678257-3a541e6e3922?q=80&w=1974&auto=format&fit=crop')"}}>
      
      {/* Overlay Gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 pointer-events-none" />

      {/* --- BARRA SUPERIOR MAC OS --- */}
      <div className="absolute top-0 w-full h-8 bg-white/20 backdrop-blur-md flex justify-between items-center px-4 text-white text-xs font-medium z-50 shadow-sm border-b border-white/10 select-none">
        <div className="flex items-center gap-4">
          <span className="hover:bg-white/20 p-1 rounded cursor-pointer"></span>
           <Link href="/login" passHref>
            <button className="font-bold text-sm bg-cyan-500/80 hover:bg-cyan-400/80 px-3 py-1 rounded-md transition-colors shadow-sm">
                Plataforma Interna
            </button>
          </Link>
          <span className="font-bold hidden sm:block">Diurna OS</span>
        </div>
        <div className="flex items-center gap-4">
          <Battery size={16} />
          <Wifi size={16} />
          <Search size={14} className="cursor-pointer hover:text-white/80"/>
          {currentTime && <span suppressHydrationWarning>{currentTime}</span>}
        </div>
      </div>

      {/* --- ESCRITORIO --- */}
      <main className="flex items-center justify-center h-screen pt-8 px-4 relative">
        
        {/* BUSCADOR + DOCK (Se difuminan cuando hay una ventana activa) */}
        <div className={`
            w-full max-w-4xl bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40
            transform transition-all duration-700 ease-out absolute z-10 flex flex-col
            max-h-[90vh] md:max-h-none
            ${activeWindow ? 'scale-90 opacity-20 blur-sm translate-y-10 pointer-events-none' : 'scale-100 opacity-100 translate-y-0'}
        `}>
          
          {/* Header de la ventana del buscador */}
          <div className="h-10 bg-white/40 border-b border-white/20 flex items-center px-4 justify-between backdrop-blur-md flex-shrink-0">
             <div className="flex gap-2 group">
               <button className="w-3 h-3 rounded-full bg-red-500 border border-red-600/10 shadow-sm flex items-center justify-center group-hover:bg-red-600 transition-colors">
                  <X size={8} className="text-red-900 opacity-0 group-hover:opacity-100" />
               </button>
               <div className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-600/10 shadow-sm"></div>
               <div className="w-3 h-3 rounded-full bg-green-500 border border-green-600/10 shadow-sm"></div>
             </div>
             <div className="text-gray-600 text-xs font-medium flex items-center gap-1 bg-white/50 px-3 py-1 rounded-md shadow-sm">
               <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
               SISTEMA: CBTIS 55 PANUCO VER. 2026
             </div>
             <div className="w-10"></div>
          </div>

          <div className="p-4 md:p-12 flex flex-col items-center justify-center flex-1 overflow-y-auto">
            <div className="mb-8 text-center animate-in slide-in-from-bottom-5 duration-700">
              <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-600 to-blue-700 tracking-tight drop-shadow-sm pb-2">
                CBTIS 55
              </h1>
              <p className="text-gray-700 font-medium mt-1 tracking-[0.2em] text-xs uppercase border-t border-gray-400/30 pt-3">
                Buscador oficial de Pánuco Ver.
              </p>
            </div>

            {/* Buscador */}
            <form onSubmit={handleSearch} className="w-full max-w-xl relative mb-12 z-20 group animate-in slide-in-from-bottom-8 duration-700 delay-100">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative flex items-center bg-white/90 backdrop-blur-md border border-white/60 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 p-2">
                <Search className="text-gray-400 ml-3" size={20} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="¿Qué quieres aprender hoy?" 
                  className="w-full bg-transparent border-none outline-none px-3 py-3 text-lg text-gray-800 placeholder-gray-400 font-light"
                />
                <button 
                  type="submit" 
                  disabled={!searchQuery}
                  className={`px-5 py-2 rounded-xl font-bold text-sm text-white shadow-lg transition-all duration-300 flex items-center gap-2 ${searchQuery ? 'bg-blue-600 hover:bg-blue-700 opacity-100 translate-x-0' : 'bg-gray-300 opacity-0 translate-x-4 w-0 px-0 overflow-hidden'}`}
                >
                  Buscar
                </button>
              </div>
            </form>

            {/* Iconos de App en el escritorio (lanzadores) */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 w-full max-w-3xl animate-in slide-in-from-bottom-10 duration-700 delay-200">
              {apps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => openApp(app.id)}
                  className="group flex flex-col items-center gap-2 transition-transform hover:-translate-y-2 focus:outline-none"
                >
                  <div className={`
                    w-14 h-14 md:w-16 md:h-16 rounded-2xl shadow-lg flex items-center justify-center relative overflow-hidden 
                    border border-white/50 backdrop-blur-md transition-all duration-300 
                    ${app.color} group-hover:shadow-2xl group-hover:shadow-blue-500/30
                  `}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none" />
                    <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
                      {app.icon}
                    </div>
                  </div>
                  <span className="text-[10px] md:text-xs font-semibold text-gray-600 bg-white/80 px-2 py-0.5 rounded-full backdrop-blur-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    {app.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Footer Decorativo */}
          <div className="bg-white/40 border-t border-white/20 p-2 text-center text-[10px] text-gray-500 flex-shrink-0">
            skool kits ai - potenciado por inteligencia artificial
          </div>
        </div>

        {/* --- VENTANA FLOTANTE DE APP ACTIVA --- */}
        {activeWindow && (
          <div className="absolute z-50 w-full h-[90vh] p-2 md:p-0 md:max-w-4xl md:h-[70vh] animate-in zoom-in-95 duration-300 ease-out">
            <div className="w-full h-full bg-white/95 backdrop-blur-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col border border-gray-400/30 ring-1 ring-black/5">
              
              {/* Barra de título de la App Activa */}
              <div className="h-9 bg-gray-100/80 border-b border-gray-200 flex items-center px-3 justify-between select-none">
                <div className="flex gap-2 group">
                  <button onClick={closeApp} className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-red-500 border border-red-600/20 flex items-center justify-center transition-colors shadow-sm">
                    <X size={8} className="text-red-900 opacity-0 group-hover:opacity-100" />
                  </button>
                  <div className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-600/10 shadow-sm"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500 border border-green-600/10 shadow-sm"></div>
                </div>
                <div className="text-xs font-semibold text-gray-500 flex items-center gap-2">
                    {apps.find(a => a.id === activeWindow)?.icon && React.cloneElement(apps.find(a => a.id === activeWindow)!.icon, { size: 12 })}
                    {apps.find(a => a.id === activeWindow)?.name}
                </div>
                <div className="w-10"></div>
              </div>

              {/* Contenido de la App */}
              <div className="flex-1 overflow-hidden relative bg-white">
                {renderWindowContent()}
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
};
