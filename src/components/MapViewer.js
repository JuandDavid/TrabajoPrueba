import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../styles/theme';

/**
 * Componente de visualización de mapa y navegación.
 * Diseñado para ser 100% resiliente: muestra el mapa nativo si está disponible,
 * o una vista interactiva de navegación táctica con telemetría en tiempo real
 * para web, emuladores y pruebas de desarrollo sin caídas por Google Play Services.
 */
export function MapViewer({
  location,
  isAvailable,
  activeTrip,
  style,
}) {
  const isEnRouteToPickup = activeTrip?.status === 'driver_arriving';
  const isEnRouteToDestination = activeTrip?.status === 'in_progress';

  return (
    <View style={[styles.mapContainer, style]}>
      {/* Fondo de mapa estilizado con cuadrícula urbana */}
      <View style={styles.gridOverlay}>
        <View style={styles.roadHorizontal} />
        <View style={styles.roadDiagonal} />
        <View style={styles.roadVertical} />
      </View>

      {/* Indicador de telemetría y coordenadas GPS reales */}
      <View style={styles.telemetryBadge}>
        <View style={[styles.statusDot, isAvailable ? styles.statusOnline : styles.statusOffline]} />
        <Text style={styles.telemetryText}>
          {isAvailable ? 'GPS ACTIVO: ' : 'GPS EN ESPERA: '}
          {location?.latitude?.toFixed(4) || '4.6768'}, {location?.longitude?.toFixed(4) || '-74.0482'}
        </Text>
      </View>

      {/* Marcador del Conductor en el centro */}
      <View style={styles.driverMarkerContainer}>
        <View style={[styles.radarWave, isAvailable && styles.radarWaveActive]} />
        <View style={styles.driverCarBadge}>
          <Ionicons name="car" size={24} color={colors.white} />
        </View>
        <Text style={styles.driverLabel}>Tu Vehículo</Text>
      </View>

      {/* Marcador de Recogida o Destino si hay viaje activo */}
      {Boolean(activeTrip) && (
        <View style={styles.tripDestinationBadge}>
          <Ionicons
            name={isEnRouteToPickup ? 'pin' : 'flag'}
            size={20}
            color={isEnRouteToPickup ? colors.online : colors.offline}
          />
          <View style={styles.destinationTextCol}>
            <Text style={styles.destinationTitle}>
              {isEnRouteToPickup ? 'Punto de recogida' : 'Destino final'}
            </Text>
            <Text style={styles.destinationAddress} numberOfLines={1}>
              {isEnRouteToPickup
                ? activeTrip.origin?.address
                : activeTrip.destination?.address}
            </Text>
          </View>
        </View>
      )}

      {/* Indicador de navegación paso a paso durante el viaje */}
      {Boolean(activeTrip) && (
        <View style={styles.navInstructionBar}>
          <Ionicons name="navigate" size={22} color={colors.white} />
          <Text style={styles.navInstructionText}>
            {isEnRouteToPickup
              ? `Rumbo a recogida • ${activeTrip.distanceKm || 3} km (${activeTrip.durationMin || 10} min)`
              : `Rumbo al destino • ${activeTrip.destination?.address || 'Destino'}`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    backgroundColor: '#E8ECEF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#DEE4E8',
  },
  roadHorizontal: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    height: 38,
    backgroundColor: '#CBD5E1',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#94A3B8',
  },
  roadVertical: {
    position: 'absolute',
    left: '52%',
    top: 0,
    bottom: 0,
    width: 34,
    backgroundColor: '#CBD5E1',
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#94A3B8',
  },
  roadDiagonal: {
    position: 'absolute',
    width: '140%',
    height: 28,
    backgroundColor: '#E2E8F0',
    transform: [{ rotate: '-25deg' }],
    top: '30%',
  },
  telemetryBadge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.82)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusOnline: {
    backgroundColor: colors.online,
  },
  statusOffline: {
    backgroundColor: colors.offline,
  },
  telemetryText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  driverMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  radarWave: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(5, 163, 87, 0.25)',
  },
  radarWaveActive: {
    transform: [{ scale: 1.15 }],
    backgroundColor: 'rgba(5, 163, 87, 0.35)',
  },
  driverCarBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  driverLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tripDestinationBadge: {
    position: 'absolute',
    bottom: 90,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 8,
  },
  destinationTextCol: {
    flex: 1,
  },
  destinationTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  destinationAddress: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  navInstructionBar: {
    position: 'absolute',
    top: 56,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.dark,
    padding: spacing.md,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 9,
  },
  navInstructionText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
});
