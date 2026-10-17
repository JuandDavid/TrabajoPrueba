import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../styles/theme';
import { CustomButton } from './CustomButton';
import { useTripRequests } from '../hooks/useTripRequests';

export function IncomingRequestModal() {
  const { incomingRequest, secondsLeft, acceptRequest, rejectRequest } = useTripRequests();

  if (!incomingRequest) return null;

  const categoryName =
    incomingRequest.category === 'xl'
      ? 'Uber XL'
      : incomingRequest.category === 'premium'
      ? 'Uber Black / Premium'
      : 'UberX (Económico)';

  const paymentLabel =
    incomingRequest.paymentMethod === 'mercadopago'
      ? 'Mercado Pago (Tarjeta/PSE)'
      : incomingRequest.paymentMethod === 'stripe'
      ? 'Stripe'
      : 'Efectivo';

  return (
    <Modal visible={Boolean(incomingRequest)} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Encabezado con temporizador de 15 segundos */}
          <View style={styles.header}>
            <View>
              <Text style={styles.badgeText}>{categoryName.toUpperCase()}</Text>
              <Text style={styles.title}>¡Nueva Solicitud!</Text>
            </View>
            <View style={[styles.timerBadge, secondsLeft <= 5 && styles.timerUrgent]}>
              <Text style={styles.timerText}>{secondsLeft}s</Text>
            </View>
          </View>

          {/* Ganancia neta y tarifa */}
          <View style={styles.earningsBox}>
            <View>
              <Text style={styles.earningsLabel}>Tu Ganancia Estimada</Text>
              <Text style={styles.earningsValue}>
                ${(incomingRequest.driverEarnings || 0).toLocaleString('es-CO')} COP
              </Text>
            </View>
            <View style={styles.fareDetails}>
              <Text style={styles.fareSmall}>Tarifa: ${(incomingRequest.fare || 0).toLocaleString('es-CO')}</Text>
              <Text style={styles.commissionSmall}>Comisión (20%): -${(incomingRequest.commission || 0).toLocaleString('es-CO')}</Text>
              {Boolean(incomingRequest.tip) && (
                <Text style={styles.tipSmall}>Propina: +${(incomingRequest.tip).toLocaleString('es-CO')}</Text>
              )}
            </View>
          </View>

          {/* Detalles de distancia, duración y método de pago */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="speedometer-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.statText}>{incomingRequest.distanceKm} km</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.statText}>{incomingRequest.durationMin} min</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="wallet-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.statText}>{paymentLabel}</Text>
            </View>
          </View>

          {/* Origen y Destino */}
          <View style={styles.routeContainer}>
            <View style={styles.routeRow}>
              <View style={[styles.dot, { backgroundColor: colors.online }]} />
              <View style={styles.routeTextContainer}>
                <Text style={styles.routeLabel}>Punto de recogida (Origen):</Text>
                <Text style={styles.routeAddress} numberOfLines={2}>
                  {incomingRequest.origin?.address || 'Punto de partida'}
                </Text>
              </View>
            </View>

            <View style={styles.routeDivider} />

            <View style={styles.routeRow}>
              <View style={[styles.dot, { backgroundColor: colors.black }]} />
              <View style={styles.routeTextContainer}>
                <Text style={styles.routeLabel}>Destino:</Text>
                <Text style={styles.routeAddress} numberOfLines={2}>
                  {incomingRequest.destination?.address || 'Punto de destino'}
                </Text>
              </View>
            </View>
          </View>

          {/* Pasajero */}
          <View style={styles.passengerRow}>
            <Ionicons name="person-circle-outline" size={24} color={colors.textPrimary} />
            <Text style={styles.passengerName}>
              {incomingRequest.passengerName || 'Pasajero'}
            </Text>
          </View>

          {/* Botones Aceptar y Rechazar */}
          <View style={styles.actionButtons}>
            <CustomButton
              title="Rechazar"
              variant="secondary"
              onPress={rejectRequest}
              style={styles.rejectBtn}
              textStyle={{ color: colors.offline }}
            />
            <CustomButton
              title="Aceptar Viaje"
              variant="success"
              onPress={acceptRequest}
              style={styles.acceptBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.info,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  timerBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerUrgent: {
    backgroundColor: colors.offline,
  },
  timerText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 16,
  },
  earningsBox: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  earningsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  earningsValue: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.online,
  },
  fareDetails: {
    alignItems: 'flex-end',
  },
  fareSmall: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  commissionSmall: {
    fontSize: 11,
    color: colors.textMuted,
  },
  tipSmall: {
    fontSize: 11,
    color: colors.online,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  routeContainer: {
    marginBottom: spacing.md,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  routeTextContainer: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  routeAddress: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  routeDivider: {
    height: 18,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
    marginLeft: 5,
    marginVertical: 2,
  },
  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.lg,
  },
  passengerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rejectBtn: {
    flex: 1,
  },
  acceptBtn: {
    flex: 2,
  },
});
