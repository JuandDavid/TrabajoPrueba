import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../styles/theme';
import { useAuth } from '../../context/AuthContext';
import { useTrip } from '../../context/TripContext';
import { useDriverLocation } from '../../hooks/useDriverLocation';
import { MapViewer } from '../../components/MapViewer';
import { IncomingRequestModal } from '../../components/IncomingRequestModal';
import { getNextSimulatedRequest } from '../../simulators/PassengerSimulator';

export function HomeScreen({ navigation }) {
  const { driver, isApproved, toggleApprovalStatus } = useAuth();
  const {
    isAvailable,
    setIsAvailable,
    activeTrip,
    receiveTripRequest,
  } = useTrip();

  // Hook de ubicación con limpieza obligatoria
  const { location, errorMsg } = useDriverLocation(isAvailable);

  // Manejar cambio de disponibilidad
  const handleToggleAvailability = (val) => {
    if (val && !isApproved) {
      Alert.alert(
        'Cuenta en Revisión',
        'Tu cuenta está en estado "Pendiente de aprobación". No puedes ponerte disponible hasta que un administrador la apruebe.\n\nPuedes simular la aprobación tocando el botón de prueba superior.',
        [{ text: 'Entendido' }]
      );
      return;
    }
    setIsAvailable(val);
  };

  // Simular solicitud entrante de pasajero
  const handleTriggerPassengerRequest = () => {
    if (!isAvailable) {
      Alert.alert(
        'Conductor Desconectado',
        'Debes ponerte en estado "Disponible" para poder recibir solicitudes de viaje.'
      );
      return;
    }
    const simulated = getNextSimulatedRequest();
    receiveTripRequest(simulated);
  };

  return (
    <View style={styles.container}>
      {/* Barra superior de estado de cuenta y simulación */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu" size={26} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Indicador de estado de aprobación */}
        <TouchableOpacity
          style={[
            styles.approvalBadge,
            isApproved ? styles.approvalApproved : styles.approvalPending,
          ]}
          onPress={toggleApprovalStatus}
        >
          <Ionicons
            name={isApproved ? 'checkmark-circle' : 'time'}
            size={16}
            color={colors.white}
          />
          <Text style={styles.approvalText}>
            {isApproved ? 'Aprobado (Toca p/ simular pendiente)' : 'Pendiente (Toca p/ aprobar)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Visualización del Mapa */}
      <MapViewer
        location={location}
        isAvailable={isAvailable}
        activeTrip={activeTrip}
        style={styles.map}
      />

      {/* Alerta si no tiene permisos GPS */}
      {Boolean(errorMsg) && (
        <View style={styles.gpsWarning}>
          <Ionicons name="warning-outline" size={16} color={colors.warning} />
          <Text style={styles.gpsWarningText}>{errorMsg}</Text>
        </View>
      )}

      {/* Panel Flotante Inferior de Disponibilidad y Acciones */}
      <View style={styles.bottomCard}>
        {/* Si hay un viaje activo, mostrar barra de acceso rápido al viaje */}
        {Boolean(activeTrip) ? (
          <TouchableOpacity
            style={styles.activeTripBanner}
            onPress={() => navigation.navigate('ActiveTrip')}
          >
            <View style={styles.activeTripInfo}>
              <Text style={styles.activeTripTitle}>
                {activeTrip.status === 'driver_arriving'
                  ? 'En camino a recoger pasajero'
                  : 'Viaje en curso hacia el destino'}
              </Text>
              <Text style={styles.activeTripSubtitle}>
                {activeTrip.passengerName} • ${(activeTrip.fare || 0).toLocaleString('es-CO')} COP
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.availabilityRow}>
            <View style={styles.availabilityTextCol}>
              <Text style={styles.availabilityTitle}>
                {isAvailable ? 'Estás En Línea' : 'Estás Desconectado'}
              </Text>
              <Text style={styles.availabilityDesc}>
                {isAvailable
                  ? 'Buscando solicitudes de viaje cercanas...'
                  : isApproved
                  ? 'Activa el interruptor para recibir viajes'
                  : 'Esperando aprobación de la cuenta'}
              </Text>
            </View>

            <Switch
              value={isAvailable}
              onValueChange={handleToggleAvailability}
              trackColor={{ false: colors.border, true: colors.online }}
              thumbColor={colors.white}
            />
          </View>
        )}

        {/* Botón didáctico para simular pasajero pidiendo viaje */}
        {!activeTrip && isAvailable && (
          <TouchableOpacity
            style={styles.simulateButton}
            onPress={handleTriggerPassengerRequest}
          >
            <Ionicons name="flash-outline" size={18} color={colors.white} />
            <Text style={styles.simulateButtonText}>
              Simular Solicitud de Pasajero (15s)
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal de Solicitud Entrante con temporizador de 15 segundos */}
      <IncomingRequestModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  menuButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  approvalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  approvalApproved: {
    backgroundColor: colors.online,
  },
  approvalPending: {
    backgroundColor: colors.warning,
  },
  approvalText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  map: {
    flex: 1,
  },
  gpsWarning: {
    position: 'absolute',
    top: 105,
    alignSelf: 'center',
    backgroundColor: colors.warningLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  gpsWarningText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  bottomCard: {
    position: 'absolute',
    bottom: 25,
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
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  availabilityTextCol: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  availabilityTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  availabilityDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  simulateButton: {
    marginTop: spacing.md,
    backgroundColor: colors.black,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  simulateButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  activeTripBanner: {
    backgroundColor: colors.dark,
    padding: spacing.md,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeTripInfo: {
    flex: 1,
  },
  activeTripTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  activeTripSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});
