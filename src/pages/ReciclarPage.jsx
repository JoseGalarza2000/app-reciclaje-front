import { Button, Container } from "react-bootstrap";
import { NavbarPage } from "../components/navBar";
import { MapaRecicladorSolicitudReciclaje, MapaUsuarioSolicitudReciclaje } from "../components/maps";
import { FormularioSolicitudRecoleccion } from "../components/formsReciclar";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useContext, useEffect, useState } from "react";
import { FloatingStepperMapa } from "../components/stepper";
import { useSelector } from "react-redux";
import { CardsSolicitudRecoleccion } from "../components/cards";
import { CustomModal, ModalCalificarRecoleccion, ModalViewPhotosReciclaje } from "../components/modals";
import axios from "axios";
import { BorderSpinnerBasic } from "../components/loadingSpinner";
import { useAlert } from '../components/alertContext';
import Roles from "../models/roles";
import { Link } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ReciclarContext } from "../components/reciclarContext";

export const ReciclarContent = function () {
    const { setSolicitudAceptada, solicitudAceptada, setAddressSolicitante,
        setLocalizacionReciclador, setShowFormReciclar, setDisableShowForm,
        setEstadoSolicitud, setRecicladorSolicitud, setUsuarioSolicitante,
        setStartTimeCountDown, startTimeCountDown, estadoSolicitud,
        showFormReciclar, disableShowForm } = useContext(ReciclarContext);
    const userState = useSelector((store) => store.user);
    const [showModal, setShowModal] = useState(false);
    const [showModalCancelada, setShowModalCancelada] = useState(false);
    const [sending, setSending] = useState(false);
    const { showAlert } = useAlert();

    const handleClickArrow = () => {
        if (disableShowForm && !estadoSolicitud) {
            showAlert('Obteniendo ubicación, por favor espere.');
            return;
        } else if (disableShowForm && estadoSolicitud) {
            showAlert('Tienes una solicitud en curso, debes culminar la solicitud actual.');
            return;
        }
        setShowFormReciclar(!showFormReciclar);
    };

    const handleAceptarCancelacion = async () => {
        setSending(true);
        try {
            const response = await axios.post(
                'https://rafaeloxj.pythonanywhere.com/api/v1/confirmar_cancelacion_solicitud/',
                {
                    "id_solicitud": solicitudAceptada.id_solicitud,
                    "id_usuario": userState.id_usuario,
                },
                { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
            );
            if (response.data.success) {
                //restablezco estados
                setShowFormReciclar(true);
                setDisableShowForm(false);
                setEstadoSolicitud('');
                setSolicitudAceptada('');
                setRecicladorSolicitud('');
                setUsuarioSolicitante('');
                setStartTimeCountDown('');
                if (userState.rol === Roles.RECICLADOR) {
                    setAddressSolicitante({});
                } else {
                    setLocalizacionReciclador('');
                }
                setSending(false);
            } else {
                console.log("Error " + response.data.error);
                setSending(false);
            }
        } catch (error) {
            console.error(error);
            console.log('Ocurrió un error al procesar la solicitud');
            setSending(false);
        }
    };

    useEffect(() => {
        // Cambiar el estado a true una vez que el estado cambia
        setShowModal(true);
        setShowModalCancelada(true);
    }, [estadoSolicitud]);

    return (
        <Container className='p-0 m-0' fluid>
            <div className='map-reciclar-container m-0 p-0 d-flex' style={{ height: `calc(100dvh - var(--nav-height))` }}>
                <div className='map-reciclar m-0 p-0' style={{ width: "100%", position: "relative" }}>
                    {userState.rol === Roles.RECICLADOR ? (
                        <>
                            <MapaRecicladorSolicitudReciclaje></MapaRecicladorSolicitudReciclaje>
                            <FloatingStepperMapa nActiveStep={0}></FloatingStepperMapa>
                            {estadoSolicitud === "R" &&
                                <ModalCalificarRecoleccion title={"Califica al usuario"}></ModalCalificarRecoleccion>
                            }
                        </>
                    ) : (
                        <>
                            <MapaUsuarioSolicitudReciclaje></MapaUsuarioSolicitudReciclaje>
                            <FloatingStepperMapa nActiveStep={1}></FloatingStepperMapa>
                            {<CustomModal showModal={showModal && estadoSolicitud === "L" && startTimeCountDown}>
                                <div className="d-flex justify-content-center flex-wrap p-4">
                                    <p className="text-center">El reciclador se encuentra en su ubicación.</p>
                                    <Button className="text-center w-50 filledButton" type="button" onClick={() => setShowModal(false)}>
                                        voy en camino
                                    </Button>
                                </div>
                            </CustomModal>
                            }
                            {estadoSolicitud === "R" &&
                                <ModalCalificarRecoleccion title={"Califica al reciclador"}></ModalCalificarRecoleccion>
                            }
                        </>
                    )
                    }
                    {(estadoSolicitud === "CR" || estadoSolicitud === "CU") &&
                        <CustomModal showModal={showModalCancelada}>
                            <div className="d-flex justify-content-center flex-wrap p-4">

                                <p className="text-center">El {userState.rol === Roles.RECICLADOR ? "usuario" : "reciclador"} cancelo la solicitud.</p>
                                <Button
                                    className="text-center w-50 filledButton"
                                    type="button"
                                    onClick={() => handleAceptarCancelacion()}
                                    disabled={sending}
                                >
                                    aceptar {sending && <BorderSpinnerBasic style={{ width: "1rem", height: "1rem" }} />}
                                </Button>
                            </div>
                        </CustomModal>
                    }
                </div>
                <div id="form_reciclaje_container" className='m-0 p-0' style={{ position: "relative", width: "auto", height: "100%" }}>
                    <div
                        className="arrow-container"
                        style={{ width: "auto", height: "100%", background: "transparent" }}
                        onClick={handleClickArrow}
                    >
                        {
                            showFormReciclar ?
                                <ArrowForwardIosIcon className="arrow" /> :
                                <ArrowBackIosNewIcon className="arrow" />
                        }
                    </div>
                    <div className={showFormReciclar ? "form-reciclar form-visible" : "form-reciclar form-hidden"} style={{ height: "100%" }}>
                        {userState.rol === Roles.RECICLADOR ? (
                            <div className='container-solicitudes m-0 p-0' style={{ height: "100%", width: "35vw", overflowY: "auto" }}>
                                <>
                                    <h5 className='text-center mt-3'>Solicitudes de Recolección</h5>
                                    <CardsSolicitudRecoleccion></CardsSolicitudRecoleccion>
                                </>
                            </div>
                        ) : (
                            <FormularioSolicitudRecoleccion style={{ width: "35vw" }} />
                        )
                        }
                    </div>
                </div>
            </div>
        </Container >
    )
}

function ReciclarPage(){
    return (
        <>
            <NavbarPage
                fluid
                titleNav="Reciclar"
                startElement={
                    <Link style={{ color: "var(--bs-nav-link-color)" }} to="/" className='h-100 W-100'>
                        <ArrowBackIcon style={{ fontSize: '3rem' }} />
                    </Link>
                }
            />
            <ReciclarContent ></ReciclarContent>
            <ModalViewPhotosReciclaje />
        </>
    )
}

export default ReciclarPage