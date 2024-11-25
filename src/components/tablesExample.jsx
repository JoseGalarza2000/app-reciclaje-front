import { useMemo, useState } from 'react';
import { MaterialReactTable, useMaterialReactTable, createMRTColumnHelper, MRT_EditActionButtons, createRow } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { mkConfig, generateCsv, download } from 'export-to-csv'; //or use your library of choice here
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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
    QueryClient,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';

//nested data is ok, see accessorKeys in ColumnDef below
const data = [
    {
        id_registro: "1",
        material: 'tetrapak',
        peso: '1kg',
        usuario_registro: 'John Doe',
        fecha_registro: '2024-04-30',
    },
    {
        id_registro: "2",
        material: 'cartón',
        peso: '0.8kg',
        usuario_registro: 'Alice Smith',
        fecha_registro: '2024-04-30',
    },
    {
        id_registro: "3",
        material: 'plástico',
        peso: '0.5kg',
        usuario_registro: 'Juan García',
        fecha_registro: '2024-04-30',
    },
    {
        id_registro: "4",
        material: 'vidrio',
        peso: '0.6kg',
        usuario_registro: 'Emily Johnson',
        fecha_registro: '2024-04-30',
    },
    {
        id_registro: "5",
        material: 'metal',
        peso: '1.2kg',
        usuario_registro: 'Carlos Rodríguez',
        fecha_registro: '2024-04-30',
    },
    {
        id_registro: "6",
        material: 'papel',
        peso: '0.4kg',
        usuario_registro: 'Sophia Brown',
        fecha_registro: '2024-04-30',
    },
    {
        id_registro: "7",
        material: 'aluminio',
        peso: '0.3kg',
        usuario_registro: 'Maria Martinez',
        fecha_registro: '2024-04-30',
    },
    {
        id_registro: "8",
        material: 'cobre',
        peso: '0.7kg',
        usuario_registro: 'Ahmed Khan',
        fecha_registro: '2024-04-30',
    },
    {
        id_registro: "9",
        material: 'plástico',
        peso: '0.6kg',
        usuario_registro: 'Emma Wilson',
        fecha_registro: '2024-04-30',
    },
    {
        id_registro: "10",
        material: 'cartón',
        peso: '0.3kg',
        usuario_registro: 'Liam Jones',
        fecha_registro: '2024-04-30',
    },
    {
        id_registro: "11",
        material: 'vidrio',
        peso: '0.9kg',
        usuario_registro: 'Olivia Davis',
        fecha_registro: '2024-04-30',
    },
    {
        id_registro: "12",
        material: 'metal',
        peso: '0.5kg',
        usuario_registro: 'Noah Gonzalez',
        fecha_registro: '2024-04-30',
    },
    {
        id_registro: "13",
        material: 'papel',
        peso: '0.6kg',
        usuario_registro: 'Isabella Martinez',
        fecha_registro: '2024-04-30',
    },
    {
        id_registro: "14",
        material: 'plástico',
        peso: '0.4kg',
        usuario_registro: 'Mia Lopez',
        fecha_registro: '2024-04-30',
    },
    {
        id_registro: "15",
        material: 'aluminio',
        peso: '0.3kg',
        usuario_registro: 'James Lee',
        fecha_registro: '2024-04-30',
    },
    {
        id_registro: "16",
        material: 'cobre',
        peso: '0.7kg',
        usuario_registro: 'Sophia Taylor',
        fecha_registro: '2024-04-30',
    },
    {
        id_registro: "17",
        material: 'vidrio',
        peso: '1.1kg',
        usuario_registro: 'Ethan Hernandez',
        fecha_registro: '2024-04-30',
    },
    {
        id_registro: "18",
        material: 'metal',
        peso: '0.8kg',
        usuario_registro: 'Ava King',
        fecha_registro: '2024-04-30',
    },
    {
        id_registro: "19",
        material: 'plástico',
        peso: '0.5kg',
        usuario_registro: 'Michael Wang',
        fecha_registro: '2024-04-30',
    },
    {
        id_registro: "20",
        material: 'papel',
        peso: '0.7kg',
        usuario_registro: 'Alexander Nguyen',
        fecha_registro: '2024-04-30',
    }
];

