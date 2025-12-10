
"use client";

import { createContext, useState, ReactNode, useEffect } from 'react';

export type Theme = {
  name: string;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
  };
};

type ThemeContextType = {
  themes: Theme[];
  currentTheme: Theme | null;
  changeTheme: (themeName: string) => void;
};

// Define 15 color palettes
const themes: Theme[] = [
  {
    name: 'Skool Kit (Default)',
    colors: {
      background: '0 0% 94%',
      foreground: '240 10% 3.9%',
      card: '0 0% 100%',
      cardForeground: '240 10% 3.9%',
      popover: '0 0% 100%',
      popoverForeground: '240 10% 3.9%',
      primary: '35 92% 55%',
      primaryForeground: '0 0% 100%',
      secondary: '240 4.8% 95.9%',
      secondaryForeground: '240 5.9% 10%',
      muted: '240 4.8% 95.9%',
      mutedForeground: '240 3.8% 46.1%',
      accent: '210 40% 96.1%',
      accentForeground: '210 40% 4.1%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '0 0% 98%',
      border: '240 5.9% 90%',
      input: '240 5.9% 90%',
      ring: '35 92% 55%',
    },
  },
  {
    name: 'Océano Profundo',
    colors: {
      background: '222.2 84% 4.9%',
      foreground: '210 40% 98%',
      card: '222.2 84% 4.9%',
      cardForeground: '210 40% 98%',
      popover: '222.2 84% 4.9%',
      popoverForeground: '210 40% 98%',
      primary: '217.2 91.2% 59.8%',
      primaryForeground: '210 40% 98%',
      secondary: '217.2 32.6% 17.5%',
      secondaryForeground: '210 40% 98%',
      muted: '217.2 32.6% 17.5%',
      mutedForeground: '215 20.2% 65.1%',
      accent: '217.2 32.6% 17.5%',
      accentForeground: '210 40% 98%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '210 40% 98%',
      border: '217.2 32.6% 17.5%',
      input: '217.2 32.6% 17.5%',
      ring: '217.2 91.2% 59.8%',
    },
  },
   {
    name: 'Bosque Esmeralda',
    colors: {
        background: '220 13% 18%',
        foreground: '210 40% 98%',
        card: '220 13% 22%',
        cardForeground: '210 40% 98%',
        popover: '220 13% 18%',
        popoverForeground: '210 40% 98%',
        primary: '142.1 76.2% 36.3%',
        primaryForeground: '210 40% 98%',
        secondary: '215 27.9% 26.9%',
        secondaryForeground: '210 40% 98%',
        muted: '215 27.9% 26.9%',
        mutedForeground: '215.4 16.3% 56.9%',
        accent: '142.1 76.2% 36.3%',
        accentForeground: '210 40% 98%',
        destructive: '0 62.8% 30.6%',
        destructiveForeground: '210 40% 98%',
        border: '215 27.9% 26.9%',
        input: '215 27.9% 26.9%',
        ring: '142.1 76.2% 36.3%',
    },
  },
  {
    name: 'Atardecer Neón',
    colors: {
      background: '260 20% 11%',
      foreground: '210 40% 98%',
      card: '260 20% 15%',
      cardForeground: '210 40% 98%',
      popover: '260 20% 11%',
      popoverForeground: '210 40% 98%',
      primary: '330 80% 55%',
      primaryForeground: '210 40% 98%',
      secondary: '280 15% 25%',
      secondaryForeground: '210 40% 98%',
      muted: '280 15% 25%',
      mutedForeground: '215.4 16.3% 56.9%',
      accent: '330 80% 55%',
      accentForeground: '210 40% 98%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '210 40% 98%',
      border: '280 15% 25%',
      input: '280 15% 25%',
      ring: '330 80% 55%',
    },
  },
  {
    name: 'Café Literario',
    colors: {
      background: '39 33% 96%',
      foreground: '39 12% 25%',
      card: '39 30% 92%',
      cardForeground: '39 12% 25%',
      popover: '39 33% 96%',
      popoverForeground: '39 12% 25%',
      primary: '24 9.8% 33.5%',
      primaryForeground: '39 33% 98%',
      secondary: '39 20% 88%',
      secondaryForeground: '39 12% 25%',
      muted: '39 20% 88%',
      mutedForeground: '39 8% 45%',
      accent: '24 9.8% 33.5%',
      accentForeground: '39 33% 98%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '0 0% 98%',
      border: '39 20% 84%',
      input: '39 20% 84%',
      ring: '24 9.8% 33.5%',
    },
  },
  {
    name: "Matrix",
    colors: {
      background: "0 0% 8%",
      foreground: "130 100% 70%",
      card: "0 0% 12%",
      cardForeground: "130 100% 70%",
      popover: "0 0% 8%",
      popoverForeground: "130 100% 70%",
      primary: "130 100% 50%",
      primaryForeground: "0 0% 8%",
      secondary: "0 0% 15%",
      secondaryForeground: "130 100% 70%",
      muted: "0 0% 15%",
      mutedForeground: "130 50% 50%",
      accent: "0 0% 15%",
      accentForeground: "130 100% 70%",
      destructive: "0 100% 50%",
      destructiveForeground: "0 0% 8%",
      border: "0 0% 15%",
      input: "0 0% 15%",
      ring: "130 100% 50%",
    },
  },
  {
    name: "Cereza y Crema",
    colors: {
      background: "0 0% 99%",
      foreground: "0 0% 15%",
      card: "0 0% 97%",
      cardForeground: "0 0% 15%",
      popover: "0 0% 99%",
      popoverForeground: "0 0% 15%",
      primary: "340 82% 52%",
      primaryForeground: "0 0% 100%",
      secondary: "0 0% 94%",
      secondaryForeground: "0 0% 15%",
      muted: "0 0% 94%",
      mutedForeground: "0 0% 50%",
      accent: "0 0% 94%",
      accentForeground: "0 0% 15%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      border: "0 0% 90%",
      input: "0 0% 90%",
      ring: "340 82% 52%",
    },
  },
  {
    name: "Vainilla y Carbón",
    colors: {
      background: "45 50% 96%",
      foreground: "240 10% 3.9%",
      card: "45 40% 92%",
      cardForeground: "240 10% 3.9%",
      popover: "45 50% 96%",
      popoverForeground: "240 10% 3.9%",
      primary: "240 5.9% 10%",
      primaryForeground: "0 0% 98%",
      secondary: "45 30% 88%",
      secondaryForeground: "240 5.9% 10%",
      muted: "45 30% 88%",
      mutedForeground: "240 3.8% 46.1%",
      accent: "240 5.9% 10%",
      accentForeground: "0 0% 98%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      border: "45 20% 84%",
      input: "45 20% 84%",
      ring: "240 5.9% 10%",
    },
  },
  {
    name: "Pizarra Moderna",
    colors: {
      background: "224 71% 4%",
      foreground: "213 31% 91%",
      card: "224 71% 10%",
      cardForeground: "213 31% 91%",
      popover: "224 71% 4%",
      popoverForeground: "213 31% 91%",
      primary: "210 40% 98%",
      primaryForeground: "224 71% 4%",
      secondary: "215 28% 17%",
      secondaryForeground: "213 31% 91%",
      muted: "215 28% 17%",
      mutedForeground: "216 12% 54%",
      accent: "215 28% 17%",
      accentForeground: "213 31% 91%",
      destructive: "0 63% 31%",
      destructiveForeground: "213 31% 91%",
      border: "215 28% 17%",
      input: "215 28% 17%",
      ring: "210 40% 98%",
    },
  },
  {
    name: "Menta Fresca",
    colors: {
      background: "150 50% 98%",
      foreground: "150 30% 20%",
      card: "150 40% 95%",
      cardForeground: "150 30% 20%",
      popover: "150 50% 98%",
      popoverForeground: "150 30% 20%",
      primary: "160 60% 40%",
      primaryForeground: "0 0% 100%",
      secondary: "150 30% 90%",
      secondaryForeground: "150 30% 20%",
      muted: "150 30% 90%",
      mutedForeground: "150 20% 40%",
      accent: "160 60% 40%",
      accentForeground: "0 0% 100%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      border: "150 20% 85%",
      input: "150 20% 85%",
      ring: "160 60% 40%",
    },
  },
  {
    name: "Ciruela Eléctrica",
    colors: {
      background: "270 50% 10%",
      foreground: "270 50% 90%",
      card: "270 40% 15%",
      cardForeground: "270 50% 90%",
      popover: "270 50% 10%",
      popoverForeground: "270 50% 90%",
      primary: "280 100% 70%",
      primaryForeground: "270 50% 10%",
      secondary: "270 30% 20%",
      secondaryForeground: "270 50% 90%",
      muted: "270 30% 20%",
      mutedForeground: "270 30% 60%",
      accent: "280 100% 70%",
      accentForeground: "270 50% 10%",
      destructive: "0 100% 60%",
      destructiveForeground: "270 50% 10%",
      border: "270 30% 20%",
      input: "270 30% 20%",
      ring: "280 100% 70%",
    },
  },
  {
    name: "Cítrico",
    colors: {
      background: "45 100% 97%",
      foreground: "25 60% 25%",
      card: "45 100% 94%",
      cardForeground: "25 60% 25%",
      popover: "45 100% 97%",
      popoverForeground: "25 60% 25%",
      primary: "35 92% 55%",
      primaryForeground: "25 60% 15%",
      secondary: "45 90% 90%",
      secondaryForeground: "25 60% 25%",
      muted: "45 90% 90%",
      mutedForeground: "25 40% 45%",
      accent: "35 92% 55%",
      accentForeground: "25 60% 15%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      border: "45 80% 85%",
      input: "45 80% 85%",
      ring: "35 92% 55%",
    },
  },
  {
    name: "Rosa Pastel",
    colors: {
      background: "340 100% 97%",
      foreground: "340 40% 20%",
      card: "340 100% 94%",
      cardForeground: "340 40% 20%",
      popover: "340 100% 97%",
      popoverForeground: "340 40% 20%",
      primary: "330 80% 65%",
      primaryForeground: "0 0% 100%",
      secondary: "340 90% 90%",
      secondaryForeground: "340 40% 20%",
      muted: "340 90% 90%",
      mutedForeground: "340 30% 50%",
      accent: "330 80% 65%",
      accentForeground: "0 0% 100%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      border: "340 80% 85%",
      input: "340 80% 85%",
      ring: "330 80% 65%",
    },
  },
  {
    name: "Cielo de Verano",
    colors: {
      background: "200 100% 97%",
      foreground: "200 50% 25%",
      card: "200 100% 94%",
      cardForeground: "200 50% 25%",
      popover: "200 100% 97%",
      popoverForeground: "200 50% 25%",
      primary: "210 90% 60%",
      primaryForeground: "0 0% 100%",
      secondary: "200 90% 90%",
      secondaryForeground: "200 50% 25%",
      muted: "200 90% 90%",
      mutedForeground: "200 30% 50%",
      accent: "210 90% 60%",
      accentForeground: "0 0% 100%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      border: "200 80% 85%",
      input: "200 80% 85%",
      ring: "210 90% 60%",
    },
  },
  {
    name: "Industrial",
    colors: {
      background: "210 10% 95%",
      foreground: "210 10% 20%",
      card: "210 10% 99%",
      cardForeground: "210 10% 20%",
      popover: "210 10% 95%",
      popoverForeground: "210 10% 20%",
      primary: "210 10% 40%",
      primaryForeground: "0 0% 100%",
      secondary: "210 10% 90%",
      secondaryForeground: "210 10% 20%",
      muted: "210 10% 90%",
      mutedForeground: "210 5% 50%",
      accent: "210 10% 40%",
      accentForeground: "0 0% 100%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      border: "210 10% 85%",
      input: "210 10% 85%",
      ring: "210 10% 40%",
    },
  },
];

