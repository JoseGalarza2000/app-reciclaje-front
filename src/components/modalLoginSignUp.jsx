import React, { useState } from 'react';
import { Modal, Button} from 'react-bootstrap';
import { Forms } from "./forms";

const Login = ({ setUserLogin }) => {
    const [show, setShowModal] = useState(false);
    const [typeForm, setTypeForm] = useState('');
    const [titleForm, setTitleForm] = useState('');

    return (
        <>
            <Button
                variant="link"
                className="text-decoration-none font-weight-bold text-start p-0"
                onClick={() => {
                    setTypeForm("login");
                    setTitleForm("Iniciar sesión");
                    setShowModal(true);
                }}
            >
                Iniciar sesión
            </Button>
            <Button
                variant="link"
                className="text-decoration-none font-weight-bold text-start p-0 d-none d-sm-inline"
                style={{ marginLeft: '0.8rem' }}
                onClick={() => {
                    setTypeForm("signUp");
                    setTitleForm("Registrarse");
                    setShowModal(true);
                }}
            >
                Registrarse
            </Button>
            <Modal
                show={show}
                onHide={() => setShowModal(false)}
                dialogClassName="modal-90w modal-dialog-scrollable"
            >
                <Modal.Header closeButton className='border-0'>
                </Modal.Header>
                <Modal.Body className='d-flex vh-100' style={{ maxHeight: '800px' }}>
                    <Forms typeForm={typeForm} titleForm={titleForm} setUserLogin={setUserLogin}></Forms>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Login;
