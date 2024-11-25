import React, { useState, useEffect, useRef } from 'react';
import { FormControl} from 'react-bootstrap';
import { useField } from 'formik';
import { useTheme } from './themeContext';

export const SelectWithSearchFormik = ({ options, emptyText, ...props }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [field, , helpers] = useField(props);
  const [showOptions, setShowOptions] = useState(false);
  const [cleanText, setCleanText] = useState(false);
  const optionsRef = useRef(null); // Referencia al div de opciones
  const inputRef = useRef(null); // Referencia al div de opciones
  const { theme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target) && event.target !== inputRef.current) {
        setShowOptions(false);
        cleanText && setSearchTerm("");
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [cleanText]);

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
    setShowOptions(true); // Mostrar opciones cuando se empiece a escribir
    setCleanText(true); // se limpia el campo de texto si dan click fuera del div de opciones
  };

  const handleOptionClick = (idOption, value) => {
    setSearchTerm(value);
    helpers.setValue(idOption);
    setShowOptions(false); // Ocultar opciones al hacer clic en una opción
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <FormControl
        as="input"
        {...field}
        type="text"
        value={searchTerm}
        onChange={handleChange}
        onClick={(e) => {setShowOptions(true); setCleanText(false);}}
        {...props}
        autoComplete="off" // Desactivar autocompletado del navegador
        ref={inputRef}
      />
      {showOptions && (
        <div className="SearchCombo" ref={optionsRef} bg={theme === "dark" ? theme : ""}>
          {filteredOptions.length !== 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                style={{ cursor: 'pointer' }}
                onClick={() => handleOptionClick(option.value, option.label)}
              >
                {option.component ? option.component : option.label}
              </div>
            ))
          ) : (
              <div
                style={{ cursor: 'pointer' }}
                onClick={() => handleOptionClick("", "")}
              >
                {emptyText}
              </div>
          )}
        </div>
      )}
    </>
  );
};

export const SelectWithSearch = ({ options, onSelectFunction, emptyText, resetSearchOnSelect, ...props }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [cleanText, setCleanText] = useState(false);
  const optionsRef = useRef(null); // Referencia al div de opciones
  const inputRef = useRef(null); // Referencia al div de opciones
  const { theme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target) && event.target !== inputRef.current) {
        setShowOptions(false);
        cleanText && setSearchTerm("");
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [cleanText]);

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
    setShowOptions(true); // Mostrar opciones cuando se empiece a escribir
    setCleanText(true); // se limpia el campo de texto si dan click fuera del div de opciones
  };

  const handleOptionClick = (valueOption, label) => {
    resetSearchOnSelect ? setSearchTerm("") : setSearchTerm(label);
    setShowOptions(false); // Ocultar opciones al hacer clic en una opción
    onSelectFunction(valueOption, label);
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <FormControl
        as="input"
        type="text"
        value={searchTerm}
        onChange={handleChange}
        onClick={(e) => {setShowOptions(true); setCleanText(false);}}
        {...props}
        autoComplete="off" // Desactivar autocompletado del navegador
        ref={inputRef}
      />
      {showOptions && (
        <div className="SearchCombo" ref={optionsRef} bg={theme === "dark" ? theme : ""}>
          {filteredOptions.length !== 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.key || option.value}
                style={{ cursor: 'pointer' }}
                onClick={() => handleOptionClick(option.value, option.label)}
              >
                {option.component ? option.component : option.label}
              </div>
            ))
          ) : (
              <div
                style={{ cursor: 'pointer' }}
                onClick={() => handleOptionClick("", "")}
              >
                {emptyText}
              </div>
          )}
        </div>
      )}
    </>
  );
};
