import { Col, Container, Row, Form, Image } from 'react-bootstrap';
import { NavbarPage } from '../components/navBar';
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { SelectWithSearch } from '../components/searchCombo';
import { Card } from '../components/cards';
import {
    MaterialReactTable,
    useMaterialReactTable,
    MRT_EditActionButtons as MRTEditActionButtons,
    createRow
} from 'material-react-table';
import { mkConfig, generateCsv, download } from 'export-to-csv'; //or use your library of choice here
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import {
    Box,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Tooltip,
} from '@mui/material';

import {
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { getDefaultImg, ModalProfile } from './profilePage';
import { StarRating } from '../components/startRating';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Roles from '../models/roles';

const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
});

const CRUDExportTableCSV = ({ dataReciclador, tiposMateriales }) => {
    const [validationErrors, setValidationErrors] = useState({});
    const userState = useSelector((store) => store.user);

    //call CREATE hook
    const { mutateAsync: createReciclaje, isPending: isCreatingReciclaje } = useCreateReciclaje(dataReciclador.id_reciclador, userState.id_usuario);

    //call READ hook
    const {
        data: fetchedReciclajes = { data: [] },
        isError: isLoadingReciclajesError,
        isFetching: isFetchingReciclajes,
        isLoading: isLoadingReciclajes,
    } = useGetReciclajes(dataReciclador.id_reciclador);

    //call UPDATE hook
    const { mutateAsync: updateReciclaje, isPending: isUpdatingReciclaje } = useUpdateReciclaje(userState.id_usuario);

    //call DELETE hook
    const { mutateAsync: deleteReciclaje, isPending: isDeletingReciclaje } = useDeleteReciclaje(userState.id_usuario);

    //CREATE action
    const handleCreateReciclaje = async ({ values, table }) => {
        const newValidationErrors = validateReciclaje(values);
        if (Object.values(newValidationErrors).some((error) => error)) {
            setValidationErrors(newValidationErrors);
            return;
        }
        setValidationErrors({});
        await createReciclaje(values);
        table.setCreatingRow(null); //exit creating mode
    };

    //UPDATE action
    const handleSaveReciclaje = async ({ values, table }) => {
        const newValidationErrors = validateReciclaje(values);
        if (Object.values(newValidationErrors).some((error) => error)) {
            setValidationErrors(newValidationErrors);
            return;
        }
        setValidationErrors({});
        await updateReciclaje(values);
        table.setEditingRow(null); //exit editing mode
    };

    //DELETE action
    const openDeleteConfirmModal = (row) => {
        if (window.confirm('Estas seguro de eliminar el registro?')) {
            deleteReciclaje(row.original.id_registro);
        }
    };

    //should be memoized or stable
    const columns = useMemo(
        () => [
            {
                accessorKey: 'id_registro', //access nested data with dot notation
                header: 'ID',
                enableClickToCopy: true,
                enableEditing: false,
            },
            {
                accessorKey: 'material', //access nested data with dot notation
                header: 'Material',
                size: 150,
                filterVariant: 'multi-select',
                filterSelectOptions: tiposMateriales.map(material => material.label),
                enableClickToCopy: true,
                editVariant: 'select',
                editSelectOptions: tiposMateriales,
                muiEditTextFieldProps: {
                    select: true,
                    error: !!validationErrors?.material,
                    helperText: validationErrors?.material,
                },
            },
            {
                accessorKey: 'peso',
                header: 'Peso (kg)',
                size: 150,
                filterFn: 'between',
                enableClickToCopy: true,
                muiEditTextFieldProps: {
                    required: true,
                    error: !!validationErrors?.peso,
                    helperText: validationErrors?.peso,
                    //optionally add validation checking for onBlur or onChange
                    onChange: (event) => {
                        const value = event.target.value;
                        //validation logic
                        const newValidationError = validateReciclaje({ peso: value });
                        if (newValidationError.peso) {
                            setValidationErrors({ ...validationErrors, peso: newValidationError.peso });
                        } else {
                            delete validationErrors.peso;
                            setValidationErrors({ ...validationErrors });
                        }
                    },
                },
            },
            {
                accessorKey: 'usuario_registro', //normal accessorKey
                header: 'Usuario registro',
                size: 200,
                enableClickToCopy: true,
                enableEditing: false,
            },
            {
                accessorKey: 'fecha_registro',
                header: 'Fecha registro',
                size: 200,
                accessorFn: (row) => new Date(row.fecha_registro + " 00:00:00"),
                filterVariant: 'date-range',
                filterFn: 'customFilterDate',
                sortingFn: 'datetime',
                Cell: ({ cell }) => cell.getValue()?.toLocaleDateString(),
                muiFilterTextFieldProps: {
                    sx: {
                        minWidth: '6rem',
                    }
                },
                enableClickToCopy: true,
                enableEditing: false,
            },
        ],
        [validationErrors, tiposMateriales],
    );

    const handleExportRows = (rows) => {
        const rowData = rows.map((row) => {
            const { id_registro, ...restoDatos } = row.original;//excluyo el id porque esta oculto
            return { ...restoDatos };
        });
        const csv = generateCsv(csvConfig)(rowData);
        download(csvConfig)(csv);
    };

    const handleExportData = () => {
        const data_ = fetchedReciclajes.data.map((obj) => {
            const { id_registro, ...restoDatos } = obj;//excluyo el id porque esta oculto
            return { ...restoDatos };
        });
        const csv = generateCsv(csvConfig)(data_);
        download(csvConfig)(csv);
    };

    const table = useMaterialReactTable({
        columns,
        data: fetchedReciclajes.data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
        enableHiding: false,
        enableGlobalFilter: false,
        columnFilterDisplayMode: 'popover',
        paginationDisplayMode: 'pages',
        positionToolbarAlertBanner: 'bottom',
        createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
        editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
        enableEditing: true,
        enableStickyHeader: true,
        muiToolbarAlertBannerProps: isLoadingReciclajesError
            ? {
                color: 'error',
                children: 'Error al cargar',
            }
            : undefined,

        onCreatingRowCancel: () => setValidationErrors({}),
        onCreatingRowSave: handleCreateReciclaje,
        onEditingRowCancel: () => setValidationErrors({}),
        onEditingRowSave: handleSaveReciclaje,
        initialState: {
            pagination: { pageSize: 10, pageIndex: 0 },
            /*showGlobalFilter: true,*/
            /*showColumnFilters: true,*/
            columnVisibility: { id_registro: false },
            density: 'comfortable',
            sorting: [
                { id: 'fecha_registro', desc: false }, //sort by fecha_registro in ascending order by default
            ],
        },
        muiPaginationProps: {
            rowsPerPageOptions: [10, 15, 20, 25, 30],
        },
        //optionally customize modal content
        renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
            <>
                <DialogTitle variant="h3">Nuevo registro</DialogTitle>
                <DialogContent
                    sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                    {internalEditComponents.filter((x) => (x.key !== "mrt-row-create_id_registro" && x.key !== "mrt-row-create_fecha_registro"))} {/*omito id_registro, fecha_registro*/}
                    {/* or render custom edit components here */}
                </DialogContent>
                <DialogActions>
                    <MRTEditActionButtons variant="text" table={table} row={row} />
                </DialogActions>
            </>
        ),
        //optionally customize modal content
        renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
            <>
                <DialogTitle variant="h3">Editar registro</DialogTitle>
                <DialogContent
                    sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                >
                    {internalEditComponents} {/* or render custom edit components here */}
                </DialogContent>
                <DialogActions>
                    <MRTEditActionButtons variant="text" table={table} row={row} />
                </DialogActions>
            </>
        ),
        renderRowActions: ({ row, table }) => (
            <Box sx={{ display: 'flex', gap: '.5rem' }}>
                <Tooltip title="Editar">
                    <IconButton onClick={() => table.setEditingRow(row)}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                    <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        ),
        renderTopToolbarCustomActions: ({ table }) => (
            <Box
                sx={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '.rem',
                    flexWrap: 'wrap',
                }}
            >
                <Button
                    variant="contained"
                    onClick={() => {
                        //table.setCreatingRow(true); //simplest way to open the create row modal with no default values
                        //or you can pass in a row object to set default values with the `createRow` helper function
                        table.setCreatingRow(
                            createRow(table, {
                                usuario_registro: userState.nombre_corto,
                            }),
                        );
                    }}
                >
                    + Agregar
                </Button>
                <Box
                    sx={{
                        display: 'flex',
                        gap: '1rem',
                        padding: '.rem',
                        flexWrap: 'wrap',
                    }}
                >
                    <Button
                        //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
                        disabled={fetchedReciclajes.data.length === 0}
                        onClick={handleExportData}
                        startIcon={<FileDownloadIcon />}
                    >
                        Exportar todo
                    </Button>
                    <Button
                        disabled={table.getPrePaginationRowModel().rows.length === 0}
                        //export all rows, including from the next page, (still respects filtering and sorting)
                        onClick={() =>
                            handleExportRows(table.getPrePaginationRowModel().rows)
                        }
                        startIcon={<FileDownloadIcon />}
                    >
                        Exportar filtrada
                    </Button>
                </Box>
            </Box>
        ),
        state: {
            isLoading: isLoadingReciclajes,
            isSaving: isCreatingReciclaje || isUpdatingReciclaje || isDeletingReciclaje,
            showAlertBanner: isLoadingReciclajesError,
            showProgressBars: isFetchingReciclajes,
        },
        filterFns: {
            customFilterDate: (row, id, filterValue) => {
                let row_date = row.getValue(id);
                let filter_date1 = filterValue[0] ? filterValue[0].$d : "";
                let filter_date2 = filterValue[1] ? filterValue[1].$d : "";
                // Verificar si row_date está dentro del rango de fechas o es igual a cualquiera de las fechas límites
                return (
                    (filter_date1 === "" || row_date >= filter_date1) && // Verificar si row_date es mayor o igual que filter_date1
                    (filter_date2 === "" || row_date <= filter_date2)    // Verificar si row_date es menor o igual que filter_date2
                );
            }
        },
        localization: {
            ...MRT_Localization_ES,
            filterCustomFilterDate: 'Entre',
        },
        muiTableContainerProps: {
            sx: {
                minHeight: '500px',
            },
        },
    });
    return (
        <>
            <div className='mb-5'>
                <Card>
                    <RecicladorInfo dataReciclador={dataReciclador} detalleReciclaje={fetchedReciclajes.detalle} />
                </Card>
            </div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <MaterialReactTable table={table} />
            </LocalizationProvider>
        </>
    );
};

