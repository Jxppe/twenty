import { useTheme } from 'twenty-ui/theme-constants';

type InitialProps = {
  name: string;
};

// Replaces twenty-ui's Avatar, which reaches the sandbox unstyled.
export const Initial = ({ name }: InitialProps) => {
  const theme = useTheme();

  return (
    <span
      style={{
        alignItems: 'center',
        background: theme.background.transparent.light,
        border: `1px solid ${theme.border.color.medium}`,
        borderRadius: theme.border.radius.rounded,
        color: theme.font.color.secondary,
        display: 'inline-flex',
        flexShrink: 0,
        fontSize: theme.font.size.xs,
        fontWeight: theme.font.weight.medium,
        height: '20px',
        justifyContent: 'center',
        width: '20px',
      }}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
};
