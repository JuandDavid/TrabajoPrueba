import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../styles/theme';
import { useTrip } from '../../context/TripContext';
import { useDriverLocation } from '../../hooks/useDriverLocation';
import { MapViewer } from '../../components/MapViewer';
import { CustomButton } from '../../components/CustomButton';

export function ActiveTripScreen({ navigation }) {
  const {
    activeTrip,
    setPassengerOnboard,
    completeTrip,
    cancelActiveTrip,
  } = useTrip();

  const { location } = useDriverLocation(true);

  if (!activeTrip) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="car-outline" size={60} color={colors.textMuted} />
        <Text style={styles.emptyText}>No hay ningún viaje activo en este momento.</Text>
        <CustomButton
          title="Volver al Inicio"
          onPress={() => navigation.navigate('Home')}
          style={{ marginTop: spacing.md }}
        />
      </View>
    );
  }

  const isEnRouteToPickup = activeTrip.status === 'driver_arriving';
  const isEnRouteToDestination = activeTrip.status === 'in_progress';

  // Manejar Pasajero a Bordo
  const handlePassengerOnboard = async () => {
    await setPassengerOnboard();
  };

  // Manejar Finalizar Viaje
  const handleFinishTrip = async () => {
    await completeTrip();
    navigation.replace('PaymentSummary');
  };

  // Cancelar viaje
  const handleCancel = () => {
    Alert.alert(
      'Cancelar Viaje',
      '¿Estás seguro de que deseas cancelar este viaje antes de iniciar?',
      [
        { text: 'No, continuar', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            await cancelActiveTrip('Cancelado por conductor antes de recoger');
            navigation.navigate('Home');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Mapa con ruta activa */}
      <MapViewer
        location={location}
        isAvailable={true}
        activeTrip={activeTrip}
        style={styles.map}
      />

      {/* Tarjeta de Control del Viaje Activo */}
      <View style={styles.tripCard}>
        {/* Estado actual */}
        <View style={styles.statusHeader}>
          <View style={[styles.statusBadge, isEnRouteToPickup ? styles.badgeYellow : styles.badgeGreen]}>
            <Text style={styles.statusBadgeText}>
              {isEnRouteToPickup ? 'RUMBO A RECOGIDA' : 'VIAJE EN CURSO'}
            </Text>
          </View>
          <Text style={styles.farePreview}>
            Tarifa: ${(activeTrip.fare || 0).toLocaleString('es-CO')} COP
          </Text>
        </View>

        {/* Pasajero y Teléfono */}
        <View style={styles.passengerRow}>
          <View style={styles.passengerAvatar}>
            <Ionicons name="person" size={20} color={colors.white} />
          </View>
          <View style={styles.passengerInfo}>
            <Text style={styles.passengerName}>{activeTrip.passengerName}</Text>
            <Text style={styles.passengerCategory}>
              {activeTrip.category?.toUpperCase()} • {activeTrip.paymentMethod === 'cash' ? 'Efectivo' : 'Pago Digital'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => Alert.alert('Llamar', `Llamando al pasajero: ${activeTrip.passengerPhone || '3001234567'}`)}
          >
            <Ionicons name="call" size={20} color={colors.black} />
          </TouchableOpacity>
        </View>

        {/* Dirección según la fase */}
        <View style={styles.targetAddressBox}>
          <Ionicons
            name={isEnRouteToPickup ? 'navigate-circle' : 'flag'}
            size={24}
            color={isEnRouteToPickup ? colors.info : colors.online}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.addressLabel}>
              {isEnRouteToPickup ? 'Punto de recogida del pasajero:' : 'Destino final del viaje:'}
            </Text>
            <Text style={styles.addressText} numberOfLines={2}>
              {isEnRouteToPickup ? activeTrip.origin?.address : activeTrip.destination?.address}
            </Text>
          </View>
        </View>

        {/* Acciones principales de la Máquina de Estados */}
        <View style={styles.actionsContainer}>
          {isEnRouteToPickup && (
            <>
              <CustomButton
                title="Pasajero a Bordo"
                variant="success"
                onPress={handlePassengerOnboard}
                style={{ flex: 2 }}
              />
              <CustomButton
                title="Cancelar"
                variant="danger"
                onPress={handleCancel}
                style={{ flex: 1 }}
              />
            </>
          )}

          {isEnRouteToDestination && (
            <CustomButton
              title="Finalizar Viaje y Cobrar"
              variant="primary"
              onPress={handleFinishTrip}
              style={{ width: '100%' }}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  map: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  tripCard: {
    position: 'absolute',
    bottom: 20,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeYellow: {
    backgroundColor: colors.warning,
  },
  badgeGreen: {
    backgroundColor: colors.online,
  },
  statusBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  farePreview: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.sm,
  },
  passengerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passengerInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  passengerName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  passengerCategory: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  callButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetAddressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8F9FA',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  addressLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
