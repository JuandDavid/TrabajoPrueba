import { useMemo } from 'react';
import { useTrip } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';

/**
 * Hook personalizado para calcular métricas de ganancias por periodo.
 * Requisito del PDF:
 * - Cálculos con useMemo sobre el historial
 * - Periodos: Hoy, Semana y Mes
 * - Métricas: número de viajes, total facturado, comisiones, propinas, ganancia neta y promedio por viaje
 * - Saldo del conductor: Ganancias de viajes por pasarela menos comisiones en efectivo
 */
export function useEarnings() {
  const { tripHistory } = useTrip();
  const { driver } = useAuth();

  const earnings = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    // Inicio de la semana (Lunes)
    const dayOfWeek = now.getDay() || 7; // Convertir domingo (0) a 7
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() - (dayOfWeek - 1));
    const startOfWeekTime = startOfWeek.getTime();

    // Inicio del mes (Día 1)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    // Función auxiliar para agregar estadísticas de una lista de viajes
    const calculateStats = (trips) => {
      // Solo contar viajes que terminaron y fueron pagados
      const validTrips = trips.filter((t) => t.status === 'paid');
      const tripCount = validTrips.length;

      const totalBilled = validTrips.reduce((acc, t) => acc + (t.fare || 0), 0);
      const totalCommission = validTrips.reduce((acc, t) => acc + (t.commission || 0), 0);
      const totalTips = validTrips.reduce((acc, t) => acc + (t.tip || 0), 0);
      const netEarnings = validTrips.reduce((acc, t) => acc + (t.driverEarnings || 0), 0);

      const averagePerTrip = tripCount > 0 ? Math.round(netEarnings / tripCount) : 0;

      return {
        tripCount,
        totalBilled,
        totalCommission,
        totalTips,
        netEarnings,
        averagePerTrip,
      };
    };

    // Filtrar viajes por fecha de creación/finalización
    const todayTrips = tripHistory.filter((t) => {
      const tripTime = new Date(t.completedAt || t.createdAt).getTime();
      return tripTime >= startOfToday;
    });

    const weekTrips = tripHistory.filter((t) => {
      const tripTime = new Date(t.completedAt || t.createdAt).getTime();
      return tripTime >= startOfWeekTime;
    });

    const monthTrips = tripHistory.filter((t) => {
      const tripTime = new Date(t.completedAt || t.createdAt).getTime();
      return tripTime >= startOfMonth;
    });

    return {
      today: calculateStats(todayTrips),
      week: calculateStats(weekTrips),
      month: calculateStats(monthTrips),
      allTime: calculateStats(tripHistory),
      // Saldo de la cuenta del conductor
      balance: driver?.balance || 0,
    };
  }, [tripHistory, driver?.balance]);

  return earnings;
}
