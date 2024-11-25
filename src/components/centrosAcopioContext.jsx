import React, { createContext, useRef, useState } from 'react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export const CentrosAcopioContext = createContext();

export const CentrosAcopioProvider = ({ children }) => {
    const [idCentroAcopio, setIdCentroAcopio] = useState('');
    const [referenciaCentroAcopio, setReferenciaCentroAcopio] = useState('');
    const [nombreCentroAcopio, setNombreCentroAcopio] = useState('');
    const [informacionCentroAcopio, setInformacionCentroAcopio] = useState('');
    const [locationCentroAcopio, setLocationCentroAcopio] = useState({});
    const [location, setLocation] = useState('');
    const [showFormCentroAcopio, setShowFormCentroAcopio] = useState(false);
    const [disableShowForm, setDisableShowForm] = useState(true);
    const [actionForm, setActionForm] = useState('');
    const [fotosAnt, setFotosAnt] = useState('');
    const [CAContent, setCAContent] = useState('');
    const markerRef = useRef(null);
    const [userMarker, setUserMarker] = useState(null);


    // Obtenemos el estado del usuario logeado desde el store (usamos useSelector)
    const userState = useSelector((store) => store.user);

    // useEffect para restablecer los estados cuando cambie el usuario logueado
    useEffect(() => {
        // Si cambia el usuario logeado, restablecemos todos los estados
        if (userState) {
            setReferenciaCentroAcopio('');
            setNombreCentroAcopio('');
            setInformacionCentroAcopio('');
            setLocationCentroAcopio({});
            setLocation('');
            setShowFormCentroAcopio(false);
            setDisableShowForm(true);
            setActionForm('');
            setIdCentroAcopio('');
            setFotosAnt('');
            setCAContent('');
            // Remueve el marcador si existe
            if (markerRef.current) {
                markerRef.current.remove();
                setUserMarker(null);  // Limpia el estado del marcador
            }
        }
    }, [userState]); // Se ejecutará cada vez que userState cambie

    // useEffect para restablecer los estados cuando se actualizan los centros de acopio
    useEffect(() => {
        setReferenciaCentroAcopio('');
        setNombreCentroAcopio('');
        setInformacionCentroAcopio('');
        setLocationCentroAcopio({});
        setLocation('');
        setShowFormCentroAcopio(false);
        setDisableShowForm(true);
        setActionForm('');
        setIdCentroAcopio('');
        setFotosAnt('');
        // Remueve el marcador si existe
        if (markerRef.current) {
            markerRef.current.remove();
            setUserMarker(null);  // Limpia el estado del marcador
        }
    }, [CAContent]); // Se ejecutará cada vez que userState cambie

    return (
        <CentrosAcopioContext.Provider value={{
            referenciaCentroAcopio, setReferenciaCentroAcopio,
            nombreCentroAcopio, setNombreCentroAcopio,
            informacionCentroAcopio, setInformacionCentroAcopio,
            locationCentroAcopio, setLocationCentroAcopio,
            location, setLocation,
            showFormCentroAcopio, setShowFormCentroAcopio,
            disableShowForm, setDisableShowForm,
            actionForm, setActionForm,
            idCentroAcopio, setIdCentroAcopio,
            fotosAnt, setFotosAnt,
            CAContent, setCAContent,
            markerRef,
            userMarker, setUserMarker
        }}>
            {children}
        </CentrosAcopioContext.Provider>
    );
};