export const ThemeContext = createContext<ThemeContextType>({
  themes,
  currentTheme: themes[0],
  changeTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const storedThemeName = localStorage.getItem('app-theme');
    const storedTheme = themes.find(t => t.name === storedThemeName);
    if (storedTheme) {
      setCurrentTheme(storedTheme);
    }
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (isInitialLoad) return;
    
    document.documentElement.style.setProperty('--background', currentTheme.colors.background);
    document.documentElement.style.setProperty('--foreground', currentTheme.colors.foreground);
    document.documentElement.style.setProperty('--card', currentTheme.colors.card);
    document.documentElement.style.setProperty('--card-foreground', currentTheme.colors.cardForeground);
    document.documentElement.style.setProperty('--popover', currentTheme.colors.popover);
    document.documentElement.style.setProperty('--popover-foreground', currentTheme.colors.popoverForeground);
    document.documentElement.style.setProperty('--primary', currentTheme.colors.primary);
    document.documentElement.style.setProperty('--primary-foreground', currentTheme.colors.primaryForeground);
    document.documentElement.style.setProperty('--secondary', currentTheme.colors.secondary);
    document.documentElement.style.setProperty('--secondary-foreground', currentTheme.colors.secondaryForeground);
    document.documentElement.style.setProperty('--muted', currentTheme.colors.muted);
    document.documentElement.style.setProperty('--muted-foreground', currentTheme.colors.mutedForeground);
    document.documentElement.style.setProperty('--accent', currentTheme.colors.accent);
    document.documentElement.style.setProperty('--accent-foreground', currentTheme.colors.accentForeground);
    document.documentElement.style.setProperty('--destructive', currentTheme.colors.destructive);
    document.documentElement.style.setProperty('--destructive-foreground', currentTheme.colors.destructiveForeground);
    document.documentElement.style.setProperty('--border', currentTheme.colors.border);
    document.documentElement.style.setProperty('--input', currentTheme.colors.input);
    document.documentElement.style.setProperty('--ring', currentTheme.colors.ring);

    localStorage.setItem('app-theme', currentTheme.name);

  }, [currentTheme, isInitialLoad]);

  const changeTheme = (themeName: string) => {
    const newTheme = themes.find(t => t.name === themeName);
    if (newTheme) {
      setCurrentTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ themes, currentTheme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

    