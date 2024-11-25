import { Col, Row, Image } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faLocationArrow, faX } from "@fortawesome/free-solid-svg-icons";
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import ToastAutohide from '../components/toasts';
import { FaEyeIcon } from './styledComponents';
import PlaceHolderPage from './placeHolderPage';
import { faFaceFrown, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { getDefaultImg, ModalProfile } from '../pages/profilePage';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import CollectionsIcon from '@mui/icons-material/Collections';
import NearMeOutlinedIcon from '@mui/icons-material/NearMeOutlined';
import Pusher from 'pusher-js';
import { Skeleton, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { ReciclarContext } from './reciclarContext';
import { useTheme } from './themeContext';
import Roles from '../models/roles';

export const Card = function ({ children, cardStyle, ...props }) {
    const marginTopStyle = props.style?.marginTop;

    return (
        <Col className={marginTopStyle === undefined ? 'mt-3' : marginTopStyle} {...props}>
            <Row className='cards' style={cardStyle ? cardStyle : {}}>
                {children}
            </Row>
        </Col>
    );
}

export const CardSolicitudReciclador = function ({ currentItems, setItems, msjEmpty }) {
    const solicitudesRecicladores = currentItems;
    const [currentUser, setCurrentUser] = useState('');
    const [sending, setSending] = useState(false);

    const actualizarEstado = async (value, estado) => {
        setSending(true);
        try {
            const response = await axios.post(
                'https://rafaeloxj.pythonanywhere.com/api/v1/actualizar_estado_reciclador/',
                { "id_reciclador": value.id_reciclador, "nuevo_estado": estado },
                { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
            );
            if (response.data.success) {
                setCurrentUser({ "cedula": value.cedula, "nombre_corto": value.nombre_corto, "url_foto": value.url_foto, "estado": (estado === "A" ? "aceptado" : "rechazado") });
                setItems();
                setSending(false);
            } else {
                console.error('Error al actualizar estado:', response.data.error);
                setSending(false);
            }
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            setSending(false);
        }
    };

    const aceptarReciclador = (value) => {
        console.log("Aceptado: ", value.id_reciclador);
        actualizarEstado(value, "A");
    };

    const rechazarReciclador = (value) => {
        console.log("Rechazado: ", value.id_reciclador);
        actualizarEstado(value, "I");
    };

    return (
        <Row md={2} xl={3} xxl={4} sm={1} xs={1} className='cards-container mb-3'>
            {
                (solicitudesRecicladores && solicitudesRecicladores.length > 0) ? (
                    solicitudesRecicladores.map(value => (
                        <Card key={value.cedula}>
                            <Col className='cards-info p-0 m-0'>
                                <div className='card-reciclador-info-foto'>
                                    <img
                                        className="profile-img"
                                        src={value.url_foto || getDefaultImg(Roles.RECICLADOR, value.genero)}
                                        alt="perfil"
                                        style={{ border: "3px solid #ccc" }}
                                    />
                                    <p>{value.nombre_corto}</p>
                                </div>
                                <div className='card-reciclador-info-data'>
                                    <div className='card-reciclador-info-data-cedula'>
                                        <label className='fw-bold'>Cédula:</label>
                                        <p className='m-0'>{value.cedula}</p>
                                    </div>
                                    <div className='card-reciclador-info-data-edad'>
                                        <label className='fw-bold'>Edad:</label>
                                        <p className='m-0'>{value.edad} años</p>
                                    </div>
                                </div>
                                <div className='card-reciclador-info-direccion'>
                                    <FontAwesomeIcon icon={faLocationArrow} fontSize="24" className='location-icon' />
                                    <p className="m-0 text-right">{value.direccion_corta}</p>
                                </div>
                            </Col>
                            <Col className='cards-btns p-0 m-0' xs={4}>
                                <div className='card-reciclador-btn' style={{ color: "var(--bs-green)" }}>
                                    <button
                                        onClick={(e) => { aceptarReciclador(value); }}
                                        disabled={sending}
                                    >
                                        <FontAwesomeIcon icon={faCheck} fontSize="24" />
                                        <span>Aceptar</span>
                                    </button>
                                </div>
                                <div className='card-reciclador-btn' style={{ color: "var(--bs-danger)" }}>
                                    <button
                                        onClick={(e) => { rechazarReciclador(value); }}
                                        disabled={sending}
                                    >
                                        <FontAwesomeIcon icon={faX} fontSize="24" />
                                        <span>Rechazar</span>
                                    </button>
                                </div>
                            </Col>
                        </Card>
                    ))
                ) : (
                    <PlaceHolderPage msj={msjEmpty} icono={faFaceFrown} />
                )
            }
            {
                currentUser && (
                    <ToastAutohide
                        textHeader={currentUser.nombre_corto + " fue " + currentUser.estado}
                        imagen={currentUser.url_foto}
                        keyToast={currentUser.cedula}
                    ></ToastAutohide>
                )
            }
        </Row>
    );
}

export const CardReciclador = function ({ currentItems, setItems, msjEmpty }) {
    const recicladores = currentItems;
    const [currentUser, setCurrentUser] = useState('');
    const [currentShowUser, setCurrentShowUser] = useState('');
    const [showModalProfile, setShowModalProfile] = useState(false);
    const [sending, setSending] = useState(false);


    const actualizarEstado = async (value, estado) => {
        setSending(true);
        try {
            const response = await axios.post(
                'https://rafaeloxj.pythonanywhere.com/api/v1/actualizar_estado_reciclador/',
                { "id_reciclador": value.id_reciclador, "nuevo_estado": estado },
                { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
            );
            if (response.data.success) {
                setCurrentUser({ "cedula": value.cedula, "nombre_corto": value.nombre_corto, "url_foto": value.url_foto, "estado": "Eliminado" });
                setItems();
                setSending(false);
            } else {
                console.error('Error al actualizar estado:', response.data.error);
                setSending(false);
            }
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            setSending(false);
        }
    };

    const EliminarReciclador = (value) => {
        console.log("Rechazado: ", value.id_reciclador);
        actualizarEstado(value, "E");
    };

    const MostrarPerfil = (value) => {
        setCurrentShowUser(value);
        setShowModalProfile(true);
    };
    return (
        <Row md={2} xl={3} sm={1} xs={1} className='cards-container mb-3'>

            {
                (recicladores && recicladores.length > 0) ? (
                    recicladores.map(value => (
                        <Card key={value.cedula}>
                            <Col className='cards-info p-0 m-0'>
                                <div className='card-reciclador-info-foto'>
                                    <img
                                        className="profile-img"
                                        src={value.url_foto || getDefaultImg(Roles.RECICLADOR, value.genero)}
                                        alt="perfil"
                                        style={{ border: "3px solid #ccc" }}
                                    />
                                    <p>{value.nombre_corto}</p>
                                </div>
                                <div className='card-reciclador-info-data'>
                                    <div className='card-reciclador-info-data-cedula'>
                                        <label className='fw-bold'>Cédula:</label>
                                        <p className='m-0'>{value.cedula}</p>
                                    </div>
                                    <div className='card-reciclador-info-data-edad'>
                                        <label className='fw-bold'>Edad:</label>
                                        <p className='m-0'>{value.edad} años</p>
                                    </div>
                                </div>
                                <div className='card-reciclador-info-direccion'>
                                    <FontAwesomeIcon icon={faLocationArrow} fontSize="24" className='location-icon' />
                                    <p className="m-0 text-right">{value.direccion_corta}</p>
                                </div>
                            </Col>
                            <Col className='cards-btns p-0 m-0' xs={4}>
                                <div className='card-reciclador-btn' style={{ color: "var(--bs-info)" }}>
                                    <button
                                        onClick={(e) => { MostrarPerfil(value); }}
                                        disabled={sending}
                                    >
                                        <FontAwesomeIcon icon={FaEyeIcon} fontSize="24" />
                                        <span>Ver perfil</span>
                                    </button>
                                </div>
                                <div className='card-reciclador-btn' style={{ color: "var(--bs-danger)" }}>
                                    <button
                                        onClick={(e) => { EliminarReciclador(value); }}
                                        disabled={sending}
                                    >
                                        <FontAwesomeIcon icon={faTrashCan} fontSize="24" />
                                        <span>Eliminar</span>
                                    </button>
                                </div>
                            </Col>
                        </Card >
                    ))
                ) : (
                    <PlaceHolderPage msj={msjEmpty} icono={faFaceFrown} />
                )
            }
            {
                currentUser && (
                    <ToastAutohide
                        textHeader={currentUser.nombre_corto + " fue " + currentUser.estado}
                        imagen={currentUser.url_foto}
                        keyToast={currentUser.cedula}
                    ></ToastAutohide>
                )
            }
            {
                showModalProfile && (
                    <ModalProfile
                        modalTitle="Perfil del reciclador"
                        setShowModal={setShowModalProfile}
                        showModal={showModalProfile}
                        userData={currentShowUser.perfil}
                    />
                )

            }
        </Row>
    );
}


export const CardsAbout = function ({ Items }) {
    const { animationSkeleton } = useTheme();
    const defaultItems = [1, 2, 3];

    return (
        <Row md={2} xl={3} sm={1} xs={1} className='cards-container cards-container-about mb-3 justify-content-around'>
            {
                (Items && Items.length > 0) ? (
                    Items.map(value => (
                        <Card key={value.id} cardStyle={{ boxShadow: "none" }}>
                            <Col className='cards-about p-3 m-0'>
                                <div className='card-about-img text-center'>
                                    <Image
                                        className="about-img"
                                        style={{ border: "none" }}
                                        src={value.imageURL} rounded />
                                </div>
                                <div className='card-about-title'>
                                    <h3 className='text-center'>{value.title}</h3>
                                </div>
                                <div className='card-about-content'>
                                    <p className="m-0 text-center">{value.content}</p>
                                </div>
                            </Col>
                        </Card >
                    ))
                ) :
                    (
                        defaultItems.map(value => (
                            <Card key={value} cardStyle={{ boxShadow: "none" }}>
                                <Col className='cards-about p-3 m-0'>
                                    <div className='card-about-img d-flex justify-content-center'>
                                        <div className='about-img'>
                                            <Skeleton variant="rounded" width="100%" height="100%" animation={animationSkeleton} />
                                        </div>
                                    </div>
                                    <div className='card-about-title'>
                                        <h3 className='d-flex justify-content-center'><Skeleton animation={animationSkeleton} width="70%" /></h3>
                                    </div>
                                    <div className='card-about-content'>
                                        <Typography component="div" variant="body1">
                                            <Skeleton animation={animationSkeleton} />
                                        </Typography>
                                        <Typography className='d-flex justify-content-center w-100 flex-wrap' component="div" variant="body1">
                                            <Skeleton animation={animationSkeleton} width="95%" />
                                            <Skeleton animation={animationSkeleton} width="100%" />
                                            <Skeleton animation={animationSkeleton} width="90%" />
                                            <Skeleton animation={animationSkeleton} width="100%" />
                                        </Typography>
                                    </div>
                                </Col>
                            </Card >
                        ))
                    )
            }
        </Row>
    );
}

export const GetDistaciaTime = function ({ location }) {
    const { localizacionReciclador, showFormReciclar } = useContext(ReciclarContext);
    //console.log(localizacionReciclador)
    const [tiempo, setTiempo] = useState('');
    const [distancia, setDistancia] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    `https://router.project-osrm.org/route/v1/driving/${location[1]},${location[0]};${localizacionReciclador.lng},${localizacionReciclador.lat}?overview=false&steps=false`
                );
                if (response.data.code === "Ok") {
                    setTiempo(response.data.routes[0].duration);
                    setDistancia(response.data.routes[0].distance);
                    //console.log(response.data.routes[0].distance, response.data.routes[0].duration);
                } else {
                    console.log(response.data.error);
                }
            } catch (error) {
                console.error(error);
                console.log('Ocurrió un error al procesar la solicitud');
            }
        };
        if (showFormReciclar && location && location[0] && localizacionReciclador && localizacionReciclador.lat && localizacionReciclador.lng) {
            fetchData(); // Llama a la función asincrónica
        }

    }, [localizacionReciclador, showFormReciclar, location]);


    return (
        <>
            <p className="m-0" style={{ fontSize: "0.8rem" }}><DirectionsWalkIcon className='me-1'></DirectionsWalkIcon><span>{distancia > 0 ? (distancia / 1000).toFixed(1) + "km" : <Skeleton variant="text" sx={{ fontSize: '1rem', width: '3rem', display: 'inline-block' }} />}</span></p>
            <p className="m-0" style={{ fontSize: "0.8rem" }}><AccessTimeIcon className='me-1'></AccessTimeIcon><span>{tiempo > 0 ? Math.round(tiempo / 60) + "min" : <Skeleton variant="text" sx={{ fontSize: '1rem', width: '3rem', display: 'inline-block' }} />}</span></p>
        </>
    );
}

