import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Check from '@mui/icons-material/Check';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import RecyclingOutlinedIcon from '@mui/icons-material/RecyclingOutlined';
import SpatialAudioOffIcon from '@mui/icons-material/SpatialAudioOff';
import { useContext } from 'react';
import { ReciclarContext } from './reciclarContext';
import { CloseOutlined, Done, MyLocation } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import MobileStepper from '@mui/material/MobileStepper';
import Button from '@mui/material/Button';
import { Button as ButtonBootstrap } from "react-bootstrap";
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { Card } from './cards';
import { Col } from 'react-bootstrap';
import CollectionsIcon from '@mui/icons-material/Collections';
import NearMeOutlinedIcon from '@mui/icons-material/NearMeOutlined';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import axios from 'axios';
import CountdownTimer from './countDown';
import { BorderSpinnerBasic } from './loadingSpinner';
import { CustomModal } from './modals';
import { FormCancelarRececoleccion } from './formsReciclar';
import Roles from '../models/roles';

function DotsMobileStepper({ steps, textBackButton, textNextButton, activeStep, setActiveStep }) {
    const theme = useTheme();

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    return (
        <MobileStepper
            variant="dots"
            steps={steps}
            position="static"
            activeStep={activeStep}
            sx={{ width: "100%", flexGrow: 1, backgroundColor: "transparent" }}
            nextButton={
                <Button size="small" onClick={handleNext} disabled={activeStep === (steps - 1)}>
                    {textNextButton}
                    {theme.direction === 'rtl' ? (
                        <KeyboardArrowLeft />
                    ) : (
                        <KeyboardArrowRight />
                    )}
                </Button>
            }
            backButton={
                <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                    {theme.direction === 'rtl' ? (
                        <KeyboardArrowRight />
                    ) : (
                        <KeyboardArrowLeft />
                    )}
                    {textBackButton}
                </Button>
            }
        />
    );
}

const QontoStepIconRoot = styled('div')(({ theme, ownerState }) => ({
    color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#eaeaf0',
    display: 'flex',
    height: 22,
    alignItems: 'center',
    ...(ownerState.active && {
        color: '#784af4',
    }),
    '& .QontoStepIcon-completedIcon': {
        color: '#784af4',
        zIndex: 1,
        fontSize: 18,
    },
    '& .QontoStepIcon-circle': {
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: 'currentColor',
    },
}));

function QontoStepIcon(props) {
    const { active, completed, className } = props;

    return (
        <QontoStepIconRoot ownerState={{ active }} className={className}>
            {completed ? (
                <Check className="QontoStepIcon-completedIcon" />
            ) : (
                <div className="QontoStepIcon-circle" />
            )}
        </QontoStepIconRoot>
    );
}

QontoStepIcon.propTypes = {
    /**
     * Whether this step is active.
     * @default false
     */
    active: PropTypes.bool,
    className: PropTypes.string,
    /**
     * Mark the step as completed. Is passed to child components.
     * @default false
     */
    completed: PropTypes.bool,
};

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 22,
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            backgroundImage:
                'linear-gradient( 95deg, var(--bs-primary-0) 0%, var(--bs-primary) 50%, var(--bs-primary-2) 100%)',
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            backgroundImage:
                'linear-gradient( 95deg, var(--bs-primary-0) 0%, var(--bs-primary) 50%, var(--bs-primary-2) 100%)',
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        height: 3,
        border: 0,
        backgroundColor:
            theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
        borderRadius: 1,
    },
}));

const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
    zIndex: 1,
    color: '#fff',
    width: 50,
    height: 50,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    ...(ownerState.active && {
        backgroundImage:
            'linear-gradient( 136deg, var(--bs-primary-0) 0%, var(--bs-primary) 50%, var(--bs-primary-2) 100%)',
        boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
    }),
    ...(ownerState.completed && {
        backgroundImage:
            'linear-gradient( 136deg, var(--bs-primary-0) 0%, var(--bs-primary) 50%, var(--bs-primary-2) 100%)',
    }),
}));

function ColorlibStepIcon(props) {
    const { active, completed, className } = props;

    const icons = {
        1: <SpatialAudioOffIcon />,//DescriptionIcon
        2: <HowToRegIcon />,
        3: <MyLocation />,
        4: <RecyclingOutlinedIcon />
    };

    return (
        <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
            {icons[String(props.icon)]}
        </ColorlibStepIconRoot>
    );
}

