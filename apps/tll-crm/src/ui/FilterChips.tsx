import { useTheme } from 'twenty-ui/theme-constants';

export type FilterChipOption<TValue extends string> = {
  value: TValue;
  label: string;
};

type FilterChipsProps<TValue extends string> = {
  value: TValue;
  options: ReadonlyArray<FilterChipOption<TValue>>;
  onChange: (value: TValue) => void;
  testId?: string;
};

// An always-visible row rather than a dropdown: a floating menu inside a front
// component renders but never receives pointer events, and with seven options
// the row is also one click instead of two.
export const FilterChips = <TValue extends string>({
  value,
  options,
  onChange,
  testId,
}: FilterChipsProps<TValue>) => {
  const theme = useTheme();

  return (
    <div
      data-testid={testId}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: theme.spacing[1],
      }}
    >
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            data-testid={
              testId !== undefined ? `${testId}-${option.value}` : undefined
            }
            aria-pressed={isSelected}
            onClick={() => onChange(option.value)}
            style={{
              background: isSelected
                ? theme.background.transparent.medium
                : 'transparent',
              border: `1px solid ${
                isSelected ? theme.border.color.strong : theme.border.color.medium
              }`,
              borderRadius: theme.border.radius.sm,
              color: isSelected
                ? theme.font.color.primary
                : theme.font.color.secondary,
              cursor: 'pointer',
              fontFamily: theme.font.family,
              fontSize: theme.font.size.sm,
              padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
              whiteSpace: 'nowrap',
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
