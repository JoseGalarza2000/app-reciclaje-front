import React, { useEffect, useState, useRef, useContext } from 'react';
import { Button } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, useMap, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder';
import 'leaflet/dist/leaflet.css';  // Importa el CSS de Leaflet
import MyLocationIcon from '@mui/icons-material/MyLocation';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import ReactDOM from 'react-dom/client';
import { BorderSpinnerBasic } from './loadingSpinner';
import { ReciclarContext } from './reciclarContext';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { StarRating } from "../components/startRating"
import { useTheme } from './themeContext';
import { Skeleton } from '@mui/material';
import { Card } from './cards';
import { Button as ButtonMui } from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import { CentrosAcopioContext } from './centrosAcopioContext';
import { CarouselFotos } from './carousel';
import { Button as ButtonBootstrap } from "react-bootstrap";
import { CustomModal } from './modals';
import { ModalProfile } from '../pages/profilePage';

// Corrige los íconos para evitar el problema de los íconos de marcador rotos
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

// ícono personalizado para ubicación actual - vista solicitante
const customIconUserLocation = new L.Icon({
    iconUrl: require('../media/map_user_pin.png'),
    iconSize: [25, 40], // tamaño del ícono
    iconAnchor: [12.5, 40], // punto del ícono que se corresponderá con la ubicación del marcador
    popupAnchor: [0, -40], // punto desde el cual se abrirá el popup relativo al íconoAnchor
    shadowSize: [41, 41]  // tamaño de la sombra
});

// ícono personalizado para ubicación actual - vista reciclador
const customIconUserLocation2 = new L.Icon({
    iconUrl: require('../media/map_user_pin2.png'),
    iconSize: [40, 40], // tamaño del ícono
    iconAnchor: [20, 20], // punto del ícono que se corresponderá con la ubicación del marcador
    popupAnchor: [0, -40], // punto desde el cual se abrirá el popup relativo al íconoAnchor
    shadowSize: [41, 41]  // tamaño de la sombra
});

// ícono personalizado para ubicación usuario
const customIconRecyclerLocation = new L.Icon({
    iconUrl: require('../media/map_recycler_pin.png'),
    iconSize: [31, 40], // tamaño del ícono
    iconAnchor: [15.5, 30], // punto del ícono que se corresponderá con la ubicación del marcador
    popupAnchor: [0, -40], // punto desde el cual se abrirá el popup relativo al íconoAnchor
    shadowSize: [41, 41]  // tamaño de la sombra
});

// Función para obtener la dirección a partir de coordenadas
const getAddressFromCoords = async (lat, lon) => {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
    const data = await response.json();
    console.log(data)
    return (data.display_name.split(",").slice(0, 2).join(","));
};


// Función para calcular la distancia entre dos puntos usando la fórmula de Haversine
const haversineDistance = (coords1, coords2) => {
    const toRad = (x) => x * Math.PI / 180;

    const lat1 = coords1[0];
    const lon1 = coords1[1];
    const lat2 = coords2[0];
    const lon2 = coords2[1];

    const R = 6371; // Radio de la Tierra en km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const CustomButtonControl = L.Control.extend({
    onAdd: function (map) {
        const btn = L.DomUtil.create('button', 'custom-button');
        btn.innerHTML = 'Find Nearest Center';
        return btn;
    },
    onRemove: function (map) {
        // No-op
    }
});

