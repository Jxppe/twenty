import { useTheme } from 'twenty-ui/theme-constants';

import { brandAccent, brandAccentText } from 'src/constants/brand';

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
              // Solid rather than a tint: at 13px on a dark background a
              // transparent fill does not read as selected.
              background: isSelected ? brandAccent(theme) : 'transparent',
              border: `1px solid ${
                isSelected ? brandAccent(theme) : theme.border.color.medium
              }`,
              borderRadius: theme.border.radius.sm,
              color: isSelected
                ? brandAccentText(theme)
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
