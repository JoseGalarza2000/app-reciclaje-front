import { Container} from 'react-bootstrap';
import { NavbarPage } from '../components/navBar';
import React, { useContext, useEffect } from 'react';
import { FormularioCentroAcopio } from "../components/forms"
import { useSelector } from 'react-redux';
import axios from 'axios';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { MapRegistrarCentrosAcopio } from '../components/maps';
import { CentrosAcopioContext } from '../components/centrosAcopioContext';

export const CentrosAcopioContent = function () {
    const { showFormCentroAcopio, setShowFormCentroAcopio, disableShowForm, CAContent, setCAContent } = useContext(CentrosAcopioContext);
    const userState = useSelector((store) => store.user);

    useEffect(() => {
        // Obtener contenido de la página desde el backend
        const fetchCAContent = async () => {
            try {

                const response = await axios.post(
                    'https://rafaeloxj.pythonanywhere.com/api/v1/obtener_centros_acopio/',
                    {
                        "id_usuario": userState.id_usuario
                    },
                    { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
                );

                if (response.data.success) {
                    //console.log(JSON.stringify(response.data.data));
                    setCAContent(response.data.data);
                } else {
                    console.log("Error obtener el contenido: " + response.data.error);
                }
            } catch (error) {
                console.log('Ocurrió un error al procesar la solicitud');
            }
        }

        fetchCAContent();
    }, [setCAContent, userState.id_usuario]);

    const handleClickArrow = () => {
        if (disableShowForm) {
            alert("Seleccione el centro de acopio a editar o agregue un marcador nuevo");
            return;
        }
        setShowFormCentroAcopio(!showFormCentroAcopio);
    };

    return (
        <Container className='p-0 m-0' fluid>
            <div className='map-reciclar-container m-0 p-0 d-flex' style={{ height: `calc(100dvh - var(--nav-height))` }}>
                <div className='map-reciclar m-0 p-0' style={{ width: "100%", position: "relative" }}>
                    <MapRegistrarCentrosAcopio objCentrosAcopio={CAContent}></MapRegistrarCentrosAcopio>
                </div>
                <div id="form_reciclaje_container" className='m-0 p-0' style={{ position: "relative", width: "auto", height: "100%" }}>
                    <div
                        className="arrow-container"
                        style={{ width: "auto", height: "100%", background: "transparent" }}
                        onClick={handleClickArrow}
                    >
                        {
                            showFormCentroAcopio ?
                                <ArrowForwardIosIcon className="arrow" /> :
                                <ArrowBackIosNewIcon className="arrow" />
                        }
                    </div>
                    <div className={showFormCentroAcopio ? "form-reciclar form-visible" : "form-reciclar form-hidden"} style={{height: "100%"}}>
                        <FormularioCentroAcopio style={{ width: "35vw" }} />
                    </div>
                </div>
            </div>
        </Container >
    );
}

function CentrosAcopioPage(){
    return (

        <>
            <NavbarPage
                titleNav="Centros acopio"
                startElement={
                    <Link style={{ color: "var(--bs-nav-link-color)" }} to="/" className='h-100 W-100'>
                        <ArrowBackIcon style={{ fontSize: '3rem' }} />
                    </Link>
                }
                fluid
            />
            <CentrosAcopioContent></CentrosAcopioContent>
        </>

    )
}

export default CentrosAcopioPage