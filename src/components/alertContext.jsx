import React, { createContext, useContext, useState } from 'react';
import { AlertModal } from './modals';

// Crear el contexto
const AlertContext = createContext();

// Proveedor del contexto
export const AlertProvider = ({ children }) => {
    const [modalConfig, setModalConfig] = useState({ show: false, text: '', btn_text: '' });

    // Función para mostrar el modal
    const showAlert = (text, btn_text = 'Aceptar') => {
        setModalConfig({ show: true, text, btn_text });
    };

    // Función para ocultar el modal
    const hideAlert = () => {
        setModalConfig((prev) => ({ ...prev, show: false }));
    };

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            {modalConfig.show && (
                <AlertModal
                    text={modalConfig.text}
                    btn_text={modalConfig.btn_text}
                    onClose={hideAlert}
                />
            )}
        </AlertContext.Provider>
    );
};

// Hook para usar el contexto en cualquier parte
export const useAlert = () => useContext(AlertContext);
