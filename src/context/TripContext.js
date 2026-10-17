import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateFare } from '../config/pricing';
import { useAuth } from './AuthContext';

const TripContext = createContext();

const STORAGE_KEYS = {
  ACTIVE_TRIP: '@uberclone_active_trip',
  TRIP_HISTORY: '@uberclone_trip_history',
};

// Viajes históricos iniciales para que las pantallas de Historial y Ganancias se puedan explorar de inmediato
const INITIAL_HISTORICAL_TRIPS = [
  {
    id: 'trip_hist_01',
    driverId: 'driver_fiera_01',
    passengerId: 'pass_01',
    passengerName: 'Laura Gómez',
    origin: { lat: 4.675, lng: -74.055, address: 'Centro Comercial Andino, Bogotá' },
    destination: { lat: 4.658, lng: -74.093, address: 'Parque Simón Bolívar, Bogotá' },
    distanceKm: 6.2,
    durationMin: 18,
    category: 'economy',
    fare: 15400,
    commission: 3080,
    tip: 2000,
    driverEarnings: 14320,
    commissionRate: 0.20,
    paymentMethod: 'mercadopago',
    paymentStatus: 'approved',
    paymentId: 'MP-897123984',
    status: 'paid',
    rating: 5,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Hace 2 horas (Hoy)
    completedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'trip_hist_02',
    driverId: 'driver_fiera_01',
    passengerId: 'pass_02',
    passengerName: 'Carlos Pineda',
    origin: { lat: 4.698, lng: -74.032, address: 'Unicentro Bogotá' },
    destination: { lat: 4.701, lng: -74.145, address: 'Aeropuerto El Dorado, Bogotá' },
    distanceKm: 14.8,
    durationMin: 38,
    category: 'xl',
    fare: 43100,
    commission: 8620,
    tip: 0,
    driverEarnings: 34480,
    commissionRate: 0.20,
    paymentMethod: 'cash',
    paymentStatus: 'cash_received',
    paymentId: 'CASH-REC-002',
    status: 'paid',
    rating: 5,
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // Ayer (Semana)
    completedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'trip_hist_03',
    driverId: 'driver_fiera_01',
    passengerId: 'pass_03',
    passengerName: 'Mariana Duarte',
    origin: { lat: 4.602, lng: -74.066, address: 'Torre Colpatria, Centro' },
    destination: { lat: 4.671, lng: -74.058, address: 'Zona T, Bogotá' },
    distanceKm: 8.5,
    durationMin: 22,
    category: 'economy',
    fare: 19200,
    commission: 3840,
    tip: 1000,
    driverEarnings: 16360,
    commissionRate: 0.20,
    paymentMethod: 'stripe',
    paymentStatus: 'approved',
    paymentId: 'pi_3KjLk21894981',
    status: 'paid',
    rating: 4,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // Hace 4 días (Semana/Mes)
    completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000).toISOString(),
  },
];

