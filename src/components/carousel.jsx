import Carousel from 'react-bootstrap/Carousel';
import { useTheme } from './themeContext';
import { Skeleton } from '@mui/material';

export function CarouselPage({ arrCarousel }) {
  const { theme, animationSkeleton } = useTheme();

  return (
    <>
      {(arrCarousel && arrCarousel.length > 0) ?
        <Carousel variant={theme} className={`mt-2 mt-xl-0 mb-2 home-carousel ${theme === 'dark' ? 'carousel-dark' : ''}`} style={{ height: '20rem' }} interval={null}>
          {
            arrCarousel.map((item) => (
              <Carousel.Item key={item.id} className="w-100 h-100">
                <img className="d-block w-100 h-100" src={item.imageURL} alt="slide" style={{ filter: "brightness(0.8)" }} />
                <Carousel.Caption>
                  <h3>{item.title}</h3>
                  <p>{item.content}</p>
                </Carousel.Caption>
              </Carousel.Item>
            ))
          }
        </Carousel> :
        <div className='h-25 mt-2 mt-xl-0 mb-2'>
          <Skeleton variant="rectangular" animation={animationSkeleton} width="100%" height='22rem' />
        </div>
      }
    </>
  );
}

export function CarouselFotos({ arrFotos }) {
  const { theme } = useTheme();

  return (
    <Carousel slide={false} interval={null} variant={theme}>
      {arrFotos.map((urlFoto, index) => (
        <Carousel.Item key={index}>
          <img className="d-block w-100" style={{ maxHeight: '100%', objectFit: 'cover' }} src={urlFoto} alt="" />
        </Carousel.Item>
      ))}
    </Carousel>
  )
}