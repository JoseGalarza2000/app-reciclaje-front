import { TittleModal, Select, FaEyeSlashIcon, FaEyeIcon, InputGroupBtnInField } from './styledComponents';
import { Row, Col, Form, Container, Alert, FloatingLabel, InputGroup, Button, Modal } from 'react-bootstrap';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as formik from 'formik';
import { SelectWithSearchFormik } from './searchCombo';
import * as yup from 'yup';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from 'react-redux';
import { createUser, updateUser } from '../redux/states/user';
import { BorderSpinnerBasic } from './loadingSpinner';
import { FormControl, FormHelperText, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import { CentrosAcopioContext } from './centrosAcopioContext';
import Roles from '../models/roles';
import { useAlert } from './alertContext';

//CONSTANTES GLOBALES
//permite solo ingreso de números
const handleInputOnlyNumber = (event) => {
    const inputValue = event.target.value;

    // Permitir solo números
    const validInput = /^[0-9]+$/.test(inputValue);

    if (!validInput) {
        // Si la entrada no es válida, eliminar el último carácter
        event.target.value = inputValue.slice(0, -1);
    }
};

//permite solo ingreso de letras
const handleInputOnlyLetters = (event) => {
    const inputValue = event.target.value;

    // Permitir solo letras (mayúsculas o minúsculas), la letra "ñ", espacios y vocales con tilde
    const validInput = /^[A-Za-zÑñÁáÉéÍíÓóÚúÜü ]+$/.test(inputValue);

    if (!validInput) {
        // Si la entrada no es válida, eliminar el último carácter
        event.target.value = inputValue.slice(0, -1);
    }
};

//validaciones generales campos formularios
const formValidations = {
    date18: yup.date()
        .required('El campo es obligatorio')
        .test('is-adult', 'Debes ser mayor de 18 años', function (value) {
            const today = new Date();
            const minDate = new Date(today);
            minDate.setFullYear(today.getFullYear() - 18);
            return value <= minDate;
        }),
    email: yup.string()
        .matches(/^[^@]+@[^@]+\.[a-zA-Z]{2,}$/, 'El correo electrónico ingresado no es válido')
        .required('El campo es obligatorio')
        .matches(/^.{1,100}$/, "Se permite máximo 100 caracteres"),
    text: yup.string()
        .matches(/^[A-Za-zÑñÁáÉéÍíÓóÚúÜü]+(?: [A-Za-zÑñÁáÉéÍíÓóÚúÜü]+)*$/, 'Ingrese un texto válido')
        .matches(/^.{1,50}$/, "Se permite máximo 50 caracteres")
        .required('El campo es obligatorio'),
    textarea: yup.string()
        .matches(/^.{1,500}$/, "Se permite máximo 500 caracteres")
        .required('El campo es obligatorio'),
    textarea250: yup.string()
        .matches(/^.{1,500}$/, "Se permite máximo 250 caracteres")
        .required('El campo es obligatorio'),
    select: yup
        .string()
        .required("El campo es obligatorio")
        .notOneOf([""], "Debe seleccionar una opción válida"),
    number10: yup.string()
        .matches(/^[0-9]+$/, 'Solo se aceptan valores numéricos')
        .matches(/^\d{10}$/, 'Debe tener 10 dígitos')
        .matches(/^.{1,10}$/, "Se permite máximo 10 dígitos")
        .required('El campo es obligatorio'),
    number13: yup.string()
        .matches(/^[0-9]+$/, 'Solo se aceptan valores numéricos')
        .matches(/^\d{13}$/, 'Debe tener 13 dígitos')
        .matches(/^.{1,13}$/, "Se permite máximo 13 dígitos")
        .required('El campo es obligatorio'),
    password: yup.string()
        .required("La contraseña es obligatoria")
        .matches(/^.{8,20}$/, "La contraseña debe tener entre 8 y 20 caracteres")
        .matches(/^.{1,20}$/, "Se permite máximo 20 caracteres"),
    url: yup.string()
        .url('La URL ingresada no es válida')
};
//

function LoginForm({ handleTypeFormStateSignUp }) {
    const { Formik } = formik;
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [sending, setSending] = useState(false);

    // Utiliza useNavigate en lugar de useHistory
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogin = async (values) => {
        const { email, password } = values;
        setSending(true);
        try {
            const response = await axios.post(
                'https://rafaeloxj.pythonanywhere.com/api/v1/login_view/',
                { "correo": email, "clave": password },
                { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
            );
            if (response.data.success) {
                setError('');
                const user_data = response.data.data;
                dispatch(createUser({ ...user_data }));
                setSending(false);
                navigate('/');
            } else {
                setError(response.data.error);
                setSending(false);
            }
        } catch (error) {
            console.error(error);
            setError('Ocurrió un error al procesar la solicitud');
            setSending(false);
        }
    };

    // Este efecto oculta la alerta de error después de 4 segundos
    useEffect(() => {
        const hideErrorTimeout = setTimeout(() => {
            setError(false);
        }, 4000);

        return () => clearTimeout(hideErrorTimeout);
    }, [error]);

    const schema = yup.object().shape({
        email: formValidations["email"],
        password: formValidations["password"]
    });

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Formik
            validationSchema={schema}
            onSubmit={(values, formikBag) => {
                formikBag.validateForm().then(errors => {
                    if (Object.keys(errors).length === 0) {
                        // No hay errores de validación, los datos ingresados son válidos
                        handleLogin(values);
                    }
                    formikBag.setSubmitting(false);  // Importante para indicar que la subida ha terminado
                });
            }}
            initialValues={{ email: '', password: '' }}
        >
            {({ handleSubmit, handleChange, values, handleBlur, touched, errors }) => (
                <Form noValidate onSubmit={(e) => { e.stopPropagation(); e.preventDefault(); handleSubmit(); }}>
                    {error &&
                        <Alert key="danger" variant="danger">
                            {error}
                        </Alert>}
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <FloatingLabel controlId="floatingEmail" label="Correo electrónico" style={{ color: "gray" }}>
                            <Form.Control
                                name="email"
                                type="text"
                                placeholder="Correo"
                                maxLength={100}
                                onInput={handleBlur}
                                onChange={handleChange}
                                isInvalid={touched.email && !!errors.email}
                                isValid={touched.email && !errors.email}
                            />
                            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                        </FloatingLabel>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <InputGroup>
                            <FloatingLabel controlId="floatingPassword" label="Contraseña" style={{ color: "gray" }}>
                                <Form.Control
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Contraseña"
                                    maxLength={20}
                                    onInput={handleBlur}
                                    onChange={handleChange}
                                    isInvalid={touched.password && !!errors.password}
                                    isValid={touched.password && !errors.password}
                                />
                            </FloatingLabel>
                            <InputGroupBtnInField>
                                <FontAwesomeIcon style={{ cursor: "pointer" }} onClick={togglePasswordVisibility} icon={showPassword ? FaEyeIcon : FaEyeSlashIcon} />
                            </InputGroupBtnInField>
                        </InputGroup>
                        <Form.Control.Feedback style={{ display: touched.password && errors.password ? "block" : "none" }} type="invalid">{errors.password}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicButton">
                        <a href="/sss" className=''>¿olvidaste tu contraseña?</a>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicButton">
                        <Button type="submit" className="w-100 filledButton" disabled={sending}>
                            Iniciar Sesión {sending && <BorderSpinnerBasic style={{ width: "1rem", height: "1rem" }} />}
                        </Button>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicButton">
                        <Button className="unFilledButton w-100" type="button" onClick={handleTypeFormStateSignUp} disabled={sending}>
                            ¿Necesitas una cuenta?
                        </Button>
                    </Form.Group>
                </Form>
            )}
        </Formik>
    );

}


function schemaSignUp(typeUser) {
    if (typeUser === "ciudadano") {
        return yup.object().shape({
            firstName: formValidations["text"],
            lastName: formValidations["text"],
            cedula: formValidations["number10"],
            fecha_nac: formValidations["date18"],
            provincia: formValidations["select"],
            ciudad: formValidations["select"],
            direccion: formValidations["textarea"],
            telephone: formValidations["number10"],
            genero: formValidations["select"],
            email: formValidations["email"],
            password: yup.string()
                .required("La contraseña es obligatoria")
                .matches(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[._@$!%*?&])[A-Za-z\d._@$!%*?&]{8,20}$/,
                    '*La contraseña debe tener entre 8 y 20 caracteres.<br/>*Debe tener al menos un número.<br/>*Debe tener al menos una letra mayúscula.<br/>*Debe tener al menos una letra minúscula.<br/>*Debe tener al menos uno de los siguientes caracteres (._@$!%*?&).'
                )
                .matches(/^.{1,20}$/, "Se permite máximo 20 caracteres"),
            passwordRepeat: yup.string()
                .required('Debes confirmar la contraseña')
                .oneOf([yup.ref('password'), null], 'Las contraseñas deben coincidir')
                .matches(/^.{1,20}$/, "Se permite máximo 20 caracteres"),
        });
    } else if (typeUser === "reciclador") {
        return yup.object().shape({
            firstName: formValidations["text"],
            lastName: formValidations["text"],
            cedula: formValidations["number10"],
            userOrg: formValidations["select"],
            fecha_nac: formValidations["date18"],
            provincia: formValidations["select"],
            ciudad: formValidations["select"],
            direccion: formValidations["textarea"],
            telephone: formValidations["number10"],
            email: formValidations["email"],
            genero: formValidations["select"],
            password: yup.string()
                .required("La contraseña es obligatoria")
                .matches(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[._@$!%*?&])[A-Za-z\d._@$!%*?&]{8,20}$/,
                    '*La contraseña debe tener entre 8 y 20 caracteres.<br/>*Debe tener al menos un número.<br/>*Debe tener al menos una letra mayúscula.<br/>*Debe tener al menos una letra minúscula.<br/>*Debe tener al menos uno de los siguientes caracteres (._@$!%*?&).'
                )
                .matches(/^.{1,20}$/, "Se permite máximo 20 caracteres"),
            passwordRepeat: yup.string()
                .required('Debes confirmar la contraseña')
                .oneOf([yup.ref('password'), null], 'Las contraseñas deben coincidir')
                .matches(/^.{1,20}$/, "Se permite máximo 20 caracteres"),
        });
    } else if (typeUser === "organizacion") {
        return yup.object().shape({
            nameOrg: formValidations["text"],
            rucOrg: formValidations["number13"],
            repOrg: formValidations["number10"],
            nameRepOrg: formValidations["text"],
            provincia: formValidations["select"],
            ciudad: formValidations["select"],
            direccion: formValidations["textarea"],
            telephone: formValidations["number10"],
            email: formValidations["email"],
            password: yup.string()
                .required("La contraseña es obligatoria")
                .matches(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[._@$!%*?&])[A-Za-z\d._@$!%*?&]{8,20}$/,
                    '*La contraseña debe tener entre 8 y 20 caracteres.<br/>*Debe tener al menos un número.<br/>*Debe tener al menos una letra mayúscula.<br/>*Debe tener al menos una letra minúscula.<br/>*Debe tener al menos uno de los siguientes caracteres (._@$!%*?&).'
                )
                .matches(/^.{1,20}$/, "Se permite máximo 20 caracteres"),
            passwordRepeat: yup.string()
                .required('Debes confirmar la contraseña')
                .oneOf([yup.ref('password'), null], 'Las contraseñas deben coincidir')
                .matches(/^.{1,20}$/, "Se permite máximo 20 caracteres"),
        });
    }
}

