
"use client";

import { createContext, useState, ReactNode, useEffect } from 'react';

// --- Tipos de Datos ---

export type Template = {
  id: string;
  name: string;
  departmentId: string;
  body: string;
  signerName: string;
  signerTitle: string;
  ccEmail: string;
  headerLogo1Url: string;
  headerLogo2Url: string;
  footerLogo1Url: string;
  footerLogo2Url: string;
  signatureUrl: string;
  docType: string;
  locationAndDate: string;
};

export type DocumentType = {
    id: string;
    name: string;
};

type TemplateContextType = {
  templates: Template[];
  addTemplate: (template: Omit<Template, 'id'> | Template) => void;
  removeTemplate: (id: string) => void;
  documentTypes: DocumentType[];
  addDocumentType: (name: string) => void;
  updateDocumentType: (id: string, name: string) => void;
  removeDocumentType: (id: string) => void;
};

export const TemplateContext = createContext<TemplateContextType>({
  templates: [],
  addTemplate: () => {},
  removeTemplate: () => {},
  documentTypes: [],
  addDocumentType: () => {},
  updateDocumentType: () => {},
  removeDocumentType: () => {},
});

const initialDocumentTypes: DocumentType[] = [
    { id: 'oficio', name: 'Oficio' },
    { id: 'circular', name: 'Circular' },
    { id: 'memorandum', name: 'Memorándum' },
    { id: 'constancia', name: 'Constancia' },
];

export const TemplateProvider = ({ children }: { children: ReactNode }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    try {
      const storedTemplates = window.localStorage.getItem('datalake-templates');
      if (storedTemplates) {
        setTemplates(JSON.parse(storedTemplates));
      }
      const storedDocTypes = window.localStorage.getItem('datalake-documentTypes');
      setDocumentTypes(storedDocTypes ? JSON.parse(storedDocTypes) : initialDocumentTypes);

    } catch (error) {
      console.error("Error reading from localStorage", error);
    } finally {
      setIsInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    if (isInitialLoad) return;
    try {
      window.localStorage.setItem('datalake-templates', JSON.stringify(templates));
      window.localStorage.setItem('datalake-documentTypes', JSON.stringify(documentTypes));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  }, [templates, documentTypes, isInitialLoad]);

  const addTemplate = (template: Omit<Template, 'id'> | Template) => {
    if ('id' in template) {
        // It's a full template object, likely from a default creation
        if (!templates.some(t => t.id === template.id)) {
            setTemplates(prev => [...prev, template]);
        }
    } else {
        // It's a new template to be created with a new ID
        const newTemplate: Template = {
            ...template,
            id: `template-${Date.now()}`,
        };
        setTemplates(prev => [...prev, newTemplate]);
    }
  };

  const removeTemplate = (id: string) => {
    setTemplates(prev => prev.filter(template => template.id !== id));
  };
  
  const addDocumentType = (name: string) => {
    if (name && !documentTypes.some(dt => dt.name.toLowerCase() === name.toLowerCase())) {
        const newType: DocumentType = { id: `doctype-${Date.now()}`, name };
        setDocumentTypes(prev => [...prev, newType]);
    }
  };

  const updateDocumentType = (id: string, name: string) => {
      setDocumentTypes(prev => prev.map(dt => dt.id === id ? { ...dt, name } : dt));
  };

  const removeDocumentType = (id: string) => {
      setDocumentTypes(prev => prev.filter(dt => dt.id !== id));
  };


  return (
    <TemplateContext.Provider value={{ 
        templates, addTemplate, removeTemplate,
        documentTypes, addDocumentType, updateDocumentType, removeDocumentType
    }}>
      {children}
    </TemplateContext.Provider>
  );
};
