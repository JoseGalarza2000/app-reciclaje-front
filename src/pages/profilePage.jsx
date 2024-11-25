import { Col, Container, Row, Modal } from 'react-bootstrap';
import { NavbarPage } from '../components/navBar';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { StarRating } from "../components/startRating"
import { SocialIcons } from "../components/socialIcons"
import React, { useEffect, useState } from 'react';
import { FormEditProfile, FormEditSocialLinks } from "../components/forms"
import { useSelector } from 'react-redux';
import axios from 'axios';
import BorderSpinner from '../components/loadingSpinner';
import { useTheme } from '../components/themeContext';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Roles from '../models/roles';

export const ProfileContent = function ({ userData, isVisitante, setUserData }) {
    const { theme } = useTheme();
    const [showModalEditProfile, setShowModalEditProfile] = useState(false);
    const [showModalEditSocialLinks, setShowModalEditSocialLinks] = useState(false);
    const [showModalImage, setShowModalImage] = useState(false);

    return (
        <>
            <Container
                fluid
                className={`p-0 background-page ${userData.informacion_general.sexo && userData.informacion_general.sexo.value === "Femenino" ? "background-page-rosa" : "background-page-azul"}`}
                style={{ zIndex: (!isVisitante ? "-1" : "") }}
            />
            <Container fluid className="profile-container p-0" bg={theme === "dark" ? theme : ""}>
                <Container bg={theme === "dark" ? theme : ""}>
                    <div className={`profile-img-name ${isVisitante ? "" : "ms-xl-5"}`}>
                        <Row className={`align-items-center justify-content-center m-0 ${isVisitante ? "" : "justify-content-xl-start"}`}>
                            <Col xs="auto" className='text-center'>
                                <img onClick={() => setShowModalImage(true)} className="profile-img" src={userData.url_foto} alt="avatar" />
                            </Col>
                        </Row>
                        <Row className={`justify-content-center m-0 ${isVisitante ? "" : "justify-content-xl-start"}`}>
                            <Col xs="auto">
                                {userData.rol !== Roles.ORG
                                    ?
                                    <label className='userName mt-2'>{userData.informacion_general.nombres.value.split(" ")[0] + " " + userData.informacion_general.apellidos.value.split(" ")[0]}</label>
                                    :
                                    <label className='userName mt-2'>{userData.informacion_general.razon_social.value}</label>
                                }
                            </Col>
                        </Row>
                    </div>
                    <Row className={`m-0 me-xl-5 ms-2 me-2 ${isVisitante ? "" : "ms-xl-5"}`}>
                        <Row className='justify-content-between m-0 p-0 mb-5'>
                            <Col className='border-top user-info mt-3 m' xl={isVisitante ? 12 : 6}>
                                <h6 className='legend fw-bold' style={{ color: "gray" }} bg={theme === "dark" ? theme : ""}>
                                    {userData.rol === Roles.ORG ? "Información general" : "Información personal"}
                                </h6>
                                {
                                    Object.entries(userData.informacion_general).map(([key, value]) => (
                                        <Row key={key} className='justify-content-center justify-content-xl-start mt-1'>
                                            <Col md={5} sm={4} xs={4}>
                                                <label className='fw-bold'>{value.label}:</label>
                                            </Col>
                                            <Col className="" md={7} sm={8} xs={8}>
                                                <p >{value.value}</p>
                                            </Col>
                                        </Row>
                                    ))
                                }
                                {userData.rol !== Roles.ORG &&
                                    <Row className='justify-content-center justify-content-xl-start mt-1'>
                                        <Col md={5} sm={4} xs={4}>
                                            <label className='fw-bold'>Calificación:</label>
                                        </Col>
                                        <Col className="" md={7} sm={8} xs={8}>
                                            <StarRating rating={userData.calificacion} size={24} />
                                        </Col>
                                    </Row>
                                }
                            </Col>
                            <Col className='border-top user-info mt-3' xl={isVisitante ? 12 : 5}>
                                <h6 className='legend fw-bold' style={{ color: "gray" }} bg={theme === "dark" ? theme : ""}>
                                    {userData.rol === Roles.RECICLADOR ? "Información laboral" : "Información de contacto"}
                                </h6>
                                {userData.rol === Roles.RECICLADOR &&
                                    <Row className='justify-content-center justify-content-xl-start mt-1'>
                                        <Col md={12}>
                                            <h5 className='d-block w-100 text-center mt-3 mb-3 fw-bold'>{userData.organizacion.razon_social}</h5>
                                        </Col>
                                        <Col md={12}>
                                            <FontAwesomeIcon icon={faLocationDot} fontSize="24" className='location-icon' />
                                            <label>{userData.organizacion.direccion}</label>
                                        </Col>
                                    </Row>
                                }
                                <SocialIcons dataRedesSociales={userData.organizacion ? userData.organizacion : userData.info_contacto}></SocialIcons>
                            </Col>
                        </Row>
                        {
                            !isVisitante && (
                                <Col className='border-top user-info' xl={12}>
                                    <h6 className='legend fw-bold' style={{ color: "gray" }} bg={theme === "dark" ? theme : ""}>Ajustes</h6>
                                    <Row className='justify-content-center justify-content-xl-start mt-1'>
                                        <Col md={12}>
                                            <div
                                                className="w-100 p-2 mb-2 btn-config-option"
                                                onClick={() => {
                                                    setShowModalEditProfile(true);
                                                }}
                                                bg={theme === "dark" ? theme : ""}
                                            >
                                                <span>Editar perfil</span>
                                                <ArrowForwardIosIcon style={{ fontSize: '1.2rem' }} />
                                            </div>
                                            {userData.rol === Roles.ORG &&
                                                < div
                                                    className="w-100 p-2 mb-2 btn-config-option"
                                                    onClick={() => {
                                                        setShowModalEditSocialLinks(true);
                                                    }}
                                                    bg={theme === "dark" ? theme : ""}
                                                >
                                                    <span>Editar redes sociales</span>
                                                    <ArrowForwardIosIcon style={{ fontSize: '1.2rem' }} />
                                                </div>
                                            }
                                            <div className="w-100 p-2 mb-2 btn-config-option" bg={theme === "dark" ? theme : ""}>
                                                <span>Restabelecer contraseña</span>
                                                <ArrowForwardIosIcon style={{ fontSize: '1.2rem' }} />
                                            </div>
                                            {/*
                                            <div className="w-100 p-2 mb-2 btn-config-option" bg={theme === "dark" ? theme : ""}>
                                                <span style={{ color: "red" }} >Eliminar cuenta</span>
                                                <ArrowForwardIosIcon style={{ fontSize: '1.2rem' }} />
                                            </div>
                                            */}
                                        </Col>
                                    </Row>
                                </Col>
                            )
                        }
                    </Row>
                </Container >
            </Container >

            <Modal
                show={showModalImage}
                onHide={() => setShowModalImage(false)}
                dialogClassName="modal-90w"
                contentClassName='rounded-0 border-0'
                centered
            >
                <Modal.Header closeButton className='border-0 modal-img-header'></Modal.Header>
                <Modal.Body className='p-0'>
                    <img src={userData.url_foto} style={{ width: '100%', height: 'auto' }} alt='perfil'/>
                </Modal.Body>
            </Modal>
            {
                !isVisitante && (
                    <>
                        <FormEditProfile
                            userData={userData}
                            setUserData={setUserData}
                            setShowModalEditProfile={setShowModalEditProfile}
                            showModalEditProfile={showModalEditProfile}
                            imgProfile={userData.url_foto}
                        />
                        {userData.rol === Roles.ORG && userData && userData.info_contacto && userData.info_contacto.redes_sociales &&
                            < FormEditSocialLinks
                                userData={userData}
                                setUserData={setUserData}
                                setShowModalEditSocialLinks={setShowModalEditSocialLinks}
                                showModalEditSocialLinks={showModalEditSocialLinks}
                            />
                        }
                    </>
                )
            }

        </>

    );
}

