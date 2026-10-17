import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

// Coordenadas iniciales didácticas (Bogotá - Parque de la 93)
const DEFAULT_COORDS = {
  latitude: 4.6768,
  longitude: -74.0482,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

/**
 * Hook personalizado para seguimiento de la ubicación del conductor en tiempo real.
 * Requisito del PDF: useEffect con función de limpieza para detener el seguimiento al salir o cambiar disponibilidad.
 *
 * @param {boolean} isAvailable - Si el conductor está activo/disponible
 */
export function useDriverLocation(isAvailable) {
  const [location, setLocation] = useState(DEFAULT_COORDS);
  const [hasPermission, setHasPermission] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let subscriber = null;
    let isMounted = true;

    async function startLocationTracking() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (isMounted) {
            setErrorMsg('Permiso de ubicación denegado. Usando ubicación simulada.');
            setHasPermission(false);
          }
          return;
        }

        if (isMounted) {
          setHasPermission(true);
          setErrorMsg(null);
        }

        // Obtener posición inicial
        const initial = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (isMounted && initial?.coords) {
          setLocation({
            latitude: initial.coords.latitude,
            longitude: initial.coords.longitude,
            latitudeDelta: 0.012,
            longitudeDelta: 0.012,
          });
        }

        // Si está disponible, suscribirse a cambios de posición
        if (isAvailable) {
          subscriber = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 4000,   // cada 4 segundos
              distanceInterval: 10, // cada 10 metros
            },
            (newLoc) => {
              if (isMounted && newLoc?.coords) {
                setLocation({
                  latitude: newLoc.coords.latitude,
                  longitude: newLoc.coords.longitude,
                  latitudeDelta: 0.012,
                  longitudeDelta: 0.012,
                });
              }
            }
          );
        }
      } catch (err) {
        if (isMounted) {
          setErrorMsg(err.message || 'Error al obtener ubicación');
        }
      }
    }

    startLocationTracking();

    // Función de limpieza de useEffect (Obligatoria por el PDF para evitar fugas de memoria y gasto de batería)
    return () => {
      isMounted = false;
      if (subscriber) {
        subscriber.remove();
      }
    };
  }, [isAvailable]);

  return { location, hasPermission, errorMsg };
}