function SignUpForm({ handleTypeFormStateLogin }) {
    const { Formik } = formik;
    const [error, setError] = useState('');
    const [typeUserSignUp, setTypeUserSignUp] = useState('ciudadano');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordRepeat, setShowPasswordRepeat] = useState(false);
    const [opcionesComboCiudad, setOpcionesComboCiudad] = useState([]);
    const [optionsSearch, setOptionsSearch] = useState([]);
    const [arrayLocalidades, setArrayLocalidades] = useState([]);
    const [sending, setSending] = useState(false);
    const { showAlert } = useAlert();

    // Fetch para opciones de usuario-empresa
    const fetchOptionsSearch = async () => {
        try {
            const response = await axios.get(
                'https://rafaeloxj.pythonanywhere.com/api/v1/usuarios-empresa/'
            );
            const array = response.data;
            const formattedOptions = array.map(x => ({
                value: x.id_empresa,
                label: `${x.razon_social} - ${x.ruc}`,
            }));
            setOptionsSearch(formattedOptions); // Actualiza el estado con las opciones formateadas
        } catch (error) {
            console.error('Error al realizar la solicitud de usuarios-empresa:', error);
            setError('Error al cargar las opciones de empresas.');
        }
    };

    // Fetch para territorios
    const fetchLocalidades = async () => {
        try {
            const response = await axios.get(
                'https://rafaeloxj.pythonanywhere.com/api/v1/territorios/'
            );
            setArrayLocalidades(response.data.data); // Actualiza el estado con las localidades
        } catch (error) {
            console.error('Error al realizar la solicitud de territorios:', error);
            setError('Error al cargar las localidades.');
        }
    };

    // useEffect para cargar datos al montar el componente
    useEffect(() => {
        fetchOptionsSearch(); // Cargar usuarios-empresa
        fetchLocalidades();  // Cargar territorios
    }, []);

    const handleChangeComboProvincia = async (provinciaId, setFieldValue, setTouched, validateField, touched) => {
        if (!provinciaId) {
            setOpcionesComboCiudad([]);  // Limpiar opciones de ciudad
            if (setFieldValue) {
                // Limpiar el valor de ciudad
                await setFieldValue('ciudad', "", true);
                // Marcar como tocado para mostrar el error
                setTouched({
                    ...touched,
                    ciudad: true,
                    provincia: true,
                });
                // Validar el campo 'ciudad'
                await validateField('ciudad');
            }
            return;
        }

        const opcionesFiltradas = arrayLocalidades.filter(option =>
            option.id_nivel_territorial === 3 && option.id_territorio_padre === parseInt(provinciaId)
        );
        setOpcionesComboCiudad(opcionesFiltradas);  // Actualizar las opciones del combo ciudad

        if (setFieldValue) {
            // Limpiar el valor de ciudad
            await setFieldValue('ciudad', "", true);
            // Marcar como tocado para mostrar el error
            setTouched({
                ...touched,
                ciudad: true,
                provincia: true,
            });
            // Validar el campo 'ciudad'
            await validateField('ciudad');
        }
    };

    const handleSignUp = async (values, event) => {
        setSending(true);
        if (typeUserSignUp === "ciudadano") {
            const { firstName, lastName, cedula, telephone, email, password,
                provincia, ciudad, direccion, fecha_nac, genero } = values;

            const json = {
                "nombres": firstName,
                "apellidos": lastName,
                "provincia": provincia,
                "ciudad": ciudad,
                "direccion": direccion,
                "fec_nac": fecha_nac,
                "genero": genero,
                "telefono": telephone,
                "cedula": cedula,
                "url_foto": (genero === "M" ? "https://rafaeloxj.pythonanywhere.com/imagenes/default-male-avatar.jpg" : "https://rafaeloxj.pythonanywhere.com/imagenes/default-female-avatar.jpg"),
                "correo": email,
                "clave": password,
            }
            //console.log(json)
            try {
                const response = await axios.post(
                    'https://rafaeloxj.pythonanywhere.com/api/v1/registro_persona/',
                    json,
                    { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
                );
                if (response.data.success) {
                    setError('');
                    setSending(false);
                    handleTypeFormStateLogin();
                    showAlert(`Se envió un correo de confrimación a ${email}, por favor valide su correo.`);
                } else {
                    setError(response.data.error);
                    setSending(false);
                }
            } catch (error) {
                setError('Ocurrió un error al procesar la solicitud');
                setSending(false);
            }
        } else if (typeUserSignUp === "reciclador") {
            const { firstName, lastName, cedula, fecha_nac, userOrg, telephone, email, password,
                provincia, ciudad, direccion, genero } = values;

            const json = {
                "nombres": firstName,
                "apellidos": lastName,
                "cedula": cedula,
                "fec_nac": fecha_nac,
                "id_empresa": userOrg,
                "provincia": provincia,
                "ciudad": ciudad,
                "direccion": direccion,
                "telefono": telephone,
                "calificacion_reciclador": 0,
                "genero": genero,
                "url_foto": (genero === "M" ? "https://rafaeloxj.pythonanywhere.com/imagenes/default-male-avatar.jpg" : "https://rafaeloxj.pythonanywhere.com/imagenes/default-female-avatar.jpg"),
                "nacionalidad": "Ecuatoriana",
                "correo": email,
                "clave": password,
            }
            try {
                const response = await axios.post(
                    'https://rafaeloxj.pythonanywhere.com/api/v1/registro_reciclador/',
                    json,
                    { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
                );
                if (response.data.success) {
                    setError('');
                    setSending(false);
                    handleTypeFormStateLogin();
                    showAlert(`Se envió un correo de confrimación a ${email}, por favor valide su correo.`);
                } else {
                    setError(response.data.error);
                    setSending(false);

                }
            } catch (error) {
                setError('Ocurrió un error al procesar la solicitud');
                setSending(false);
            }
        } else if (typeUserSignUp === "organizacion") {
            const { nameOrg, rucOrg, repOrg, nameRepOrg, telephone, email, password,
                provincia, ciudad, direccion } = values;
            const json = {
                "ruc": rucOrg,
                "razon_social": nameOrg,
                "ced_rep_legal": repOrg,
                "nom_rep_legal": nameRepOrg,
                "actividad_comercial": "idk",
                "provincia": provincia,
                "ciudad": ciudad,
                "direccion": direccion,
                "telefono": telephone,
                "redes": {},
                "url_foto": "https://rafaeloxj.pythonanywhere.com/imagenes/default-org-avatar.jpg",
                "correo": email,
                "clave": password,
            }

            try {
                const response = await axios.post(
                    'https://rafaeloxj.pythonanywhere.com/api/v1/registro_empresa/',
                    json,
                    { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
                );
                if (response.data.success) {
                    setError('');
                    setSending(false);
                    handleTypeFormStateLogin();
                    showAlert(`Se envió un correo de confrimación a ${email}, por favor valide su correo.`);
                } else {
                    setError(response.data.error);
                    setSending(false);
                }
            } catch (error) {
                setError('Ocurrió un error al procesar la solicitud');
                setSending(false);
            }
        }
    };

    // Este efecto simula el cambio inicial llamando a handleRadioChange
    useEffect(() => {
        handleInitialRadioChange();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Función para manejar el cambio inicial del radio
    const handleInitialRadioChange = () => {
        handleRadioChange({
            target: {
                value: typeUserSignUp,
            },
        });
    };

    const handleRadioChange = (event) => {
        let selectedValue = event.target.value;
        setTypeUserSignUp(selectedValue);
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const togglePasswordRepeatVisibility = () => {
        setShowPasswordRepeat(!showPasswordRepeat);
    };

    return (
        <Formik
            validationSchema={schemaSignUp(typeUserSignUp)}
            onSubmit={(values, formikBag) => {
                formikBag.validateForm().then(errors => {
                    if (Object.keys(errors).length === 0) {
                        // No hay errores de validación, los datos ingresados son válidos
                        handleSignUp(values);
                        //console.log(values);
                    }
                    formikBag.setSubmitting(false);  // Importante para indicar que la subida ha terminado
                });
            }}
            initialValues={
                {
                    firstName: '',
                    lastName: '',
                    cedula: '',
                    nameOrg: '',
                    rucOrg: '',
                    repOrg: '',
                    nameRepOrg: '',
                    userOrg: '',
                    telephone: '',
                    provincia: '',
                    ciudad: '',
                    direccion: '',
                    fecha_nac: '',
                    email: '',
                    password: '',
                    passwordRepeat: '',
                    genero: '',
                }}
        >
            {({ handleSubmit, handleChange, handleBlur, resetForm, touched, errors, values, setFieldValue, setTouched, validateField }) => (
                <Form noValidate onSubmit={(e) => { e.stopPropagation(); e.preventDefault(); handleSubmit(); }}>
                    {error &&
                        <Alert key="danger" variant="danger">
                            {error}
                        </Alert>}
                    <Form.Label>Tipo de usuario:</Form.Label>
                    <Form.Group className="mb-3 d-flex flex-column flex-md-row">
                        <Form.Check
                            inline
                            label="Ciudadano"
                            name="typeUser"
                            type="radio"
                            id="inline-radio-1"
                            value="ciudadano"
                            checked={typeUserSignUp === 'ciudadano'}
                            onChange={(e) => {
                                resetForm();
                                handleRadioChange(e);
                            }}
                            className="flex-grow-1"
                        />
                        <Form.Check
                            className="flex-grow-1"
                            inline
                            label="Reciclador"
                            name="typeUser"
                            type="radio"
                            id="inline-radio-2"
                            value="reciclador"
                            checked={typeUserSignUp === 'reciclador'}
                            onChange={(e) => {
                                resetForm();
                                handleRadioChange(e);
                            }}
                        />
                        <Form.Check
                            className="flex-grow-1"
                            inline
                            label="Organización"
                            name="typeUser"
                            type="radio"
                            id="inline-radio-3"
                            value="organizacion"
                            checked={typeUserSignUp === 'organizacion'}
                            onChange={(e) => {
                                resetForm();
                                handleRadioChange(e);
                            }}
                        />
                    </Form.Group>
                    {typeUserSignUp === "organizacion" ?
                        (
                            <>
                                <Form.Group className="mb-3" controlId="formBasicRucOrg">
                                    <FloatingLabel controlId="floatingRucOrg" label="RUC de la organización" style={{ color: "gray" }}>
                                        <Form.Control
                                            name="rucOrg"
                                            type="text"
                                            placeholder="RUC de la organización"
                                            maxLength={13}
                                            onInput={(e) => {
                                                handleInputOnlyNumber(e);
                                                handleBlur(e);
                                            }}
                                            onChange={handleChange}
                                            value={values.rucOrg}
                                            isInvalid={touched.rucOrg && !!errors.rucOrg}
                                            isValid={touched.rucOrg && !errors.rucOrg}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.rucOrg}</Form.Control.Feedback>
                                    </FloatingLabel>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formBasicNameOrg">
                                    <FloatingLabel controlId="floatingNameOrg" label="Nombre de la organización" style={{ color: "gray" }}>
                                        <Form.Control
                                            name="nameOrg"
                                            type="text"
                                            placeholder="Nombre de la organización"
                                            maxLength={50}
                                            onInput={(e) => {
                                                handleInputOnlyLetters(e);
                                                handleBlur(e);
                                            }}
                                            onChange={handleChange}
                                            value={values.nameOrg}
                                            isInvalid={touched.nameOrg && !!errors.nameOrg}
                                            isValid={touched.nameOrg && !errors.nameOrg}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.nameOrg}</Form.Control.Feedback>
                                    </FloatingLabel>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formBasicRepOrg">
                                    <FloatingLabel controlId="floatingRepOrg" label="Cédula del representante legal" style={{ color: "gray" }}>
                                        <Form.Control
                                            name="repOrg"
                                            type="text"
                                            placeholder="Cédula representante legal"
                                            maxLength={10}
                                            onInput={(e) => {
                                                handleInputOnlyNumber(e);
                                                handleBlur(e);
                                            }}
                                            onChange={handleChange}
                                            value={values.repOrg}
                                            isInvalid={touched.repOrg && !!errors.repOrg}
                                            isValid={touched.repOrg && !errors.repOrg}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.repOrg}</Form.Control.Feedback>
                                    </FloatingLabel>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formBasicNameRepOrg">
                                    <FloatingLabel controlId="floatingNameRepOrg" label="Nombres del representante legal" style={{ color: "gray" }}>
                                        <Form.Control
                                            name="nameRepOrg"
                                            type="text"
                                            placeholder="Nombres del representante legal"
                                            maxLength={50}
                                            onInput={(e) => {
                                                handleInputOnlyLetters(e);
                                                handleBlur(e);
                                            }}
                                            onChange={handleChange}
                                            value={values.nameRepOrg}
                                            isInvalid={touched.nameRepOrg && !!errors.nameRepOrg}
                                            isValid={touched.nameRepOrg && !errors.nameRepOrg}
                                        />
                                        <Form.Control.Feedback type="invalid">{errors.nameRepOrg}</Form.Control.Feedback>
                                    </FloatingLabel>
                                </Form.Group>
                            </>
                        ) :
                        <>
                            <Form.Group className="mb-3" controlId="formBasicNames">
                                <FloatingLabel controlId="floatingNames" label="Nombres" style={{ color: "gray" }} >
                                    <Form.Control
                                        name="firstName"
                                        type="text"
                                        placeholder="Nombres"
                                        maxLength={50}
                                        onInput={(e) => {
                                            handleInputOnlyLetters(e);
                                            handleBlur(e);
                                        }}
                                        onChange={handleChange}
                                        value={values.firstName}
                                        isInvalid={touched.firstName && !!errors.firstName}
                                        isValid={touched.firstName && !errors.firstName}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
                                </FloatingLabel>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicLastNames" >
                                <FloatingLabel controlId="floatingLastNames" label="Apellidos" style={{ color: "gray" }}>
                                    <Form.Control
                                        name="lastName"
                                        type="text"
                                        placeholder="Apellidos"
                                        maxLength={50}
                                        onInput={(e) => {
                                            handleInputOnlyLetters(e);
                                            handleBlur(e);
                                        }}
                                        onChange={handleChange}
                                        value={values.lastName}
                                        isInvalid={touched.lastName && !!errors.lastName}
                                        isValid={touched.lastName && !errors.lastName}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
                                </FloatingLabel>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicCedula" >
                                <FloatingLabel controlId="formBasicCedula" label="Cédula" style={{ color: "gray" }}>
                                    <Form.Control
                                        name="cedula"
                                        type="text"
                                        placeholder="Cédula"
                                        maxLength={10}
                                        onInput={(e) => {
                                            handleInputOnlyNumber(e);
                                            handleBlur(e);
                                        }}
                                        onChange={handleChange}
                                        value={values.cedula}
                                        isInvalid={touched.cedula && !!errors.cedula}
                                        isValid={touched.cedula && !errors.cedula}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.cedula}</Form.Control.Feedback>
                                </FloatingLabel>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicFechaNacimiento" >
                                <FloatingLabel controlId="formBasicFechaNacimiento" label="Fecha de nacimiento" style={{ color: "gray" }}>
                                    <Form.Control
                                        name="fecha_nac"
                                        type="date"
                                        placeholder="Fecha de nacimiento"
                                        onInput={handleBlur}
                                        onChange={handleChange}
                                        value={values.fecha_nac}
                                        isInvalid={touched.fecha_nac && !!errors.fecha_nac}
                                        isValid={touched.fecha_nac && !errors.fecha_nac}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.fecha_nac}</Form.Control.Feedback>
                                </FloatingLabel>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicGenero">
                                <Form.Label>Sexo:</Form.Label>
                                <Select
                                    aria-label="Default select example"
                                    name="genero"
                                    onChange={(e) => { handleBlur(e); handleChange(e); }}
                                    value={values.genero}
                                    isInvalid={touched.genero && !!errors.genero}
                                    isValid={touched.genero && !errors.genero}
                                >
                                    <option value="">Seleccione una opción</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                </Select>
                                <Form.Control.Feedback type="invalid">{errors.genero}</Form.Control.Feedback>
                            </Form.Group>
                            {typeUserSignUp === "reciclador" &&
                                (<Form.Group className="mb-3" controlId="formBasicUserOrg">
                                    <Form.Label>Organización a la que pertenece:</Form.Label>
                                    <SelectWithSearchFormik
                                        options={optionsSearch}
                                        placeholder="Ingrese RUC o Razón Social"
                                        name="userOrg"
                                        emptyText="No se encontro la organización"
                                        isInvalid={touched.userOrg && !!errors.userOrg}
                                        isValid={touched.userOrg && !errors.userOrg}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.userOrg}</Form.Control.Feedback>
                                </Form.Group>)
                            }
                        </>
                    }
                    <Form.Group className="mb-3" controlId="formBasicProvincia">
                        <Form.Label>Provincia:</Form.Label>
                        <Select
                            aria-label="Provincia"
                            name="provincia"
                            onChange={(e) => { handleChangeComboProvincia(e.target.value, setFieldValue, setTouched, validateField, touched); handleChange(e); validateField("provincia") }}
                            value={values.provincia}
                            isInvalid={touched.provincia && !!errors.provincia}
                            isValid={touched.provincia && !errors.provincia}
                        >
                            <option value="">Seleccione una opción</option>
                            {arrayLocalidades.map(option => (
                                option.id_nivel_territorial === 2 && (
                                    <option key={option.id_territorio} value={option.id_territorio}>{option.descripcion}</option>
                                )
                            ))}
                        </Select>
                        <Form.Control.Feedback type="invalid">{errors.provincia}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicCiudad">
                        <Form.Label>Ciudad:</Form.Label>
                        <Select
                            aria-label="Ciudad"
                            name="ciudad"
                            onChange={(e) => { handleBlur(e); handleChange(e); }}
                            value={values.ciudad}
                            isInvalid={touched.ciudad && !!errors.ciudad}
                            isValid={touched.ciudad && !errors.ciudad}
                        >
                            <option value="">Seleccione una opción</option>
                            {opcionesComboCiudad.map(option => (
                                <option key={option.id_territorio} value={option.id_territorio}>{option.descripcion}</option>
                            ))}
                        </Select>
                        <Form.Control.Feedback type="invalid">{errors.ciudad}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicDireccion" >
                        <FloatingLabel controlId="formBasicDireccion" label="Dirección" style={{ color: "gray" }}>
                            <Form.Control
                                as="textarea"
                                placeholder=""
                                name="direccion"
                                type="textarea"
                                onInput={handleBlur}
                                onChange={handleChange}
                                value={values.direccion}
                                isInvalid={touched.direccion && !!errors.direccion}
                                isValid={touched.direccion && !errors.direccion}
                                style={{ height: "100px" }}
                            />
                            <Form.Control.Feedback type="invalid">{errors.direccion}</Form.Control.Feedback>
                        </FloatingLabel>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicTelephone">
                        <FloatingLabel controlId="floatingThelephone" label="Teléfono" style={{ color: "gray" }}>
                            <Form.Control
                                name="telephone"
                                type="text"
                                placeholder="Teléfono"
                                onInput={(e) => {
                                    handleInputOnlyNumber(e);
                                    handleBlur(e);
                                }}
                                maxLength={10}
                                onChange={handleChange}
                                value={values.telephone}
                                isInvalid={touched.telephone && !!errors.telephone}
                                isValid={touched.telephone && !errors.telephone}
                            />
                            <Form.Control.Feedback type="invalid">{errors.telephone}</Form.Control.Feedback>
                        </FloatingLabel>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <FloatingLabel controlId="floatingEmail" label="Correo electrónico" style={{ color: "gray" }}>
                            <Form.Control
                                name="email"
                                type="email"
                                placeholder="Correo"
                                onInput={handleBlur}
                                onChange={handleChange}
                                maxLength={100}
                                value={values.email}
                                isInvalid={touched.email && !!errors.email}
                                isValid={touched.email && !errors.email}
                            />
                            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                        </FloatingLabel>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicPasswordSignUp">
                        <InputGroup>
                            <FloatingLabel controlId="floatingPasswordSignUp" label="Contraseña" style={{ color: "gray" }}>
                                <Form.Control
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Contraseña"
                                    maxLength={20}
                                    onInput={handleBlur}
                                    onChange={handleChange}
                                    value={values.password}
                                    isInvalid={touched.password && !!errors.password}
                                    isValid={touched.password && !errors.password}
                                />
                            </FloatingLabel>
                            <InputGroupBtnInField>
                                <FontAwesomeIcon style={{ cursor: "pointer" }} onClick={togglePasswordVisibility} icon={showPassword ? FaEyeIcon : FaEyeSlashIcon} />
                            </InputGroupBtnInField>
                        </InputGroup>
                        <Form.Control.Feedback style={{ display: touched.password && errors.password ? "block" : "none" }} type="invalid"><div dangerouslySetInnerHTML={{ __html: errors.password }} /></Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicPasswordSignUpRepeat">
                        <InputGroup>
                            <FloatingLabel controlId="floatingPasswordSignUpRepeat" label="Repetir contraseña" style={{ color: "gray" }}>
                                <Form.Control
                                    name="passwordRepeat"
                                    type={showPasswordRepeat ? 'text' : 'password'}
                                    placeholder="Repetir contraseña"
                                    maxLength={20}
                                    onInput={handleBlur}
                                    onChange={handleChange}
                                    value={values.passwordRepeat}
                                    isInvalid={touched.passwordRepeat && !!errors.passwordRepeat}
                                    isValid={touched.passwordRepeat && !errors.passwordRepeat}
                                />
                            </FloatingLabel>
                            <InputGroupBtnInField>
                                <FontAwesomeIcon style={{ cursor: "pointer" }} onClick={togglePasswordRepeatVisibility} icon={showPasswordRepeat ? FaEyeIcon : FaEyeSlashIcon} />
                            </InputGroupBtnInField>
                        </InputGroup>
                        <Form.Control.Feedback style={{ display: touched.passwordRepeat && errors.passwordRepeat ? "block" : "none" }} type="invalid">{errors.passwordRepeat}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicButton">
                        <Button type="submit" className="filledButton w-100" disabled={sending}>
                            Registrarse {sending && <BorderSpinnerBasic style={{ width: "1rem", height: "1rem" }} />}
                        </Button>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicButton">
                        <Button className="unFilledButton w-100" type="button" onClick={handleTypeFormStateLogin} disabled={sending}>
                            ¿Ya tienes una cuenta?
                        </Button>
                    </Form.Group>
                </Form>)}
        </Formik>
    );
}


