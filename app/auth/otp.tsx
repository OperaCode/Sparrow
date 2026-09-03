import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { SparrowLogo } from '@/components/SparrowLogo';
import { useAuth } from '@/contexts/AuthContext';

const OTP_LENGTH = 6;

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { signIn } = useAuth();
  const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    setTimeout(() => inputs.current[0]?.focus(), 300);
  }, []);

  const handleCodeChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError(null);

    if (digit && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }

    if (newCode.every((d) => d !== '') && newCode.join('').length === OTP_LENGTH) {
      verifyOtp(newCode.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = (otp: string) => {
    // Mock: any 6-digit code works. New users go to onboarding.
    if (otp.length === OTP_LENGTH) {
      signIn();
      router.replace('/auth/onboarding');
    }
  };

  const resendOtp = () => {
    setError(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <SparrowLogo size={48} color={colors.primary} />
          <Text style={styles.title}>Verify your number</Text>
          <Text style={styles.subtitle}>
            We sent a code to {phone}. Enter it below.
          </Text>

          <View style={styles.otpRow}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputs.current[index] = ref; }}
                style={[styles.otpBox, digit ? styles.otpFilled : null, error ? styles.otpError : null]}
                value={digit}
                onChangeText={(value) => handleCodeChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e.nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button
            label="Resend code"
            variant="ghost"
            onPress={resendOtp}
            fullWidth={false}
            style={styles.resendBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xxxl + spacing.xl, alignItems: 'center' },
  title: { ...typography.h1, textAlign: 'center', color: colors.text, marginTop: spacing.md },
  subtitle: { ...typography.body, textAlign: 'center', color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.xxl },
  otpRow: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' },
  otpBox: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    textAlign: 'center',
    fontSize: 24,
    fontFamily: 'PlusJakartaSans-Bold',
    color: colors.text,
  },
  otpFilled: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  otpError: { borderColor: colors.error },
  errorText: { ...typography.small, color: colors.error, marginTop: spacing.md, textAlign: 'center' },
  resendBtn: { marginTop: spacing.lg },
});
