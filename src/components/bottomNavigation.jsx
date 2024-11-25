import * as React from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import RecyclingRoundedIcon from '@mui/icons-material/RecyclingRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import { Fab, Paper } from '@mui/material';
import { scroller } from 'react-scroll';
import { Link } from 'react-router-dom';

export default function FixedBottomNavigation() {
  const [value, setValue] = React.useState("inicio");
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleScroll = () => {
    const sections = ['inicio', 'about', 'info', 'map'];
    const scrollPosition = window.scrollY + 50; // Aplicar -50px al scroll actual
    const windowHeight = window.innerHeight; // Altura de la ventana
    const documentHeight = document.documentElement.scrollHeight; // Altura total del documento

    sections.forEach((section) => {
      const sectionElement = document.getElementById(section);
      if (sectionElement) {
        const { offsetTop, clientHeight } = sectionElement;
        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + clientHeight) {
          setValue(section); // Actualiza el valor basado en la sección visible
        }
      }
    });

    // Verificar si se ha llegado cerca del final de la página
    if (scrollPosition + windowHeight >= documentHeight - 50) {
      setValue('map'); // Activa el botón "Acopios" si se está cerca del final
    }
  };

  React.useEffect(() => {
    if (isClient) {
      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isClient]);

  // Función para hacer scroll suave a la sección
  const scrollToSection = (section) => {
    scroller.scrollTo(section, {
      duration: 500,
      delay: 0,
      smooth: 'easeInOutQuart',
      offset: -50, // Ajustar el offset según sea necesario
    });
  };

  if (!isClient) {
    return null; // Evita renderizar cualquier cosa si aún no estamos en el cliente
  }

  return (
    <>
      <Box sx={{ position: 'fixed', pb: 7, zIndex: 3000 }}>
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 3000 }} elevation={5} className='navigationMovil'>
          <BottomNavigation
            value={value}
            onChange={(event, newValue) => {
              setValue(newValue);
              // Realiza el scroll a la sección correspondiente
              scrollToSection(newValue);
            }}
          >
            <BottomNavigationAction
              showLabel={true}
              label="Inicio"
              value="inicio"
              icon={<HomeRoundedIcon />}
              onClick={() => scrollToSection('inicio')}
            />
            <BottomNavigationAction
              showLabel={true}
              label="Nosotros"
              value="about"
              icon={<HelpRoundedIcon />}
              onClick={() => scrollToSection('about')}
            />
            <BottomNavigationAction
              showLabel={true}
              label="Información"
              value="info"
              icon={<InfoRoundedIcon />}
              onClick={() => scrollToSection('info')}
            />
            <BottomNavigationAction
              showLabel={true}
              label="Acopios"
              value="map"
              icon={<HomeWorkIcon />}
              onClick={() => scrollToSection('map')}
            />
          </BottomNavigation>
        </Paper>
      </Box>

      <Fab
        variant="extended"
        sx={{ position: 'fixed', bottom: '1rem', right: '1rem' }}
        className='reciclar-btn-fixed fw-bold'
        onClick={() => setValue("reciclar")}
        component={Link}
        to="/Reciclar"
      >
        <RecyclingRoundedIcon sx={{ mr: 1 }} />
        Reciclar
      </Fab>
    </>
  );
}
