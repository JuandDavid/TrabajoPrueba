import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../styles/theme';
import { useTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { CustomButton } from '../../components/CustomButton';

export function PaymentSummaryScreen({ navigation }) {
  const { activeTrip, registerPayment } = useTrip();
  const { driver } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState(
    activeTrip?.paymentMethod || 'mercadopago'
  );
  const [paymentStatus, setPaymentStatus] = useState('pending'); // 'pending' | 'approved' | 'rejected' | 'cash_received'
  const [isProcessing, setIsProcessing] = useState(false);

  if (!activeTrip) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.title}>No hay ningún cobro pendiente.</Text>
        <CustomButton
          title="Ir al Inicio"
          onPress={() => navigation.navigate('MainApp', { screen: 'Home' })}
          style={{ marginTop: spacing.md }}
        />
      </View>
    );
  }

  // Confirmar cobro en efectivo
  const handleCashPayment = async () => {
    setIsProcessing(true);
    setTimeout(async () => {
      await registerPayment({
        method: 'cash',
        status: 'cash_received',
      });
      setPaymentStatus('cash_received');
      setIsProcessing(false);
      Alert.alert(
        'Efectivo Recibido',
        `Cobraste $${(activeTrip.fare + (activeTrip.tip || 0)).toLocaleString('es-CO')} COP en mano.\n\nSe debitó la comisión de la plataforma (-$${(activeTrip.commission).toLocaleString('es-CO')} COP) de tu saldo virtual.`,
        [{ text: 'Listo', onPress: () => navigation.navigate('MainApp', { screen: 'Home' }) }]
      );
    }, 800);
  };

  // Simular pago con pasarela (Mercado Pago / Stripe Checkout Pro)
  const handleGatewayPayment = async (statusChoice = 'approved') => {
    setIsProcessing(true);
    setTimeout(async () => {
      setIsProcessing(false);
      if (statusChoice === 'approved') {
        await registerPayment({
          method: selectedMethod,
          status: 'approved',
          paymentId: `MP-TEST-${Math.floor(Math.random() * 900000 + 100000)}`,
        });
        setPaymentStatus('approved');
        Alert.alert(
          '¡Pago Aprobado por la Pasarela!',
          `El pasajero pagó con tarjeta de prueba en Mercado Pago.\n\nSe han acreditado +$${(activeTrip.driverEarnings).toLocaleString('es-CO')} COP a tu saldo en la plataforma.`,
          [{ text: 'Continuar', onPress: () => navigation.navigate('MainApp', { screen: 'Home' }) }]
        );
      } else {
        setPaymentStatus('rejected');
        Alert.alert(
          'Pago Rechazado',
          'La tarjeta del pasajero fue rechazada por fondos insuficientes o error de prueba. Por favor solicita cobro alternativo o en efectivo.',
          [{ text: 'Reintentar' }]
        );
      }
    }, 1200);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Icono de Finalización */}
      <View style={styles.topIconCircle}>
        <Ionicons name="checkmark-done" size={40} color={colors.white} />
      </View>

      <Text style={styles.title}>¡Viaje Finalizado!</Text>
      <Text style={styles.subtitle}>Resumen y liquidación del cobro</Text>

      {/* Tarjeta de desglose financiero */}
      <View style={styles.breakdownCard}>
        <View style={styles.row}>
          <Text style={styles.label}>Tarifa total del viaje</Text>
          <Text style={styles.value}>
            ${(activeTrip.fare || 0).toLocaleString('es-CO')} COP
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.labelMuted}>
            Distancia ({activeTrip.distanceKm} km) • Tiempo ({activeTrip.durationMin} min)
          </Text>
          <Text style={styles.catBadge}>{activeTrip.category?.toUpperCase()}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.commissionLabel}>Comisión de la Plataforma (20%)</Text>
          <Text style={styles.commissionValue}>
            -${(activeTrip.commission || 0).toLocaleString('es-CO')} COP
          </Text>
        </View>

        {Boolean(activeTrip.tip) && (
          <View style={styles.row}>
            <Text style={styles.tipLabel}>Propina del pasajero (100% conductor)</Text>
            <Text style={styles.tipValue}>
              +${(activeTrip.tip).toLocaleString('es-CO')} COP
            </Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.rowTotal}>
          <Text style={styles.totalLabel}>Tu Ganancia Neta:</Text>
          <Text style={styles.totalValue}>
            ${(activeTrip.driverEarnings || 0).toLocaleString('es-CO')} COP
          </Text>
        </View>
      </View>

      {/* Saldo actual del conductor */}
      <View style={styles.balanceInfoBox}>
        <Ionicons name="wallet-outline" size={20} color={colors.info} />
        <Text style={styles.balanceInfoText}>
          Saldo actual en plataforma:{' '}
          <Text style={{ fontWeight: '800' }}>
            ${(driver?.balance || 0).toLocaleString('es-CO')} COP
          </Text>
        </Text>
      </View>

      {/* Selección del método de cobro */}
      <Text style={styles.sectionTitle}>Seleccionar Método de Pago:</Text>

      <View style={styles.methodSelector}>
        <TouchableOpacity
          style={[
            styles.methodCard,
            selectedMethod === 'mercadopago' && styles.methodCardActive,
          ]}
          onPress={() => setSelectedMethod('mercadopago')}
        >
          <Ionicons
            name="card-outline"
            size={22}
            color={selectedMethod === 'mercadopago' ? colors.black : colors.textMuted}
          />
          <Text style={styles.methodCardTitle}>Mercado Pago</Text>
          <Text style={styles.methodCardDesc}>Checkout Pro / Tarjetas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.methodCard,
            selectedMethod === 'cash' && styles.methodCardActive,
          ]}
          onPress={() => setSelectedMethod('cash')}
        >
          <Ionicons
            name="cash-outline"
            size={22}
            color={selectedMethod === 'cash' ? colors.black : colors.textMuted}
          />
          <Text style={styles.methodCardTitle}>Efectivo</Text>
          <Text style={styles.methodCardDesc}>Cobro físico recibido</Text>
        </TouchableOpacity>
      </View>

      {/* Acciones de procesamiento */}
      <View style={styles.actionsBox}>
        {selectedMethod === 'cash' ? (
          <CustomButton
            title="Confirmar Cobro en Efectivo"
            variant="success"
            loading={isProcessing}
            onPress={handleCashPayment}
          />
        ) : (
          <View style={{ gap: spacing.sm }}>
            <CustomButton
              title="Simular Pago Aprobado (Checkout Pro)"
              variant="primary"
              loading={isProcessing}
              onPress={() => handleGatewayPayment('approved')}
            />
            <CustomButton
              title="Simular Pago Rechazado (Prueba de error)"
              variant="outline"
              disabled={isProcessing}
              onPress={() => handleGatewayPayment('rejected')}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    padding: spacing.lg,
    alignItems: 'center',
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  topIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.online,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  breakdownCard: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  rowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  value: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  labelMuted: {
    fontSize: 12,
    color: colors.textMuted,
  },
  catBadge: {
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: colors.borderLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    color: colors.textPrimary,
  },
  commissionLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  commissionValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.offline,
  },
  tipLabel: {
    fontSize: 13,
    color: colors.online,
    fontWeight: '600',
  },
  tipValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.online,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.online,
  },
  balanceInfoBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.infoLight,
    padding: spacing.md,
    borderRadius: 10,
    marginTop: spacing.md,
  },
  balanceInfoText: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  sectionTitle: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  methodSelector: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
    marginBottom: spacing.lg,
  },
  methodCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  methodCardActive: {
    borderColor: colors.black,
    backgroundColor: '#FAFAFA',
  },
  methodCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 6,
  },
  methodCardDesc: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  actionsBox: {
    width: '100%',
  },
});
