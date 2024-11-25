import { Col, Container, Image, Row } from "react-bootstrap";
import { CarouselPage } from "../components/carousel"
import { CardsAbout } from "../components/cards";
import CustomizedTimeline from "../components/timeline";
import { MapComponentBasic } from "../components/maps";
import { useEffect } from "react";
import { scroller } from "react-scroll";
import { NavbarsHome } from "../components/navBar";
import axios from "axios";
import { useState } from "react";
import { Skeleton, Typography } from "@mui/material";
import { useTheme } from "../components/themeContext";

function ReciclajeInfo({ arrSecciones }) {
    const { animationSkeleton } = useTheme();
    const defaultItems = [{ id: 1, tipo: "texto" }, { id: 2, tipo: "texto" }, { id: 3, tipo: "foto" }];

    return (
        <div className='home-info-content mb3'>
            {
                (arrSecciones && arrSecciones.length > 0) ? (
                    arrSecciones.map(seccion => (
                        <div key={seccion.id}>
                            <h2 className="text-center">{seccion.title}</h2>
                            <Row md={(seccion.content.length > 1) || (seccion.content.length > 0 && seccion.imageURL) ? 2 : 1} sm={1} xs={1}>
                                {seccion.imageURL && (
                                    <Col key={`${seccion.id}-image`} /*md={{ order: 'last' }} sm={{ span: 12, order: 'first' }} xs={{ span: 12, order: 'first' }}*/>
                                        <div className='info-content-img-container text-center'>
                                            <Image
                                                className="info-content-img"
                                                style={{ border: "none" }}
                                                src={seccion.imageURL} rounded />
                                        </div>
                                    </Col>
                                )}
                                {
                                    (seccion.content && seccion.content.length > 0) &&
                                    (
                                        seccion.content.map(item => (
                                            (item.tipo === "parrafo" ?
                                                <Col key={`${item.id}-parrafo`} sm={12}>
                                                    <h5 className="w-100">{item.title}</h5>
                                                    <p>{item.content}</p>
                                                    {item.imageURL && (
                                                        <div className='info-parrafo-img-container text-center'>
                                                            <Image
                                                                className="info-parrafo-img"
                                                                style={{ border: "none" }}
                                                                src={item.imageURL} rounded
                                                            />
                                                        </div>
                                                    )}
                                                </Col>
                                                : item.tipo === "timeline" &&
                                                <Col key={`${item.id}-timeline`} sm={12}>
                                                    {item.title &&
                                                        <h5 className="w-100">{item.title}</h5>
                                                    }
                                                    {<CustomizedTimeline timelimeObject={item} key={item.id}></CustomizedTimeline>}
                                                </Col>
                                            )
                                        ))
                                    )
                                }
                            </Row>
                        </div>
                    ))
                ) : (
                    <div>
                        <Typography className='d-flex justify-content-center w-100' component="div" variant="h3">
                            <Skeleton animation={animationSkeleton} width="50%" />
                        </Typography>
                        <Row md={2} sm={1} xs={1}>
                            <Col style={{ minHeight: "20rem" }}>
                                <div className='info-content-img-container text-center w-100 h-100'>
                                    <div className='info-content-img w-100 h-100'>
                                        <Skeleton variant="rounded" width="100%" height="100%" animation={animationSkeleton} />
                                    </div>
                                </div>
                            </Col>
                            {
                                defaultItems.map(value => (value.tipo === "texto" ?
                                    <Col key={value.id} sm={12}>
                                        <Typography component="div" variant="h5">
                                            <Skeleton animation={animationSkeleton} width="60%" />
                                        </Typography>
                                        <Typography component="div" variant="body1" className="d-flex justify-content-center w-100 flex-wrap">
                                            <Skeleton animation={animationSkeleton} width="100%" />
                                            <Skeleton animation={animationSkeleton} width="95%" />
                                            <Skeleton animation={animationSkeleton} width="100%" />
                                            <Skeleton animation={animationSkeleton} width="90%" />
                                            <Skeleton animation={animationSkeleton} width="100%" />
                                            <Skeleton animation={animationSkeleton} width="95%" />
                                            <Skeleton animation={animationSkeleton} width="100%" />
                                            <Skeleton animation={animationSkeleton} width="95%" />
                                            <Skeleton animation={animationSkeleton} width="100%" />
                                            <Skeleton animation={animationSkeleton} width="90%" />
                                            <Skeleton animation={animationSkeleton} width="100%" />
                                            <Skeleton animation={animationSkeleton} width="95%" />
                                            <Skeleton animation={animationSkeleton} width="100%" />
                                            <Skeleton animation={animationSkeleton} width="100%" />
                                        </Typography>
                                    </Col>
                                    :
                                    <Col key={value.id} sm={12}>
                                        <Typography component="div" variant="h5">
                                            <Skeleton animation={animationSkeleton} width="60%" />
                                        </Typography>
                                        <Typography component="div" variant="body1" className="d-flex justify-content-center w-100 flex-wrap">
                                            <Skeleton animation={animationSkeleton} width="100%" />
                                            <Skeleton animation={animationSkeleton} width="95%" />
                                            <Skeleton animation={animationSkeleton} width="100%" />
                                            <Skeleton animation={animationSkeleton} width="90%" />
                                            <Skeleton animation={animationSkeleton} width="100%" />
                                            <Skeleton animation={animationSkeleton} width="95%" />
                                            <Skeleton animation={animationSkeleton} width="100%" />
                                        </Typography>
                                        <div className='info-parrafo-img-container d-flex justify-content-center w-100' style={{ height: "10rem" }} >
                                            <div className='info-parrafo-img w-50 h-100'>
                                                <Skeleton variant="rounded" width="100%" height="100%" animation={animationSkeleton} />
                                            </div>
                                        </div>
                                    </Col>
                                ))
                            }
                        </Row>
                    </div>
                )
            }
        </div>
    )
}

