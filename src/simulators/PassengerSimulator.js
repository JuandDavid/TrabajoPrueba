/**
 * Simulador de Solicitudes del Pasajero
 * Permite a los desarrolladores y evaluadores generar solicitudes de viaje
 * sin necesidad de tener una segunda aplicación instalada.
 */

export const SIMULATED_SCENARIOS = [
  {
    passengerName: 'Valentina Restrepo',
    passengerPhone: '3115554321',
    category: 'economy',
    distanceKm: 4.5,
    durationMin: 14,
    origin: {
      lat: 4.6750,
      lng: -74.0530,
      address: 'Calle 85 # 14-05, Zona T',
    },
    destination: {
      lat: 4.6980,
      lng: -74.0320,
      address: 'Carrera 15 # 124-30, Unicentro',
    },
    paymentMethod: 'mercadopago',
    tip: 1500,
  },
  {
    passengerName: 'Andrés Felipe Morales',
    passengerPhone: '3209876543',
    category: 'xl',
    distanceKm: 12.8,
    durationMin: 32,
    origin: {
      lat: 4.6580,
      lng: -74.0930,
      address: 'Parque Metropolitano Simón Bolívar',
    },
    destination: {
      lat: 4.7010,
      lng: -74.1450,
      address: 'Terminal 1, Aeropuerto El Dorado',
    },
    paymentMethod: 'cash',
    tip: 0,
  },
  {
    passengerName: 'Camila Rojas',
    passengerPhone: '3157778899',
    category: 'premium',
    distanceKm: 6.8,
    durationMin: 19,
    origin: {
      lat: 4.6020,
      lng: -74.0660,
      address: 'Carrera 7 # 24-89, Torre Colpatria',
    },
    destination: {
      lat: 4.6640,
      lng: -74.0530,
      address: 'Carrera 5 # 70A-25, Zona G',
    },
    paymentMethod: 'stripe',
    tip: 3000,
  },
];

let scenarioIndex = 0;

export function getNextSimulatedRequest() {
  const scenario = SIMULATED_SCENARIOS[scenarioIndex % SIMULATED_SCENARIOS.length];
  scenarioIndex++;

  return {
    id: `req_${Date.now()}`,
    passengerId: `pass_${Math.floor(Math.random() * 9000 + 1000)}`,
    ...scenario,
  };
}