const GetAcopioMasCercano = ({ objCentrosAcopio }) => {
    const map = useMap();

    useEffect(() => {
        const customControl = new CustomButtonControl({ position: 'topright' });

        customControl.onAdd = function (map) {
            const btn = L.DomUtil.create('button', 'custom-button leaflet-bar custom-button-mapa');
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
            btn.style.padding = '5px';
            btn.style.setProperty('cursor', 'pointer', 'important');

            // Inicializa `createRoot` para este botón
            const root = ReactDOM.createRoot(btn);

            // Renderiza el ícono inicial
            root.render(<HomeWorkIcon />);

            //btn.innerHTML = 'Centro de acopio más cercano';
            btn.onclick = function (event) {
                event.stopPropagation();
                // Desactiva el botón y muestra el spinner
                btn.disabled = true;
                root.render(<BorderSpinnerBasic style={{ width: "1.5rem", height: "1.5rem" }} />);
                btn.style.setProperty('cursor', 'not-allowed', 'important');

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(position => {
                        const userLocation = [position.coords.latitude, position.coords.longitude];

                        // Lógica para encontrar el centro de acopio más cercano
                        let minDistance = Infinity;
                        let centroAcopio = null;

                        for (let center of objCentrosAcopio) {
                            const distance = haversineDistance(userLocation, center.ubicacion);
                            if (distance < minDistance) {
                                minDistance = distance;
                                centroAcopio = center;
                            }
                        }

                        if (centroAcopio) {
                            map.setView(centroAcopio.ubicacion, 15);
                        }
                        root.render(<HomeWorkIcon />);
                        btn.disabled = false;
                        btn.style.setProperty('cursor', 'pointer', 'important');
                    }, (error) => {
                        if (error.code === error.PERMISSION_DENIED) {
                            alert('No tenemos acceso a tu ubicación, antes debes conceder el permiso.');
                        } else {
                            alert('Error obteniendo la ubicación: ' + error.message);
                        }
                        root.render(<HomeWorkIcon />);
                        btn.disabled = false;
                        btn.style.setProperty('cursor', 'pointer', 'important');
                    });

                } else {
                    root.render(<HomeWorkIcon />);
                    btn.disabled = false;
                    btn.style.setProperty('cursor', 'pointer', 'important');
                    alert('Geolocation is not supported by this browser.');
                }
            };
            return btn;
        };

        map.addControl(customControl);
        return () => {
            map.removeControl(customControl);
        };
    }, [map, objCentrosAcopio]);

    return null;
};

const BtnGetLocation = ({ setUserLocation, setAddress, setLocation }) => {
    const map = useMap();

    useEffect(() => {
        const customControl = new L.Control({ position: 'topright' });

        customControl.onAdd = function (map) {
            const btn = L.DomUtil.create('button', 'custom-button leaflet-bar custom-button-mapa');
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
            btn.style.padding = '5px';
            btn.style.setProperty('cursor', 'pointer', 'important');

            const root = ReactDOM.createRoot(btn);
            root.render(<MyLocationIcon />);

            btn.onclick = async function () {
                setLocation(null);
                setAddress(null);
                // Desactiva el botón y muestra el spinner
                btn.disabled = true;
                root.render(<BorderSpinnerBasic style={{ width: "1.5rem", height: "1.5rem" }} />);
                btn.style.setProperty('cursor', 'not-allowed', 'important');

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(async (position) => {
                        const newLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        setUserLocation(newLocation);
                        map.setView(new L.LatLng(newLocation.lat, newLocation.lng), 14); // Centra y hace zoom al mapa

                        // Obtén la dirección y actualiza el estado
                        const addr = await getAddressFromCoords(newLocation.lat, newLocation.lng);
                        setLocation(newLocation.lat + "," + newLocation.lng);
                        setAddress(addr);

                        root.render(<MyLocationIcon />);
                        btn.disabled = false;
                        btn.style.setProperty('cursor', 'pointer', 'important');
                    }, (error) => {
                        if (error.code === error.PERMISSION_DENIED) {
                            alert('No tenemos acceso a tu ubicación, antes debes conceder el permiso.');
                        } else {
                            alert('Error obteniendo la ubicación: ' + error.message);
                        }
                        root.render(<MyLocationIcon />);
                        btn.disabled = false;
                        btn.style.setProperty('cursor', 'pointer', 'important');
                    });
                } else {
                    btn.innerHTML = 'Obtener ubicación';
                    alert('Geolocalización no disponible.');
                    root.render(<MyLocationIcon />);
                    btn.disabled = false;
                    btn.style.setProperty('cursor', 'pointer', 'important');
                }
            };
            return btn;
        };

        map.addControl(customControl);
        return () => {
            map.removeControl(customControl);
        };
    }, [map, setAddress, setLocation, setUserLocation]);

    return null;
};

