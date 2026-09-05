import { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Star, X } from 'lucide-react-native';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

interface RatingModalProps {
  visible: boolean;
  deliveryCode: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

export function RatingModal({ visible, deliveryCode, onClose, onSubmit }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit(rating, comment.trim());
    setRating(0);
    setComment('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.sheetWrap}>
          <View style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.title}>Rate your delivery</Text>
              <TouchableOpacity onPress={onClose} hitSlop={8}>
                <X color={colors.textSecondary} size={22} strokeWidth={2} />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>How was {deliveryCode}?</Text>

            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity key={value} onPress={() => setRating(value)} hitSlop={6}>
                  <Star
                    color={value <= rating ? colors.primary : colors.border}
                    fill={value <= rating ? colors.primary : 'transparent'}
                    size={36}
                    strokeWidth={1.5}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Add a comment (optional)"
              placeholder="e.g. Rider was fast and courteous"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
              style={styles.textArea}
            />

            <Button label="Submit Rating" onPress={handleSubmit} disabled={rating === 0} />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(21,36,54,0.5)', justifyContent: 'flex-end' },
  sheetWrap: { width: '100%' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...typography.h3, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },
  starRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  textArea: { minHeight: 72, textAlignVertical: 'top', marginBottom: spacing.lg },
});
