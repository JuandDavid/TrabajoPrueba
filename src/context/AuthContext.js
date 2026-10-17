import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

const STORAGE_KEYS = {
  DRIVER_SESSION: '@uberclone_driver_session',
  LANGUAGE: '@uberclone_language',
  LAST_AVAILABILITY: '@uberclone_last_availability',
};

// Conductor inicial de prueba para facilitar la demostración de inmediato
const DEFAULT_DEMO_DRIVER = {
  id: 'driver_fiera_01',
  fullName: 'Juan Felipe (Fiera)',
  documentId: '1098765432',
  phone: '3001234567',
  email: 'fiera.driver@uberclone.com',
  birthDate: '2000-05-15',
  gender: 'Masculino',
  language: 'es',
  photoUri: null,
  status: 'approved', // 'pending_approval' | 'approved' | 'rejected'
  balance: 45000,     // Saldo en COP (positivo o negativo)
  rating: 4.95,
  vehicle: {
    category: 'economy', // 'economy' | 'xl' | 'premium'
    plate: 'ABC123',
    makeModel: 'Chevrolet Onix',
    year: '2022',
    color: 'Gris Plata',
    capacity: 4,
    photoUri: null,
  },
  documents: {
    licenseNumber: 'C1-9876543',
    licenseExpiry: '2028-12-31',
    soatExpiry: '2027-11-20',
    tecnoExpiry: '2027-10-15',
    mpEmail: 'fiera.driver@mercadopago.com',
    termsAccepted: true,
  },
};

export function AuthProvider({ children }) {
  const [driver, setDriver] = useState(DEFAULT_DEMO_DRIVER);
  const [language, setLanguage] = useState('es');
  const [isLoading, setIsLoading] = useState(true);

  // Cargar sesión y preferencias guardadas al iniciar
  useEffect(() => {
    async function loadStoredData() {
      try {
        const [storedSession, storedLang] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.DRIVER_SESSION),
          AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE),
        ]);

        if (storedSession) {
          setDriver(JSON.parse(storedSession));
        } else {
          // Guardar el perfil inicial por defecto
          await AsyncStorage.setItem(
            STORAGE_KEYS.DRIVER_SESSION,
            JSON.stringify(DEFAULT_DEMO_DRIVER)
          );
        }

        if (storedLang) {
          setLanguage(storedLang);
        }
      } catch (err) {
        console.warn('Error al cargar sesión de almacenamiento:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredData();
  }, []);

  // Guardar en AsyncStorage cada vez que cambie el conductor
  const persistDriver = async (updatedDriver) => {
    setDriver(updatedDriver);
    if (updatedDriver) {
      await AsyncStorage.setItem(STORAGE_KEYS.DRIVER_SESSION, JSON.stringify(updatedDriver));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.DRIVER_SESSION);
    }
  };

  // Registro de nuevo conductor (Inicia siempre como 'pending_approval' según el PDF)
  const registerDriver = async (formData) => {
    const newDriver = {
      id: `driver_${Date.now()}`,
      fullName: formData.personal.fullName,
      documentId: formData.personal.documentId,
      phone: formData.personal.phone,
      email: formData.personal.email,
      birthDate: formData.personal.birthDate,
      gender: formData.personal.gender,
      language: formData.personal.language || 'es',
      photoUri: formData.personal.photoUri,
      status: 'pending_approval', // Bloqueado de salir a trabajar hasta ser aprobado
      balance: 0,
      rating: 5.0,
      vehicle: { ...formData.vehicle },
      documents: { ...formData.documents },
    };

    await persistDriver(newDriver);
    return newDriver;
  };

  // Simulación autorizada para cambiar estado (Aprobado <-> Pendiente)
  const toggleApprovalStatus = async () => {
    if (!driver) return;
    const nextStatus = driver.status === 'approved' ? 'pending_approval' : 'approved';
    const updated = { ...driver, status: nextStatus };
    await persistDriver(updated);
  };

  // Modificar perfil
  const updateDriverProfile = async (partialData) => {
    if (!driver) return;
    const updated = { ...driver, ...partialData };
    await persistDriver(updated);
  };

  // Modificar saldo tras comisiones o pagos
  const updateDriverBalance = async (amountDelta) => {
    if (!driver) return;
    const updated = {
      ...driver,
      balance: Math.round((driver.balance || 0) + amountDelta),
    };
    await persistDriver(updated);
  };

  // Cambiar idioma (es / en)
  const changeLanguage = async (newLang) => {
    setLanguage(newLang);
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, newLang);
  };

  // Cerrar sesión
  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.DRIVER_SESSION);
    setDriver(null);
  };

  return (
    <AuthContext.Provider
      value={{
        driver,
        isApproved: driver?.status === 'approved',
        language,
        isLoading,
        registerDriver,
        toggleApprovalStatus,
        updateDriverProfile,
        updateDriverBalance,
        changeLanguage,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
