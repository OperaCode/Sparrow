import { ActivityIndicator, Text, TouchableOpacity, type TouchableOpacityProps } from 'react-native';
import { colors, radius, spacing, typography, shadows } from '@/constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  size = 'lg',
  loading = false,
  fullWidth = true,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';

  const height = size === 'lg' ? 56 : 48;

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        {
          height,
          borderRadius: radius.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing.lg,
          ...(isPrimary && { backgroundColor: colors.primary }),
          ...(isSecondary && { backgroundColor: colors.ink }),
          ...(isOutline && { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.border }),
          ...(isGhost && { backgroundColor: 'transparent' }),
          ...(disabled && { opacity: 0.4 }),
          ...(fullWidth && { width: '100%' }),
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary || isSecondary ? colors.white : colors.text} />
      ) : (
        <Text
          style={[
            typography.bodyMedium,
            {
              ...(isPrimary && { color: colors.ink }),
              ...(isSecondary && { color: colors.white }),
              ...(isOutline && { color: colors.text }),
              ...(isGhost && { color: colors.text }),
            },
            { fontFamily: 'PlusJakartaSans-Bold', fontSize: 16 },
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
