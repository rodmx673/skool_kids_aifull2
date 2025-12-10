
import lenguaData from './lengua-y-comunicacion-II.json';
// Importa aquí otros archivos JSON de asignaturas cuando los tengas

type Categoria = {
    nombre: string;
}

type Subcategoria = {
    nombre: string;
}

type Progresion = {
    progresion: number;
    meta: string;
    categorias: Categoria[];
    subcategorias: Subcategoria[];
    aprendizajes: string[];
};

export type LibrarySubject = {
    id: string;
    title: string;
    description: string;
    progresiones: Progresion[];
};

// Se pueden añadir más asignaturas al array
export const libraryData: LibrarySubject[] = [
    lenguaData as LibrarySubject
    // ... más asignaturas importadas
];