export const CardsSolicitudRecoleccion = function () {
    const [solicitudes, setSolicitudes] = useState([]);
    const userState = useSelector((store) => store.user);
    const { setAddressSolicitante, setShowFormReciclar, setDisableShowForm,
        setSolicitudAceptada, localizacionReciclador, setUsuarioSolicitante,
        setStartTimeCountDown, setEstadoSolicitud, showFormReciclar,
        setArrFotosSolicitud } = useContext(ReciclarContext);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // Función para aceptar una solicitud
    const aceptarSolicitud = async (value) => {
        setSending(true);
        // Acepto la solicitud
        try {
            const response = await axios.post(
                'https://rafaeloxj.pythonanywhere.com/aceptar_solicitud_y_actualizar_ubicacion/',
                {
                    "id_solicitud": value.id_solicitud,
                    "id_usuario": userState.id_usuario,
                    "ubicacion_reciclador": JSON.stringify([localizacionReciclador.lat, localizacionReciclador.lng]),
                    "estado": "A"
                },
                { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
            );

            if (response.data.success) {
                setShowFormReciclar(false);//oculto formulario
                setDisableShowForm(true);//inactivo boton de mostrar formulario
                setSolicitudAceptada(value);
                setAddressSolicitante({ lat: value.ubicacion[0], lng: value.ubicacion[1] });
                // Elimina la solicitud aceptada del front
                setSolicitudes(solicitudes => solicitudes.filter(item => item.id_solicitud !== value.id_solicitud));
                setEstadoSolicitud(value.estado);

                console.log("conectando pusher estado_solicitud");
                // Configuración de Pusher para el canal "estado_solicitud"
                const pusherSolicitud = new Pusher('390cef738b8ca03faacd', {
                    cluster: 'sa1',
                    encrypted: true  // Asegura que las conexiones sean seguras
                });

                pusherSolicitud.connection.bind('connected', () => {
                    console.log('Conectado a Pusher (estado_solicitud)!');
                });

                // Suscribirse al canal de la solicitud
                const channelSolicitud = pusherSolicitud.subscribe(`estado_solicitud_${value.id_solicitud}_channel`);

                // Manejar la recepción de la ubicación actualizada
                channelSolicitud.bind('estado_solicitud', function (data) {
                    if (data.estado === "CU") {
                        setEstadoSolicitud(data.estado);
                    }
                });

                pusherSolicitud.connection.bind('error', (err) => {
                    console.error('Error en la conexión de Pusher (estado_solicitud):', err);
                });

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

    // Función para rechazar una solicitud
    const rechazarSolicitud = async (value) => {
        setSending(true);
        // Rechazo la solicitud
        try {
            const response = await axios.post(
                'https://rafaeloxj.pythonanywhere.com/rechazar_solicitud/',
                { "id_solicitud": value.id_solicitud, "id_usuario": userState.id_usuario },
                { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
            );

            // Elimina la solicitud rechazada del front
            setSolicitudes(solicitudes => solicitudes.filter(item => item.id_solicitud !== value.id_solicitud));
            if (response.data.success) {
                //console.log(solicitudes);
                console.log("solicitud Rechazada...");
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

    // Manejo de solicitudes desde el backend y WebSocket de Pusher
    useEffect(() => {
        // Obtener las solicitudes pendientes desde el backend
        const fetchSolicitudes = async () => {
            try {
                const response = await axios.post(
                    'https://rafaeloxj.pythonanywhere.com/obtener_solicitudes_por_usuario/',
                    { "id_usuario": userState.id_usuario },
                    { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
                );

                if (response.data.success) {
                    //si solo trae una solicitud entonces puede ser que tenga una en curso
                    console.log(JSON.stringify(response.data.data));
                    if (response.data.data.length === 1 && response.data.data[0].estado !== "P") {
                        setShowFormReciclar(false);//oculto formulario
                        setDisableShowForm(true);//inactivo boton de mostrar formulario
                        setEstadoSolicitud(response.data.data[0].estado);
                        setSolicitudAceptada(response.data.data[0]);
                        setAddressSolicitante({ lat: response.data.data[0].ubicacion[0], lng: response.data.data[0].ubicacion[1] });
                        setUsuarioSolicitante(response.data.data[0].id_usuario);
                        console.log(JSON.stringify(response.data.data[0]));
                        if (response.data.data[0].estado === "L") {
                            let fecha_arribo = response.data.data[0].fecha_arribo;
                            setStartTimeCountDown(Math.floor(new Date(fecha_arribo).getTime() / 1000))
                        }

                        console.log("conectando pusher estado_solicitud");
                        // Configuración de Pusher para el canal "estado_solicitud"
                        const pusherSolicitud = new Pusher('390cef738b8ca03faacd', {
                            cluster: 'sa1',
                            encrypted: true  // Asegura que las conexiones sean seguras
                        });

                        pusherSolicitud.connection.bind('connected', () => {
                            console.log('Conectado a Pusher (estado_solicitud)!');
                        });

                        // Suscribirse al canal de la solicitud
                        const channelSolicitud = pusherSolicitud.subscribe(`estado_solicitud_${response.data.data[0].id_solicitud}_channel`);

                        // Manejar la recepción de la ubicación actualizada
                        channelSolicitud.bind('estado_solicitud', function (data) {
                            if (data.estado === "CU") {
                                setEstadoSolicitud(data.estado);
                            }
                        });

                        pusherSolicitud.connection.bind('error', (err) => {
                            console.error('Error en la conexión de Pusher (estado_solicitud):', err);
                        });

                        setLoading(false);

                        // Limpiar la suscripción cuando el componente se desmonta
                        return () => {
                            channelSolicitud.unbind_all();
                            channelSolicitud.unsubscribe();
                        };
                    } else {
                        setSolicitudes(response.data.data);
                        console.log("conectando a pusher solicitudes_channel")
                        // Configuración de Pusher con tus credenciales
                        const pusher = new Pusher('390cef738b8ca03faacd', {
                            cluster: 'sa1',
                            encrypted: true  // Asegura que las conexiones sean seguras
                        });

                        // Log para confirmar la conexión a Pusher
                        pusher.connection.bind('connected', () => {
                            console.log('Conectado a Pusher!');
                        });

                        // Suscribirse al canal solicitudes_channel
                        const channel = pusher.subscribe('solicitudes_channel');

                        // Escuchar el evento 'nuevo_solicitud' que se está enviando desde Django
                        channel.bind('nuevo_solicitud', function (data) {
                            console.log('Nueva solicitud recibida:', data);

                            // Actualizar el estado con la nueva solicitud recibida
                            setSolicitudes(solicitudes => [...solicitudes, data]);
                        });

                        // Escuchar el evento 'nuevo_solicitud' que se está enviando desde Django
                        channel.bind('solicitudes_aceptadas_canceladas', function (data) {
                            console.log('Nueva solicitud aceptada o cancelada:', data);

                            // Actualizar el estado filtrando la solicitud correspondiente
                            setSolicitudes(solicitudes => solicitudes.filter(solicitud => solicitud.id_solicitud !== data.id_solicitud));
                        });

                        // Manejar errores en la conexión de Pusher
                        pusher.connection.bind('error', (err) => {
                            console.error('Error en la conexión de Pusher:', err);
                        });

                        setLoading(false);
                        // Limpiar la suscripción cuando el componente se desmonta
                        return () => {
                            channel.unbind_all();
                            channel.unsubscribe();
                        };
                    }
                } else {
                    console.log("Error al cargar las solicitudes: " + response.data.error);
                    setLoading(false);
                }
            } catch (error) {
                console.log('Ocurrió un error al procesar la solicitud');
                setLoading(false);
            }
        }
        console.log("showFormReciclar: " + showFormReciclar)
        if (showFormReciclar) {
            //setLoading(true);
            fetchSolicitudes();
        }
    }, [showFormReciclar, setAddressSolicitante, setDisableShowForm, setEstadoSolicitud, setShowFormReciclar, setSolicitudAceptada, setStartTimeCountDown, setUsuarioSolicitante, userState.id_usuario]);

    // Muestra solo las primeras 3 solicitudes para el renderizado
    const solicitudesParaMostrar = solicitudes.slice(0, 3);

    return (
        <Row xs={1} className='cards-container m-0 justify-content-center w-100'>
            {
                loading ?
                    (
                        <CardsSolicitudRecoleccionSkeleton NumItems={3} />
                    ) :
                    (
                        (solicitudesParaMostrar && solicitudesParaMostrar.length > 0) ? (
                            solicitudesParaMostrar.map(value => (
                                <Card key={value.id_solicitud} cardStyle={{ minHeight: "150px", height: "fit-content" }}>
                                    <Col className='cards-info p-0 m-0'>
                                        <div className='card-solicitud-info w-100'>
                                            <div className='card-solicitud-info-start'>
                                                <div className='mb-2'>
                                                    <label className='fw-bold' style={{ fontSize: "0.8rem" }}>Materiales:</label>
                                                    <p className='m-0' style={{ fontSize: "0.8rem" }}>
                                                        <CollectionsIcon
                                                            style={{ cursor: "pointer" }}
                                                            className='me-1'
                                                            onClick={() => { setArrFotosSolicitud(value.fotos) }}
                                                        />
                                                        <span style={{ cursor: "pointer" }} onClick={() => { setArrFotosSolicitud(value.fotos) }}>{value.materiales}</span>
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className='m-0' style={{ fontSize: "0.8rem" }}>
                                                        <NearMeOutlinedIcon
                                                            className='me-1'
                                                        />
                                                        <span>{value.direccion}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className='card-solicitud-info-end'>
                                                <div className='d-flex justify-content-around m-0'>
                                                    <GetDistaciaTime location={value.ubicacion} />
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col className='cards-btns p-0 m-0' xs={4}>
                                        <div className='card-reciclador-btn' style={{ color: "var(--bs-green)" }}>
                                            <button
                                                onClick={(e) => { aceptarSolicitud(value); }}
                                                disabled={sending || !localizacionReciclador.lat}
                                            >
                                                <FontAwesomeIcon icon={faCheck} fontSize="24" />
                                                <span>Aceptar</span>
                                            </button>
                                        </div>
                                        <div className='card-reciclador-btn' style={{ color: "var(--bs-danger)" }}>
                                            <button
                                                onClick={(e) => { rechazarSolicitud(value); }}
                                                disabled={sending || !localizacionReciclador.lat}
                                            >
                                                <FontAwesomeIcon icon={faX} fontSize="24" />
                                                <span>Rechazar</span>
                                            </button>
                                        </div>
                                    </Col>
                                </Card>
                            ))
                        ) : (
                            <PlaceHolderPage msj={"No hay solicitudes"} />
                        )
                    )
            }
        </Row>
    );
}

export const CardsSolicitudRecoleccionSkeleton = function ({ NumItems, msjEmpty }) {
    return (
        <Row xs={1} className='cards-container m-0 justify-content-center w-100'>
            {
                (NumItems && NumItems > 0) ? (
                    Array.from({ length: NumItems }).map((_, index) => (
                        <Card key={index} cardStyle={{ minHeight: "150px", height: "fit-content" }}>
                            <Col className='cards-info p-0 m-0'>
                                <div className='card-solicitud-info w-100'>
                                    <div className='card-solicitud-info-start'>
                                        <div className='mb-2'>
                                            <label className='fw-bold' style={{ fontSize: "0.8rem" }}><Skeleton variant="text" sx={{ fontSize: '1rem', width: '8rem' }} /></label>
                                            <p className='m-0' style={{ fontSize: "0.8rem" }}><Skeleton variant="rectangular" sx={{ height: '20px', width: '20px', display: 'inline-block' }} /> <span><Skeleton variant="text" sx={{ fontSize: '1rem', width: '12rem', display: 'inline-block' }} /></span></p>
                                        </div>
                                        <div>
                                            <p className='m-0' style={{ fontSize: "0.8rem" }}><Skeleton variant="rectangular" sx={{ height: '20px', width: '20px', display: 'inline-block' }} /> <span><Skeleton variant="text" sx={{ fontSize: '1rem', width: '10rem', display: 'inline-block' }} /></span></p>
                                        </div>
                                    </div>
                                    <div className='card-solicitud-info-end'>
                                        <div className='d-flex justify-content-around m-0'>
                                            <p className="m-0" style={{ fontSize: "0.8rem" }}><Skeleton variant="rectangular" sx={{ height: '20px', width: '20px', display: 'inline-block' }} /><span> <Skeleton variant="text" sx={{ fontSize: '1rem', width: '3rem', display: 'inline-block' }} /></span></p>
                                            <p className="m-0" style={{ fontSize: "0.8rem" }}><Skeleton variant="rectangular" sx={{ height: '20px', width: '20px', display: 'inline-block' }} /><span> <Skeleton variant="text" sx={{ fontSize: '1rem', width: '3rem', display: 'inline-block' }} /></span></p>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            <Col className='cards-btns p-0 m-0' xs={4}>
                                <div className='card-reciclador-btn' style={{ color: "var(--bs-green)" }}>
                                    <button>
                                        <Skeleton variant="rectangular" sx={{ height: '24px', width: '20px', display: 'inline-block' }} />
                                        <span><Skeleton variant="text" sx={{ fontSize: '1rem', width: '4rem' }} /></span>
                                    </button>
                                </div>
                                <div className='card-reciclador-btn' style={{ color: "var(--bs-danger)" }}>
                                    <button>
                                        <Skeleton variant="rectangular" sx={{ height: '24px', width: '20px', display: 'inline-block' }} />
                                        <span><Skeleton variant="text" sx={{ fontSize: '1rem', width: '4rem' }} /></span>
                                    </button>
                                </div>
                            </Col>
                        </Card>
                    ))
                ) : (
                    <></>
                )
            }
        </Row>
    );
}