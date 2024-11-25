import { createTheme } from '@mui/material/styles';

export const themeMui = createTheme({
  palette: {
    primary: {
      main: '#0fa968', // Cambia este valor al color primario deseado
    },
  },
});

export const darkThemeMui = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0fa968', // Cambia este valor al color primario deseado
    },
    background: {
      default: "#212529",
      //paper: "#212529",
    }
  },
});