const Example = () => {
    //should be memoized or stable
    const columns = useMemo(
        () => [
            {
                accessorKey: 'id_registro', //access nested data with dot notation
                header: 'ID',
                enableClickToCopy: true,
            },
            {
                accessorKey: 'material', //access nested data with dot notation
                header: 'Material',
                size: 150,
                filterVariant: 'multi-select',
                filterSelectOptions: ["cartón", "tetrapak", "plástico", "vidrio", "metal", "papel", "cobre"],
                enableClickToCopy: true,
            },
            {
                accessorKey: 'peso',
                header: 'Peso',
                size: 150,
                filterFn: 'between',
                enableClickToCopy: true,
            },
            {
                accessorKey: 'usuario_registro', //normal accessorKey
                header: 'Usuario registro',
                size: 200,
                enableClickToCopy: true,
            },
            {
                accessorKey: 'fecha_registro',
                header: 'Fecha registro',
                size: 150,
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
            },
        ],
        [],
    );

    const table = useMaterialReactTable({
        columns,
        data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
        enableHiding: false,
        enableGlobalFilter: false,
        columnFilterDisplayMode: 'popover',
        paginationDisplayMode: 'pages',
        initialState: {
            pagination: { pageSize: 5, pageIndex: 0 },
            /*showGlobalFilter: true,*/
            /*showColumnFilters: true,*/
            sorting: [
                { id: 'fecha_registro', desc: false }, //sort by fecha_registro in ascending order by default
            ],
        },
        muiPaginationProps: {
            rowsPerPageOptions: [5, 10, 15, 20],
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
    });

    return <MaterialReactTable table={table} />;
};

export const TableBasicExample = () => (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Example />
    </LocalizationProvider>
);

const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
});

export const ExportTableCSVExample = () => {
    //should be memoized or stable
    const columns = useMemo(
        () => [
            {
                accessorKey: 'id_registro', //access nested data with dot notation
                header: 'ID',
                enableClickToCopy: true,
            },
            {
                accessorKey: 'material', //access nested data with dot notation
                header: 'Material',
                size: 150,
                filterVariant: 'multi-select',
                filterSelectOptions: ["cartón", "tetrapak", "plástico", "vidrio", "metal", "papel", "cobre"],
                enableClickToCopy: true,
            },
            {
                accessorKey: 'peso',
                header: 'Peso',
                size: 150,
                filterFn: 'between',
                enableClickToCopy: true,
            },
            {
                accessorKey: 'usuario_registro', //normal accessorKey
                header: 'Usuario registro',
                size: 200,
                enableClickToCopy: true,
            },
            {
                accessorKey: 'fecha_registro',
                header: 'Fecha registro',
                size: 150,
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
            },
        ],
        [],
    );

    const handleExportRows = (rows) => {
        const rowData = rows.map((row) => row.original);
        const csv = generateCsv(csvConfig)(rowData);
        download(csvConfig)(csv);
    };

    const handleExportData = () => {
        const csv = generateCsv(csvConfig)(data);
        download(csvConfig)(csv);
    };

    const table = useMaterialReactTable({
        columns,
        data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
        enableHiding: false,
        enableGlobalFilter: false,
        enableRowSelection: true,
        columnFilterDisplayMode: 'popover',
        paginationDisplayMode: 'pages',
        positionToolbarAlertBanner: 'bottom',
        initialState: {
            pagination: { pageSize: 5, pageIndex: 0 },
            /*showGlobalFilter: true,*/
            /*showColumnFilters: true,*/
            sorting: [
                { id: 'fecha_registro', desc: false }, //sort by fecha_registro in ascending order by default
            ],
        },
        muiPaginationProps: {
            rowsPerPageOptions: [5, 10, 15, 20],
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
                    //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
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
                <Button
                    disabled={table.getRowModel().rows.length === 0}
                    //export all rows as seen on the screen (respects pagination, sorting, filtering, etc.)
                    onClick={() => handleExportRows(table.getRowModel().rows)}
                    startIcon={<FileDownloadIcon />}
                >
                    Exportar página
                </Button>
                <Button
                    disabled={
                        !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
                    }
                    //only export selected rows
                    onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
                    startIcon={<FileDownloadIcon />}
                >
                    Exportar selección
                </Button>
            </Box>
        ),
    });
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MaterialReactTable table={table} />
        </LocalizationProvider>
    );
};

const queryClient = new QueryClient();