//CREATE hook (post new reciclaje to api)
function useCreateReciclaje(id_reciclador, id_usuario_ingreso) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newReciclajeInfo) => {
            //send api request here
            try {
                const response = await axios.post(
                    'https://rafaeloxj.pythonanywhere.com/api/v1/ingresar_registro_reciclaje/',
                    {
                        "id_material": newReciclajeInfo.material, "peso": newReciclajeInfo.peso,
                        "id_reciclador": id_reciclador, "id_usuario_registro": id_usuario_ingreso
                    },
                    { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
                );
                if (response.data.success) {
                    return Promise.resolve();
                } else {
                    //console.log(response.data.error);
                    return Promise.reject(response.data.error);
                }
            } catch (error) {
                console.log(error);
                return Promise.reject(error);
            }
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['reciclajes'] }), //refetch reciclajes after mutation, disabled for demo
    });
}

//READ hook (get reciclajes from api)
function useGetReciclajes(id_reciclador) {
    return useQuery({
        queryKey: ['reciclajes'],
        queryFn: async () => {
            //send api request here
            try {
                const response = await axios.post(
                    'https://rafaeloxj.pythonanywhere.com/api/v1/obtener_registro_reciclaje/',
                    { "id_reciclador": id_reciclador },
                    { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
                );
                if (response.data.success) {
                    const reciclaje_data = response.data.data;
                    let total_reciclaje = 0;
                    let total_reciclaje_mes = 0;
                    let fechaActual = new Date();
                    reciclaje_data.forEach((x) => {
                        total_reciclaje += parseFloat(x.peso);
                        let fechaData = new Date(x.fecha_registro + " 00:00:00");
                        if (fechaData.getMonth() === fechaActual.getMonth() && fechaData.getFullYear() === fechaActual.getFullYear()) {
                            total_reciclaje_mes += parseFloat(x.peso);
                        }
                    });
                    return Promise.resolve({ data: reciclaje_data, detalle: { reciclaje: total_reciclaje, reciclaje_mes: total_reciclaje_mes } });
                } else {
                    console.log(response.data.error);
                    return Promise.reject(response.data.error);
                }
            } catch (error) {
                console.log(error);
                return Promise.reject(error);
            }
        },
        refetchOnWindowFocus: false,
        //retry: false, // Desactivar retries automáticos, react-query hace 4 intentos si da error
    });
}

//UPDATE hook (put reciclaje in api)
function useUpdateReciclaje(id_usuario_ingreso) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newReciclajeInfo) => {
            /*console.log({
                "id_registro": newReciclajeInfo.id_registro, "id_material": newReciclajeInfo.material,
                "peso": newReciclajeInfo.peso, "id_usuario_modificacion": id_usuario_ingreso + "ss", "estado": "A"
            })*/
            //send api request here
            try {
                const response = await axios.post(
                    'https://rafaeloxj.pythonanywhere.com/api/v1/actualizar_registro_reciclaje/',
                    {
                        "id_registro": newReciclajeInfo.id_registro, "id_material": newReciclajeInfo.material,
                        "peso": newReciclajeInfo.peso, "id_usuario_modificacion": id_usuario_ingreso, "estado": "A"
                    },
                    { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
                );
                if (response.data.success) {
                    return Promise.resolve();
                } else {
                    console.log(response.data.error);
                    return Promise.reject(response.data.error);
                }
            } catch (error) {
                console.log(error);
                return Promise.reject(error);
            }
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['reciclajes'] }), //refetch reciclajes after mutation, disabled for demo
    });
}

