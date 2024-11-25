import * as React from 'react';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import { Button, FloatingLabel, Form } from 'react-bootstrap';
import AddIcon from '@mui/icons-material/Add';
import { FormHelperText, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { Formik } from 'formik';
import * as yup from 'yup';
import { ReciclarContext } from './reciclarContext';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Pusher from 'pusher-js';
import { useEffect } from 'react';
import { useContext } from 'react';
import { useState } from 'react';
import { BorderSpinnerBasic } from './loadingSpinner';
import Roles from '../models/roles';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

// Componente para sincronizar el campo direccion
export const SyncAddressField = ({ address, location, setFieldValue }) => {
    React.useEffect(() => {
        setFieldValue('direccion', address, false);
        setFieldValue('ubicacion', location, false);
    }, [address, setFieldValue, location]);

    return null;
};

export function FormularioSolicitudRecoleccion(props) {
    const [filesLoads, setFilesLoads] = React.useState([]);
    const fileLoadContainerRef = React.useRef(null);
    const { address } = React.useContext(ReciclarContext); // Usa el contexto para obtener el address
    const { location } = React.useContext(ReciclarContext); // Usa el contexto para obtener location
    const { setEstadoSolicitud, setDisableShowForm, setShowFormReciclar,
        setSolicitudAceptada, setLocalizacionReciclador, setRecicladorSolicitud,
        showFormReciclar, setStartTimeCountDown } = React.useContext(ReciclarContext);
    const userState = useSelector((store) => store.user);
    const [tiposMateriales, setTiposMateriales] = useState([]);

    // Manejo de solicitudes desde el backend y WebSocket de Pusher
    useEffect(() => {
        // Obtener las solicitudes pendientes desde el backend
        const fetchSolicitudes = async () => {
            if (showFormReciclar) {
                try {
                    const response = await axios.post(
                        'https://rafaeloxj.pythonanywhere.com/obtener_ultima_solicitud_pendiente/',
                        { "id_usuario": userState.id_usuario },
                        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
                    );

                    if (response.data.success) {
                        //si trae una solicitud entonces tiene una en curso
                        setShowFormReciclar(false);//oculto formulario
                        setDisableShowForm(true);//inactivo boton de mostrar formulario
                        setSolicitudAceptada(response.data.data);
                        setEstadoSolicitud(response.data.data.estado);
                        let ubicacion = JSON.parse(response.data.data.ubicacion_reciclador)
                        if (response.data.data.estado !== "P") {
                            setLocalizacionReciclador(({ lat: ubicacion[0], lng: ubicacion[1] }))
                            setRecicladorSolicitud(response.data.data.id_reciclador)
                        }
                        //console.log(JSON.stringify(response.data.data));
                        if (response.data.data.estado === "L") {
                            let fecha_arribo = response.data.data.fecha_arribo;
                            setStartTimeCountDown(Math.floor(new Date(fecha_arribo).getTime() / 1000))
                        }
                        console.log("conectando pusher solicitud_actualizada");
                        // Configuración de Pusher
                        const pusher = new Pusher('390cef738b8ca03faacd', {
                            cluster: 'sa1',
                            encrypted: true  // Asegura que las conexiones sean seguras
                        });

                        // Log para confirmar la conexión a Pusher
                        pusher.connection.bind('connected', () => {
                            console.log('Conectado a Pusher!');
                        });

                        // Suscribirse al canal de la solicitud
                        const channel = pusher.subscribe(`solicitud_${response.data.data.id_solicitud}_channel`);

                        // Manejar la recepción de la ubicación actualizada
                        channel.bind('solicitud_actualizada', function (data) {
                            if (data.ubicacion_reciclador) {//cuando se cancela una solicitud no trae ubicacion
                                let ubicacion_actualizada = JSON.parse(data.ubicacion_reciclador)
                                setLocalizacionReciclador({ lat: ubicacion_actualizada[0], lng: ubicacion_actualizada[1] })
                            }
                            setEstadoSolicitud(data.estado);
                            if (data.estado === "L") {
                                let fecha_arribo = data.fecha_arribo;
                                setStartTimeCountDown(Math.floor(new Date(fecha_arribo).getTime() / 1000))
                            }
                        });

                        // Manejar errores en la conexión de Pusher
                        pusher.connection.bind('error', (err) => {
                            console.error('Error en la conexión de Pusher:', err);
                        });

                        // Limpiar la suscripción cuando el componente se desmonta
                        return () => {
                            channel.unbind_all();
                            channel.unsubscribe();
                        };
                    } else {
                        console.log("Error al cargar las solicitudes: " + response.data.error);
                        //setLoading(false);
                    }
                } catch (error) {
                    console.log('Ocurrió un error al procesar la solicitud');
                }
            }
        }
        fetchSolicitudes();
    }, [showFormReciclar, setDisableShowForm, setEstadoSolicitud, setLocalizacionReciclador, setRecicladorSolicitud, setShowFormReciclar, setSolicitudAceptada, setStartTimeCountDown, userState.id_usuario]);

    useEffect(() => {
        // Obtener contenido de la página desde el backend
        const fetchTiposMateriales = async () => {
            try {
                const response = await axios.get(
                    'https://rafaeloxj.pythonanywhere.com/api/v1/tipos_materiales_activos/'
                );

                if (response.data.success) {
                    console.log(JSON.stringify(response.data.data));
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

    const handleFileChange = async (event, setFieldValue, validateField, setFieldError) => {
        const files = Array.from(event.target.files);
        if (files.length <= 3) {
            const filePreviews = files.map(file => {
                return {
                    file,
                    preview: URL.createObjectURL(file)
                };
            });
            setFilesLoads(filePreviews);
            //await setFieldValue('files', filePreviews, false);
            await setFieldValue('files', files, false);
            validateField('files'); // Valida el campo
        } else {
            setFilesLoads([]);
            await setFieldValue('files', [], false);
            setFieldError("files", "Se permiten máximo 3 fotos");
        }
    };

    const handleDrop = async (event, setFieldValue, validateField, setFieldError) => {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);
        if (files.length <= 3) {
            const filePreviews = files.map(file => {
                return {
                    file,
                    preview: URL.createObjectURL(file)
                };
            });
            setFilesLoads(filePreviews);
            await setFieldValue('files', filePreviews, false);
            validateField('files'); // Valida el campo
        } else {
            setFilesLoads([]);
            await setFieldValue('files', [], false);
            setFieldError("files", "Se permiten máximo 3 fotos");
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleScroll = (event) => {
        if (fileLoadContainerRef.current) {
            fileLoadContainerRef.current.scrollLeft += event.deltaY; //hace scroll en Y cuando se hace scroll en X
        }
        event.stopPropagation();
        event.preventDefault();
    };

    const handleChangeSelect = async (event, setFieldValue, validateField) => {
        const {
            target: { value },
        } = event;
        await setFieldValue('materiales', typeof value === 'string' ? value.split(',') : value, false);
        validateField('materiales'); // Valida el campo
    };

    React.useEffect(() => {
        const container = fileLoadContainerRef.current;
        if (container) {
            container.addEventListener('wheel', handleScroll, { passive: false });
        }

        // Cleanup file previews when component unmounts
        return () => {
            if (container) {
                container.removeEventListener('wheel', handleScroll);
            }
            filesLoads.forEach(file => URL.revokeObjectURL(file.preview));
        };
    }, [filesLoads]);

    const enviarSolicitud = async (values) => {
        const { direccion, ubicacion, materiales, files } = values;
        console.log(direccion, ubicacion, materiales, files);

        // Crear FormData para manejar archivos y otros datos
        const formData = new FormData();
        formData.append("id_usuario", userState.id_usuario);
        formData.append("direccion", direccion);
        formData.append("ubicacion", JSON.stringify(ubicacion.split(",").map(Number)));
        formData.append("materiales", materiales.map(item => item.label).join(", "));

        // Añadir los archivos a FormData
        //        files.forEach((file, index) => {
        //          formData.append(`fotos[${index}]`, file.file);
        //    });

        // Añadir los archivos a FormData uno por uno
        files.forEach((file) => {
            formData.append(`fotos[]`, file);
        });

        //formData.append("fotos[]", files);

        //console.log(formData);
        try {
            const response = await axios.post(
                'https://rafaeloxj.pythonanywhere.com/api/crear_solicitud/',
                formData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                //console.log("solicitud enviada..." + JSON.stringify(response.data));
                setShowFormReciclar(false);//oculto formulario
                setDisableShowForm(true);//inactivo boton de mostrar formulario
                const data_solicitud = response.data.data
                
                setSolicitudAceptada(data_solicitud);
                setEstadoSolicitud('P');
                
                console.log("conectando pusher solicitud_actualizada");
                // Configuración de Pusher
                const pusher = new Pusher('390cef738b8ca03faacd', {
                    cluster: 'sa1',
                    encrypted: true  // Asegura que las conexiones sean seguras
                });

                // Log para confirmar la conexión a Pusher
                pusher.connection.bind('connected', () => {
                    console.log('Conectado a Pusher!');
                });

                // Suscribirse al canal de la solicitud
                const channel = pusher.subscribe(`solicitud_${data_solicitud.id_solicitud}_channel`);

                // Manejar la recepción de la ubicación actualizada
                channel.bind('solicitud_actualizada', function (data) {
                    if (data.ubicacion_reciclador) {//cuando se cancela una solicitud no trae ubicacion
                        let ubicacion_actualizada = JSON.parse(data.ubicacion_reciclador);
                        setLocalizacionReciclador({ lat: ubicacion_actualizada[0], lng: ubicacion_actualizada[1] });
                    }
                    setEstadoSolicitud(data.estado);
                    if (data.estado === "L") {
                        let fecha_arribo = data.fecha_arribo;
                        setStartTimeCountDown(Math.floor(new Date(fecha_arribo).getTime() / 1000))
                    }
                });

                // Manejar errores en la conexión de Pusher
                pusher.connection.bind('error', (err) => {
                    console.error('Error en la conexión de Pusher:', err);
                });

                // Limpiar la suscripción cuando el componente se desmonta
                return () => {
                    channel.unbind_all();
                    channel.unsubscribe();
                };
            } else {
                console.log("Error " + response.data.error);
            }
        } catch (error) {
            console.error(error);
            console.log('Ocurrió un error al procesar la solicitud');
        }
    };

    const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];

    const schema = yup.object().shape({
        direccion: yup.string()
            .required('El campo es obligatorio'),
        ubicacion: yup.string()
            .required('El campo es obligatorio'),
        materiales: yup.array()
            .min(1, 'Debe seleccionar al menos un material'),
        files: yup.array()
            .min(1, 'Debe adjuntar al menos una foto')
            .max(3, 'Se permite máximo 3 archivos')
            .test("fileFormat", "El formato del archivo no es soportado", value => {
                return value.every(file => SUPPORTED_FORMATS.includes(file.type));
            })
    });

    return (
        <div {...props}>
            <h5 className='text-center mt-3'>Solicitar Recolección</h5>
            <Formik
                validationSchema={schema}
                onSubmit={(values, formikBag) => {
                    formikBag.validateForm().then(errors => {
                        if (Object.keys(errors).length === 0) {
                            // No hay errores de validación, los datos ingresados son válidos
                            enviarSolicitud(values);
                        }
                        formikBag.setSubmitting(false);  // Importante para indicar que la subida ha terminado
                    });
                }}
                initialValues={{ direccion: address, ubicacion: location, materiales: [], files: [] }}

            >
                {({ handleSubmit, handleChange, values, touched, errors, setFieldValue, validateField, setFieldError }) => (

                    <Form noValidate className='form-reciclar-contianer' onSubmit={(e) => { e.stopPropagation(); e.preventDefault(); handleSubmit(); }} style={{ width: "100%" }}>
                        <SyncAddressField address={address} location={location} setFieldValue={setFieldValue} />
                        <FormControl sx={{ m: 1, width: "90%" }}>
                            <TextField
                                name="direccion"
                                label="Dirección"
                                InputProps={{
                                    readOnly: true,
                                    classes: {
                                        input: 'outlined-read-only-input',
                                    }
                                }}
                                onChange={handleChange}
                                value={values.direccion}
                                error={touched.direccion && !!errors.direccion ? true : touched.direccion && !!errors.direccion}
                                helperText={errors.direccion}
                                hidden
                            />
                        </FormControl>
                        <FormControl sx={{ m: 1, width: "90%" }}>
                            <TextField
                                name="ubicacion"
                                label="Ubicación"
                                InputProps={{
                                    readOnly: true,
                                    classes: {
                                        input: 'outlined-read-only-input',
                                    }
                                }}
                                onChange={handleChange}
                                value={values.ubicacion}
                                error={touched.ubicacion && !!errors.ubicacion ? true : touched.ubicacion && !!errors.ubicacion}
                                helperText={errors.ubicacion}
                                hidden
                            />
                        </FormControl>
                        <FormControl sx={{ m: 1, width: "90%" }}>
                            <InputLabel id="demo-multiple-chip-label" className={errors.materiales ? 'Mui-error' : ''}>Tipos de materiales</InputLabel>
                            <Select
                                className={errors.materiales ? 'Mui-error' : ''}
                                name="materiales"
                                labelId="demo-multiple-chip-label"
                                id="demo-multiple-chip"
                                multiple
                                value={values.materiales}
                                onChange={(e) => {
                                    handleChangeSelect(e, setFieldValue, validateField);
                                }}
                                input={<OutlinedInput id="select-multiple-chip" label="Tipos de materiales" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => (
                                            <Chip key={value.value} label={value.label} />
                                        ))}
                                    </Box>
                                )}
                                MenuProps={MenuProps}
                                error={touched.materiales && !!errors.materiales ? true : touched.materiales && !!errors.materiales}
                            >
                                {tiposMateriales.map((_material) => (
                                    <MenuItem
                                        key={_material.value}
                                        value={_material}
                                    >
                                        {_material.label}
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText className={errors.materiales ? 'Mui-error' : ''}>{errors.materiales}</FormHelperText>
                        </FormControl>
                        <Form.Group controlId="formFileMultiple" className="mb-3" style={{ width: "90%" }}>
                            <Form.Label>Adjuntar Fotos:</Form.Label>
                            <div className="custom-file-upload">
                                <Form.Control
                                    type="file"
                                    multiple
                                    className="file-input"
                                    onChange={(e) => {
                                        handleFileChange(e, setFieldValue, validateField, setFieldError);
                                    }}
                                    hidden
                                    accept={SUPPORTED_FORMATS.join(',')}
                                />
                                <label htmlFor="formFileMultiple" className="file-upload-btn" onDrop={(e) => { handleDrop(e, setFieldValue, validateField, setFieldError); }} onDragOver={handleDragOver}><AddIcon></AddIcon></label>
                                <div className="file-loaded" ref={fileLoadContainerRef}>
                                    {filesLoads.length > 0 ? (
                                        filesLoads.map(({ file, preview }) => (
                                            <div key={file.name} className="file-preview">
                                                <img src={preview} alt={file.name} />
                                            </div>
                                        ))
                                    ) : (
                                        <div className='custom-file-upload-placeholder'>
                                            <span>No se han subido fotos</span>
                                        </div>
                                    )
                                    }
                                </div>
                            </div>
                            <FormHelperText className={errors.files ? 'Mui-error' : ''}>{errors.files}</FormHelperText>
                        </Form.Group>
                        <Form.Group className="d-flex justify-content-center w-100" controlId="formBasicButton">
                            <Button className="unFilledButton" type="submit">
                                Enviar solicitud <SendIcon />
                            </Button>
                        </Form.Group>
                    </Form>
                )}
            </Formik>
        </div >
    );
}

export function FormCancelarRececoleccion({ setShowModalCancelar }) {
    const [checkSeleccionado, setCheckSeleccionado] = useState('');
    const [sending, setSending] = useState(false);
    const { setSolicitudAceptada, solicitudAceptada, setAddressSolicitante,
        setLocalizacionReciclador, setShowFormReciclar, setDisableShowForm,
        setEstadoSolicitud, setRecicladorSolicitud, setUsuarioSolicitante,
        setStartTimeCountDown, estadoSolicitud } = useContext(ReciclarContext);
    const userState = useSelector((store) => store.user);

    const handleCancelar = async (values) => {
        setSending(true);
        try {
            const response = await axios.post(
                'https://rafaeloxj.pythonanywhere.com/api/v1/cancelar_solicitud/',
                {
                    "id_solicitud": solicitudAceptada.id_solicitud,
                    "id_usuario": userState.id_usuario,
                    "motivo": values.motivo === "Otro" ? values.otro : values.motivo,
                },
                { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
            );
            if (response.data.success) {
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
                setShowModalCancelar(false);
            } else {
                console.log("Error " + response.data.error);
                setSending(false);
            }
        } catch (e) {
            console.error(e);
            console.log('Ocurrió un error al procesar la solicitud');
            setSending(false);
        }
    };

    const handleRadioChange = (event) => {
        let selectedValue = event.target.value;
        setCheckSeleccionado(selectedValue);
    }

    const validationSchema = yup.object().shape({
        motivo: yup.string().required('Debes seleccionar al menos un motivo'),
        otro: yup.string().when('motivo', {
            is: (value) => value === 'Otro',  // Se valida el campo 'otro' solo si 'motivo' es "Otro"
            then: () => yup.string()
                .required('Debes ingresar un motivo')
                .min(10, 'El motivo debe tener al menos 10 caracteres')
                .matches(/^.{1,500}$/, "Se permite máximo 500 caracteres"),
        }),
    });

    const opcionesDefinidas = {
        [Roles.RECICLADOR]: [
            {
                "validador": "L",
                "opciones": [
                    "Demora del usuario: El usuario no estaba presente o demoró demasiado en atender la recolección."
                ]
            },
            {
                "validador": "all",//todos los estados
                "opciones": [
                    "Inaccesibilidad del domicilio: No pude llegar a la dirección indicada por algún motivo (bloqueo, falta de acceso, etc).",
                    "Material inapropiado: El material no es reciclable o no cumple con los requisitos."
                ]
            }
        ],
        [Roles.USER]: [
            {
                "validador": "L",
                "opciones": [
                    "Recolección tardía: El reciclador no llegó a tiempo o se retrasó demasiado."
                ]
            },
            {
                "validador": "all",//todos los estados
                "opciones": [
                    "Cambio de planes: Decidí no reciclar en este momento.",
                    "Inseguridad: No me sentí cómodo con el reciclador o la situación en general."
                ]
            }
        ]
    }
    return (
        <Formik
            validationSchema={validationSchema}
            onSubmit={(values, formikBag) => {
                formikBag.validateForm().then(errors => {
                    if (Object.keys(errors).length === 0) {
                        // No hay errores de validación, los datos ingresados son válidos
                        handleCancelar(values)
                    }
                    formikBag.setSubmitting(false);  // Importante para indicar que la subida ha terminado
                });
            }}
            initialValues={{
                motivo: '',
                otro: ''
            }}
        >
            {({ handleSubmit, handleChange, handleBlur, resetForm, touched, errors, values }) => (
                <Form noValidate onSubmit={(e) => { e.stopPropagation(); e.preventDefault(); handleSubmit(); }}>
                    <Form.Label>Seleccione un motivo:</Form.Label>
                    <Form.Group className="mb-3">
                        <Form.Control.Feedback type="invalid" style={errors.motivo ? { display: "block" } : { display: "none" }}>{errors.motivo}</Form.Control.Feedback>
                        {opcionesDefinidas[userState.rol] && opcionesDefinidas[userState.rol].length > 0 &&
                            opcionesDefinidas[userState.rol].map((value, index) => {
                                if (value.validador === estadoSolicitud || value.validador === "all") {
                                    return value.opciones.map((opcion, indexOpt) => (
                                        <Form.Check
                                            className="flex-grow-1 mb-3"
                                            inline
                                            label={opcion}
                                            name="motivo"
                                            type="radio"
                                            id={"inline-radio" + index + "-" + indexOpt}
                                            value={opcion}
                                            onChange={(e) => {
                                                handleChange(e);
                                                handleRadioChange(e);
                                            }}
                                        />
                                    ));
                                }
                                return null; // Si no cumple la condición, no renderiza nada
                            })
                        }
                        <Form.Check
                            className="flex-grow-1 mb-3"
                            inline
                            label="Otro."
                            name="motivo"
                            type="radio"
                            id="inline-radio-otro"
                            value="Otro"
                            onChange={(e) => {
                                handleChange(e);
                                handleRadioChange(e);
                            }}
                        />
                    </Form.Group>
                    {checkSeleccionado === "Otro" &&
                        <Form.Group className="mb-3" controlId="formBasicDireccion" >
                            <FloatingLabel controlId="formBasicDireccion" label="Ingrese el motivo" style={{ color: "gray" }}>
                                <Form.Control
                                    as="textarea"
                                    placeholder=""
                                    name="otro"
                                    type="textarea"
                                    maxLength={500}
                                    onInput={handleBlur}
                                    onChange={handleChange}
                                    value={values.otro}
                                    isInvalid={touched.otro && !!errors.otro}
                                    isValid={touched.otro && !errors.otro}
                                    style={{ height: "100px" }}
                                />
                                <Form.Control.Feedback type="invalid">{errors.otro}</Form.Control.Feedback>
                            </FloatingLabel>
                        </Form.Group>
                    }
                    <div className='d-flex justify-content-around'>
                        <Form.Group className="mb-3" controlId="formBasicButton" style={{ width: "45%" }}>
                            <Button type="submit" className="filledButton w-100" disabled={sending}>
                                Enviar {sending && <BorderSpinnerBasic style={{ width: "1rem", height: "1rem" }} />}
                            </Button>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicButton" style={{ width: "45%" }}>
                            <Button className="unFilledButton w-100" type="button" onClick={() => setShowModalCancelar(false)} disabled={sending}>
                                Cancelar
                            </Button>
                        </Form.Group>
                    </div>
                </Form>)
            }
        </Formik >
    );
}