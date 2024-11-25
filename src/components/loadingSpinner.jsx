import React from 'react';
import Spinner from 'react-bootstrap/Spinner';

function BorderSpinner() {
    return (
        <div className="mt-5" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
            <Spinner animation="border" variant="primary" />
            <span style={{ color: "gray", marginTop: '10px', userSelect: 'none' }}>Cargando...</span>
        </div>
    );
}

export function BorderSpinnerBasic(props) {
  return (
    <Spinner animation="border" role="status" {...props}>
      <span className="visually-hidden">Cargando...</span>
    </Spinner>
  );
}

export default BorderSpinner;
