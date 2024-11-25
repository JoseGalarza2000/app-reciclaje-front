import React, { createContext, useState } from 'react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export const ReciclarContext = createContext();

export const ReciclarProvider = ({ children }) => {
    const [address, setAddress] = useState('');//direccion en texto
    const [addressSolicitante, setAddressSolicitante] = useState({});
    const [location, setLocation] = useState('');
    const [localizacionReciclador, setLocalizacionReciclador] = useState('');
    const [showFormReciclar, setShowFormReciclar] = useState(false);
    const [disableShowForm, setDisableShowForm] = useState(true);
    const [estadoSolicitud, setEstadoSolicitud] = useState('');
    const [solicitudAceptada, setSolicitudAceptada] = useState('');
    const [recicladorSolicitud, setRecicladorSolicitud] = useState('');
    const [usuarioSolicitante, setUsuarioSolicitante] = useState('');
    const [startTimeCountDown, setStartTimeCountDown] = useState('');
    const [arrFotosSolicitud, setArrFotosSolicitud] = useState([]);

    // Obtenemos el estado del usuario logeado desde el store (usamos useSelector)
    const userState = useSelector((store) => store.user);

    // useEffect para restablecer los estados cuando cambie el usuario logueado
    useEffect(() => {
        // Si cambia el usuario logeado, restablecemos todos los estados
        if (userState) {
            setAddress('');
            setAddressSolicitante({});
            setLocation('');
            setLocalizacionReciclador('');
            setShowFormReciclar(false);
            setDisableShowForm(true);
            setEstadoSolicitud('');
            setSolicitudAceptada('');
            setRecicladorSolicitud('');
            setUsuarioSolicitante('');
            setStartTimeCountDown('');
            setArrFotosSolicitud([]);
        }
    }, [userState]); // Se ejecutará cada vez que userState cambie
    
    return (
        <ReciclarContext.Provider value={{
            address, setAddress,
            location, setLocation,
            addressSolicitante, setAddressSolicitante,
            showFormReciclar, setShowFormReciclar,
            disableShowForm, setDisableShowForm,
            estadoSolicitud, setEstadoSolicitud,
            solicitudAceptada, setSolicitudAceptada,
            localizacionReciclador, setLocalizacionReciclador,
            recicladorSolicitud, setRecicladorSolicitud,
            usuarioSolicitante, setUsuarioSolicitante,
            startTimeCountDown, setStartTimeCountDown,
            arrFotosSolicitud, setArrFotosSolicitud
        }}>
            {children}
        </ReciclarContext.Provider>
    );
};