export function ModalProfile({ setShowModal, showModal, modalTitle, userData }) {
    return (
        <Modal
            show={showModal}
            onHide={() => setShowModal(false)}
            dialogClassName="modal-90w modal-dialog-scrollable"
            size="lg"
        >
            <Modal.Header closeButton>
                <h5>{modalTitle}</h5>
            </Modal.Header>
            <Modal.Body className='vh-100 p-0' style={{ maxHeight: '800px' }}>
                <ProfileContent isVisitante={true} userData={userData} />
            </Modal.Body>
        </Modal>
    );
}

function ProfilePage() {
const [loading, setLoading] = useState(true); // cargando
const [userData, setUserData] = useState('');
    const userState = useSelector((store) => store.user);

    

    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const response = await axios.post(
                    'https://rafaeloxj.pythonanywhere.com/api/v1/obtener_informacion_usuario/',
                    { "id_usuario": /*"user_002"*/userState.id_usuario },
                    { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
                );
                if (response.data.success) {
                    const perfil_info = response.data.data;
                    setUserData(perfil_info);
                } else {
                    console.error('Error al obtener las solicitudes:', response.data.error);
                }
            } catch (error) {
                console.error('Error al obtener las solicitudes:', error);
            }
        };

        setLoading(true); // Establecer carga en true al comenzar la solicitud
        fetchPerfil().then(() => {
            setLoading(false);// Establecer carga en false cuando la solicitud finaliza (tanto si es exitosa como si falla)
        });
    }, [userState.id_usuario]);

    return (

        <>
            <NavbarPage
                titleNav="Perfil"
                startElement={
                    <Link style={{ color: "var(--bs-nav-link-color)" }} to="/" className='h-100 W-100'>
                        <ArrowBackIcon style={{ fontSize: '3rem' }} />
                    </Link>
                }
            />
            {
                loading ?
                    (<BorderSpinner></BorderSpinner >) :
                    (
                        <>
                            {
                                userData && (
                                    <ProfileContent isVisitante={false} userData={userData} setUserData={setUserData}/>
                                )
                            }
                        </>
                    )
            }
        </>

    )
}

export default ProfilePage