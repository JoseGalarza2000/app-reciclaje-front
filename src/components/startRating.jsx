import React, { useState } from 'react';
import StarRatingComponent from 'react-star-rating-component';
import { faStar, faStarHalfAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const StarRating = ({ rating, size }) => {
  return (
    <StarRatingComponent
      name="rate1"
      starCount={5}
      value={rating}
      starColor="#ffd700"
      emptyStarColor="gray"
      editing={false}
      renderStarIcon={(index, value) => {
        const isFull = index <= value;
        const isHalf = index - 0.5 === value;

        return (
          <FontAwesomeIcon
            icon={isFull ? faStar : (isHalf ? faStarHalfAlt : faStar)}
            fontSize={size}
            style={{ color: isFull || isHalf ? "#ffd700" : "gray" }}
          />
        );
      }}
    />
  );
};

export const StarRatingSelectable = ({ rating, size, onRatingChange }) => {
  const [startRating, setStartRating] = useState(rating);
  const [hoverRating, setHoverRating] = useState(0);  // Estado para manejar el hover

  // Función para manejar el clic en las estrellas
  const handleStarClick = (nextValue) => {
    setStartRating(nextValue);  // Actualiza el estado con el nuevo valor
    if (onRatingChange) {
      onRatingChange(nextValue);  // Notifica al componente padre
    }
  };

  // Función para manejar el hover en las estrellas
  const handleStarHover = (nextValue) => {
    setHoverRating(nextValue);
  };

  // Función para manejar cuando el hover sale de las estrellas
  const handleStarHoverOut = () => {
    setHoverRating(0);  // Restablece el estado del hover
  };

  return (
    <StarRatingComponent
      name="rate2"
      starCount={5}
      value={hoverRating || startRating}  // Muestra la calificación en hover o la seleccionada
      starColor="#ffd700"
      emptyStarColor="gray"
      onStarClick={handleStarClick}  // Función que se ejecuta al hacer clic en una estrella
      onStarHover={handleStarHover}  // Función para manejar el hover
      onStarHoverOut={handleStarHoverOut}  // Función para manejar cuando el hover sale
      renderStarIcon={(index, value) => {
        const isFull = index <= value;
        const isHalf = index - 0.5 === value;

        return (
          <FontAwesomeIcon
            icon={isFull ? faStar : (isHalf ? faStarHalfAlt : faStar)}
            fontSize={size}
            style={{ color: isFull || isHalf ? "#ffd700" : "gray" }}
          />
        );
      }}
      renderStarIconHalf={() => (
        <FontAwesomeIcon icon={faStarHalfAlt} fontSize={size} style={{ color: "#ffd700" }} />
      )}
    />
  );
};

