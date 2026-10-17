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
import { useAuth } from '../../context/AuthContext';
import { InputWithValidation } from '../../components/InputWithValidation';
import { CustomButton } from '../../components/CustomButton';

export function ProfileScreen({ navigation }) {
  const {
    driver,
    isApproved,
    toggleApprovalStatus,
    updateDriverProfile,
    language,
    changeLanguage,
    logout,
  } = useAuth();

  const [phone, setPhone] = useState(driver?.phone || '3001234567');
  const [vehicleColor, setVehicleColor] = useState(driver?.vehicle?.color || 'Gris Plata');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    await updateDriverProfile({
      phone,
      vehicle: {
        ...driver?.vehicle,
        color: vehicleColor,
      },
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.replace('Register');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Barra superior */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="menu" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil y Ajustes</Text>
        <View style={{ width: 42 }} />
      </View>

      {/* Tarjeta de Resumen del Conductor */}
      <View style={styles.profileHeaderCard}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={40} color={colors.white} />
        </View>
        <Text style={styles.driverName}>{driver?.fullName || 'Conductor'}</Text>
        <Text style={styles.driverDoc}>C.C. {driver?.documentId || '---'}</Text>

        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={14} color="#FFB800" />
          <Text style={styles.ratingText}>{driver?.rating || 5.0} • Conductor Pro</Text>
        </View>

        {/* Estado de Aprobación */}
        <TouchableOpacity
          style={[styles.approvalBtn, isApproved ? styles.btnApproved : styles.btnPending]}
          onPress={toggleApprovalStatus}
        >
          <Ionicons
            name={isApproved ? 'checkmark-circle' : 'time'}
            size={18}
            color={colors.white}
          />
          <Text style={styles.approvalBtnText}>
            Estado: {isApproved ? 'APROBADO (Toca para simular pendiente)' : 'PENDIENTE (Toca para aprobar)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Datos del Vehículo */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Vehículo Registrado</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Placa:</Text>
          <Text style={styles.plateBadge}>{driver?.vehicle?.plate || 'ABC123'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Categoría:</Text>
          <Text style={styles.infoValue}>{driver?.vehicle?.category?.toUpperCase() || 'ECONOMY'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Marca y Modelo:</Text>
          <Text style={styles.infoValue}>{driver?.vehicle?.makeModel || 'Vehículo'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Año:</Text>
          <Text style={styles.infoValue}>{driver?.vehicle?.year || '2022'}</Text>
        </View>
      </View>

      {/* Editar Datos Permitidos */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Editar Información de Contacto</Text>
        <InputWithValidation
          label="Número de Celular"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <InputWithValidation
          label="Color del Vehículo"
          value={vehicleColor}
          onChangeText={setVehicleColor}
        />
        <CustomButton
          title={isSaved ? '¡Guardado con Éxito! ✓' : 'Guardar Cambios'}
          variant="secondary"
          onPress={handleSave}
        />
      </View>

      {/* Preferencia de Idioma (Español / English) */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Idioma de la Aplicación</Text>
        <View style={styles.langRow}>
          <TouchableOpacity
            style={[styles.langChip, language === 'es' && styles.langChipActive]}
            onPress={() => changeLanguage('es')}
          >
            <Text style={[styles.langText, language === 'es' && styles.langTextActive]}>
              🇨🇴 Español
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langChip, language === 'en' && styles.langChipActive]}
            onPress={() => changeLanguage('en')}
          >
            <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>
              🇺🇸 English
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cierre de Sesión */}
      <CustomButton
        title="Cerrar Sesión"
        variant="danger"
        onPress={handleLogout}
        style={{ marginTop: spacing.md }}
      />
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
    marginBottom: spacing.md,
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
  profileHeaderCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  driverName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  driverDoc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: spacing.sm,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A6D00',
  },
  approvalBtn: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  btnApproved: {
    backgroundColor: colors.online,
  },
  btnPending: {
    backgroundColor: colors.warning,
  },
  approvalBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  plateBadge: {
    backgroundColor: '#FFE600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '900',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#000',
  },
  langRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  langChip: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  langChipActive: {
    borderColor: colors.black,
    backgroundColor: '#F5F5F5',
  },
  langText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  langTextActive: {
    color: colors.black,
    fontWeight: '800',
  },
});
