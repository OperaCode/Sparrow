import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Button } from '@/components/Button';

export default function PhoneScreen() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const formatPhone = (value: string) => {
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('234')) cleaned = cleaned.slice(3);
    if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
    cleaned = cleaned.slice(0, 10);
    return cleaned;
  };

  const handleContinue = () => {
    setError(null);
    const digits = formatPhone(phone);
    if (digits.length !== 10) {
      setError('Enter a valid 10-digit phone number');
      return;
    }
    const fullPhone = `+234${digits}`;
    router.push({ pathname: '/auth/otp', params: { phone: fullPhone } });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.bird}>🐦</Text>
          <Text style={styles.title}>Welcome to Sparrow</Text>
          <Text style={styles.subtitle}>Local delivery, made simple.</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Phone number</Text>
            <View style={styles.phoneRow}>
              <View style={styles.prefix}>
                <Text style={styles.prefixText}>🇳🇬 +234</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="801 234 5678"
                placeholderTextColor={colors.textTertiary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          <Button label="Continue" onPress={handleContinue} />
          <Text style={styles.terms}>
            By continuing, you agree to Sparrow's Terms & Conditions
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xxxl + spacing.xl, justifyContent: 'center' },
  bird: { fontSize: 64, textAlign: 'center', marginBottom: spacing.md },
  title: { ...typography.h1, textAlign: 'center', color: colors.text },
  subtitle: { ...typography.body, textAlign: 'center', color: colors.textSecondary, marginTop: spacing.xs },
  form: { marginTop: spacing.xxl, marginBottom: spacing.lg },
  label: { ...typography.label, marginBottom: spacing.xs + 2, color: colors.text },
  phoneRow: { flexDirection: 'row', alignItems: 'center' },
  prefix: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderTopLeftRadius: radius.md,
    borderBottomLeftRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 16,
  },
  prefixText: { ...typography.bodyMedium, color: colors.text },
  phoneInput: {
    ...typography.body,
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderTopRightRadius: radius.md,
    borderBottomRightRadius: radius.md,
    borderLeftWidth: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: 16,
    color: colors.text,
    minHeight: 52,
  },
  errorText: { ...typography.small, color: colors.error, marginTop: spacing.xs },
  terms: { ...typography.small, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.lg, paddingHorizontal: spacing.md },
});
