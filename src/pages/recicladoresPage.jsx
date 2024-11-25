import { Container, InputGroup, FloatingLabel, Form } from 'react-bootstrap';
import { NavbarPage } from '../components/navBar';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import React, { useCallback, useEffect, useState } from 'react';
import { CardSolicitudReciclador, CardReciclador } from "../components/cards"
import PaginatedItems from '../components/pagination';
import { InputGroupBtnInField } from '../components/styledComponents';
import axios from 'axios';
import { TabsPageMui } from '../components/tabsPage';
import BorderSpinner from '../components/loadingSpinner';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSelector } from 'react-redux';

export const BuildRecicladores = function ({ estadoFecth, cardComponent, itemsName }) {
    const [loading, setLoading] = useState(true); // cargando
    const [solicitudes, setSolicitudes] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [searchSolicitudes, setSearchSolicitudes] = useState('');
    const userState = useSelector((store) => store.user);

    // Memoriza la función con useCallback
    const fetchSolicitudes = useCallback(async () => {
        try {
            const response = await axios.post(
                'https://rafaeloxj.pythonanywhere.com/api/v1/lista_recicladores_empresa/',
                { "id_empresa": userState.id_usuario, "estado_reciclador": estadoFecth },
                { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
            );
            if (response.data.success) {
                const solicitudes = response.data.data;
                setSolicitudes(solicitudes);
                setSearchSolicitudes('');
            } else {
                console.error('Error al obtener las solicitudes:', response.data.error);
            }
        } catch (error) {
            console.error('Error al obtener las solicitudes:', error);
        }
    }, [estadoFecth, userState.id_usuario]); // Añadimos las dependencias correctas

    useEffect(() => {
        setInputValue('');    
        setLoading(true); // Establecer carga en true al comenzar la solicitud
        fetchSolicitudes().then(() => {
            setLoading(false); // Establecer carga en false cuando la solicitud finaliza (tanto si es exitosa como si falla)
        });
    }, [fetchSolicitudes]);

    const handleChange = (event) => {
        if (solicitudes.length>0) {
            const newValue = event.target.value;
            setInputValue(newValue); // Actualiza el estado inputValue con el nuevo valor
            // Llama a searchItem con el nuevo valor después de que se haya actualizado el estado inputValue
            searchItem(newValue);
        }

    };


    const searchItem = (value) => {
        const filteredSolicitudes = [];

        // Recorre todos los objetos en el objeto de datos
        solicitudes.forEach((x) => {
            // Comprueba si el valor coincide con el nombre o la clave del objeto
            if (x.cedula.includes(value.toLowerCase()) || x.nombre_corto.toLowerCase().includes(value.toLowerCase())) {
                // Si hay coincidencia, agrega el objeto al nuevo objeto filtrado
                filteredSolicitudes.push(x);
            }
        });

        // Actualiza el estado 'solicitudes' con los objetos filtrados
        setSearchSolicitudes(filteredSolicitudes);
    };

    return (
        <>
            <div className='search-field-container'>
                <InputGroup className='search-field'>
                    <FloatingLabel controlId="search" label="Buscar por nombre o cédula" style={{ color: "var(--bs-info)" }}>
                        <Form.Control
                            name="Buscar por nombre o cédula"
                            type='text'
                            placeholder="Buscar por nombre o cédula"
                            value={inputValue}
                            maxLength={20}
                            onChange={handleChange}
                        />
                    </FloatingLabel>
                    <InputGroupBtnInField>
                        <FontAwesomeIcon
                            style={{ cursor: "pointer" }}
                            icon={faMagnifyingGlass}
                            onClick={() => {
                                searchItem(inputValue);
                            }}
                        />
                    </InputGroupBtnInField>
                </InputGroup>
            </div>
            {
                loading ?
                    (<BorderSpinner></BorderSpinner>) :
                    (<PaginatedItems
                        itemsPerPage={12}
                        arrItems={searchSolicitudes ? searchSolicitudes : solicitudes}
                        itemsRender={cardComponent}
                        setItems={fetchSolicitudes}
                        msjEmpty={searchSolicitudes ? "No se encontraron coincidencias" : "No tienes " + itemsName}
                    />)
            }
        </>
    );

}


function RecicladoresPage(){

    const pages = [
        { "value": "recicladores", "name": "Recicladores", "content": <BuildRecicladores estadoFecth="A" cardComponent={CardReciclador} itemsName="recicladores" /> },
        { "value": "solicitudes", "name": "Solicitudes", "content": <BuildRecicladores estadoFecth="E" cardComponent={CardSolicitudReciclador} itemsName="solicitudes" /> }
    ]

    return (
        <>
            <NavbarPage
                titleNav="Recicladores"
                startElement={
                    <Link style={{ color: "var(--bs-nav-link-color)" }} to="/" className='h-100 W-100'>
                        <ArrowBackIcon style={{ fontSize: '3rem' }} />
                    </Link>
                }
            />
            <Container>
                <TabsPageMui pages={pages}></TabsPageMui>
            </Container>
        </>
    )
}

export default RecicladoresPage