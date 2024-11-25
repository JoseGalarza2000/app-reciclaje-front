import React, { createContext, useState, useContext, useEffect } from 'react';
import { ThemeProvider } from '@mui/material';
import { darkThemeMui, themeMui } from './themesMui';

// Crear el contexto
const ThemeContext = createContext();

// Hook personalizado para usar el contexto
export const useTheme = () => useContext(ThemeContext);

// Proveedor de Tema
export const ThemeProviderBootstrap = ({ children }) => {
    // Obtener el tema inicial desde las preferencias del sistema
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const [theme, setTheme] = useState(prefersDarkMode ? 'dark' : 'light');
    const [animationSkeleton] = useState('wave');

    // Actualizar el atributo `data-bs-theme` cuando cambie el tema
    useEffect(() => {
        document.documentElement.setAttribute('data-bs-theme', theme);
    }, [theme]);

    // Función para alternar el tema
    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, animationSkeleton }}>
            <ThemeProvider theme={theme === 'light' ? themeMui : darkThemeMui}>
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};