const InformacionReciclador = ({ id_reciclador }) => {
    const [dataReciclador, setDataReciclador] = useState('');
    const [loading, setLoading] = useState(true); // cargando
    const [showModalProfile, setShowModalProfile] = useState(false);

    useEffect(() => {
        
        const fetchPerfil = async () => {
            console.log({ "id_usuario": id_reciclador })
            try {
                const response = await axios.post(
                    'https://rafaeloxj.pythonanywhere.com/api/v1/obtener_informacion_usuario/',
                    { "id_usuario": id_reciclador },
                    { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
                );
                if (response.data.success) {
                    console.log(response.data.data)
                    const perfil_info = response.data.data;
                    setDataReciclador(perfil_info);
                } else {
                    console.error('Error al obtener las solicitudes:', response.data.error);
                }
            } catch (error) {
                console.error('Error al obtener las solicitudes:', error);
            }
        };

        setLoading(true); // Establecer carga en true al comenzar la solicitud
        fetchPerfil().then(() => {
            setLoading(false);// Establecer carga en false cuando la solicitud finaliza (tanto si es exitosa como si falla)
        });
    }, [id_reciclador]);

    return (
        <div className="text-center" style={{ minWidth: "8rem" }}>
            {loading ?
                <BorderSpinnerBasic style={{ width: "1.5rem", height: "1.5rem" }} /> :
                (dataReciclador ?
                    (
                        <div className='d-flex flex-wrap justify-content-center' >
                            <img className="img-profile" src={dataReciclador.url_foto} alt='perfil' />

                            <span className='w-100 fw-bold'>
                                {dataReciclador.informacion_general.nombres.value.split(" ")[0] + " " + dataReciclador.informacion_general.apellidos.value.split(" ")[0]}
                            </span>
                            <StarRating rating={dataReciclador.calificacion} size={14} />
                            <Button className="text-center w-100 filledButton mt-2" type="submit" onClick={() => { setShowModalProfile(true); }}>
                                Ver perfil
                            </Button>
                            <Button className="text-center w-100 filledButton mt-2" type="submit">
                                Llamar
                            </Button>
                        </div>
                    ) :
                    (
                        <span>error al obtener el reciclador</span>
                    )
                )
            }
            {
                showModalProfile && (
                    <ModalProfile
                        modalTitle="Perfil del reciclador"
                        setShowModal={setShowModalProfile}
                        showModal={showModalProfile}
                        userData={dataReciclador}
                    />
                )
            }
        </div>
    );
};

const InformacionSolicitante = ({ id_usuario }) => {
    const [dataSolicitante, setDataSolicitante] = useState('');
    const [loading, setLoading] = useState(true); // cargando
    const [showModalProfile, setShowModalProfile] = useState(false);
    
    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const response = await axios.post(
                    'https://rafaeloxj.pythonanywhere.com/api/v1/obtener_informacion_usuario/',
                    { "id_usuario": id_usuario },
                    { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
                );
                console.log(id_usuario);
                if (response.data.success) {
                    const perfil_info = response.data.data;
                    setDataSolicitante(perfil_info);
                } else {
                    console.error('Error al obtener las solicitudes:', response.data.error);
                }
            } catch (error) {
                console.error('Error al obtener las solicitudes:', error);
            }
        };
    
        setLoading(true); // Establecer carga en true al comenzar la solicitud
        fetchPerfil().then(() => {
            setLoading(false);// Establecer carga en false cuando la solicitud finaliza (tanto si es exitosa como si falla)
        });
    }, [id_usuario]);

    return (
        <div className="text-center" style={{ minWidth: "8rem" }}>
            {loading ?
                <BorderSpinnerBasic style={{ width: "1.5rem", height: "1.5rem" }} /> :
                (dataSolicitante ?
                    (
                        <div className='d-flex flex-wrap justify-content-center' >
                            <img className="img-profile" src={dataSolicitante.url_foto} alt='perfil' />

                            <span className='w-100 fw-bold'>
                                {dataSolicitante.informacion_general.nombres.value.split(" ")[0] + " " + dataSolicitante.informacion_general.apellidos.value.split(" ")[0]}
                            </span>
                            <StarRating rating={dataSolicitante.calificacion} size={14} />
                            <Button className="text-center w-100 filledButton mt-2" type="submit" onClick={() => { setShowModalProfile(true); }}>
                                Ver perfil
                            </Button>
                            <Button className="text-center w-100 filledButton mt-2" type="submit">
                                Llamar
                            </Button>
                        </div>
                    ) :
                    (
                        <span>error al obtener el usuario</span>
                    )

                )
            }
            {
                showModalProfile && (
                    <ModalProfile
                        modalTitle="Perfil del reciclador"
                        setShowModal={setShowModalProfile}
                        showModal={showModalProfile}
                        userData={dataSolicitante}
                    />
                )
            }
        </div>
    );
}

export const LocationSetter = ({ userLocation }) => {
    const map = useMap();
    const [hasSetCenter, setHasSetCenter] = useState(false); // Estado para validar si se ha establecido el centro

    useEffect(() => {
        if (userLocation && !hasSetCenter) {
            map.setView([userLocation.lat, userLocation.lng], 14); // Cambiar el centro y el zoom
            setHasSetCenter(true); // Marca que la vista ha sido establecida
        }
    }, [userLocation, hasSetCenter, map]);

    return null;
};

