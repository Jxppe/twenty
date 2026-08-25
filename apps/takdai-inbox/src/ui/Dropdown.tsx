import { useRef, useState } from 'react';
import { IconChevronDown } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme-constants';

export type DropdownOption<TValue extends string> = {
  value: TValue;
  label: string;
};

type DropdownProps<TValue extends string> = {
  value: TValue;
  options: ReadonlyArray<DropdownOption<TValue>>;
  onChange: (value: TValue) => void;
  testId?: string;
};

// Hand-rolled rather than taken from a component library: the front-component
// sandbox drops createPortal silently, so every Radix/base-ui popover renders
// nothing. This positions the menu absolutely inside its own tree instead.
export const Dropdown = <TValue extends string>({
  value,
  options,
  onChange,
  testId,
}: DropdownProps<TValue>) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredValue, setHoveredValue] = useState<TValue | null>(null);
  const isSelectingRef = useRef(false);

  const selected = options.find((option) => option.value === value);

  const select = (nextValue: TValue) => {
    isSelectingRef.current = true;
    onChange(nextValue);
    setIsOpen(false);
    setHoveredValue(null);
  };

  const optionBackground = (optionValue: TValue) => {
    if (optionValue === hoveredValue) {
      return theme.background.transparent.medium;
    }

    if (optionValue === value) {
      return theme.background.transparent.light;
    }

    return 'transparent';
  };

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      // document-level listeners never fire in the sandbox, so outside clicks
      // are detected by the wrapper losing focus.
      onBlur={(event) => {
        if (isSelectingRef.current) {
          isSelectingRef.current = false;
          return;
        }

        const nextFocused = event.relatedTarget as Node | null;

        if (nextFocused !== null && event.currentTarget.contains(nextFocused)) {
          return;
        }

        setIsOpen(false);
        setHoveredValue(null);
      }}
    >
      <button
        type="button"
        data-testid={testId}
        onClick={() => setIsOpen((previous) => !previous)}
        style={{
          alignItems: 'center',
          background: theme.background.primary,
          border: `1px solid ${theme.border.color.medium}`,
          borderRadius: theme.border.radius.sm,
          color: theme.font.color.primary,
          cursor: 'pointer',
          display: 'flex',
          fontFamily: theme.font.family,
          fontSize: theme.font.size.sm,
          gap: theme.spacing[1],
          padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
        }}
      >
        {selected?.label ?? value}
        <IconChevronDown size={14} color={theme.font.color.tertiary} />
      </button>
      {isOpen && (
        <div
          style={{
            background: theme.background.primary,
            border: `1px solid ${theme.border.color.medium}`,
            borderRadius: theme.border.radius.sm,
            boxShadow: theme.boxShadow.strong,
            left: 0,
            minWidth: '160px',
            padding: theme.spacing[1],
            position: 'absolute',
            top: 'calc(100% + 4px)',
            zIndex: 20,
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              data-testid={
                testId !== undefined ? `${testId}-${option.value}` : undefined
              }
              // The wrapper's blur unmounts this menu on mousedown, before a
              // click can land on it, so selection has to happen on mousedown.
              onMouseDown={(event) => {
                event.preventDefault();
                select(option.value);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  select(option.value);
                }
              }}
              // Inline styles carry no :hover, so hover feedback is state.
              onMouseEnter={() => setHoveredValue(option.value)}
              onMouseLeave={() =>
                setHoveredValue((previous) =>
                  previous === option.value ? null : previous,
                )
              }
              style={{
                background: optionBackground(option.value),
                border: 'none',
                borderRadius: theme.border.radius.sm,
                color: theme.font.color.primary,
                cursor: 'pointer',
                display: 'block',
                fontFamily: theme.font.family,
                fontSize: theme.font.size.sm,
                padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                textAlign: 'left',
                width: '100%',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
