import React, { useState, useEffect } from 'react';
import { ReciclarContext } from './reciclarContext';
import { useContext } from 'react';

const CountdownTimer = () => {
    const initialTime = 100; // 5 minutos en segundos
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isLoading, setIsLoading] = useState(true);
    const { startTimeCountDown, setStartTimeCountDown } = useContext(ReciclarContext);

    useEffect(() => {
        const getTimeLeft = () => {
            //const startTime = await fetchStartTimeFromServer();
            const now = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
            const elapsedTime = now - startTimeCountDown;
            const remainingTime = initialTime - elapsedTime;

            setTimeLeft(remainingTime > 0 ? remainingTime : 0);
            setIsLoading(false);

            if (remainingTime <= 0) {
                setStartTimeCountDown('');
            }
        };

        getTimeLeft();

        const intervalId = setInterval(() => {
            setTimeLeft((prevTimeLeft) => {
                if (prevTimeLeft <= 1) {
                    clearInterval(intervalId);
                    setStartTimeCountDown('');
                    return 0;
                }
                return prevTimeLeft - 1;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [setStartTimeCountDown, startTimeCountDown]);

    // Formatear tiempo en mm:ss
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secondsLeft = seconds % 60;
        return `${minutes}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;
    };

    if (isLoading) {
        return <div>Cargando...</div>;
    }

    return (
        <span>({formatTime(timeLeft)})</span>
    );
};

export default CountdownTimer;
