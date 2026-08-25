import { type ComponentType, useState } from 'react';
import { useTheme } from 'twenty-ui/theme-constants';

type ButtonProps = {
  title: string;
  Icon?: ComponentType<{ size?: number; color?: string }>;
  variant?: 'secondary' | 'primary';
  isDisabled?: boolean;
  onClick: () => void;
  testId?: string;
};

// twenty-ui's Button reaches the sandbox unstyled: its Linaria classes are not
// applied there, so the icon and label stack as raw block content. Everything
// here is inline-styled for that reason, not by preference.
export const Button = ({
  title,
  Icon,
  variant = 'secondary',
  isDisabled = false,
  onClick,
  testId,
}: ButtonProps) => {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const isPrimary = variant === 'primary';

  const background = isPrimary
    ? theme.color.blue
    : isHovered
      ? theme.background.transparent.light
      : theme.background.primary;

  return (
    <button
      type="button"
      data-testid={testId}
      disabled={isDisabled}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        alignItems: 'center',
        background,
        border: `1px solid ${
          isPrimary ? 'transparent' : theme.border.color.medium
        }`,
        borderRadius: theme.border.radius.sm,
        color: isPrimary ? theme.font.color.inverted : theme.font.color.secondary,
        cursor: isDisabled ? 'default' : 'pointer',
        display: 'inline-flex',
        fontFamily: theme.font.family,
        fontSize: theme.font.size.sm,
        fontWeight: theme.font.weight.regular,
        gap: theme.spacing[1],
        height: '32px',
        lineHeight: '1',
        opacity: isDisabled ? 0.5 : 1,
        padding: `0 ${theme.spacing[2]}`,
        whiteSpace: 'nowrap',
      }}
    >
      {Icon !== undefined && (
        <Icon
          size={14}
          color={isPrimary ? theme.font.color.inverted : theme.font.color.tertiary}
        />
      )}
      {title}
    </button>
  );
};