ColorlibStepIcon.propTypes = {
    /**
     * Whether this step is active.
     * @default false
     */
    active: PropTypes.bool,
    className: PropTypes.string,
    /**
     * Mark the step as completed. Is passed to child components.
     * @default false
     */
    completed: PropTypes.bool,
    /**
     * The label displayed in the step icon.
     */
    icon: PropTypes.node,
};

const steps = ['Enviada', 'Aceptada', 'En sitio', 'Recolectado'];

export function FloatingStepperMapa({ nActiveStep }) {
    const { setSolicitudAceptada, solicitudAceptada, setAddressSolicitante,
        setLocalizacionReciclador, setShowFormReciclar, setDisableShowForm,
        setEstadoSolicitud, setRecicladorSolicitud, setUsuarioSolicitante,
        setStartTimeCountDown, startTimeCountDown, estadoSolicitud,
        setArrFotosSolicitud } = useContext(ReciclarContext);
    const userState = useSelector((store) => store.user);
    const [activeStep, setActiveStep] = useState(nActiveStep);
    const [showModal, setShowModal] = useState(false);
    const [showModalCancelar, setShowModalCancelar] = useState(false);
    const [sending, setSending] = useState(false);

    const handleCancelar = async () => {
        setSending(true);
        try {
            const response = await axios.post(
                'https://rafaeloxj.pythonanywhere.com/api/v1/cancelar_solicitud/',
                {
                    "id_solicitud": solicitudAceptada.id_solicitud,
                    "id_usuario": userState.id_usuario,
                    "motivo": "",//vacia porque el estado es P
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

    const handleRecolectada = async () => {
        setSending(true);
        try {
            const response = await axios.post(
                'https://rafaeloxj.pythonanywhere.com/aceptar_solicitud_y_actualizar_ubicacion/',
                {
                    "id_solicitud": solicitudAceptada.id_solicitud,
                    "id_usuario": userState.id_usuario,
                    "ubicacion_reciclador": "[]",//vacia porque el estado R no registra ubicacion
                    "estado": "R"
                },
                { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
            );
            if (response.data.success) {
                console.log("se actualizo el estado a recolectado");
                setStartTimeCountDown('');//reset countDown
                setEstadoSolicitud(response.data.data.estado);//establezco estado
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

    const estadoSolicitudSteps = {
        'P': 0,
        'A': 1,
        'L': 2,
        'R': 3,
    }

    return (
        <>
            {
                (estadoSolicitud === 'P' || estadoSolicitud === 'A' || estadoSolicitud === 'L' || estadoSolicitud === 'R') &&
                <div className="stepper-reciclar-container">
                    <Stack className="stepper-reciclar p-0" sx={{ width: '100%', maxWidth: '33rem', minHeight: '10rem' }} spacing={4}>
                        {userState.rol === Roles.USER &&
                            <DotsMobileStepper
                                steps={2}
                                textBackButton="solicitud"
                                textNextButton="estado"
                                activeStep={activeStep}
                                setActiveStep={setActiveStep}
                            />
                        }
                        {
                            activeStep === 1 &&
                            <Stepper className='m-0 pb-2' alternativeLabel activeStep={estadoSolicitudSteps[estadoSolicitud]} connector={<ColorlibConnector />}>
                                {steps.map((label) => (
                                    <Step key={label}>
                                        <StepLabel StepIconComponent={ColorlibStepIcon}><span className='fw-bolder'>{label}</span></StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                        }
                        {
                            activeStep === 0 && solicitudAceptada &&
                            <Card key={solicitudAceptada.id_solicitud} cardStyle={{ height: "fit-content", boxShadow: "none" }} style={{ marginTop: 0, paddingLeft: "1rem", paddingRigth: "1rem" }}>
                                <Col className={`cards-info p-0 m-0 ${userState.rol === Roles.USER ? "no-padding-top" : ""}`}>
                                    <div className='card-solicitud-info w-100'>
                                        <div className='card-solicitud-info-start'>
                                            <div className='mb-2'>
                                                <label className='fw-bold' style={{ fontSize: "0.8rem" }}>Materiales:</label>
                                                <p className='m-0' style={{ fontSize: "0.8rem" }}>
                                                    <CollectionsIcon
                                                        style={{ cursor: "pointer" }}
                                                        className='me-1'
                                                        onClick={() => { setArrFotosSolicitud(solicitudAceptada.fotos) }}
                                                    />
                                                    <span style={{ cursor: "pointer" }} onClick={() => { setArrFotosSolicitud(solicitudAceptada.fotos) }} >{solicitudAceptada.materiales}</span>
                                                </p>
                                            </div>
                                            <div>
                                                <p className='m-0' style={{ fontSize: "0.8rem" }}><NearMeOutlinedIcon className='me-1'></NearMeOutlinedIcon><span>{solicitudAceptada.direccion}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Card>
                        }
                        {solicitudAceptada &&
                            <>
                                <Col className='cards-btns p-0 m-0 d-flex' xs={12} style={{ border: "none", borderTop: "1px solid #ccc", borderRadius: 0 }}>
                                    {solicitudAceptada.id_reciclador &&
                                        <>
                                            {
                                                userState.rol === Roles.RECICLADOR &&
                                                <div className='card-reciclador-btn p-2' style={{ color: "var(--bs-green)", borderRight: "1px solid #ccc", borderBottom: 0 }}>
                                                    <button
                                                        style={{ justifyContent: 'center' }}
                                                        disabled={estadoSolicitud !== "L" || sending}
                                                        onClick={() => handleRecolectada()}
                                                    >
                                                        <Done style={{ marginRight: "1rem", fontSize: '1.8rem' }} />
                                                        <span>Recolectado {sending && <BorderSpinnerBasic style={{ width: "1rem", height: "1rem" }} />}</span>
                                                    </button>
                                                </div>
                                            }
                                        </>
                                    }
                                    <div className='card-reciclador-btn p-2' style={{ color: "var(--bs-danger)", borderBottom: 0 }}>
                                        {userState.rol === Roles.USER &&
                                            <button
                                                style={{ justifyContent: 'center' }}
                                                disabled={(estadoSolicitud !== "P" && estadoSolicitud !== "L") || startTimeCountDown || sending}
                                                onClick={() => { estadoSolicitud === "P" ? handleCancelar() : setShowModal(true); }}
                                            >
                                                <CloseOutlined style={{ marginRight: "1rem", fontSize: '1.8rem' }} />
                                                <span>Cancelar {startTimeCountDown && <CountdownTimer></CountdownTimer>}</span>
                                            </button>
                                        }
                                        {userState.rol === Roles.RECICLADOR &&
                                            <button
                                                style={{ justifyContent: 'center' }}
                                                disabled={estadoSolicitud === "R" || startTimeCountDown || sending}
                                                onClick={() => setShowModal(true)}
                                            >
                                                <CloseOutlined style={{ marginRight: "1rem", fontSize: '1.8rem' }} />
                                                <span>Cancelar {startTimeCountDown && <CountdownTimer></CountdownTimer>}</span>
                                            </button>
                                        }
                                    </div>
                                </Col>
                            </>

                        }
                    </Stack>
                </div>
            }
            <CustomModal showModal={showModal}>
                <div className="d-flex justify-content-center flex-wrap p-4">
                    <p className="text-center">¿Esta seguro de cancelar la orden?</p>
                    <div className='d-flex justify-content-around w-100'>
                        <ButtonBootstrap
                            className="text-center filledButton"
                            type="submit"
                            style={{ width: "45%" }}
                            onClick={() => { setShowModal(false); setShowModalCancelar(true); }}
                        >
                            Aceptar
                        </ButtonBootstrap>
                        <ButtonBootstrap
                            className="text-center unFilledButton"
                            type="button"
                            style={{ width: "45%" }}
                            onClick={() => setShowModal(false)}
                        >
                            Cancelar
                        </ButtonBootstrap>
                    </div>
                </div>
            </CustomModal>
            <CustomModal showModal={showModalCancelar}>
                <div /*className="d-flex justify-content-center flex-wrap p-4"*/>
                    <h5 className="text-center">Cancelar la orden</h5>
                    <FormCancelarRececoleccion setShowModalCancelar={setShowModalCancelar}></FormCancelarRececoleccion>
                </div>
            </CustomModal >
        </>
    );
}

export function StepperPhoto({ objFotos }) {
    const [activeStep, setActiveStep] = useState(0);
    return (
        <>
            {objFotos.length > 0 &&
                <>
                    <div className='container_stepper_img'>
                        <img src={objFotos[activeStep]} alt="" />
                    </div>
                    <DotsMobileStepper
                        steps={objFotos.length}
                        activeStep={activeStep}
                        setActiveStep={setActiveStep}
                        textBackButton="anterior"
                        textNextButton="siguiente"
                    />
                </>
            }

        </>
    )
}