const Routing = () => {
    const map = useMap();
    const routingControlRef = useRef(null);
    const { setStartTimeCountDown, setEstadoSolicitud, estadoSolicitud,
         solicitudAceptada, localizacionReciclador, addressSolicitante } = useContext(ReciclarContext);
    const userState = useSelector((store) => store.user);
    
    // Refs para tener acceso a las variables más recientes
    const estadoSolicitudRef = useRef(estadoSolicitud);
    const solicitudAceptadaRef = useRef(solicitudAceptada);

    useEffect(() => {
        estadoSolicitudRef.current = estadoSolicitud;
        solicitudAceptadaRef.current = solicitudAceptada;
    }, [estadoSolicitud, solicitudAceptada]);
    
    useEffect(() => {
        if (!map || Object.keys(localizacionReciclador).length === 0 || Object.keys(addressSolicitante).length === 0) {
            return () => {
                if (routingControlRef.current) {
                    map.removeControl(routingControlRef.current); // Eliminar el control de rutas del mapa
                    routingControlRef.current = null; // Limpiar la referencia
                }
            };
        };

        const validLatLng = (lat, lng) => lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

        if (!validLatLng(localizacionReciclador.lat, localizacionReciclador.lng) || !validLatLng(addressSolicitante.lat, addressSolicitante.lng)) {
            console.log('Coordenadas invalidas');
            return;
        }

        if (!routingControlRef.current) {
            // Crear el control de rutas solo una vez
            const routingControl = L.Routing.control({
                waypoints: [
                    L.latLng(localizacionReciclador.lat, localizacionReciclador.lng),
                    L.latLng(addressSolicitante.lat, addressSolicitante.lng)
                ],
                show: false,  // Oculta el cuadro de información
                routeWhileDragging: true,
                geocoder: L.Control.Geocoder.nominatim(),
                router: L.Routing.osrmv1({
                    serviceUrl: 'https://router.project-osrm.org/route/v1'
                }),
                createMarker: () => null,  // Evita agregar marcadores automáticamente
                lineOptions: {
                    styles: [
                        { color: 'green', opacity: 0.7, weight: 4 }
                    ]
                },
                altLineOptions: {
                    styles: [
                        { color: 'gray', opacity: 0.5, weight: 3 },
                    ]
                }
            }).addTo(map);

            //proceso la respuesta del servicio serviceUrl: 'https://router.project-osrm.org/route/v1'
            routingControl.on('routesfound', async function (e) {
                const routes = e.routes;
                if (routes && routes.length > 0) {
                    console.log("Estado solicitud: " + estadoSolicitudRef.current)
                    const distance = routes[0].summary.totalDistance; // Distancia en metros
                    if (estadoSolicitudRef.current !== '' && estadoSolicitudRef.current !== "CU") {
                        //console.log((distance / 1000).toFixed(1) + "km", Math.round(time / 60) + "min");
                        let estado = (distance < 50000) ? "L" : "A";//si la distancia es menor a 50m actualizo el estado de la solicitud
                        try {
                            const response = await axios.post(
                                'https://rafaeloxj.pythonanywhere.com/aceptar_solicitud_y_actualizar_ubicacion/',
                                {
                                    "id_solicitud": solicitudAceptadaRef.current.id_solicitud,
                                    "id_usuario": userState.id_usuario,
                                    "ubicacion_reciclador": JSON.stringify([localizacionReciclador.lat, localizacionReciclador.lng]),
                                    "estado": estado
                                },
                                { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
                            );

                            if (response.data.success) {
                                if (response.data.data.estado === "L") {
                                    let fecha_arribo = response.data.data.fecha_arribo;
                                    setStartTimeCountDown(Math.floor(new Date(fecha_arribo).getTime() / 1000))
                                }
                                setEstadoSolicitud(response.data.data.estado);
                                console.log("se envió ubicación actual");
                            } else {
                                console.log("Error " + response.data.error);
                            }
                        } catch (error) {
                            console.error(error);
                            console.log('Ocurrió un error al procesar la solicitud');
                        }
                    }
                }
            });

            routingControlRef.current = routingControl;
        } else {
            // Solo actualiza los waypoints si ya existe el control
            routingControlRef.current.setWaypoints([
                L.latLng(localizacionReciclador.lat, localizacionReciclador.lng),
                L.latLng(addressSolicitante.lat, addressSolicitante.lng)
            ]);
        }
    }, [map, localizacionReciclador, addressSolicitante, setEstadoSolicitud, setStartTimeCountDown, userState.id_usuario]); // Solo vuelve a ejecutar el efecto si el mapa, el inicio o el final cambian

    return null;
};

const ResizeObserverMap = ({ containerRef }) => {
    const map = useMap();

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver(() => {
            map.invalidateSize(); // Ajusta el tamaño del mapa
        });

        observer.observe(containerRef.current); // Observar cambios en el contenedor

        // Limpieza
        return () => {
            observer.disconnect();
        };
    }, [map, containerRef]);

    return null;
};

