import { Fragment, useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { useTheme } from 'twenty-ui/theme-constants';

import {
  createClient,
  createWorkLogs,
  fetchPickerOptions,
  fetchWorkLogDrafts,
  type JobOption,
  type PickerOption,
} from 'src/api/work-logs';
import { LOG_MY_DAY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  blankLine,
  isDerived,
  isSaveable,
  type Line,
  minutesOf,
  SOURCE_LABELS,
  today,
  toLine,
  WORK_LOG_STATUSES,
} from 'src/front-components/log-my-day-lines';
import { brandAccent } from 'src/constants/brand';
import { Button } from 'src/ui/Button';
import { RecordPicker, recordPickerCss } from 'src/ui/RecordPicker';

const LogMyDay = () => {
  const theme = useTheme();
  const [workedOn, setWorkedOn] = useState(today);
  const [lines, setLines] = useState<Line[]>([]);
  const [workspaceMemberId, setWorkspaceMemberId] = useState<string | null>(
    null,
  );
  const [clients, setClients] = useState<PickerOption[]>([]);
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [categories, setCategories] = useState<PickerOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  useEffect(() => {
    let isStale = false;

    setIsLoading(true);
    setSavedCount(null);

    void Promise.all([fetchWorkLogDrafts(workedOn), fetchPickerOptions()])
      .then(([response, options]) => {
        if (isStale) {
          return;
        }

        setClients(options.clients);
        setJobs(options.jobs);
        setCategories(options.categories);
        setWorkspaceMemberId(response.workspaceMemberId);
        setLines([...response.drafts.map(toLine), blankLine()]);
        setIsLoading(false);
      })
      .catch(() => {
        if (!isStale) {
          setLines([blankLine()]);
          setIsLoading(false);
        }
      });

    return () => {
      isStale = true;
    };
  }, [workedOn]);

  const update = (key: string, changes: Partial<Line>) =>
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...changes } : line)),
    );

  // The job already knows whose it is. Filling the client from it saves the
  // typing and, more to the point, stops the two disagreeing.
  const pickJob = (line: Line, matterId: string | null) => {
    const picked = jobs.find((job) => job.id === matterId);

    update(line.key, {
      matterId,
      ...(picked?.clientId != null && line.personId === null
        ? { personId: picked.clientId }
        : {}),
    });
  };

  const addClient = (line: Line, name: string) => {
    void createClient(name)
      .then((created) => {
        setClients((current) => [...current, created]);
        update(line.key, { personId: created.id });
        void enqueueSnackbar({
          message: `Added ${created.label} to People`,
          variant: 'success',
        });
      })
      .catch(() => {
        void enqueueSnackbar({
          message: 'Could not add that client.',
          variant: 'error',
        });
      });
  };

  const saveable = lines.filter(isSaveable);

  const save = () => {
    if (workspaceMemberId === null || saveable.length === 0) {
      return;
    }

    setIsSaving(true);

    void createWorkLogs(
      saveable.map((line) => ({
        description: line.description.trim(),
        notes: line.notes.trim(),
        workedOn,
        minutes: minutesOf(line),
        staffId: workspaceMemberId,
        practiceAreaId: line.practiceAreaId,
        status: line.status,
        matterId: line.matterId,
        bookingId: line.bookingId,
        personId: line.personId,
        billingEntityId: line.billingEntityId,
      })),
    )
      .then((created) => {
        setSavedCount(created);
        setIsSaving(false);
        void enqueueSnackbar({
          message: `Logged ${created} ${created === 1 ? 'entry' : 'entries'}`,
          variant: 'success',
        });
      })
      .catch(() => {
        setIsSaving(false);
        void enqueueSnackbar({
          message: 'Could not save. Nothing after the failure was written.',
          variant: 'error',
        });
      });
  };

  // The page sits inside Twenty's own chrome, beside its record tables, so it
  // has to read as part of the product rather than as a form bolted onto it.
  // Twenty's tables carry no per-cell borders: text sits on the row and a
  // control only draws itself once you are in it. A stylesheet rather than
  // inline styles, because focus and hover cannot be expressed inline.
  //
  // Front-component CSS lands in the host page unscoped, so every selector is
  // prefixed and none of them names a bare element.
  const css = `
    .tll-daylog {
      --tll-fg: ${theme.font.color.primary};
      --tll-fg-2: ${theme.font.color.secondary};
      --tll-fg-3: ${theme.font.color.tertiary};
      --tll-line: ${theme.border.color.light};
      --tll-line-strong: ${theme.border.color.medium};
      --tll-bg: ${theme.background.primary};
      --tll-accent: ${brandAccent(theme)};
      color: var(--tll-fg);
      display: flex;
      flex-direction: column;
      font-family: ${theme.font.family};
      height: 100%;
    }
    .tll-daylog-head {
      align-items: baseline;
      border-bottom: 1px solid var(--tll-line);
      display: flex;
      gap: 12px;
      padding: 16px 20px 12px;
    }
    .tll-daylog-title {
      font-size: ${theme.font.size.lg};
      font-weight: ${theme.font.weight.semiBold};
      letter-spacing: -0.01em;
      margin: 0;
    }
    .tll-daylog-date {
      background: transparent;
      border: 1px solid transparent;
      border-radius: ${theme.border.radius.sm};
      color: var(--tll-fg-2);
      font-family: inherit;
      font-size: ${theme.font.size.sm};
      padding: 2px 4px;
    }
    .tll-daylog-date:hover { border-color: var(--tll-line-strong); }
    .tll-daylog-date:focus {
      background: var(--tll-bg);
      border-color: var(--tll-accent);
      outline: none;
    }
    .tll-daylog-said {
      color: var(--tll-fg-3);
      font-size: ${theme.font.size.sm};
      margin-left: auto;
      max-width: 380px;
      text-align: right;
    }
    /* No overflow here: an absolutely positioned picker menu cannot escape a
       clipping ancestor, and nothing can be measured from a worker to place it
       anywhere else. A day is a handful of rows, so the page scrolls instead. */
    .tll-daylog-scroll { flex: 1; padding: 0 20px; }
    .tll-daylog-grid {
      align-items: center;
      display: grid;
      grid-template-columns: 3px 150px 150px 150px minmax(180px, 1.4fr) minmax(140px, 1fr) 124px 64px;
    }
    .tll-daylog-col {
      background: var(--tll-bg);
      border-bottom: 1px solid var(--tll-line);
      color: var(--tll-fg-3);
      font-size: ${theme.font.size.xs};
      font-weight: ${theme.font.weight.medium};
      letter-spacing: 0.04em;
      padding: 10px 8px;
      position: sticky;
      text-transform: uppercase;
      top: 0;
      z-index: 1;
    }
    .tll-daylog-col-num { text-align: right; }
    .tll-daylog-mark { align-self: stretch; }
    .tll-daylog-mark-derived { background: var(--tll-accent); }
    .tll-daylog-row-new .tll-daylog-field::placeholder { font-style: italic; }
    .tll-daylog-cell { border-bottom: 1px solid var(--tll-line); padding: 3px 4px; }
    .tll-daylog-field {
      background: transparent;
      border: 1px solid transparent;
      border-radius: ${theme.border.radius.sm};
      color: var(--tll-fg-2);
      font-family: inherit;
      font-size: ${theme.font.size.sm};
      padding: 5px 4px;
      width: 100%;
    }
    .tll-daylog-field-main { color: var(--tll-fg); }
    .tll-daylog-field-num { font-variant-numeric: tabular-nums; text-align: right; }
    .tll-daylog-field:hover { border-color: var(--tll-line); }
    .tll-daylog-field:focus {
      background: var(--tll-bg);
      border-color: var(--tll-accent);
      color: var(--tll-fg);
      outline: none;
    }
    .tll-daylog-field::placeholder { color: var(--tll-fg-3); }
    /* Their notes run to three or four lines. field-sizing grows the box where
       it is supported and is ignored where it is not, leaving a two-line box
       that still scrolls, so nothing is ever hidden without a scrollbar. */
    .tll-daylog-text {
      field-sizing: content;
      line-height: 1.45;
      max-height: 140px;
      min-height: 30px;
      resize: vertical;
    }
    .tll-daylog-foot {
      align-items: center;
      border-top: 1px solid var(--tll-line);
      display: flex;
      gap: 8px;
      padding: 12px 20px;
    }
    .tll-daylog-count {
      color: var(--tll-fg-3);
      font-size: ${theme.font.size.sm};
      margin-left: auto;
    }
    .tll-daylog-empty {
      color: var(--tll-fg-3);
      font-size: ${theme.font.size.sm};
      padding: 24px 20px;
    }
    @media (max-width: 900px) {
      .tll-daylog-grid { grid-template-columns: 3px 1fr 1fr; }
      .tll-daylog-col { display: none; }
    }
    ${recordPickerCss(theme)}
  `;

  const columns = [
    'Category',
    'Client',
    'Job',
    'What you did',
    'Notes',
    'Status',
    'Minutes',
  ];

  return (
    <div className="tll-daylog">
      <style>{css}</style>

      <div className="tll-daylog-head">
        <h1 className="tll-daylog-title">Log my day</h1>
        <input
          className="tll-daylog-date"
          type="date"
          value={workedOn}
          max={today()}
          onChange={(event) => setWorkedOn(event.target.value)}
        />
        {!isLoading && savedCount === null && (
          <span className="tll-daylog-said">
            Filled in from your bookings and the deadlines you closed. Correct
            what is wrong, add what is missing.
          </span>
        )}
      </div>

      {isLoading && <div className="tll-daylog-empty">Loading…</div>}

      {!isLoading && savedCount !== null && (
        <div className="tll-daylog-foot">
          <span>
            Logged {savedCount} {savedCount === 1 ? 'entry' : 'entries'} for{' '}
            {workedOn}.
          </span>
          <Button
            title="Log more"
            onClick={() => {
              setSavedCount(null);
              setLines([blankLine()]);
            }}
          />
        </div>
      )}

      {!isLoading && savedCount === null && (
        <>
          <div className="tll-daylog-scroll">
            <div className="tll-daylog-grid">
              <div className="tll-daylog-col" />
              {columns.map((column) => (
                <div
                  key={column}
                  className={
                    column === 'Minutes'
                      ? 'tll-daylog-col tll-daylog-col-num'
                      : 'tll-daylog-col'
                  }
                >
                  {column}
                </div>
              ))}

              {lines.map((line) => (
                <Fragment key={line.key}>
                  <div
                    className={
                      isDerived(line)
                        ? 'tll-daylog-mark tll-daylog-mark-derived'
                        : 'tll-daylog-mark'
                    }
                    title={SOURCE_LABELS[line.source]}
                  />
                  <div className="tll-daylog-cell">
                    <select
                      className="tll-daylog-field"
                      value={line.practiceAreaId ?? ''}
                      onChange={(event) =>
                        update(line.key, {
                          practiceAreaId:
                            event.target.value === ''
                              ? null
                              : event.target.value,
                        })
                      }
                    >
                      <option value="">&mdash;</option>
                      {categories.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="tll-daylog-cell">
                    <RecordPicker
                      options={clients}
                      value={line.personId}
                      placeholder="Client"
                      onPick={(personId) => update(line.key, { personId })}
                      onCreate={(name) => addClient(line, name)}
                      createLabel="Add client"
                    />
                  </div>
                  <div className="tll-daylog-cell">
                    <RecordPicker
                      options={jobs}
                      value={line.matterId}
                      placeholder="Job"
                      onPick={(matterId) => pickJob(line, matterId)}
                    />
                  </div>
                  <div className="tll-daylog-cell">
                    <textarea
                      className="tll-daylog-field tll-daylog-field-main tll-daylog-text"
                      rows={1}
                      value={line.description}
                      placeholder={
                        isDerived(line) ? '' : 'Anything else you did'
                      }
                      onChange={(event) =>
                        update(line.key, { description: event.target.value })
                      }
                    />
                  </div>
                  <div className="tll-daylog-cell">
                    <textarea
                      className="tll-daylog-field tll-daylog-text"
                      rows={1}
                      value={line.notes}
                      onChange={(event) =>
                        update(line.key, { notes: event.target.value })
                      }
                    />
                  </div>
                  <div className="tll-daylog-cell">
                    <select
                      className="tll-daylog-field"
                      value={line.status}
                      onChange={(event) =>
                        update(line.key, { status: event.target.value })
                      }
                    >
                      {WORK_LOG_STATUSES.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="tll-daylog-cell">
                    <input
                      className="tll-daylog-field tll-daylog-field-num"
                      type="number"
                      min={0}
                      step={5}
                      value={line.minutesText}
                      onChange={(event) =>
                        update(line.key, { minutesText: event.target.value })
                      }
                    />
                  </div>
                </Fragment>
              ))}
            </div>
          </div>

          <div className="tll-daylog-foot">
            <Button
              title="Add a line"
              onClick={() => setLines((current) => [...current, blankLine()])}
            />
            <Button
              title={isSaving ? 'Saving…' : 'Save the day'}
              variant="primary"
              isDisabled={isSaving || saveable.length === 0}
              onClick={save}
            />
            <span className="tll-daylog-count">
              {saveable.length === lines.length
                ? `${saveable.length} to save`
                : `${saveable.length} of ${lines.length} to save — a line with nothing written in it is skipped`}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: LOG_MY_DAY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'log-my-day',
  description: 'The day’s work, pre-filled from what the system already knows',
  component: LogMyDay,
});
