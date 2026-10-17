/**
 * Configuración central de precios y tarifas de la plataforma.
 * Conforme a la Sección 5 del documento del proyecto (UberClone — Versión Conductor).
 * Todos los valores monetarios se manejan en pesos colombianos (COP) enteros.
 */

export const PRICING_CONFIG = {
  baseFare: 3500,        // COP
  pricePerKm: 1200,      // COP
  pricePerMinute: 250,   // COP
  minimumFare: 6000,     // COP
  commissionRate: 0.20,  // 20% para la plataforma
  categories: {
    economy: {
      id: 'economy',
      name: 'Económico',
      multiplier: 1.0,
      minCapacity: 4,
    },
    xl: {
      id: 'xl',
      name: 'XL',
      multiplier: 1.4,
      minCapacity: 6,
    },
    premium: {
      id: 'premium',
      name: 'Premium',
      multiplier: 1.8,
      minCapacity: 4,
    },
  },
};

/**
 * Función pura para calcular la tarifa, comisión y ganancia neta.
 * Regla de redondeo: Redondear al múltiplo de 100 COP más cercano antes de calcular la comisión.
 *
 * @param {Object} params
 * @param {number} params.distanceKm - Distancia en kilómetros
 * @param {number} params.durationMin - Duración en minutos
 * @param {string} [params.category='economy'] - 'economy' | 'xl' | 'premium'
 * @param {number} [params.tip=0] - Propina (100% para el conductor)
 * @returns {{ fare: number, commission: number, driverEarnings: number, commissionRate: number }}
 */
export function calculateFare({ distanceKm = 0, durationMin = 0, category = 'economy', tip = 0 }) {
  const catConfig = PRICING_CONFIG.categories[category] || PRICING_CONFIG.categories.economy;
  const multiplier = catConfig.multiplier;

  // Fórmula base: (Base + km * Vkm + min * Vmin) * Multiplicador
  const subtotal = (
    PRICING_CONFIG.baseFare +
    distanceKm * PRICING_CONFIG.pricePerKm +
    durationMin * PRICING_CONFIG.pricePerMinute
  ) * multiplier;

  // Aplicar tarifa mínima
  const rawFare = Math.max(PRICING_CONFIG.minimumFare, subtotal);

  // Redondear al múltiplo de 100 COP más cercano
  const fare = Math.round(rawFare / 100) * 100;

  // Comisión de la plataforma (20%)
  const commission = Math.round(fare * PRICING_CONFIG.commissionRate);

  // Ganancia neta del conductor = Tarifa - Comisión + Propina
  const safeTip = Math.max(0, Math.round(tip || 0));
  const driverEarnings = fare - commission + safeTip;

  return {
    fare,
    commission,
    driverEarnings,
    commissionRate: PRICING_CONFIG.commissionRate,
  };
}
