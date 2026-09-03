import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { useDraft } from '@/contexts/DraftContext';
import { ArrowLeft, Copy, Check, Upload } from 'lucide-react-native';

const BANK_DETAILS = {
  accountName: 'Sparrow Logistics',
  bank: 'GTBank',
  accountNumber: '0123456789',
};

export default function PaymentScreen() {
  const { draft } = useDraft();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copyAccountNumber = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUploadReceipt = () => {
    setReceiptUploaded(true);
  };

  const handleSubmitPayment = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setLoading(false);
      router.replace('/send/confirmation');
    }, 800);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft color={colors.text} size={24} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Pay for your Sparrow</Text>

      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>Amount</Text>
        <Text style={styles.amountValue}>₦{draft.price?.toLocaleString() ?? '1,200'}</Text>
      </View>

      <View style={styles.bankCard}>
        <Text style={styles.bankSectionTitle}>Transfer to</Text>
        <View style={styles.bankRow}>
          <Text style={styles.bankLabel}>Account Name</Text>
          <Text style={styles.bankValue}>{BANK_DETAILS.accountName}</Text>
        </View>
        <View style={styles.bankRow}>
          <Text style={styles.bankLabel}>Bank</Text>
          <Text style={styles.bankValue}>{BANK_DETAILS.bank}</Text>
        </View>
        <View style={styles.bankRow}>
          <Text style={styles.bankLabel}>Account Number</Text>
          <Text style={styles.bankValue}>{BANK_DETAILS.accountNumber}</Text>
        </View>
        <TouchableOpacity style={styles.copyBtn} activeOpacity={0.85} onPress={copyAccountNumber}>
          {copied ? (
            <>
              <Check color={colors.success} size={18} strokeWidth={2.5} />
              <Text style={styles.copyTextDone}>Copied!</Text>
            </>
          ) : (
            <>
              <Copy color={colors.text} size={18} strokeWidth={2} />
              <Text style={styles.copyText}>Copy Account Number</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>Upload payment receipt (optional)</Text>
      <TouchableOpacity style={styles.uploadBtn} activeOpacity={0.85} onPress={handleUploadReceipt}>
        {receiptUploaded ? (
          <>
            <Check color={colors.success} size={20} strokeWidth={2.5} />
            <Text style={styles.uploadTextDone}>Receipt uploaded</Text>
          </>
        ) : (
          <>
            <Upload color={colors.textSecondary} size={20} strokeWidth={2} />
            <Text style={styles.uploadText}>Upload Receipt</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.note}>
        After making the transfer, submit your payment confirmation. We'll verify it shortly.
      </Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Button label="I've Made Payment" onPress={handleSubmitPayment} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.xl },
  amountCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  amountLabel: { ...typography.bodyMedium, color: colors.white, opacity: 0.9 },
  amountValue: { ...typography.display, color: colors.white, fontSize: 36, marginTop: spacing.xs },
  bankCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  bankSectionTitle: { ...typography.label, color: colors.textTertiary, marginBottom: spacing.md },
  bankRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs + 2 },
  bankLabel: { ...typography.body, color: colors.textSecondary },
  bankValue: { ...typography.bodyMedium, color: colors.text, fontFamily: 'PlusJakartaSans-SemiBold' },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
  },
  copyText: { ...typography.bodyMedium, color: colors.text },
  copyTextDone: { ...typography.bodyMedium, color: colors.success, fontFamily: 'PlusJakartaSans-SemiBold' },
  sectionLabel: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md + 2,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginBottom: spacing.md,
  },
  uploadText: { ...typography.bodyMedium, color: colors.textSecondary },
  uploadTextDone: { ...typography.bodyMedium, color: colors.success, fontFamily: 'PlusJakartaSans-SemiBold' },
  note: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xl, lineHeight: 20 },
  errorText: { ...typography.small, color: colors.error, marginBottom: spacing.md },
});