export const MapaRecicladorSolicitudReciclaje = () => {
    const { theme } = useTheme();
    const { setLocalizacionReciclador, usuarioSolicitante, setShowFormReciclar, 
        setDisableShowForm, addressSolicitante, localizacionReciclador } = useContext(ReciclarContext);
    const mapContainerRef = useRef(null);
    const hasSetInitialRef = useRef(false);
    //ubicación en tiempo real
    useEffect(() => {
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                async (position) => {
                    setLocalizacionReciclador({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    console.log("se obtuvo la localización");
                    console.log({ lat: position.coords.latitude, lng: position.coords.longitude });
                    // Si es la primera vez que se obtiene ubicacion, actualiza los estados
                    if (!hasSetInitialRef.current) {
                        setShowFormReciclar(true);
                        setDisableShowForm(false);
                        hasSetInitialRef.current = true; // Marcar que ya se ha realizado
                    }
                },
                error => {
                    if (error.code === error.PERMISSION_DENIED) {
                        alert('No tenemos acceso a tu ubicación, antes debes conceder el permiso.');
                    } else {
                        console.log('Error obteniendo la ubicación: ' + error.message);
                    }
                }
            );

            // Limpiar el seguimiento cuando el componente se desmonte
            return () => navigator.geolocation.clearWatch(watchId);
        } else {
            alert('Geolocalización no disponible.');
        }
    }, [setDisableShowForm, setLocalizacionReciclador, setShowFormReciclar]);

    return (
        <div ref={mapContainerRef} className="map-wrapper" style={{ width: '100%', height: "100%" }} >
            <MapContainer className={theme === "dark" ? 'dark_map' : ''} center={[-1.831239, -78.183406]} zoom={7} style={{ width: '100%', height: '100%' }}>
                <ResizeObserverMap containerRef={mapContainerRef} />
                <LocationSetter userLocation={localizacionReciclador} /> {/* Componente para establecer centro y zoom */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {localizacionReciclador && (
                    <Marker position={[localizacionReciclador.lat, localizacionReciclador.lng]} icon={customIconUserLocation2}></Marker>
                )}
                {addressSolicitante && Object.keys(addressSolicitante).length > 0 && (
                    <Marker position={[addressSolicitante.lat, addressSolicitante.lng]} icon={customIconRecyclerLocation}>
                        <Popup>
                            <InformacionSolicitante id_usuario={usuarioSolicitante} />
                        </Popup>
                    </Marker>
                )}
                <Routing/>
            </MapContainer>
        </div>
    );
};

export const MapaUsuarioSolicitudReciclaje = () => {
    const { theme } = useTheme();
    const [userLocation, setUserLocation] = useState(null);
    const { address, setAddress, setLocation, localizacionReciclador,
        disableShowForm, recicladorSolicitud, setShowFormReciclar, setDisableShowForm } = useContext(ReciclarContext); // Usa el contexto para manejar el address
    const markerRef = useRef(null);
    const popupRef = useRef(null);
    const mapContainerRef = useRef(null);
    const hasSetInitialRef = useRef(false);

    useEffect(() => {
        if (markerRef.current && popupRef.current) {
            if (!disableShowForm) {
                markerRef.current.openPopup();
            } else {
                markerRef.current.closePopup();
            }
        }
    }, [userLocation, address, disableShowForm]);

    useEffect(() => {
        setLocation(null);
        setAddress(null);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });
                // Obtengo la dirección y actualizo el estado
                const addr = await getAddressFromCoords(latitude, longitude);
                setLocation(latitude + "," + longitude);
                setAddress(addr);
                // Si es la primera vez, actualiza los estados
                if (!hasSetInitialRef.current) {
                    setShowFormReciclar(true);
                    setDisableShowForm(false);
                    hasSetInitialRef.current = true; // Marcar que ya se ha realizado
                }
            }, (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    alert('No tenemos acceso a tu ubicación, antes debes conceder el permiso.');
                } else {
                    alert('Error obteniendo la ubicación: ' + error.message);
                }
            });
        } else {
            alert('Geolocalización no disponible.');
        }
    }, [setAddress, setDisableShowForm, setLocation, setShowFormReciclar]);

    return (
        <div ref={mapContainerRef} className="map-wrapper mapa-usuario-solicitante" style={{ width: '100%', height: '100%' }}>
            <MapContainer className={theme === "dark" ? 'dark_map' : ''} center={[-1.831239, -78.183406]} zoom={7} style={{ width: '100%', height: '100%' }} >
                <ResizeObserverMap containerRef={mapContainerRef} />
                <LocationSetter userLocation={userLocation} /> {/* Componente para establecer centro y zoom */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={customIconUserLocation} ref={markerRef} bubblingMouseEvents={false}>
                        <Popup
                            ref={popupRef}
                            closeButton={false}
                            closeOnEscapeKey={false}
                            closeOnClick={false}
                            autoClose={false}
                        >
                            {address ? (
                                <div>
                                    <p>{address}</p>
                                </div>
                            ) : (
                                <BorderSpinnerBasic style={{ width: "1.5rem", height: "1.5rem" }} />
                            )}
                        </Popup>
                    </Marker>
                )}
                {localizacionReciclador && recicladorSolicitud && (
                    <Marker position={[localizacionReciclador.lat, localizacionReciclador.lng]} icon={customIconRecyclerLocation}>
                        <Popup>
                            <InformacionReciclador id_reciclador={recicladorSolicitud} />
                        </Popup>
                    </Marker>
                )}
                <BtnGetLocation setUserLocation={setUserLocation} setAddress={setAddress} setLocation={setLocation}></BtnGetLocation>
            </MapContainer>
        </div>
    );
};


