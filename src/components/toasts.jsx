import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Toast from 'react-bootstrap/Toast';

function ToastAutohide({ imagen, textHeader, textBody, keyToast }) {
    const [show, setShow] = useState(true);

    return ReactDOM.createPortal(
        <Toast key={keyToast} onClose={() => setShow(false)} show={show} delay={3000} autohide>
            <Toast.Header>
                <img
                    src={imagen}
                    className="rounded me-2"
                    alt=""
                    style={{ height: "2rem" }}
                />
                <strong className="me-auto">{textHeader}</strong>
            </Toast.Header>
            {textBody && (
                <Toast.Body>{textBody}</Toast.Body>
            )}
        </Toast>,
        document.getElementById('toast-container') // Nodo en el que se montará el portal
    );
}

export default ToastAutohide;
