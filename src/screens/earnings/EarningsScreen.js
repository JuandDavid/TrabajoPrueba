import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../styles/theme';
import { useEarnings } from '../../hooks/useEarnings';

export function EarningsScreen({ navigation }) {
  const [selectedPeriod, setSelectedPeriod] = useState('today'); // 'today' | 'week' | 'month'
  const earnings = useEarnings();

  const currentStats = earnings[selectedPeriod] || earnings.today;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Botón de Menú */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tus Ganancias</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tarjeta de Saldo en Plataforma */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>SALDO EN PLATAFORMA</Text>
          <Ionicons name="wallet" size={22} color={colors.white} />
        </View>
        <Text
          style={[
            styles.balanceAmount,
            earnings.balance < 0 && styles.balanceNegative,
          ]}
        >
          ${(earnings.balance || 0).toLocaleString('es-CO')} COP
        </Text>
        <Text style={styles.balanceExplanation}>
          Ganancias digitales acreditadas menos comisiones por viajes en efectivo.
          {earnings.balance < 0 && (
            <Text style={{ color: '#FF8A80', fontWeight: '800' }}>
              {'\n'}Aviso: Tienes saldo negativo por comisiones en efectivo pendientes.
            </Text>
          )}
        </Text>
      </View>

      {/* Selector de Periodo (Hoy / Semana / Mes) */}
      <View style={styles.periodTabs}>
        {[
          { id: 'today', label: 'Hoy' },
          { id: 'week', label: 'Esta Semana' },
          { id: 'month', label: 'Este Mes' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.periodTab,
              selectedPeriod === tab.id && styles.periodTabActive,
            ]}
            onPress={() => setSelectedPeriod(tab.id)}
          >
            <Text
              style={[
                styles.periodTabText,
                selectedPeriod === tab.id && styles.periodTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Resumen del Periodo */}
      <View style={styles.summaryCard}>
        <View style={styles.netEarningsBox}>
          <Text style={styles.netLabel}>Ganancia Neta del Periodo</Text>
          <Text style={styles.netValue}>
            ${(currentStats.netEarnings || 0).toLocaleString('es-CO')} COP
          </Text>
        </View>

        {/* Desglose de Métricas exigidas por el PDF */}
        <View style={styles.metricGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricTitle}>Viajes Realizados</Text>
            <Text style={styles.metricNumber}>{currentStats.tripCount}</Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricTitle}>Promedio / Viaje</Text>
            <Text style={styles.metricNumber}>
              ${(currentStats.averagePerTrip || 0).toLocaleString('es-CO')}
            </Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricTitle}>Total Facturado</Text>
            <Text style={styles.metricNumber}>
              ${(currentStats.totalBilled || 0).toLocaleString('es-CO')}
            </Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricTitle}>Comisión Plataforma (20%)</Text>
            <Text style={[styles.metricNumber, { color: colors.offline }]}>
              -${(currentStats.totalCommission || 0).toLocaleString('es-CO')}
            </Text>
          </View>

          <View style={[styles.metricItem, { width: '100%' }]}>
            <Text style={styles.metricTitle}>Propinas Recibidas (100% tuyas)</Text>
            <Text style={[styles.metricNumber, { color: colors.online }]}>
              +${(currentStats.totalTips || 0).toLocaleString('es-CO')}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: spacing.md,
    paddingTop: 50,
    paddingBottom: 40,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  menuBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  balanceCard: {
    backgroundColor: colors.black,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  balanceAmount: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '900',
    marginVertical: spacing.sm,
  },
  balanceNegative: {
    color: '#FF5252',
  },
  balanceExplanation: {
    color: '#B0B0B0',
    fontSize: 12,
    lineHeight: 16,
  },
  periodTabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 4,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodTabActive: {
    backgroundColor: colors.black,
  },
  periodTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  periodTabTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  netEarningsBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  netLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  netValue: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.online,
    marginTop: 4,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricItem: {
    width: '47%',
    backgroundColor: '#FAFAFA',
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  metricTitle: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  metricNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
  },
});
