import { useEffect, useRef, useState } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);

  // document-level listeners never fire in the sandbox, so closing on an
  // outside click is done with a blur-capturing wrapper instead.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = setTimeout(() => undefined, 0);

    return () => clearTimeout(timer);
  }, [isOpen]);

  const selected = options.find((option) => option.value === value);

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', display: 'inline-block' }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsOpen(false);
        }
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
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              style={{
                background:
                  option.value === value
                    ? theme.background.transparent.light
                    : 'transparent',
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