// Definir el ícono personalizado
const iconCentroAcopio = new L.Icon({
    iconUrl: require('../media/map_CA_pin.png'),
    iconSize: [31, 40], // tamaño del ícono
    iconAnchor: [15.5, 30], // punto del ícono que se corresponderá con la ubicación del marcador
    popupAnchor: [0, -40], // punto desde el cual se abrirá el popup relativo al íconoAnchor
    shadowSize: [41, 41]  // tamaño de la sombra
});

// Definir el ícono personalizado
const iconAddCentroAcopio = new L.Icon({
    iconUrl: require('../media/map_add_CA_pin.png'),
    iconSize: [31, 40], // tamaño del ícono
    iconAnchor: [15.5, 30], // punto del ícono que se corresponderá con la ubicación del marcador
    popupAnchor: [0, -40], // punto desde el cual se abrirá el popup relativo al íconoAnchor
    shadowSize: [41, 41]  // tamaño de la sombra
});

export const MapComponentBasic = ({ objCentrosAcopio }) => {
    const [userLocation, setUserLocation] = useState(null);
    const { theme, animationSkeleton } = useTheme();

    // Intentar obtener la ubicación del usuario
    useEffect(() => {
        const getUserLocation = () => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setUserLocation({ lat: latitude, lng: longitude });
                    },
                    (error) => {
                        if (error.code === error.PERMISSION_DENIED) {
                            alert("No tenemos acceso a tu ubicación, debes conceder el permiso.");
                        } else {
                            alert('Error obteniendo la ubicación: ' + error.message);
                        }
                    }
                );
            } else {
                alert("La geolocalización no está disponible en este navegador.");
            }
        };

        getUserLocation();
    }, []);

    return (
        <div className='map-container mb-5'>
            {(objCentrosAcopio && objCentrosAcopio.length > 0) ?
                <MapContainer
                    className={theme === "dark" ? 'dark_map' : ''}
                    center={[-1.831239, -78.183406]}
                    zoom={7}
                    scrollWheelZoom={false}
                    style={{ width: '100%', height: '100%' }}
                >
                    <LocationSetter userLocation={userLocation} /> {/* Componente para establecer centro y zoom */}
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {

                        objCentrosAcopio.map(value => (
                            <Marker position={value.ubicacion} key={value.id} icon={iconCentroAcopio}>
                                <Popup>
                                    <CentroAcopioData objCentroAcopio={value} isVisitante={true} />
                                </Popup>
                            </Marker>
                        ))

                    }
                    <GetAcopioMasCercano objCentrosAcopio={objCentrosAcopio} />
                </MapContainer> :
                <div className='w-100 h-100'>
                    <Skeleton variant="rounded" width="100%" height="100%" animation={animationSkeleton} />
                </div>
            }
        </div>
    );
}

