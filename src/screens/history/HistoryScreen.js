import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../styles/theme';
import { useTrip } from '../../context/TripContext';
import { CustomButton } from '../../components/CustomButton';

export function HistoryScreen({ navigation }) {
  const { tripHistory } = useTrip();

  // Filtros
  const [periodFilter, setPeriodFilter] = useState('all'); // 'all' | 'today' | 'week' | 'month'
  const [paymentFilter, setPaymentFilter] = useState('all'); // 'all' | 'mercadopago' | 'stripe' | 'cash'
  const [selectedTripDetail, setSelectedTripDetail] = useState(null);

  // Filtrado memoizado y ordenado por fecha más reciente
  const filteredTrips = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const dayOfWeek = now.getDay() || 7;
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() - (dayOfWeek - 1));
    const startOfWeekTime = startOfWeek.getTime();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return tripHistory
      .filter((t) => {
        // Filtro por método de pago
        if (paymentFilter !== 'all' && t.paymentMethod !== paymentFilter) {
          return false;
        }

        // Filtro por periodo
        const tripTime = new Date(t.completedAt || t.createdAt).getTime();
        if (periodFilter === 'today' && tripTime < startOfToday) return false;
        if (periodFilter === 'week' && tripTime < startOfWeekTime) return false;
        if (periodFilter === 'month' && tripTime < startOfMonth) return false;

        return true;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [tripHistory, periodFilter, paymentFilter]);

  // Renderizar cada elemento de la lista según el PDF
  const renderTripItem = ({ item }) => {
    const dateFormatted = new Date(item.completedAt || item.createdAt).toLocaleDateString('es-CO', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const isPaid = item.status === 'paid';
    const isCash = item.paymentMethod === 'cash';

    return (
      <TouchableOpacity
        style={styles.tripCard}
        onPress={() => setSelectedTripDetail(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.dateText}>{dateFormatted}</Text>
          <View style={[styles.statusBadge, isPaid ? styles.badgePaid : styles.badgeCancelled]}>
            <Text style={styles.statusBadgeText}>
              {isPaid ? (isCash ? 'EFECTIVO' : 'PAGADO') : item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Origen -> Destino */}
        <View style={styles.routeBox}>
          <View style={styles.routePointRow}>
            <View style={[styles.dot, { backgroundColor: colors.online }]} />
            <Text style={styles.addressText} numberOfLines={1}>
              {item.origin?.address || 'Origen'}
            </Text>
          </View>
          <View style={styles.lineConnector} />
          <View style={styles.routePointRow}>
            <View style={[styles.dot, { backgroundColor: colors.black }]} />
            <Text style={styles.addressText} numberOfLines={1}>
              {item.destination?.address || 'Destino'}
            </Text>
          </View>
        </View>

        {/* Tarifa y Ganancia neta */}
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.categoryLabel}>{item.category?.toUpperCase()}</Text>
            <Text style={styles.fareSmall}>
              Tarifa: ${(item.fare || 0).toLocaleString('es-CO')}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.earningsLabel}>Tu Ganancia:</Text>
            <Text style={styles.earningsValue}>
              ${(item.driverEarnings || 0).toLocaleString('es-CO')} COP
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Barra superior */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de Carreras</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filtros por Periodo */}
      <View style={styles.filterRow}>
        {[
          { id: 'all', label: 'Todos' },
          { id: 'today', label: 'Hoy' },
          { id: 'week', label: 'Semana' },
          { id: 'month', label: 'Mes' },
        ].map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[
              styles.filterChip,
              periodFilter === f.id && styles.filterChipActive,
            ]}
            onPress={() => setPeriodFilter(f.id)}
          >
            <Text
              style={[
                styles.filterChipText,
                periodFilter === f.id && styles.filterChipTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filtros por Método de Pago */}
      <View style={[styles.filterRow, { marginBottom: spacing.md }]}>
        {[
          { id: 'all', label: 'Cualquier Pago' },
          { id: 'mercadopago', label: 'Mercado Pago' },
          { id: 'cash', label: 'Efectivo' },
          { id: 'stripe', label: 'Stripe' },
        ].map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[
              styles.subFilterChip,
              paymentFilter === m.id && styles.subFilterChipActive,
            ]}
            onPress={() => setPaymentFilter(m.id)}
          >
            <Text
              style={[
                styles.subFilterText,
                paymentFilter === m.id && styles.subFilterTextActive,
              ]}
            >
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista FlatList con estado vacío según el PDF */}
      <FlatList
        data={filteredTrips}
        keyExtractor={(item) => item.id}
        renderItem={renderTripItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="documents-outline" size={54} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No hay carreras en este periodo</Text>
            <Text style={styles.emptySubtitle}>
              Prueba cambiando los filtros de fecha o método de pago.
            </Text>
          </View>
        }
      />

      {/* Modal de Detalle de Carrera según el PDF */}
      <Modal visible={Boolean(selectedTripDetail)} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalle del Viaje</Text>
              <TouchableOpacity onPress={() => setSelectedTripDetail(null)}>
                <Ionicons name="close-circle" size={28} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {selectedTripDetail && (
              <ScrollView>
                {/* Ruta Detallada */}
                <View style={styles.detailBox}>
                  <Text style={styles.detailLabel}>RECORRIDO:</Text>
                  <Text style={styles.detailAddressText}>
                    <Text style={{ fontWeight: '700' }}>Origen: </Text>{selectedTripDetail.origin?.address}
                  </Text>
                  <Text style={[styles.detailAddressText, { marginTop: 4 }]}>
                    <Text style={{ fontWeight: '700' }}>Destino: </Text>{selectedTripDetail.destination?.address}
                  </Text>
                </View>

                {/* Métricas del viaje */}
                <View style={styles.detailGrid}>
                  <View style={styles.detailGridItem}>
                    <Text style={styles.gridLabel}>Distancia</Text>
                    <Text style={styles.gridValue}>{selectedTripDetail.distanceKm} km</Text>
                  </View>
                  <View style={styles.detailGridItem}>
                    <Text style={styles.gridLabel}>Duración</Text>
                    <Text style={styles.gridValue}>{selectedTripDetail.durationMin} min</Text>
                  </View>
                  <View style={styles.detailGridItem}>
                    <Text style={styles.gridLabel}>Calificación</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Ionicons name="star" size={14} color="#FFB800" />
                      <Text style={styles.gridValue}>{selectedTripDetail.rating || 5}.0</Text>
                    </View>
                  </View>
                </View>

                {/* Cuentas Financieras */}
                <View style={styles.financialCard}>
                  <View style={styles.finRow}>
                    <Text style={styles.finLabel}>Tarifa Cobrada:</Text>
                    <Text style={styles.finValue}>${(selectedTripDetail.fare || 0).toLocaleString('es-CO')} COP</Text>
                  </View>
                  <View style={styles.finRow}>
                    <Text style={styles.finLabel}>Comisión Plataforma (20%):</Text>
                    <Text style={[styles.finValue, { color: colors.offline }]}>
                      -${(selectedTripDetail.commission || 0).toLocaleString('es-CO')} COP
                    </Text>
                  </View>
                  <View style={styles.finRow}>
                    <Text style={styles.finLabel}>Propina:</Text>
                    <Text style={[styles.finValue, { color: colors.online }]}>
                      +${(selectedTripDetail.tip || 0).toLocaleString('es-CO')} COP
                    </Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.finRow}>
                    <Text style={[styles.finLabel, { fontWeight: '800' }]}>Ganancia Neta Conductor:</Text>
                    <Text style={[styles.finValue, { fontSize: 18, color: colors.online }]}>
                      ${(selectedTripDetail.driverEarnings || 0).toLocaleString('es-CO')} COP
                    </Text>
                  </View>
                  <View style={[styles.finRow, { marginTop: 6 }]}>
                    <Text style={styles.finLabel}>Método de Pago:</Text>
                    <Text style={styles.finValue}>{selectedTripDetail.paymentMethod?.toUpperCase()}</Text>
                  </View>
                </View>

                <CustomButton
                  title="Cerrar Detalle"
                  variant="primary"
                  onPress={() => setSelectedTripDetail(null)}
                  style={{ marginTop: spacing.lg }}
                />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 50,
    paddingBottom: spacing.sm,
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: 8,
    marginTop: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  subFilterChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#EAEAEA',
  },
  subFilterChipActive: {
    backgroundColor: colors.info,
  },
  subFilterText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  subFilterTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  tripCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dateText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgePaid: {
    backgroundColor: colors.onlineLight,
  },
  badgeCancelled: {
    backgroundColor: colors.offlineLight,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  routeBox: {
    marginVertical: 4,
  },
  routePointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  lineConnector: {
    height: 10,
    borderLeftWidth: 1.5,
    borderLeftColor: colors.border,
    marginLeft: 3.5,
  },
  addressText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderColor: colors.borderLight,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.info,
  },
  fareSmall: {
    fontSize: 11,
    color: colors.textMuted,
  },
  earningsLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  earningsValue: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.online,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  detailBox: {
    backgroundColor: '#F5F5F5',
    padding: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.md,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 6,
  },
  detailAddressText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  detailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  detailGridItem: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  gridLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  gridValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  financialCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  finRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  finLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  finValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 6,
  },
});
