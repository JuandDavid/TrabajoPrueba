import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing } from '../../styles/theme';
import { InputWithValidation } from '../../components/InputWithValidation';
import { CustomButton } from '../../components/CustomButton';
import { useAuth } from '../../context/AuthContext';

export function RegisterScreen({ navigation }) {
  const { registerDriver } = useAuth();
  const [activeTab, setActiveTab] = useState(0); // 0: Personal, 1: Vehículo, 2: Documentos

  // --- FORMULARIOS ---
  // Pestaña 1: Datos Personales
  const [personal, setPersonal] = useState({
    fullName: '',
    documentId: '',
    phone: '',
    birthDate: '2000-01-01',
    gender: 'Masculino',
    email: '',
    language: 'es',
    photoUri: null,
  });

  // Pestaña 2: Vehículo
  const [vehicle, setVehicle] = useState({
    category: 'economy', // economy | xl | premium
    plate: '',
    make: '',
    model: '',
    year: '2021',
    color: 'Negro',
    capacity: '4',
    photoUri: null,
  });

  // Pestaña 3: Documentos y Pagos
  const [docs, setDocs] = useState({
    licenseNumber: '',
    licenseExpiry: '2028-12-31',
    licensePhotoUri: null,
    soatExpiry: '2027-05-20',
    soatPhotoUri: null,
    tecnoExpiry: '2027-04-10',
    tecnoPhotoUri: null,
    mpEmail: '',
    termsAccepted: false,
  });

  // Errores inline
  const [errors, setErrors] = useState({});

  // --- SELECCIONAR IMAGEN ---
  const pickImage = async (type) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        const uri = result.assets[0].uri;
        if (type === 'personal') setPersonal((p) => ({ ...p, photoUri: uri }));
        if (type === 'vehicle') setVehicle((v) => ({ ...v, photoUri: uri }));
        if (type === 'license') setDocs((d) => ({ ...d, licensePhotoUri: uri }));
        if (type === 'soat') setDocs((d) => ({ ...d, soatPhotoUri: uri }));
        if (type === 'tecno') setDocs((d) => ({ ...d, tecnoPhotoUri: uri }));
      }
    } catch (err) {
      console.warn('Error al seleccionar imagen:', err);
    }
  };

  // --- VALIDACIONES ESTRICTAS SEGÚN EL PDF ---
  const validateForm = () => {
    const errs = {};
    const currentYear = new Date().getFullYear();

    // 1. Datos Personales
    if (!personal.photoUri) errs.personalPhoto = 'La foto de perfil es obligatoria';
    if (!personal.fullName.trim()) {
      errs.fullName = 'El nombre completo es obligatorio';
    } else if (personal.fullName.length > 50) {
      errs.fullName = 'Máximo 50 caracteres';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(personal.fullName)) {
      errs.fullName = 'Solo se permiten letras y espacios';
    }

    if (!personal.documentId.trim()) {
      errs.documentId = 'El documento es obligatorio';
    } else if (!/^\d{6,10}$/.test(personal.documentId.trim())) {
      errs.documentId = 'Debe ser numérico de 6 a 10 dígitos';
    }

    if (!personal.phone.trim()) {
      errs.phone = 'El celular es obligatorio';
    } else if (!/^\d{10}$/.test(personal.phone.trim())) {
      errs.phone = 'Debe tener exactamente 10 dígitos';
    }

    if (!personal.email.trim()) {
      errs.email = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email.trim())) {
      errs.email = 'Formato de correo inválido con @ y dominio';
    }

    // Validar edad > 18
    const birthYear = parseInt((personal.birthDate || '').split('-')[0], 10);
    if (!birthYear || currentYear - birthYear < 18) {
      errs.birthDate = 'El conductor debe ser mayor de 18 años';
    }

    // 2. Vehículo
    if (!vehicle.photoUri) errs.vehiclePhoto = 'Foto del vehículo con placa visible obligatoria';

    const cleanPlate = (vehicle.plate || '').toUpperCase().trim();
    if (!cleanPlate) {
      errs.plate = 'La placa es obligatoria';
    } else if (!/^[A-Z]{3}\d{3}$/.test(cleanPlate)) {
      errs.plate = 'Formato colombiano inválido (Ej: ABC123)';
    }

    if (!vehicle.make.trim()) {
      errs.make = 'La marca es obligatoria';
    } else if (vehicle.make.length > 30) {
      errs.make = 'Máximo 30 caracteres';
    }

    if (!vehicle.model.trim()) {
      errs.model = 'El modelo es obligatorio';
    } else if (vehicle.model.length > 30) {
      errs.model = 'Máximo 30 caracteres';
    }

    const vehYear = parseInt(vehicle.year, 10);
    if (!vehYear || vehicle.year.length !== 4) {
      errs.year = 'El año debe ser de 4 dígitos';
    } else if (vehYear > currentYear) {
      errs.year = `No puede ser mayor al año actual (${currentYear})`;
    }

    const cap = parseInt(vehicle.capacity, 10);
    if (!cap || cap < 1) {
      errs.capacity = 'Capacidad numérica inválida';
    } else if (vehicle.category === 'xl' && cap < 6) {
      errs.capacity = 'La categoría XL exige mínimo 6 pasajeros';
    }

    // 3. Documentos y Pagos
    if (!docs.licenseNumber.trim()) errs.licenseNumber = 'Número de licencia obligatorio';
    if (!docs.licensePhotoUri) errs.licensePhoto = 'Foto de licencia obligatoria';
    if (!docs.soatPhotoUri) errs.soatPhoto = 'Foto de SOAT obligatoria';

    // Regla de técnico-mecánica: requerida si el vehículo tiene más de 5 años
    const vehicleAge = currentYear - vehYear;
    if (vehicleAge > 5 && !docs.tecnoPhotoUri) {
      errs.tecnoPhoto = 'Técnico-mecánica obligatoria para vehículos con más de 5 años';
    }

    if (!docs.mpEmail.trim()) {
      errs.mpEmail = 'El correo de Mercado Pago es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(docs.mpEmail.trim())) {
      errs.mpEmail = 'Formato de correo de Mercado Pago inválido';
    }

    if (!docs.termsAccepted) {
      errs.terms = 'Debe aceptar los términos y condiciones de la comisión del 20%';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const isFormValid = Object.keys(errors).length === 0;

  const handleSubmit = async () => {
    if (!validateForm()) {
      // Si hay errores, llevar a la pestaña donde están
      if (errors.personalPhoto || errors.fullName || errors.documentId || errors.phone || errors.email) {
        setActiveTab(0);
      } else if (errors.vehiclePhoto || errors.plate || errors.make || errors.model || errors.year || errors.capacity) {
        setActiveTab(1);
      } else {
        setActiveTab(2);
      }
      return;
    }

    await registerDriver({
      personal,
      vehicle: {
        ...vehicle,
        plate: vehicle.plate.toUpperCase().trim(),
        capacity: parseInt(vehicle.capacity, 10),
      },
      documents: docs,
    });

    Alert.alert(
      'Registro Exitoso',
      'Tu cuenta ha sido creada y se encuentra en estado "Pendiente de aprobación". Puedes simular tu aprobación desde el menú lateral para activar la disponibilidad.',
      [{ text: 'Entendido', onPress: () => navigation.replace('MainApp') }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Registro de Conductor</Text>
        <Text style={styles.headerSubtitle}>Completa las 3 pestañas requeridas</Text>
      </View>

      {/* Selector de pestañas Tab */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 0 && styles.tabItemActive]}
          onPress={() => setActiveTab(0)}
        >
          <Ionicons
            name="person"
            size={18}
            color={activeTab === 0 ? colors.black : colors.textMuted}
          />
          <Text style={[styles.tabLabel, activeTab === 0 && styles.tabLabelActive]}>
            1. Personal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 1 && styles.tabItemActive]}
          onPress={() => setActiveTab(1)}
        >
          <Ionicons
            name="car-sport"
            size={18}
            color={activeTab === 1 ? colors.black : colors.textMuted}
          />
          <Text style={[styles.tabLabel, activeTab === 1 && styles.tabLabelActive]}>
            2. Vehículo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 2 && styles.tabItemActive]}
          onPress={() => setActiveTab(2)}
        >
          <Ionicons
            name="document-text"
            size={18}
            color={activeTab === 2 ? colors.black : colors.textMuted}
          />
          <Text style={[styles.tabLabel, activeTab === 2 && styles.tabLabelActive]}>
            3. Documentos
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* PESTAÑA 1: DATOS PERSONALES */}
        {activeTab === 0 && (
          <View>
            <Text style={styles.sectionHeader}>Datos Personales</Text>

            {/* Foto de perfil */}
            <View style={styles.photoPickerContainer}>
              <TouchableOpacity
                style={styles.avatarButton}
                onPress={() => pickImage('personal')}
              >
                {personal.photoUri ? (
                  <Image source={{ uri: personal.photoUri }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="camera" size={32} color={colors.textMuted} />
                    <Text style={styles.avatarLabel}>Subir Foto</Text>
                  </View>
                )}
              </TouchableOpacity>
              {Boolean(errors.personalPhoto) && (
                <Text style={styles.errorInline}>{errors.personalPhoto}</Text>
              )}
            </View>

            <InputWithValidation
              label="Nombre Completo (Máx 50 caracteres)"
              placeholder="Ej: Juan Felipe Morales"
              value={personal.fullName}
              onChangeText={(txt) => setPersonal((p) => ({ ...p, fullName: txt }))}
              error={errors.fullName}
              maxLength={50}
            />

            <InputWithValidation
              label="Documento de Identidad (6-10 dígitos)"
              placeholder="Ej: 1098765432"
              value={personal.documentId}
              onChangeText={(txt) => setPersonal((p) => ({ ...p, documentId: txt }))}
              keyboardType="numeric"
              error={errors.documentId}
              maxLength={10}
            />

            <InputWithValidation
              label="Número de Celular (10 dígitos)"
              placeholder="Ej: 3001234567"
              value={personal.phone}
              onChangeText={(txt) => setPersonal((p) => ({ ...p, phone: txt }))}
              keyboardType="phone-pad"
              error={errors.phone}
              maxLength={10}
            />

            <InputWithValidation
              label="Fecha de Nacimiento (YYYY-MM-DD)"
              placeholder="2000-01-15"
              value={personal.birthDate}
              onChangeText={(txt) => setPersonal((p) => ({ ...p, birthDate: txt }))}
              error={errors.birthDate}
              helperText="El conductor debe ser mayor de 18 años"
            />

            <InputWithValidation
              label="Correo Electrónico"
              placeholder="conductor@ejemplo.com"
              value={personal.email}
              onChangeText={(txt) => setPersonal((p) => ({ ...p, email: txt }))}
              keyboardType="email-address"
              error={errors.email}
            />

            <CustomButton
              title="Continuar a Vehículo"
              onPress={() => setActiveTab(1)}
              style={{ marginTop: spacing.md }}
            />
          </View>
        )}

        {/* PESTAÑA 2: VEHÍCULO */}
        {activeTab === 1 && (
          <View>
            <Text style={styles.sectionHeader}>Información del Vehículo</Text>

            {/* Foto del vehículo con placa */}
            <View style={styles.docUploadBox}>
              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={() => pickImage('vehicle')}
              >
                <Ionicons name="image-outline" size={24} color={colors.textPrimary} />
                <Text style={styles.uploadBtnText}>
                  {vehicle.photoUri ? 'Cambiar Foto del Vehículo' : 'Subir Foto con Placa Visible'}
                </Text>
              </TouchableOpacity>
              {vehicle.photoUri && (
                <Image source={{ uri: vehicle.photoUri }} style={styles.previewThumb} />
              )}
              {Boolean(errors.vehiclePhoto) && (
                <Text style={styles.errorInline}>{errors.vehiclePhoto}</Text>
              )}
            </View>

            {/* Selector de Categoría */}
            <Text style={styles.fieldLabel}>Categoría del Vehículo</Text>
            <View style={styles.categoryRow}>
              {[
                { id: 'economy', label: 'Económico' },
                { id: 'xl', label: 'XL (6+ Pasajeros)' },
                { id: 'premium', label: 'Premium' },
              ].map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.catBadge,
                    vehicle.category === cat.id && styles.catBadgeActive,
                  ]}
                  onPress={() => setVehicle((v) => ({ ...v, category: cat.id }))}
                >
                  <Text
                    style={[
                      styles.catBadgeText,
                      vehicle.category === cat.id && styles.catBadgeTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <InputWithValidation
              label="Placa de Carro (Formato colombiano ABC123)"
              placeholder="ABC123"
              value={vehicle.plate}
              onChangeText={(txt) => setVehicle((v) => ({ ...v, plate: txt.toUpperCase() }))}
              error={errors.plate}
              autoCapitalize="characters"
              maxLength={6}
            />

            <InputWithValidation
              label="Marca (Máx 30 caracteres)"
              placeholder="Ej: Chevrolet"
              value={vehicle.make}
              onChangeText={(txt) => setVehicle((v) => ({ ...v, make: txt }))}
              error={errors.make}
              maxLength={30}
            />

            <InputWithValidation
              label="Modelo (Máx 30 caracteres)"
              placeholder="Ej: Onix Sedan"
              value={vehicle.model}
              onChangeText={(txt) => setVehicle((v) => ({ ...v, model: txt }))}
              error={errors.model}
              maxLength={30}
            />

            <InputWithValidation
              label="Año (4 dígitos)"
              placeholder="2022"
              value={vehicle.year}
              onChangeText={(txt) => setVehicle((v) => ({ ...v, year: txt }))}
              keyboardType="numeric"
              error={errors.year}
              maxLength={4}
            />

            <InputWithValidation
              label="Capacidad de Pasajeros"
              placeholder={vehicle.category === 'xl' ? 'Mínimo 6 para XL' : '4'}
              value={vehicle.capacity}
              onChangeText={(txt) => setVehicle((v) => ({ ...v, capacity: txt }))}
              keyboardType="numeric"
              error={errors.capacity}
            />

            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
              <CustomButton
                title="Anterior"
                variant="secondary"
                onPress={() => setActiveTab(0)}
                style={{ flex: 1 }}
              />
              <CustomButton
                title="Continuar a Documentos"
                onPress={() => setActiveTab(2)}
                style={{ flex: 2 }}
              />
            </View>
          </View>
        )}

        {/* PESTAÑA 3: DOCUMENTOS Y PAGOS */}
        {activeTab === 2 && (
          <View>
            <Text style={styles.sectionHeader}>Documentos y Cuenta de Pago</Text>

            <InputWithValidation
              label="Número de Licencia de Conducción"
              placeholder="C1-12345678"
              value={docs.licenseNumber}
              onChangeText={(txt) => setDocs((d) => ({ ...d, licenseNumber: txt }))}
              error={errors.licenseNumber}
            />

            {/* Carga de Licencia */}
            <View style={styles.docUploadBox}>
              <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage('license')}>
                <Ionicons name="card-outline" size={20} color={colors.textPrimary} />
                <Text style={styles.uploadBtnText}>
                  {docs.licensePhotoUri ? 'Licencia Cargada' : 'Subir Foto de Licencia'}
                </Text>
              </TouchableOpacity>
              {Boolean(errors.licensePhoto) && (
                <Text style={styles.errorInline}>{errors.licensePhoto}</Text>
              )}
            </View>

            {/* Carga de SOAT */}
            <View style={styles.docUploadBox}>
              <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage('soat')}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.textPrimary} />
                <Text style={styles.uploadBtnText}>
                  {docs.soatPhotoUri ? 'SOAT Cargado' : 'Subir Foto de SOAT'}
                </Text>
              </TouchableOpacity>
              {Boolean(errors.soatPhoto) && (
                <Text style={styles.errorInline}>{errors.soatPhoto}</Text>
              )}
            </View>

            {/* Carga de Técnico-Mecánica */}
            <View style={styles.docUploadBox}>
              <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage('tecno')}>
                <Ionicons name="construct-outline" size={20} color={colors.textPrimary} />
                <Text style={styles.uploadBtnText}>
                  {docs.tecnoPhotoUri ? 'Técnico-mecánica Cargada' : 'Subir Foto Técnico-mecánica'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.helperTextDoc}>Obligatoria para vehículos con más de 5 años</Text>
              {Boolean(errors.tecnoPhoto) && (
                <Text style={styles.errorInline}>{errors.tecnoPhoto}</Text>
              )}
            </View>

            {/* Correo Mercado Pago */}
            <InputWithValidation
              label="Correo de la Cuenta de Mercado Pago"
              placeholder="pagos.conductor@mercadopago.com"
              value={docs.mpEmail}
              onChangeText={(txt) => setDocs((d) => ({ ...d, mpEmail: txt }))}
              keyboardType="email-address"
              error={errors.mpEmail}
              helperText="Aquí recibirás tus pagos y liquidaciones"
            />

            {/* Checkbox Términos y Comisión 20% */}
            <TouchableOpacity
              style={styles.termsBox}
              onPress={() => setDocs((d) => ({ ...d, termsAccepted: !d.termsAccepted }))}
            >
              <Ionicons
                name={docs.termsAccepted ? 'checkbox' : 'square-outline'}
                size={24}
                color={docs.termsAccepted ? colors.online : colors.textMuted}
              />
              <Text style={styles.termsText}>
                Acepto los términos y condiciones. Entiendo que la plataforma cobrará una{' '}
                <Text style={{ fontWeight: '800' }}>comisión del 20%</Text> sobre la tarifa del viaje
                y que las propinas van completas para mí.
              </Text>
            </TouchableOpacity>
            {Boolean(errors.terms) && <Text style={styles.errorInline}>{errors.terms}</Text>}

            {/* Botón Final Enviar Registro */}
            <CustomButton
              title="Completar y Enviar Registro"
              variant="primary"
              onPress={handleSubmit}
              style={{ marginTop: spacing.lg }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabItem: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    borderBottomWidth: 3,
    borderColor: 'transparent',
  },
  tabItemActive: {
    borderColor: colors.black,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.black,
    fontWeight: '700',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  photoPickerContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 2,
  },
  docUploadBox: {
    marginBottom: spacing.md,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  uploadBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  previewThumb: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  catBadge: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  catBadgeActive: {
    borderColor: colors.black,
    backgroundColor: colors.black,
  },
  catBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  catBadgeTextActive: {
    color: colors.white,
  },
  termsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  errorInline: {
    color: colors.errorText,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  helperTextDoc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 3,
  },
});