export const CentroAcopioData = ({ objCentroAcopio, isVisitante }) => {
    const { setLocationCentroAcopio, setReferenciaCentroAcopio, setInformacionCentroAcopio,
        setShowFormCentroAcopio, setDisableShowForm, setNombreCentroAcopio,
        setActionForm, setIdCentroAcopio, setFotosAnt, setCAContent,
        setUserMarker, markerRef } = useContext(CentrosAcopioContext);
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const [sending, setSending] = useState(false);

    const handleConfirmDelete = async (objCentroAcopio, markerRef) => {
        setSending(true);
        const json = {
            "id_centro": objCentroAcopio.id,
            "organizacion": objCentroAcopio.organizacion.id_usuario
        }

        try {
            const response = await axios.post(
                'https://rafaeloxj.pythonanywhere.com/api/v1/eliminar_centros_acopio/',
                json,
                { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
            );
            if (response.data.success) {
                setCAContent(response.data.data);
                setSending(false);
                setShowConfirmDeleteModal(false);
            } else {
                console.log("Error " + response.data.error);
                setSending(false);
            }
        } catch (error) {
            console.error(error);
            console.log('Ocurrió un error al procesar la solicitud');
            setSending(false);
        }
    };

    const handleCancelDelete = () => {
        setShowConfirmDeleteModal(false);
    };

    const editarCentroAcopio = (objCentroAcopio) => {
        setActionForm('Editar');
        setDisableShowForm(false);
        setShowFormCentroAcopio(true);
        setIdCentroAcopio(objCentroAcopio.id);
        setLocationCentroAcopio(objCentroAcopio.ubicacion);
        setReferenciaCentroAcopio(objCentroAcopio.referencia);
        setInformacionCentroAcopio(objCentroAcopio.informacion);
        setNombreCentroAcopio(objCentroAcopio.nombre_acopio);
        setFotosAnt(objCentroAcopio.fotos);
        // Remueve el marcador si existe
        if (markerRef.current) {
            markerRef.current.remove();
            setUserMarker(null);  // Limpia el estado del marcador
        }
    }

    return (
        <>
            <h6 className='fw-bold text-center' style={{ color: 'var(--bs-primary)' }}>{objCentroAcopio.nombre_acopio}</h6>
            {objCentroAcopio.organizacion &&
                <>
                    <CarouselFotos arrFotos={objCentroAcopio.fotos} />
                    <Card >
                        <div className='d-flex gap-2 pt-2 pb-2'>
                            <div className='w-auto'>
                                <img className="img-profile" src={objCentroAcopio.organizacion.url_foto} alt='perfil' />
                            </div>
                            <div className='w-auto d-flex flex-wrap'>
                                <label className='me-1 fw-bold w-100' style={{ color: 'var(--bs-primary)' }}>
                                    {objCentroAcopio.organizacion.razon_social}
                                </label>
                                <label style={{ color: 'var(--bs-info)' }}>
                                    {objCentroAcopio.organizacion.ruc}
                                </label>
                            </div>
                        </div>
                    </Card>
                </>
            }
            <div className='info-centro-acopio mt-2'>
                <div className='mb-2'>
                    <h6 className='fw-bold'>Referencia</h6>
                    <p className='p-0 m-0'>{objCentroAcopio.referencia}</p>
                </div>
                <div>
                    <h6 className='fw-bold'>Información</h6>
                    <p className='p-0 m-0'>{objCentroAcopio.informacion}</p>
                </div>
            </div>
            {!isVisitante &&
                <div className='w-100 mt-3'>
                    <ButtonMui className='w-50'
                        style={{ justifyContent: 'center', color: "var(--bs-green)" }}
                        onClick={() => editarCentroAcopio(objCentroAcopio)}
                    >
                        <EditIcon style={{ marginRight: "1rem", fontSize: '1.8rem' }} />
                        <span>Editar</span>
                    </ButtonMui>
                    <ButtonMui className='w-50'
                        style={{ justifyContent: 'center', color: "var(--bs-danger)" }}
                        onClick={() => setShowConfirmDeleteModal(true)}
                    >
                        <CloseOutlined style={{ marginRight: "1rem", fontSize: '1.8rem' }} />
                        <span>Eliminar</span>
                    </ButtonMui>
                </div>
            }
            <CustomModal showModal={showConfirmDeleteModal}>
                <div className="d-flex justify-content-center flex-wrap p-4">
                    <p className="text-center">¿Esta seguro de eliminar el centro de acopio <b>{objCentroAcopio.nombre_acopio}</b>?</p>
                    <div className='d-flex justify-content-around w-100'>
                        <ButtonBootstrap
                            className="text-center filledButton"
                            type="submit"
                            style={{ width: "45%" }}
                            onClick={() => handleConfirmDelete(objCentroAcopio, markerRef)}
                            disabled={sending}
                        >
                            Aceptar {sending && <BorderSpinnerBasic style={{ width: "1rem", height: "1rem" }} />}
                        </ButtonBootstrap>
                        <ButtonBootstrap
                            className="text-center unFilledButton"
                            type="button"
                            style={{ width: "45%" }}
                            onClick={handleCancelDelete}
                            disabled={sending}
                        >
                            Cancelar
                        </ButtonBootstrap>
                    </div>
                </div>
            </CustomModal>
        </>
    );
}

export const MapRegistrarCentrosAcopio = ({ objCentrosAcopio }) => {
    const [userLocation, setUserLocation] = useState(null);
    const { theme } = useTheme();
    const [tempMarkerPosition, setTempMarkerPosition] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const { setLocationCentroAcopio, setReferenciaCentroAcopio, setInformacionCentroAcopio,
        setShowFormCentroAcopio, setDisableShowForm, setNombreCentroAcopio, setActionForm,
        setIdCentroAcopio, setFotosAnt, markerRef, userMarker, setUserMarker } = useContext(CentrosAcopioContext);
    const mapContainerRef = useRef(null);

    // Intentar obtener la ubicación del usuario
    useEffect(() => {
        const getUserLocation = () => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setUserLocation({ lat: latitude, lng: longitude });
                    },
                    (error) => {
                        if (error.code === error.PERMISSION_DENIED) {
                            alert("No tenemos acceso a tu ubicación, debes conceder el permiso.");
                        } else {
                            alert('Error obteniendo la ubicación: ' + error.message);
                        }
                    }
                );
            } else {
                alert("La geolocalización no está disponible en este navegador.");
            }
        };

        getUserLocation();
    }, []);

    // Componente para manejar clics en el mapa y agregar un marcador del usuario
    const UserMarkerSetter = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setTempMarkerPosition([lat, lng]);
                setShowConfirmModal(true); // Mostrar el modal de confirmación
            },
        });


        return userMarker ? (
            <Marker position={userMarker} icon={iconAddCentroAcopio} ref={markerRef}>
                <Popup>
                    Ubicación del nuevo centro de acopio
                </Popup>
            </Marker>
        ) : null;
    };

    // Función para confirmar la ubicación del nuevo marcador
    const handleConfirm = () => {
        setUserMarker(tempMarkerPosition); // Actualiza el marcador con la posición confirmada
        setLocationCentroAcopio(tempMarkerPosition);
        setNombreCentroAcopio('');
        setInformacionCentroAcopio('');
        setReferenciaCentroAcopio('');
        setIdCentroAcopio('');
        setFotosAnt('');
        setActionForm('Registrar');
        setShowConfirmModal(false);
        setDisableShowForm(false);
        setShowFormCentroAcopio(true);
    };

    // Función para cancelar la colocación del marcador
    const handleCancel = () => {
        setTempMarkerPosition(null);
        setShowConfirmModal(false);
    };

    return (
        <div ref={mapContainerRef} className="map-wrapper" style={{ width: '100%', height: '100%' }}>
            <MapContainer
                markerZoomAnimation
                className={theme === "dark" ? 'dark_map' : ''}
                center={[-1.831239, -78.183406]}
                zoom={7}
                style={{ width: '100%', height: '100%' }}
            >
                <ResizeObserverMap containerRef={mapContainerRef} />
                <LocationSetter userLocation={userLocation} /> {/* Componente para establecer centro y zoom */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {

                    objCentrosAcopio && objCentrosAcopio.length > 0 && objCentrosAcopio.map(value => (
                        <Marker position={value.ubicacion} key={value.id} icon={iconCentroAcopio}>
                            <Popup>
                                <CentroAcopioData objCentroAcopio={value} />
                            </Popup>
                        </Marker>
                    ))

                }
                <GetAcopioMasCercano objCentrosAcopio={objCentrosAcopio} />
                <UserMarkerSetter />
            </MapContainer>
            <CustomModal showModal={showConfirmModal}>
                <div className="d-flex justify-content-center flex-wrap p-4">
                    <p className="text-center">¿Esta seguro de agregar un centro de acopio en la ubicación seleccionada?</p>
                    <div className='d-flex justify-content-around w-100'>
                        <ButtonBootstrap
                            className="text-center filledButton"
                            type="submit"
                            style={{ width: "45%" }}
                            onClick={handleConfirm}
                        >
                            Aceptar
                        </ButtonBootstrap>
                        <ButtonBootstrap
                            className="text-center unFilledButton"
                            type="button"
                            style={{ width: "45%" }}
                            onClick={handleCancel}
                        >
                            Cancelar
                        </ButtonBootstrap>
                    </div>
                </div>
            </CustomModal>
        </div>
    );
};