import { useContext, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { StarRatingSelectable } from "../components/startRating"
import axios from 'axios';
import { ReciclarContext } from './reciclarContext';
import { useSelector } from 'react-redux';
import { BorderSpinnerBasic } from './loadingSpinner';
import { CarouselFotos } from './carousel';
import Roles from '../models/roles';



export function CustomModal({ title, closeButton, FooterContent, children, showModal, size }) {
    const [show, setShow] = useState(showModal);
    
    const handleClose = () => setShow(false);
    
    useEffect(() => {
        setShow(showModal);
    }, [showModal]);

    return (
        <>

            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                aria-labelledby="contained-modal-title-vcenter"
                centered
                size={size ? size : 'md'}//size 'sm' 'md' 'lg' 'xl'
            >
                {(title || closeButton) &&
                    <Modal.Header closeButton={closeButton}>
                        <Modal.Title>{title}</Modal.Title>
                    </Modal.Header>
                }
                <Modal.Body>
                    {children}
                </Modal.Body>
                {
                    FooterContent &&
                    <Modal.Footer>
                        {FooterContent}
                    </Modal.Footer>
                }
            </Modal>
        </>
    );
}

export function AlertModal({ text, btn_text, onClose }) {
    return (
        <CustomModal showModal={true}>
            <div className="d-flex justify-content-center flex-wrap p-4">
                <p className="w-100 text-center">{text}</p>
                <Button
                    className="text-center w-50 filledButton"
                    type="button"
                    onClick={onClose}
                >
                    {btn_text}
                </Button>
            </div>
        </CustomModal>
    );
}


export function ModalCalificarRecoleccion({ title }) {
    const [calificacion, setCalificacion] = useState(0);
    const [sending, setSending] = useState(false);
    const { usuarioSolicitante, recicladorSolicitud, setSolicitudAceptada, solicitudAceptada,
        setAddressSolicitante, setLocalizacionReciclador, setShowFormReciclar,
        setDisableShowForm, setEstadoSolicitud, setRecicladorSolicitud,
        setUsuarioSolicitante, setStartTimeCountDown } = useContext(ReciclarContext);
    const userState = useSelector((store) => store.user);

    const handleRatingChange = (newRating) => {
        console.log("Nueva calificación:", newRating);
        setCalificacion(newRating);
    };

    const handleSend = async () => {
        setSending(true);
        try {
            const response = await axios.post(
                'https://rafaeloxj.pythonanywhere.com/api/v1/agregar_calificacion/',
                {
                    "id_usuario_calificador": userState.id_usuario,
                    "id_usuario_calificado": userState.rol === Roles.RECICLADOR ? usuarioSolicitante : recicladorSolicitud,
                    "calificacion": calificacion,
                    "id_solicitud": solicitudAceptada.id_solicitud
                },
                { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
            );
            if (response.data.success) {
                console.log("se registro la calificación");
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

    return (
        <CustomModal showModal={true}>
            <div className="d-flex justify-content-center flex-wrap p-4">
                <h5 className="text-center w-100">{title}</h5>
                <div className='mb-3 mt-3'>
                    <StarRatingSelectable
                        rating={0}// Valor inicial
                        size={"3rem"}
                        onRatingChange={handleRatingChange}// Callback para manejar el cambio de calificación
                    />
                </div>
                <Button
                    className="text-center w-50 filledButton"
                    type="button"
                    disabled={sending}
                    onClick={() => handleSend()}
                >
                    Enviar {sending && <BorderSpinnerBasic style={{ width: "1rem", height: "1rem" }} />}
                </Button>
            </div>
        </CustomModal>
    );
}

export function ModalViewPhotosReciclaje() {
    const { arrFotosSolicitud, setArrFotosSolicitud } = useContext(ReciclarContext);

    return (
        <Modal
            show={arrFotosSolicitud.length > 0}
            onHide={() => setArrFotosSolicitud([])}
            dialogClassName="modal-90w"
            contentClassName='rounded-0 border-0 content-modal-photos'
            centered
            aria-labelledby="contained-modal-title-vcenter"
        >
            <Modal.Header closeButton className='border-0 modal-img-header' style={{ filter: "contrast(0.1)" }}></Modal.Header>
            <Modal.Body className='p-0'>
                <CarouselFotos arrFotos={arrFotosSolicitud} />
            </Modal.Body>
        </Modal>
    )
}
