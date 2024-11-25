import React from 'react';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import XIcon from '@mui/icons-material/X';
import YouTubeIcon from '@mui/icons-material/YouTube';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import { Col, Row } from 'react-bootstrap';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

export const SocialIcons = ({ dataRedesSociales }) => {
    console.log(dataRedesSociales)

    return (
        <>
            {
                (dataRedesSociales && (dataRedesSociales.correo !== undefined || dataRedesSociales.telefono !== undefined)) &&
                (
                    <>
                        <Row className='mt-1'>
                            <Col md={12}>
                                <h6 className='d-block w-100 text-center mt-3 fw-bold'>Contacto</h6>
                            </Col>
                            {dataRedesSociales.correo &&
                                <Col md={12} className='d-flex align-items-center'>
                                    <a href={'mailto:' + dataRedesSociales.correo}>
                                        <EmailIcon style={{ fontSize: '3rem' }} />
                                        <label className='ms-2' style={{ color: "gray" }}>{dataRedesSociales.correo}</label>
                                    </a>
                                </Col>
                            }
                            {dataRedesSociales.telefono &&
                                <Col md={12} className='d-flex align-items-center mt-2'>
                                    <a href={"tel:" + dataRedesSociales.telefono}>
                                        <PhoneIcon style={{ fontSize: '3rem' }} />
                                        <label className='ms-2' style={{ color: "gray" }}>{dataRedesSociales.telefono}</label>
                                    </a>
                                </Col>
                            }
                        </Row>
                        {dataRedesSociales.redes_sociales !== undefined && Object.values(dataRedesSociales.redes_sociales).some(x => x !== "") &&
                            <>
                                <Row className='mt-1 mb-3'>
                                    <Col md={12}>
                                        <h6 className='d-block w-100 text-center mt-3 fw-bold'>Redes sociales</h6>
                                    </Col>
                                    <Col className="d-flex justify-content-center gap-2">
                                        {dataRedesSociales.redes_sociales.facebook &&
                                            <a className="social-link" href={dataRedesSociales.redes_sociales.facebook}>
                                                <FacebookOutlinedIcon style={{ fontSize: '3.5rem' }} />
                                            </a>
                                        }
                                        {dataRedesSociales.redes_sociales.instagram &&
                                            <a className="social-link" href={dataRedesSociales.redes_sociales.instagram}>
                                                <InstagramIcon style={{ fontSize: '3.5rem' }} />
                                            </a>
                                        }
                                        {dataRedesSociales.redes_sociales.twitter &&
                                            <a className="social-link" href={dataRedesSociales.redes_sociales.twitter}>
                                                <XIcon style={{ fontSize: '3.5rem' }} />
                                            </a>
                                        }
                                        {dataRedesSociales.redes_sociales.youtube &&
                                            <a className="social-link" href={dataRedesSociales.redes_sociales.youtube}>
                                                <YouTubeIcon style={{ fontSize: '3.5rem' }} />
                                            </a>
                                        }
                                        {dataRedesSociales.redes_sociales.linkedin &&
                                            <a className="social-link" href={dataRedesSociales.redes_sociales.linkedin}>
                                                <LinkedInIcon style={{ fontSize: '3.5rem' }} />
                                            </a>
                                        }
                                    </Col>
                                </Row>
                            </>
                        }
                    </>
                )
            }
        </>

    );
}