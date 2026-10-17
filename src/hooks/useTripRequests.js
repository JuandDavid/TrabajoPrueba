import { useState, useEffect, useCallback } from 'react';
import { useTrip } from '../context/TripContext';

const REQUEST_TIMEOUT_SECONDS = 15;

/**
 * Hook para gestionar solicitudes entrantes con temporizador de 15 segundos y rechazo automático.
 * Requisito del PDF:
 * - useState para solicitud activa
 * - useEffect con función de limpieza para el temporizador
 * - useCallback para manejadores de aceptar y rechazar
 */
export function useTripRequests() {
  const { incomingRequest, acceptRequest, rejectRequest } = useTrip();
  const [secondsLeft, setSecondsLeft] = useState(REQUEST_TIMEOUT_SECONDS);

  // Manejador memoizado para aceptar solicitud
  const handleAccept = useCallback(() => {
    acceptRequest();
  }, [acceptRequest]);

  // Manejador memoizado para rechazar solicitud
  const handleReject = useCallback(() => {
    rejectRequest();
  }, [rejectRequest]);

  // Temporizador de 15 segundos con limpieza obligatoria
  useEffect(() => {
    if (!incomingRequest) {
      setSecondsLeft(REQUEST_TIMEOUT_SECONDS);
      return;
    }

    setSecondsLeft(REQUEST_TIMEOUT_SECONDS);

    const intervalId = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          handleReject(); // Expira automáticamente al llegar a cero
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Limpieza al desmontar o al cerrarse la solicitud
    return () => {
      clearInterval(intervalId);
    };
  }, [incomingRequest, handleReject]);

  return {
    incomingRequest,
    secondsLeft,
    acceptRequest: handleAccept,
    rejectRequest: handleReject,
  };
}
