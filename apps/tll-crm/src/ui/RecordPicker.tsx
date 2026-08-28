import { useState } from 'react';
import { useTheme } from 'twenty-ui/theme-constants';

import { brandAccent } from 'src/constants/brand';

type Theme = ReturnType<typeof useTheme>;

export type RecordOption = { id: string; label: string };

type RecordPickerProps = {
  options: RecordOption[];
  value: string | null;
  placeholder: string;
  onPick: (id: string | null) => void;
  // Offered only when nothing matched, and always as the last thing after the
  // list of what exists. Search first is what stops a misspelling becoming a
  // second client.
  onCreate?: (name: string) => void;
  createLabel?: string;
};

const VISIBLE = 8;

// A floating list, which the sandbox does allow: component elements are
// mirrored into real host DOM, and the root container sets only width and
// height. What it forbids is `createPortal`, because the component runs in a
// worker with no document — which is why every Radix or MUI menu dies here and
// why this is hand-rolled instead.
//
// Nothing is measured. There is no DOM to measure from a worker, so the list is
// placed with CSS alone and must not sit inside a clipping ancestor.
export const RecordPicker = ({
  options,
  value,
  placeholder,
  onPick,
  onCreate,
  createLabel = 'Add',
}: RecordPickerProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const selected = options.find((option) => option.id === value) ?? null;
  const trimmed = query.trim();

  const matches = options
    .filter((option) =>
      option.label.toLowerCase().includes(trimmed.toLowerCase()),
    )
    .slice(0, VISIBLE);

  const isExact = options.some(
    (option) => option.label.toLowerCase() === trimmed.toLowerCase(),
  );

  const close = () => {
    setIsOpen(false);
    setQuery('');
  };

  const pick = (option: RecordOption) => {
    onPick(option.id);
    close();
  };

  return (
    <div className="tll-picker">
      <input
        className="tll-picker-input"
        type="text"
        value={isOpen ? query : (selected?.label ?? '')}
        placeholder={placeholder}
        onFocus={() => setIsOpen(true)}
        // Losing focus to anywhere but the list means the person moved on, and
        // a half-typed name is not an answer, so nothing is kept.
        onBlur={close}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            close();
          }

          if (event.key === 'Enter' && matches.length > 0) {
            event.preventDefault();
            pick(matches[0]);
          }
        }}
      />

      {selected !== null && !isOpen && (
        <button
          className="tll-picker-clear"
          type="button"
          title={`Clear ${selected.label}`}
          onClick={() => onPick(null)}
        >
          ×
        </button>
      )}

      {isOpen && (
        <div className="tll-picker-menu">
          {matches.map((option) => (
            <button
              key={option.id}
              className="tll-picker-option"
              type="button"
              // The click would otherwise never land: blur fires first and
              // closes the list out from under the pointer.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => pick(option)}
            >
              {option.label}
            </button>
          ))}

          {matches.length === 0 && trimmed === '' && (
            <span className="tll-picker-empty">Type to search</span>
          )}

          {matches.length === 0 && trimmed !== '' && (
            <span className="tll-picker-empty">Nothing matches “{trimmed}”</span>
          )}

          {onCreate !== undefined && trimmed !== '' && !isExact && (
            <button
              className="tll-picker-create"
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onCreate(trimmed);
                close();
              }}
            >
              + {createLabel} “{trimmed}”
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Exported as a string rather than rendered per instance: a front component's
// <style> is lifted into the host document head, so five pickers would mean
// five identical stylesheets in the page.
export const recordPickerCss = (theme: Theme): string => `
  .tll-picker { position: relative; width: 100%; }
  .tll-picker-input {
    background: transparent;
    border: 1px solid transparent;
    border-radius: ${theme.border.radius.sm};
    color: ${theme.font.color.secondary};
    font-family: inherit;
    font-size: ${theme.font.size.sm};
    padding: 5px 4px;
    width: 100%;
  }
  .tll-picker-input:hover { border-color: ${theme.border.color.light}; }
  .tll-picker-input:focus {
    background: ${theme.background.primary};
    border-color: ${brandAccent(theme)};
    color: ${theme.font.color.primary};
    outline: none;
  }
  .tll-picker-input::placeholder { color: ${theme.font.color.tertiary}; }
  .tll-picker-clear {
    background: none;
    border: none;
    color: ${theme.font.color.tertiary};
    cursor: pointer;
    font-size: ${theme.font.size.md};
    line-height: 1;
    padding: 0 4px;
    position: absolute;
    right: 2px;
    top: 50%;
    transform: translateY(-50%);
  }
  .tll-picker-clear:hover { color: ${theme.font.color.primary}; }
  .tll-picker-menu {
    background: ${theme.background.primary};
    border: 1px solid ${theme.border.color.medium};
    border-radius: ${theme.border.radius.sm};
    box-shadow: 0 4px 16px ${theme.background.transparent.medium};
    display: flex;
    flex-direction: column;
    left: 0;
    min-width: 100%;
    position: absolute;
    top: calc(100% + 2px);
    white-space: nowrap;
    z-index: 20;
  }
  .tll-picker-option, .tll-picker-create {
    background: none;
    border: none;
    color: ${theme.font.color.primary};
    cursor: pointer;
    font-family: inherit;
    font-size: ${theme.font.size.sm};
    padding: 6px 8px;
    text-align: left;
  }
  .tll-picker-option:hover, .tll-picker-create:hover {
    background: ${theme.background.transparent.light};
  }
  .tll-picker-create {
    border-top: 1px solid ${theme.border.color.light};
    color: ${brandAccent(theme)};
  }
  .tll-picker-empty {
    color: ${theme.font.color.tertiary};
    font-size: ${theme.font.size.sm};
    padding: 6px 8px;
  }
`;
