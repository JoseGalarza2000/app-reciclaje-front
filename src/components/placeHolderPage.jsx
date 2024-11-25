import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from 'react';

function PlaceHolderPage({ msj, icono }) {
    return (
        <div className="mt-5" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', width: '100%' }}>
            <div>
                {icono &&
                    <FontAwesomeIcon icon={icono} style={{ color: 'gray' }} fontSize="12rem" className='location-icon' />
                }
            </div>
            <span style={{ color: "gray", marginTop: '10px', userSelect: 'none' }}>
                {msj}
            </span>
        </div>
    );
}

export default PlaceHolderPage;
