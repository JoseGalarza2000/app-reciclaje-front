import React, { createContext, useState, useContext } from 'react';
import { ThemeProvider } from '@mui/material';
import { darkThemeMui, themeMui } from './themesMui';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProviderBootstrap = ({ children }) => {
    const [theme, setTheme] = useState('dark');
    const [animationSkeleton] = useState('wave');

    // Cambiar el tema globalmente
    const rootElement = document.documentElement;
    rootElement.setAttribute('data-bs-theme', theme); // Establece el tema inicial

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
        rootElement.setAttribute('data-bs-theme', theme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, animationSkeleton }}>
            <ThemeProvider theme={theme === 'light' ? themeMui : darkThemeMui}>
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};
