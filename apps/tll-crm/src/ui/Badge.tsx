import { useTheme } from 'twenty-ui/theme-constants';

export type BadgeColor = keyof ReturnType<typeof useTheme>['tag']['background'];

type BadgeProps = {
  text: string;
  color: BadgeColor;
  testId?: string;
};

// Replaces twenty-ui's Tag and Status, which reach the sandbox unstyled.
export const Badge = ({ text, color, testId }: BadgeProps) => {
  const theme = useTheme();

  return (
    <span
      data-testid={testId}
      style={{
        alignItems: 'center',
        background: theme.tag.background[color],
        borderRadius: theme.border.radius.sm,
        color: theme.tag.text[color],
        display: 'inline-flex',
        fontSize: theme.font.size.xs,
        fontWeight: theme.font.weight.medium,
        height: '20px',
        padding: `0 ${theme.spacing[1]}`,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  );
};