export function Forms({ typeForm, titleForm }) {
    const [typeFormState, setTypeFormState] = useState(typeForm);
    const [titleFormShow, setTitleFormShow] = useState(titleForm);

    const handleTypeFormStateSignUp = () => {
        setTypeFormState("signUp");
        setTitleFormShow("Registrarse");
    }

    const handleTypeFormStateLogin = () => {
        setTypeFormState("login");
        setTitleFormShow("Iniciar Sesión");
    }



    let formToShow;
    if (typeFormState === "login") {
        formToShow = <LoginForm handleTypeFormStateSignUp={handleTypeFormStateSignUp} ></LoginForm>;
    } else if (typeFormState === "signUp") {
        formToShow = <SignUpForm handleTypeFormStateLogin={handleTypeFormStateLogin} ></SignUpForm>;
    }


    return (
        <Container className='m-auto'>
            <Row className="justify-content-md-center">
                <Col md="auto">
                    <TittleModal className="text-center">{titleFormShow}</TittleModal>
                </Col>
            </Row>
            {formToShow}
        </Container>
    );
}

export function FormEditProfile({ userData, setShowModalEditProfile, showModalEditProfile, setUserData }) {
    const [profileImage, setProfileImage] = useState(null);
    const { Formik } = formik;
    const userState = useSelector((store) => store.user);
    const [sending, setSending] = useState(false);
    const dispatch = useDispatch();
    const [arrayLocalidades, setArrayLocalidades] = useState([]);
    const [opcionesComboCiudad, setOpcionesComboCiudad] = useState([]);

    const getOpcionesCiudad = useCallback((provinciaId) => {
        return arrayLocalidades.filter(option =>
            option.id_nivel_territorial === 3 &&
            option.id_territorio_padre === parseInt(provinciaId)
        );
    }, [arrayLocalidades]);

    const handleChangeComboProvincia = useCallback(async (provinciaId, setFieldValue, setTouched, validateField, touched) => {
        if (!provinciaId) {
            setOpcionesComboCiudad([]);  // Limpiar opciones de ciudad
            if (setFieldValue) {
                // Limpiar el valor de ciudad
                await setFieldValue('ciudad', "", true);
                // Marcar como tocado para mostrar el error
                setTouched({
                    ...touched,
                    ciudad: true,
                    provincia: true,
                });
                // Validar el campo 'ciudad'
                await validateField('ciudad');
            }
            return;
        }

        const opcionesFiltradas = getOpcionesCiudad(provinciaId);  // Obtener nuevas opciones de ciudad
        setOpcionesComboCiudad(opcionesFiltradas);  // Actualizar las opciones del combo ciudad

        if (setFieldValue) {
            // Limpiar el valor de ciudad
            await setFieldValue('ciudad', "", true);
            // Marcar como tocado para mostrar el error
            setTouched({
                ...touched,
                ciudad: true,
                provincia: true,
            });
            // Validar el campo 'ciudad'
            await validateField('ciudad');
        }
    }, [setOpcionesComboCiudad, getOpcionesCiudad]);

    //genero el json de validacón para el formulario dinámico
    //genero el json de valores iniciales del formulario
    let validationSchemaBase = {};
    let initialValues = {};

    Object.entries(userData.informacion_general).forEach(([key, value]) => {
        validationSchemaBase[key] = formValidations[value.validation];
        if (value.type === "select") {
            initialValues[key] = value.selected;
        } else {
            initialValues[key] = value.value;
        }
    });

    let validationSchemaEditProfile = yup.object().shape(validationSchemaBase);
    //

    const handleImageChange = (event, setFieldValue) => {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                setProfileImage(e.target.result);
            };

            reader.readAsDataURL(file);
            setFieldValue('foto', file); // Guarda el archivo seleccionado en Formik
        }
    };

    const handleEditProfile = async (values, event) => {
        // Crear FormData para manejar archivos y otros datos
        const formData = new FormData();

        // Agregar a formData solo los campos "editable": true
        Object.keys(values).forEach((key) => {
            if (userData.informacion_general[key]?.editable) {  // Verifica si "editable" es true
                formData.append(key, values[key]);
            }
        });
        formData.append("id_rol", userState.id_rol);
        formData.append("id_usuario", userState.id_usuario);
        // Añadir la imagen al FormData
        formData.append('foto', values.foto);

        //console.log(formData);
        //actualizo los datos
        setSending(true);
        try {
            const response = await axios.post(
                'https://rafaeloxj.pythonanywhere.com/api/v1/actualizar_usuario/',
                formData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                const data_ = response.data.data;
                //console.log(JSON.stringify(data_));
                setUserData(data_);
                setShowModalEditProfile(false);

                //actualizo el local storage
                let nombre_corto = '';
                if (data_.rol === Roles.ORG) {
                    nombre_corto = data_.informacion_general.razon_social.value;
                } else {
                    let nombre = data_.informacion_general.nombres.value.split(" ")[0];
                    let apellido = data_.informacion_general.apellidos.value.split(" ")[0];
                    nombre_corto = nombre + " " + apellido;
                }
                const updatedUser = {
                    url_foto: response.data.data.url_foto,
                    nombre_corto: nombre_corto
                };
                // Dispatch para actualizar el estado
                dispatch(updateUser(updatedUser));

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
    }

    // Fetch para territorios
    const fetchLocalidades = async () => {
        try {
            const response = await axios.get(
                'https://rafaeloxj.pythonanywhere.com/api/v1/territorios/'
            );
            setArrayLocalidades(response.data.data); // Actualiza el estado con las localidades
        } catch (error) {
            console.error('Error al realizar la solicitud de territorios:', error);
        }
    };

    // useEffect para cargar datos al montar el componente
    useEffect(() => {
        fetchLocalidades();  // Cargar territorios
    }, []); // Solo ejecuta al montar el componente

    useEffect(() => {
        if (showModalEditProfile && initialValues.provincia && arrayLocalidades.length > 0) {
            handleChangeComboProvincia(initialValues.provincia);
        }
    }, [initialValues.provincia, arrayLocalidades, showModalEditProfile, handleChangeComboProvincia]);


    return (
        <Modal
            show={showModalEditProfile}
            onHide={() => setShowModalEditProfile(false)}
            dialogClassName="modal-90w modal-dialog-scrollable"
        /*size="lg"*/
        >
            <Modal.Header closeButton>
                <h5>Editar perfil</h5>
            </Modal.Header>
            <Modal.Body className='vh-100' style={{ maxHeight: '800px' }}>
                <Formik
                    validationSchema={validationSchemaEditProfile}
                    onSubmit={(values, formikBag) => {
                        formikBag.validateForm().then(errors => {
                            if (Object.keys(errors).length === 0) {
                                // No hay errores de validación, los datos ingresados son válidos
                                handleEditProfile(values);
                                //console.log(values);
                            }
                            formikBag.setSubmitting(false);  // Importante para indicar que la subida ha terminado
                        });
                    }}
                    initialValues={{ ...initialValues, foto: '' }}
                >
                    {({ handleSubmit, handleChange, values, handleBlur, errors, setFieldValue, setTouched, validateField, touched }) => (
                        <Form noValidate onSubmit={(e) => { e.stopPropagation(); e.preventDefault(); handleSubmit(); }}>
                            <div className="w-100">
                                <div>
                                    <Row className='align-items-center justify-content-center m-0'>
                                        <Col xs="auto" className='text-center position-relative'>
                                            <label htmlFor="formFile" style={{ cursor: 'pointer' }}>
                                                <img
                                                    className="profile-img"
                                                    src={profileImage || userData.url_foto}
                                                    alt="avatar"
                                                    style={{ border: "3px solid #ccc" }}
                                                />
                                                <FontAwesomeIcon className="edit-profile-img location-icon" icon={faPenToSquare} fontSize="24" />
                                            </label>
                                        </Col>
                                    </Row>
                                    <Row className='justify-content-center m-0'>
                                        <Col xs="auto">
                                            <label className='userName mt-2'>José Galarza</label>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                            <Form.Group controlId="formFile" className="mb-3">
                                <Form.Control
                                    name='foto'
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={(e) => { handleImageChange(e, setFieldValue); }}
                                />
                            </Form.Group>
                            {
                                Object.entries(userData.informacion_general).map(([key, value]) => (
                                    <Form.Group className="mb-3" controlId={`formBasic${key}`} key={key}>
                                        {
                                            value.type === "select" ?
                                                (
                                                    <>
                                                        <FloatingLabel controlId={`floating${key}`} label={value.label} style={{ color: "gray" }}>
                                                            <Select
                                                                name={key}
                                                                onChange={(e) => {
                                                                    handleBlur(e)
                                                                    if (key === "provincia") {
                                                                        handleChangeComboProvincia(e.target.value, setFieldValue, setTouched, validateField, touched);
                                                                        handleChange(e);
                                                                    } else {
                                                                        handleChange(e);
                                                                    }
                                                                }}
                                                                readOnly={!value.editable}
                                                                value={values[key]}
                                                                isInvalid={touched[key] && !!errors[key]}
                                                                isValid={touched[key] && !errors[key]}
                                                            >
                                                                <option value="">Seleccione una opción</option>
                                                                {
                                                                    key !== "provincia" && key !== "ciudad" &&
                                                                    value.options && value.options.map(([key, value_]) => (
                                                                        <option
                                                                            key={key}
                                                                            value={key}
                                                                        >
                                                                            {value_}
                                                                        </option>
                                                                    ))
                                                                }
                                                                {key === "provincia" && (
                                                                    arrayLocalidades.map(option => (
                                                                        option.id_nivel_territorial === 2 && (
                                                                            <option key={option.id_territorio} value={option.id_territorio}>{option.descripcion}</option>
                                                                        )
                                                                    ))
                                                                )}
                                                                {key === "ciudad" && (
                                                                    opcionesComboCiudad.map(option => (
                                                                        <option key={option.id_territorio} value={option.id_territorio}>{option.descripcion}</option>
                                                                    ))
                                                                )}
                                                            </Select>
                                                            <Form.Control.Feedback type="invalid">{errors[key]}</Form.Control.Feedback>
                                                        </FloatingLabel>

                                                    </>
                                                )
                                                : value.type === "textarea" ?
                                                    (
                                                        <>
                                                            <FloatingLabel controlId={`floating${key}`} label={value.label} style={{ color: "gray" }}>
                                                                <Form.Control
                                                                    as="textarea"
                                                                    placeholder=""
                                                                    name={key}
                                                                    onChange={handleChange}
                                                                    onInput={(e) => {
                                                                        handleBlur(e);
                                                                    }}
                                                                    maxLength={value.maxLength}
                                                                    value={values[key]}
                                                                    readOnly={!value.editable}
                                                                    isInvalid={touched[key] && !!errors[key]}
                                                                    isValid={touched[key] && !errors[key]}
                                                                    style={{ height: "150px" }}
                                                                />
                                                                <Form.Control.Feedback type="invalid">{errors[key]}</Form.Control.Feedback>
                                                            </FloatingLabel>
                                                        </>
                                                    ) :
                                                    (
                                                        <>
                                                            <FloatingLabel controlId={`floating${key}`} label={value.label} style={{ color: "gray" }}>
                                                                <Form.Control
                                                                    name={key}
                                                                    type={value.type}
                                                                    placeholder={value.label}
                                                                    onChange={handleChange}
                                                                    onInput={(e) => {
                                                                        if (value.validation === "number10" || value.validation === "number13") {
                                                                            handleInputOnlyNumber(e);
                                                                            handleBlur(e);
                                                                        } else if (value.validation === "text") {
                                                                            handleInputOnlyLetters(e);
                                                                            handleBlur(e);
                                                                        } else {
                                                                            handleBlur(e);
                                                                        }
                                                                    }}
                                                                    maxLength={value.maxLength}
                                                                    value={values[key]}
                                                                    readOnly={!value.editable}
                                                                    isInvalid={touched[key] && !!errors[key]}
                                                                    isValid={touched[key] && !errors[key]}
                                                                />
                                                                <Form.Control.Feedback type="invalid">{errors[key]}</Form.Control.Feedback>
                                                            </FloatingLabel>
                                                        </>
                                                    )
                                        }
                                    </Form.Group>
                                ))
                            }

                            <Form.Group className="mb-3" controlId="formBasicButton">
                                <Button type="submit" className="w-100 filledButton" disabled={sending}>
                                    Guardar cambios {sending && <BorderSpinnerBasic style={{ width: "1rem", height: "1rem" }} />}
                                </Button>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicButton">
                                <Button className="unFilledButton w-100" type="button" disabled={sending} onClick={() => { setShowModalEditProfile(false) }}>
                                    Cancelar
                                </Button>
                            </Form.Group>
                        </Form>
                    )}
                </Formik>
            </Modal.Body>
        </Modal>
    );
}

export function FormEditSocialLinks({ userData, setShowModalEditSocialLinks, showModalEditSocialLinks, setUserData }) {
    const { Formik } = formik;
    const userState = useSelector((store) => store.user);
    const [sending, setSending] = useState(false);

    //genero el json de validacón para el formulario dinámico
    //genero el json de valores iniciales del formulario
    let validationSchemaBase = {};
    let initialValues = {};

    Object.entries(userData.info_contacto.redes_sociales).forEach(([key, value]) => {
        validationSchemaBase[key] = formValidations["url"];
        initialValues[key] = value;
    });

    let validationSchemaEditSocialLinks = yup.object().shape(validationSchemaBase);
    //

    function capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    const handleUpdateSocialLinks = async (values, event) => {
        setSending(true);
        try {
            const response = await axios.post(
                'https://rafaeloxj.pythonanywhere.com/api/v1/actualizar_redes_empresa/',
                { ...values, "id_usuario": userState.id_usuario },
                { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
            );

            if (response.data.success) {
                //console.log(JSON.stringify(response.data.data));
                setUserData(response.data.data);
                setShowModalEditSocialLinks(false);
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
    }

    return (
        <Modal
            show={showModalEditSocialLinks}
            onHide={() => setShowModalEditSocialLinks(false)}
            dialogClassName="modal-90w modal-dialog-scrollable"
        /*size="lg"*/
        >
            <Modal.Header closeButton>
                <h5>Editar redes sociales</h5>
            </Modal.Header>
            <Modal.Body className='vh-100' style={{ maxHeight: '800px' }}>
                <Formik
                    validationSchema={validationSchemaEditSocialLinks}
                    onSubmit={(values, formikBag) => {
                        formikBag.validateForm().then(errors => {
                            if (Object.keys(errors).length === 0) {
                                // No hay errores de validación, los datos ingresados son válidos
                                handleUpdateSocialLinks(values);
                            }
                            formikBag.setSubmitting(false);  // Importante para indicar que la subida ha terminado
                        });
                    }}
                    initialValues={initialValues}
                >
                    {({ handleSubmit, handleChange, values, handleBlur, touched, errors }) => (
                        <Form noValidate onSubmit={(e) => { e.stopPropagation(); e.preventDefault(); handleSubmit(); }}>
                            {
                                Object.entries(userData.info_contacto.redes_sociales).map(([key]) => (
                                    <Form.Group className="mb-3" controlId={"formBasic_" + key} key={key} >
                                        <FloatingLabel controlId={"floating_" + key} label={capitalizeFirstLetter(key)} style={{ color: "gray" }}>
                                            <Form.Control
                                                name={key}
                                                type="text"
                                                placeholder={capitalizeFirstLetter(key)}
                                                maxLength={500}
                                                onInput={(e) => {
                                                    handleBlur(e);
                                                }}
                                                onChange={handleChange}
                                                value={values[key]}
                                                isInvalid={touched[key] && !!errors[key]}
                                                isValid={touched[key] && !errors[key]}
                                            />
                                            <Form.Control.Feedback type="invalid">{errors[key]}</Form.Control.Feedback>
                                        </FloatingLabel>
                                    </Form.Group>
                                ))
                            }
                            <Form.Group className="mb-3" controlId="formBasicButton">
                                <Button
                                    type="submit"
                                    className="w-100 filledButton"
                                    disabled={sending}
                                >
                                    Guardar cambios {sending && <BorderSpinnerBasic style={{ width: "1rem", height: "1rem" }} />}
                                </Button>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicButton">
                                <Button
                                    className="unFilledButton w-100"
                                    type="button"
                                    onClick={() => { setShowModalEditSocialLinks(false) }}
                                    disabled={sending}
                                >
                                    Cancelar
                                </Button>
                            </Form.Group>
                        </Form>
                    )}
                </Formik>
            </Modal.Body>
        </Modal>
    );
}

// Componente para sincronizar el campo direccion
export const SyncFieldsFormularioCA = ({ ubicacion, referencia, informacion, nombre, id_centro, setFieldValue }) => {
    React.useEffect(() => {
        setFieldValue('ubicacion', ubicacion[0] + "," + ubicacion[1], false); //latitude + "," + longitude
        setFieldValue('referencia', referencia, false);
        setFieldValue('nombre', nombre, false);
        setFieldValue('informacion', informacion, false);
        setFieldValue('id_centro', id_centro, false);
    }, [ubicacion, setFieldValue, id_centro, informacion, nombre, referencia]);

    return null;
};

export function FormularioCentroAcopio(props) {
    const { Formik } = formik;
    const [filesLoads, setFilesLoads] = React.useState([]);
    const fileLoadContainerRef = React.useRef(null);
    const { locationCentroAcopio, referenciaCentroAcopio, informacionCentroAcopio,
        nombreCentroAcopio, actionForm, idCentroAcopio, fotosAnt, setFotosAnt,
        setCAContent } = useContext(CentrosAcopioContext);
    const userState = useSelector((store) => store.user);

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
            await setFotosAnt('');
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
            await setFotosAnt('');
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

    const enviarSolicitud = async (values, action) => {
        // Crear FormData para manejar archivos y otros datos
        const formData = new FormData();

        formData.append("organizacion", userState.id_usuario);
        formData.append("nombre_acopio", values.nombre);
        formData.append("ubicacion", JSON.stringify(values.ubicacion.split(",").map(Number)));
        formData.append("referencia", values.referencia);
        formData.append("informacion", values.informacion);

        // Añadir los archivos a FormData uno por uno
        values.files.forEach((file) => {
            formData.append(`fotos[]`, file);
        });
        //console.log(action)
        if (action === "Registrar") {
            try {
                const response = await axios.post(
                    'https://rafaeloxj.pythonanywhere.com/api/v1/crear_centros_acopio/',
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
                    setCAContent(response.data.data);
                } else {
                    console.log("Error " + response.data.error);
                }
            } catch (error) {
                console.error(error);
                console.log('Ocurrió un error al procesar la solicitud');
            }

        } else if (action === "Editar") {
            formData.append("id_centro", values.id_centro);

            try {
                const response = await axios.post(
                    'https://rafaeloxj.pythonanywhere.com/api/v1/actualizar_centros_acopio/',
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
                    setCAContent(response.data.data);
                } else {
                    console.log("Error " + response.data.error);
                }
            } catch (error) {
                console.error(error);
                console.log('Ocurrió un error al procesar la solicitud');
            }
        }
    };

    const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];

    const schema = (idCentroAcopio) => yup.object().shape({
        // Solo incluirá 'id_centro' si 'idCentroAcopio' tiene valor.
        ...(idCentroAcopio ? {
            id_centro: formValidations.text,
        } : {}),
        ubicacion: yup.string()
            .required('El campo es obligatorio'),
        referencia: formValidations.textarea250,
        nombre: formValidations.text,
        informacion: formValidations.textarea250,
        // Solo incluirá 'files' si 'fotosAnt' no tiene valor.
        ...(!fotosAnt ? {
            files: yup.array()
                .min(1, 'Debe adjuntar al menos una foto')
                .max(3, 'Se permite máximo 3 archivos')
                .test("fileFormat", "El formato del archivo no es soportado", value => {
                    return value.every(file => SUPPORTED_FORMATS.includes(file.type));
                }),
        } : {})
    });

    return (
        <div {...props}>
            <h5 className='text-center mt-3'>{actionForm} centro de acopio</h5>
            <Formik
                validationSchema={schema(idCentroAcopio)}
                onSubmit={(values, formikBag) => {
                    //console.log(values);
                    formikBag.validateForm().then(errors => {
                        if (Object.keys(errors).length === 0) {
                            // No hay errores de validación, los datos ingresados son válidos
                            enviarSolicitud(values, actionForm);
                            //console.log("Se envia solicitud");
                        }
                        formikBag.setSubmitting(false);  // Importante para indicar que la subida ha terminado
                    });
                }}
                initialValues={{
                    ...(idCentroAcopio ? { id_centro: idCentroAcopio } : {}),//se agrega solo cuando existe idCentroAcopio
                    ubicacion: Object.keys(locationCentroAcopio).length > 0 ? locationCentroAcopio : '',
                    nombre: nombreCentroAcopio,
                    referencia: referenciaCentroAcopio,
                    informacion: informacionCentroAcopio,
                    files: []
                }}

            >
                {({ handleSubmit, handleChange, values, touched, errors, setFieldValue, validateField, setFieldError }) => (

                    <Form noValidate className='form-reciclar-contianer' onSubmit={(e) => { e.stopPropagation(); e.preventDefault(); handleSubmit(); }} style={{ width: "100%" }}>
                        <SyncFieldsFormularioCA
                            ubicacion={Object.keys(locationCentroAcopio).length > 0 ? locationCentroAcopio : ''}
                            referencia={referenciaCentroAcopio} informacion={informacionCentroAcopio}
                            nombre={nombreCentroAcopio}
                            id_centro={idCentroAcopio}
                            setFieldValue={setFieldValue}
                        />
                        {idCentroAcopio &&
                            <FormControl sx={{ m: 1, width: "90%" }}>
                                <TextField
                                    name="id_centro"
                                    label="id_centro"
                                    InputProps={{
                                        readOnly: true,
                                        classes: {
                                            input: 'outlined-read-only-input',
                                        }
                                    }}
                                    onChange={handleChange}
                                    value={values.id_centro}
                                    error={touched.id_centro && !!errors.id_centro ? true : touched.id_centro && !!errors.id_centro}
                                    helperText={errors.id_centro}
                                    hidden
                                />
                            </FormControl>
                        }
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
                            <TextField
                                name="nombre"
                                label="Nombre Centro de Acopio"
                                InputProps={{
                                    classes: {
                                        input: 'outlined-read-only-input',
                                    }
                                }}
                                onChange={handleChange}
                                value={values.nombre}
                                error={touched.nombre && !!errors.nombre ? true : touched.nombre && !!errors.nombre}
                                helperText={errors.nombre}
                            />
                        </FormControl>
                        <FormControl sx={{ m: 1, width: "90%" }}>
                            <TextField
                                name="referencia"
                                label="Referencia"
                                InputProps={{
                                    classes: {
                                        input: 'outlined-read-only-input',
                                    }
                                }}
                                onChange={handleChange}
                                value={values.referencia}
                                error={touched.referencia && !!errors.referencia ? true : touched.referencia && !!errors.referencia}
                                helperText={errors.referencia}
                                maxLength={250}
                            />
                        </FormControl>
                        <FormControl sx={{ m: 1, width: "90%" }}>
                            <TextField
                                name="informacion"
                                label="Información"
                                InputProps={{
                                    classes: {
                                        input: 'outlined-read-only-input',
                                    }
                                }}
                                onChange={handleChange}
                                value={values.informacion}
                                error={touched.informacion && !!errors.informacion ? true : touched.informacion && !!errors.informacion}
                                helperText={errors.informacion}
                                maxLength={250}
                            />
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
                                        fotosAnt ?
                                            fotosAnt.map((foto, index) => (
                                                <div key={index} className="file-preview">
                                                    <img src={foto} alt={foto} />
                                                </div>
                                            ))
                                            :
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
                                Enviar <SendIcon />
                            </Button>
                        </Form.Group>
                    </Form>
                )}
            </Formik>
        </div >
    );
}