//DELETE hook (delete reciclaje in api)
function useDeleteReciclaje(id_usuario_ingreso) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (reciclajeInfo) => {
            //console.log(reciclajeInfo)
            //send api request here
            try {
                const response = await axios.post(
                    'https://rafaeloxj.pythonanywhere.com/api/v1/actualizar_registro_reciclaje/',
                    { "id_registro": reciclajeInfo, "id_usuario_modificacion": id_usuario_ingreso, "estado": "I" },
                    { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
                );
                if (response.data.success) {
                    return Promise.resolve();
                } else {
                    console.log(response.data.error);
                    return Promise.reject(response.data.error);
                }
            } catch (error) {
                console.log(error);
                return Promise.reject(error);
            }
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['reciclajes'] }), //refetch reciclajes after mutation, disabled for demo
    });
}

const validateRequired = (value) => {
    console.log(value)
    return (value !== "" && value !== undefined && (!!value && !!value.length));
}

const validateText = (value) => {
    const expresionRegular = /^[0-9]+$/;
    return expresionRegular.test(value);
}

function validateReciclaje(reciclaje) {
    console.log(reciclaje)
    return {
        material: !validateRequired(reciclaje.material)
            ? 'Material es requerido'
            : '',
        peso: !validateRequired(reciclaje.peso) ? 'Peso es requerido' :
            !validateText(reciclaje.peso) ?
                'Ingrese un número válido' :
                '',
    };

}

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