export const CRUDExportTableCSVExample = () => {
    const [validationErrors, setValidationErrors] = useState({});

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
                filterSelectOptions: ["cartón", "tetrapak", "plástico", "vidrio", "metal", "papel", "cobre"],
                enableClickToCopy: true,
                editVariant: 'select',
                editSelectOptions: [
                    { label: 'cartón', value: '1' },
                    { label: 'tetrapak', value: '2' },
                    { label: 'plástico', value: '3' },
                ],
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
        [validationErrors],
    );

    //call CREATE hook
    const { mutateAsync: createReciclaje, isPending: isCreatingReciclaje } = useCreateReciclaje();

    //call READ hook
    const {
        data: fetchedReciclajes = [],
        isError: isLoadingReciclajesError,
        isFetching: isFetchingReciclajes,
        isLoading: isLoadingReciclajes,
    } = useGetReciclajes();

    //call UPDATE hook
    const { mutateAsync: updateReciclaje, isPending: isUpdatingReciclaje } = useUpdateReciclaje();

    //call DELETE hook
    const { mutateAsync: deleteReciclaje, isPending: isDeletingReciclaje } = useDeleteReciclaje();

    //CREATE action
    const handleCreateReciclaje = async ({ values, table }) => {
        const newValidationErrors = validateReciclaje(values);
        console.log(values, newValidationErrors);
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

    const handleExportRows = (rows) => {
        const rowData = rows.map((row) => {
            const { id_registro, ...restoDatos } = row.original;//excluyo el id porque esta oculto
            return { ...restoDatos };
        });
        const csv = generateCsv(csvConfig)(rowData);
        download(csvConfig)(csv);
    };

    const handleExportData = () => {
        const data_ = data.map((obj) => {
            const { id_registro, ...restoDatos } = obj;//excluyo el id porque esta oculto
            return { ...restoDatos };
        });
        const csv = generateCsv(csvConfig)(data_);
        download(csvConfig)(csv);
    };

    const table = useMaterialReactTable({
        columns,
        data: fetchedReciclajes, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
        enableHiding: false,
        enableGlobalFilter: false,
        columnFilterDisplayMode: 'popover',
        paginationDisplayMode: 'pages',
        positionToolbarAlertBanner: 'bottom',
        createDisplayMode: 'modal', //default ('row', and 'custom' are also available)
        editDisplayMode: 'modal', //default ('row', 'cell', 'table', and 'custom' are also available)
        enableEditing: true,
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
            pagination: { pageSize: 5, pageIndex: 0 },
            /*showGlobalFilter: true,*/
            /*showColumnFilters: true,*/
            columnVisibility: { id_registro: false },
            density: 'compact',
            sorting: [
                { id: 'fecha_registro', desc: false }, //sort by fecha_registro in ascending order by default
            ],
        },
        muiPaginationProps: {
            rowsPerPageOptions: [5, 10, 15, 20],
        },
        //optionally customize modal content
        renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
            <>
                <DialogTitle variant="h3">Nuevo registro</DialogTitle>
                <DialogContent
                    sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                    {internalEditComponents.filter((x) => (x.key != "mrt-row-create_id_registro" && x.key != "mrt-row-create_fecha_registro"))} {/*omito id_registro, fecha_registro*/}
                    {/* or render custom edit components here */}
                </DialogContent>
                <DialogActions>
                    <MRT_EditActionButtons variant="text" table={table} row={row} />
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
                    <MRT_EditActionButtons variant="text" table={table} row={row} />
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
                                usuario_registro: "xdxd",
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
    });
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MaterialReactTable table={table} />
        </LocalizationProvider>
    );
};

//CREATE hook (post new reciclaje to api)
function useCreateReciclaje() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (reciclaje) => {
            //send api update request here
            console.log("alv")
            await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
            return Promise.resolve();
        },
        //client side optimistic update
        onMutate: (newReciclajeInfo) => {
            queryClient.setQueryData(['reciclajes'], (prevReciclajes) => [
                ...prevReciclajes,
                {
                    ...newReciclajeInfo,
                    fecha_registro: new Date().toLocaleDateString(),
                    /*id: (Math.random() + 1).toString(36).substring(7), se puede agregar valores por defecto */
                },
            ]);
        },
        //onSettled: () => queryClient.invalidateQueries({ queryKey: ['reciclajes'] }), //refetch reciclajes after mutation, disabled for demo
    });
}

//READ hook (get reciclajes from api)
function useGetReciclajes() {
    return useQuery({
        queryKey: ['reciclajes'],
        queryFn: async () => {
            //send api request here
            await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
            return Promise.resolve(data);
        },
        refetchOnWindowFocus: false,
    });
}

//UPDATE hook (put reciclaje in api)
function useUpdateReciclaje() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (reciclaje) => {
            //send api update request here
            await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
            return Promise.resolve();
        },
        //client side optimistic update
        onMutate: (newReciclajeInfo) => {
            queryClient.setQueryData(['reciclajes'], (prevReciclajes) =>
                prevReciclajes?.map((prevReciclaje) =>
                    prevReciclaje.id === newReciclajeInfo.id_registro ? newReciclajeInfo : prevReciclaje,
                ),
            );
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['reciclajes'] }), //refetch reciclajes after mutation, disabled for demo
    });
}

//DELETE hook (delete reciclaje in api)
function useDeleteReciclaje() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (reciclajeId) => {
            //send api update request here
            await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
            return Promise.resolve();
        },
        //client side optimistic update
        onMutate: (reciclajeId) => {
            queryClient.setQueryData(['reciclajes'], (prevReciclajes) =>
                prevReciclajes?.filter((reciclaje) => reciclaje.id_registro !== reciclajeId),
            );
        },
        // onSettled: () => queryClient.invalidateQueries({ queryKey: ['reciclaje'] }), //refetch reciclaje after mutation, disabled for demo
    });
}

const validateRequired = (value) => {
    return (value != "" && value !== undefined && (!!value && !!value.length));
}

const validateText = (value) => {
    const expresionRegular = /^[0-9]+$/;
    return expresionRegular.test(value);
}

function validateReciclaje(reciclaje) {
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

