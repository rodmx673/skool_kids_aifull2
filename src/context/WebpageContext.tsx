

"use client";

import { createContext, useState, ReactNode, useEffect } from 'react';

export type NewsItem = {
    id: string;
    title: string;
    description: string;
    date: string; // YYYY-MM-DD
    imageUrl: string;
    imageHint: string;
};

export type HeroContent = {
    title: string;
    description: string;
    buttonText: string;
    imageUrl: string;
};

export type InstitutionContent = {
    mission: string;
    vision: string;
};

export type ContactContent = {
    address: string;
    phone: string;
    email: string;
};

type WebpageContextType = {
    news: NewsItem[];
    addNewsItem: (item: Omit<NewsItem, 'id'>) => void;
    updateNewsItem: (id: string, updatedItem: Partial<Omit<NewsItem, 'id'>>) => void;
    deleteNewsItem: (id: string) => void;
    hero: HeroContent;
    setHero: React.Dispatch<React.SetStateAction<HeroContent>>;
    institution: InstitutionContent;
    setInstitution: React.Dispatch<React.SetStateAction<InstitutionContent>>;
    contact: ContactContent;
    setContact: React.Dispatch<React.SetStateAction<ContactContent>>;
};

const initialNews: NewsItem[] = [
    {
        id: 'news-1',
        title: 'Equipo de Robótica Gana Competencia Nacional',
        description: 'Nuestros talentosos estudiantes se llevaron el primer lugar en el torneo de robótica, demostrando innovación y trabajo en equipo.',
        date: '2024-10-25',
        imageUrl: 'https://picsum.photos/seed/noticia1/600/400',
        imageHint: 'students robotics competition',
    },
    {
        id: 'news-2',
        title: 'Feria de Ciencias 2024 Presenta Proyectos Innovadores',
        description: 'La feria anual de ciencias fue un éxito, con proyectos que abarcan desde energías renovables hasta biotecnología.',
        date: '2024-10-18',
        imageUrl: 'https://picsum.photos/seed/noticia2/600/400',
        imageHint: 'students science fair',
    },
    {
        id: 'news-3',
        title: 'Campaña de Reforestación Involucra a la Comunidad',
        description: 'Alumnos y docentes participaron en una jornada de reforestación, plantando más de 500 árboles en áreas locales.',
        date: '2024-10-10',
        imageUrl: 'https://picsum.photos/seed/noticia3/600/400',
        imageHint: 'students planting trees',
    }
];

export const initialHero: HeroContent = {
    title: 'ESTUDIA EN EL CBTIS No. 55',
    description: 'Conviértete en el profesional que siempre soñaste, en una institución reconocida por su excelencia académica y valores. ¡Tu futuro empieza aquí!',
    imageUrl: 'https://picsum.photos/seed/anahuac-hero/1600/900'
};

export const initialInstitution: InstitutionContent = {
    mission: 'Formar personas con conocimientos tecnológicos en las áreas industrial, comercial y de servicios, a través de la preparación de bachilleres y profesionales técnicos, con el fin de contribuir al desarrollo sustentable del país.',
    vision: 'Ser una institución de educación media superior certificada, orientada al aprendizaje y al desarrollo de conocimientos tecnológicos y humanísticos.'
};

export const contact: ContactContent = {
    address: 'Carr. Pánuco - Canoas Km. 2, S/N, Col. Alto de Viñas.',
    phone: '(846) 266 0122',
    email: 'cbtis055.dir@dgeti.sems.gob.mx'
};

export const WebpageContext = createContext<WebpageContextType>({
    news: [],
    addNewsItem: () => {},
    updateNewsItem: () => {},
    deleteNewsItem: () => {},
    hero: initialHero,
    setHero: () => {},
    institution: initialInstitution,
    setInstitution: () => {},
    contact: contact,
    setContact: () => {},
});

export const WebpageProvider = ({ children }: { children: ReactNode }) => {
    const [news, setNews] = useState<NewsItem[]>(initialNews);
    const [hero, setHero] = useState<HeroContent>(initialHero);
    const [institution, setInstitution] = useState<InstitutionContent>(initialInstitution);
    const [contactState, setContact] = useState<ContactContent>(contact);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        try {
            const storedNews = window.localStorage.getItem('datalake-webpage-news');
            setNews(storedNews ? JSON.parse(storedNews) : initialNews);
            
            const storedHero = window.localStorage.getItem('datalake-webpage-hero');
            setHero(storedHero ? JSON.parse(storedHero) : initialHero);

            const storedInstitution = window.localStorage.getItem('datalake-webpage-institution');
            setInstitution(storedInstitution ? JSON.parse(storedInstitution) : initialInstitution);
            
            const storedContact = window.localStorage.getItem('datalake-webpage-contact');
            setContact(storedContact ? JSON.parse(storedContact) : contact);

        } catch (error) {
            console.error("Error reading webpage data from localStorage", error);
        } finally {
            setIsInitialLoad(false);
        }
    }, []);

    useEffect(() => {
        if (isInitialLoad) return;
        try {
            window.localStorage.setItem('datalake-webpage-news', JSON.stringify(news));
            window.localStorage.setItem('datalake-webpage-hero', JSON.stringify(hero));
            window.localStorage.setItem('datalake-webpage-institution', JSON.stringify(institution));
            window.localStorage.setItem('datalake-webpage-contact', JSON.stringify(contactState));
        } catch (error) {
            console.error("Error writing webpage data to localStorage", error);
        }
    }, [news, hero, institution, contactState, isInitialLoad]);

    const addNewsItem = (item: Omit<NewsItem, 'id'>) => {
        const newItem: NewsItem = { ...item, id: `news-${Date.now()}` };
        setNews(prev => [newItem, ...prev]);
    };

    const updateNewsItem = (id: string, updatedItem: Partial<Omit<NewsItem, 'id'>>) => {
        setNews(prev => prev.map(item => (item.id === id ? { ...item, ...updatedItem } : item)));
    };

    const deleteNewsItem = (id: string) => {
        setNews(prev => prev.filter(item => item.id !== id));
    };

    return (
        <WebpageContext.Provider value={{ 
            news, addNewsItem, updateNewsItem, deleteNewsItem,
            hero, setHero,
            institution, setInstitution,
            contact: contactState, setContact
        }}>
            {children}
        </WebpageContext.Provider>
    );
};
