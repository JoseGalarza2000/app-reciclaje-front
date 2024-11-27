import { Col, Container, Row, Form, Image } from 'react-bootstrap';
import { NavbarPage } from '../components/navBar';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { SelectWithSearch } from '../components/searchCombo';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
    useQueryClient,
} from '@tanstack/react-query';
import { getDefaultImg } from './profilePage';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Roles from '../models/roles';
import { CRUDExportTableCSV } from '../components/tableRegistroPesos';

const recicladorOption = function ({ nombres, apellidos, url_foto, cedula, genero }) {

    return (
        <>
            <Row>
                <Col xs={2} className='text-center'>
                    <Image className="image-profile" src={url_foto || getDefaultImg(Roles.RECICLADOR, genero)} roundedCircle style={{ width: "3rem", height: "3rem" }} />
                </Col>
                <Col>
                    <p className='mb-0'>
                        {nombres + " " + apellidos}
                    </p>
                    <p className='mb-0'>
                        <span>{cedula}</span>
                    </p>
                </Col>
            </Row>
        </>
    )
}

function RegistroPesos() {
    const [optionsSearch, setOptionsSearch] = useState('');
    const [dataReciclador, setDataReciclador] = useState('');
    //const [loading, setLoading] = useState(true); // cargando
    const queryClient = useQueryClient();
    const [tiposMateriales, setTiposMateriales] = useState([]);
    const userState = useSelector((store) => store.user);

    useEffect(() => {
        // Obtener contenido de la página desde el backend
        const fetchTiposMateriales = async () => {
            try {
                const response = await axios.get(
                    'https://rafaeloxj.pythonanywhere.com/api/v1/tipos_materiales_activos/'
                );

                if (response.data.success) {
                    //console.log(response.data.data);
                    setTiposMateriales(response.data.data);
                } else {
                    console.log("Error obtener tipos de materiales: " + response.data.error);
                }
            } catch (error) {
                console.log('Ocurrió un error al procesar la solicitud');
            }
        }
        fetchTiposMateriales();
    }, []);

    useEffect(() => {
        // Invalidar la consulta cuando id_reciclador cambie para forzar la ejecución
        queryClient.invalidateQueries({ queryKey: ['reciclajes'] })
    }, [dataReciclador, queryClient]);

    useEffect(() => {
        const fetchRecicladores = async () => {
            try {
                const response = await axios.post(
                    'https://rafaeloxj.pythonanywhere.com/api/v1/lista_recicladores_empresa/',
                    { "id_empresa": userState.id_usuario, "estado_reciclador": "A" },
                    { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
                );
                if (response.data.success) {
                    let array = response.data.data;
                    let options = [];
                    //console.log(array)
                    array.forEach(x => {
                        options.push({ value: x, label: (x.nombre_corto + " - " + x.cedula), component: recicladorOption({ nombres: x.nombres, apellidos: x.apellidos, url_foto: x.url_foto, cedula: x.cedula, genero: x.genero }), key: x.id_usuario })
                    });

                    setOptionsSearch(options);
                } else {
                    console.error('Error al obtener las solicitudes:', response.data.error);
                }
            } catch (error) {
                console.error('Error al obtener las solicitudes:', error);
            }
        };

        //setLoading(true); // Establecer carga en true al comenzar la solicitud
        fetchRecicladores().then(() => {
            //setLoading(false);// Establecer carga en false cuando la solicitud finaliza (tanto si es exitosa como si falla)
        });
    }, [userState.id_usuario]);

    return (
        <>
            <NavbarPage
                titleNav="Registro de pesos"
                startElement={
                    <Link style={{ color: "var(--bs-nav-link-color)" }} to="/" className='h-100 W-100'>
                        <ArrowBackIcon style={{ fontSize: '3rem' }} />
                    </Link>
                }
            />
            <Container>
                <div className='search-select-container'>
                    {
                        optionsSearch && (
                            <Form.Group className="mb-3" controlId="search-select" style={{ position: "relative" }}>
                                <Form.Label>Seleccione un usuario:</Form.Label>
                                <SelectWithSearch
                                    options={optionsSearch}
                                    placeholder="Ingrese nombre o cédula"
                                    name="searchSelect"
                                    onSelectFunction={(valueOpcion, label) => {
                                        setDataReciclador(valueOpcion);
                                    }}
                                    emptyText="No se encrontro el usuario"
                                    resetSearchOnSelect={true}
                                />
                            </Form.Group>
                        )
                    }
                </div>
                {
                    dataReciclador && (
                        <>
                            <CRUDExportTableCSV dataReciclador={dataReciclador} tiposMateriales={tiposMateriales}></CRUDExportTableCSV>
                        </>
                    )
                }
            </Container>
        </>
    );
}

export default RegistroPesos