const RecicladorInfo = function ({ dataReciclador, detalleReciclaje }) {
    const [showModalProfile, setShowModalProfile] = useState(false);

    return (
        <>
            <Row className='p-2'>
                <Col xs={5} md={4} xl={2} className='text-center'>
                    <Image className='image-profile' src={dataReciclador.url_foto || getDefaultImg(Roles.RECICLADOR, dataReciclador.genero)} roundedCircle style={{ cursor: "pointer" }} onClick={() => { setShowModalProfile(true) }} />
                </Col>
                <Col xs={7} md={8} xl={10} className='card-reciclador-pesos-info'>
                    <p className='fw-light fs-3 m-0'>{dataReciclador.nombres + " " + dataReciclador.apellidos}</p>
                    <p className='fw-light text-info m-0'>{dataReciclador.cedula}</p>
                    <StarRating rating={dataReciclador.perfil.calificacion} size={24} />
                    <p className='fw-medium m-0'>Reciclaje: <span className='fw-light text-info'>{detalleReciclaje ? detalleReciclaje.reciclaje : 0}kg</span></p>
                    <p className='fw-medium m-0'>Reciclaje (Mes): <span className='fw-light text-info'>{detalleReciclaje ? detalleReciclaje.reciclaje_mes : 0}kg</span></p>
                    <p className='fw-medium m-0'>Solicitudes atendidas: <span className='fw-light text-info'>{(detalleReciclaje && detalleReciclaje.solicitudes) ? detalleReciclaje.solicitudes : 0}</span></p>
                </Col>
            </Row>
            {
                showModalProfile && (
                    <ModalProfile
                        modalTitle="Perfil del reciclador"
                        setShowModal={setShowModalProfile}
                        showModal={showModalProfile}
                        userData={dataReciclador.perfil}
                    />
                )

            }
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