export function TripProvider({ children }) {
  const { updateDriverBalance, driver } = useAuth();
  const [activeTrip, setActiveTrip] = useState(null);
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [tripHistory, setTripHistory] = useState(INITIAL_HISTORICAL_TRIPS);
  const [isAvailable, setIsAvailable] = useState(false);

  // Cargar estado de almacenamiento (recuperación de viaje si se cerró la app)
  useEffect(() => {
    async function loadStoredTrips() {
      try {
        const [storedActive, storedHistory] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_TRIP),
          AsyncStorage.getItem(STORAGE_KEYS.TRIP_HISTORY),
        ]);

        if (storedActive) {
          setActiveTrip(JSON.parse(storedActive));
        }
        if (storedHistory) {
          setTripHistory(JSON.parse(storedHistory));
        }
      } catch (err) {
        console.warn('Error al recuperar viajes guardados:', err);
      }
    }
    loadStoredTrips();
  }, []);

  // Sincronizar viaje activo en AsyncStorage para recuperación en caso de desconexión
  const persistActiveTrip = async (trip) => {
    setActiveTrip(trip);
    if (trip) {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_TRIP, JSON.stringify(trip));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_TRIP);
    }
  };

  // Guardar viaje completado en historial
  const saveTripToHistory = async (completedTrip) => {
    const updatedHistory = [completedTrip, ...tripHistory];
    setTripHistory(updatedHistory);
    await AsyncStorage.setItem(STORAGE_KEYS.TRIP_HISTORY, JSON.stringify(updatedHistory));
  };

  // Recibir solicitud entrante de viaje (generada por el simulador de pasajero)
  const receiveTripRequest = (requestData) => {
    // Solo si el conductor está disponible y no tiene un viaje activo
    if (!isAvailable || activeTrip) return false;

    // Calcular la tarifa estimada usando la función pura obligatoria
    const calculation = calculateFare({
      distanceKm: requestData.distanceKm,
      durationMin: requestData.durationMin,
      category: requestData.category || 'economy',
      tip: requestData.tip || 0,
    });

    const fullRequest = {
      ...requestData,
      ...calculation,
      status: 'requested',
      createdAt: new Date().toISOString(),
    };

    setIncomingRequest(fullRequest);
    return true;
  };

  // Aceptar solicitud
  const acceptRequest = async () => {
    if (!incomingRequest) return;
    const acceptedTrip = {
      ...incomingRequest,
      driverId: driver?.id || 'driver_default',
      status: 'driver_arriving', // Conductor rumbo al punto de recogida
      acceptedAt: new Date().toISOString(),
    };

    setIncomingRequest(null);
    await persistActiveTrip(acceptedTrip);
  };

  // Rechazar o expirar solicitud (temporizador de 15s a 0)
  const rejectRequest = () => {
    setIncomingRequest(null);
  };

  // Transición: Pasajero a bordo -> in_progress
  const setPassengerOnboard = async () => {
    if (!activeTrip || activeTrip.status !== 'driver_arriving') return;
    const updated = {
      ...activeTrip,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
    };
    await persistActiveTrip(updated);
  };

  // Transición: Finalizar viaje -> completed
  const completeTrip = async () => {
    if (!activeTrip || activeTrip.status !== 'in_progress') return;

    // Recalcular con calculateFare
    const calculation = calculateFare({
      distanceKm: activeTrip.distanceKm,
      durationMin: activeTrip.durationMin,
      category: activeTrip.category,
      tip: activeTrip.tip || 0,
    });

    const updated = {
      ...activeTrip,
      ...calculation,
      status: 'completed',
      completedAt: new Date().toISOString(),
    };
    await persistActiveTrip(updated);
  };

  // Registrar cobro (Pasarela aprobada o Efectivo recibido) -> status: 'paid'
  const registerPayment = async ({ method, status = 'approved', paymentId = null }) => {
    if (!activeTrip) return;

    const isCash = method === 'cash';
    const finalPaymentStatus = isCash ? 'cash_received' : status;
    const generatedPaymentId = paymentId || `${method.toUpperCase()}-${Date.now()}`;

    const paidTrip = {
      ...activeTrip,
      paymentMethod: method,
      paymentStatus: finalPaymentStatus,
      paymentId: generatedPaymentId,
      status: 'paid',
      rating: 5, // Por defecto para la demostración
    };

    // Actualizar saldo del conductor según reglas del PDF:
    // "Saldo: Ganancias de viajes pagados por pasarela menos comisiones de viajes en efectivo"
    if (isCash) {
      // El conductor cobró todo el efectivo en mano -> La plataforma le debita su comisión del saldo virtual
      await updateDriverBalance(-paidTrip.commission);
    } else if (finalPaymentStatus === 'approved') {
      // El pago entró a la pasarela -> Se le acredita la ganancia neta al saldo del conductor
      await updateDriverBalance(paidTrip.driverEarnings);
    }

    // Guardar en historial
    await saveTripToHistory(paidTrip);

    // Limpiar viaje activo
    await persistActiveTrip(null);
    return paidTrip;
  };

  // Cancelar viaje
  const cancelActiveTrip = async (reason = 'Cancelado por conductor') => {
    if (!activeTrip || activeTrip.status === 'in_progress') return;
    const cancelledTrip = {
      ...activeTrip,
      status: 'cancelled',
      cancelReason: reason,
      cancelledAt: new Date().toISOString(),
    };
    await saveTripToHistory(cancelledTrip);
    await persistActiveTrip(null);
  };

  return (
    <TripContext.Provider
      value={{
        activeTrip,
        incomingRequest,
        tripHistory,
        isAvailable,
        setIsAvailable,
        receiveTripRequest,
        acceptRequest,
        rejectRequest,
        setPassengerOnboard,
        completeTrip,
        registerPayment,
        cancelActiveTrip,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip debe usarse dentro de un TripProvider');
  }
  return context;
}
