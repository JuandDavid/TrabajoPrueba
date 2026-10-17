import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

export function CustomDrawerContent(props) {
  const { driver, isApproved, toggleApprovalStatus } = useAuth();
  const { state, navigation } = props;

  const currentRoute = state.routes[state.index]?.name;

  const navItems = [
    { name: 'Home', label: 'Inicio y Mapa', icon: 'map' },
    { name: 'Earnings', label: 'Ganancias y Saldo', icon: 'wallet' },
    { name: 'History', label: 'Historial de Carreras', icon: 'time' },
    { name: 'Profile', label: 'Perfil y Configuración', icon: 'person' },
  ];

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      {/* Header del Drawer con perfil del conductor */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color={colors.white} />
        </View>
        <Text style={styles.driverName}>{driver?.fullName || 'Conductor'}</Text>
        <Text style={styles.plateText}>Placa: {driver?.vehicle?.plate || 'ABC123'}</Text>

        {/* Badge de Aprobación */}
        <TouchableOpacity
          style={[styles.badge, isApproved ? styles.badgeApproved : styles.badgePending]}
          onPress={toggleApprovalStatus}
        >
          <Ionicons
            name={isApproved ? 'checkmark-circle' : 'time'}
            size={14}
            color={colors.white}
          />
          <Text style={styles.badgeLabel}>
            {isApproved ? 'Aprobado (Toca p/ simular)' : 'Pendiente (Toca p/ aprobar)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Elementos de Navegación */}
      <View style={styles.menuItems}>
        {navItems.map((item) => {
          const isActive = currentRoute === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => navigation.navigate(item.name)}
            >
              <Ionicons
                name={item.icon}
                size={22}
                color={isActive ? colors.black : colors.textSecondary}
              />
              <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Registro de Nuevo Conductor */}
      <View style={styles.footerSection}>
        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate('Register')}
        >
          <Ionicons name="person-add-outline" size={20} color={colors.info} />
          <Text style={styles.registerText}>Ir a Formulario de Registro</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>UberClone Conductor v1.0 • React Native Expo</Text>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
  },
  header: {
    backgroundColor: colors.black,
    padding: spacing.lg,
    paddingTop: 50,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  driverName: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  plateText: {
    color: '#CCC',
    fontSize: 13,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  badgeApproved: {
    backgroundColor: colors.online,
  },
  badgePending: {
    backgroundColor: colors.warning,
  },
  badgeLabel: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  menuItems: {
    padding: spacing.md,
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: '#F0F0F0',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  menuLabelActive: {
    color: colors.black,
    fontWeight: '800',
  },
  footerSection: {
    marginTop: 'auto',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderColor: colors.borderLight,
  },
  registerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  registerText: {
    color: colors.info,
    fontSize: 14,
    fontWeight: '700',
  },
  versionText: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: spacing.md,
  },
});
