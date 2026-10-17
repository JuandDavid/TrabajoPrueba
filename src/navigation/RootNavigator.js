import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerNavigator } from './DrawerNavigator';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ActiveTripScreen } from '../screens/trip/ActiveTripScreen';
import { PaymentSummaryScreen } from '../screens/trip/PaymentSummaryScreen';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MainApp"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainApp" component={DrawerNavigator} />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          headerShown: true,
          title: 'Registro de Conductor',
          headerBackTitle: 'Atrás',
        }}
      />
      <Stack.Screen
        name="ActiveTrip"
        component={ActiveTripScreen}
        options={{
          gestureEnabled: false, // Evita volver atrás durante la carrera
        }}
      />
      <Stack.Screen
        name="PaymentSummary"
        component={PaymentSummaryScreen}
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}
