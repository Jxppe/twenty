import { useTheme } from 'twenty-ui/theme-constants';

type Theme = ReturnType<typeof useTheme>;

// Twenty's blue is its own product identity, not ours. Bronze reads as a law
// firm, and it avoids the colours that already carry meaning in the inbox:
// green for open, red for overdue, per-channel colours on the tags.
export const brandAccent = (theme: Theme) => theme.color.bronze;

export const brandAccentText = (theme: Theme) => theme.font.color.inverted;