function HomeContent() {
    const [homeContent, setHomeContent] = useState('');

    useEffect(() => {
        // Obtener contenido de la página desde el backend
        const fetchHomeContent = async () => {
            try {
                const response = await axios.get(
                    'https://rafaeloxj.pythonanywhere.com/api/v1/home/'
                );

                if (response.data.success) {
                    //console.log(JSON.stringify(response.data.data.centros_acopio));
                    setHomeContent(response.data.data);
                } else {
                    console.log("Error obtener el contenido: " + response.data.error);
                }
            } catch (error) {
                console.log('Ocurrió un error al procesar la solicitud');
            }
        }
        /*
        setTimeout(() => {
            fetchHomeContent();
        }, 5000);
        */
        fetchHomeContent();
    }, []);

    useEffect(() => {
        // Hacer scroll al elemento "inicio" al cargar la página
        scroller.scrollTo('inicio', {
            duration: 500,
            delay: 0,
            smooth: 'easeInOutQuart',
            offset: -95
        });
    }, []);

    return (
        <>
            <NavbarsHome />
            <Container>
                <Container id="inicio">
                    <CarouselPage arrCarousel={homeContent ? homeContent.carrusel : []}></CarouselPage>
                </Container>
                <Container id="about">
                    <h2 className="text-center">¿Quienes somos?</h2>
                    <CardsAbout Items={homeContent ? homeContent.quienes_somos : []}></CardsAbout>
                </Container>
                <Container id="info">
                    <ReciclajeInfo arrSecciones={homeContent ? homeContent.secciones : []} />
                </Container>
                <Container id="map">
                    <h2 className="text-center">Centros de acopio</h2>
                    <MapComponentBasic objCentrosAcopio={homeContent ? homeContent.centros_acopio : []} />
                </Container>
            </Container>
        </>
    )
}

export default HomeContent;