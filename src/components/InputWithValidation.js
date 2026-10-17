import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, spacing } from '../styles/theme';

/**
 * Campo de texto reutilizable con etiqueta y mensaje de error en línea.
 * Requisito estricto del PDF: "los errores se muestran debajo de cada campo, no en un Alert".
 */
export function InputWithValidation({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = 'default',
  secureTextEntry = false,
  maxLength,
  autoCapitalize = 'none',
  editable = true,
  helperText,
}) {
  const hasError = Boolean(error);

  return (
    <View style={styles.container}>
      {Boolean(label) && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          hasError && styles.inputError,
          !editable && styles.inputDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        editable={editable}
      />
      {hasError ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.errorText,
    backgroundColor: colors.errorBg,
  },
  inputDisabled: {
    backgroundColor: '#F5F5F5',
    color: colors.textMuted,
  },
  errorText: {
    color: colors.errorText,
    fontSize: 12,
    fontWeight: '500',
    marginTop: spacing.xs,
    marginLeft: 2,
  },
  helperText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
    marginLeft: 2,
  },
});
