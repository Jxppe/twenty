import { useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { useTheme } from 'twenty-ui/theme-constants';

import {
  createWorkLogs,
  fetchPickerOptions,
  fetchWorkLogDrafts,
  type PickerOption,
} from 'src/api/work-logs';
import { LOG_MY_DAY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import {
  blankLine,
  idOf,
  isSaveable,
  type Line,
  minutesOf,
  SOURCE_LABELS,
  today,
  toLine,
} from 'src/front-components/log-my-day-lines';
import { Button } from 'src/ui/Button';

const LogMyDay = () => {
  const theme = useTheme();
  const [workedOn, setWorkedOn] = useState(today);
  const [lines, setLines] = useState<Line[]>([]);
  const [workspaceMemberId, setWorkspaceMemberId] = useState<string | null>(
    null,
  );
  const [clients, setClients] = useState<PickerOption[]>([]);
  const [jobs, setJobs] = useState<PickerOption[]>([]);
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
        setLines([
          ...response.drafts.map((draft, index) =>
            toLine(draft, index, options.clients, options.jobs),
          ),
          blankLine(),
        ]);
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
        matterId: idOf(jobs, line.jobText),
        bookingId: line.bookingId,
        personId: idOf(clients, line.clientText),
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

  const label = {
    color: theme.font.color.tertiary,
    fontSize: theme.font.size.xs,
  };

  const input = {
    background: theme.background.primary,
    border: `1px solid ${theme.border.color.medium}`,
    borderRadius: theme.border.radius.sm,
    color: theme.font.color.primary,
    fontFamily: theme.font.family,
    fontSize: theme.font.size.sm,
    padding: theme.spacing[1],
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        fontFamily: theme.font.family,
        gap: theme.spacing[3],
        padding: theme.spacing[4],
      }}
    >
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          gap: theme.spacing[2],
        }}
      >
        <span style={label}>Day</span>
        <input
          type="date"
          value={workedOn}
          max={today()}
          onChange={(event) => setWorkedOn(event.target.value)}
          style={input}
        />
      </div>

      <datalist id="log-my-day-clients">
        {clients.map((option) => (
          <option key={option.id} value={option.label} />
        ))}
      </datalist>
      <datalist id="log-my-day-jobs">
        {jobs.map((option) => (
          <option key={option.id} value={option.label} />
        ))}
      </datalist>

      {isLoading && (
        <span style={{ color: theme.font.color.tertiary }}>Loading…</span>
      )}

      {!isLoading && savedCount !== null && (
        <div
          style={{
            color: theme.font.color.secondary,
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[2],
          }}
        >
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
          <span style={label}>
            These are the things the system already knows about. Say how long
            each took, correct anything wrong, and add what is missing.
          </span>

          {lines.map((line) => (
            <div
              key={line.key}
              style={{
                alignItems: 'center',
                borderBottom: `1px solid ${theme.border.color.light}`,
                display: 'flex',
                gap: theme.spacing[2],
                paddingBottom: theme.spacing[2],
              }}
            >
              <span style={{ ...label, width: 74 }}>
                {SOURCE_LABELS[line.source]}
              </span>
              <select
                value={line.practiceAreaId ?? ''}
                onChange={(event) =>
                  update(line.key, {
                    practiceAreaId:
                      event.target.value === '' ? null : event.target.value,
                  })
                }
                style={{ ...input, width: 170 }}
              >
                <option value="">Category</option>
                {categories.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                list="log-my-day-clients"
                value={line.clientText}
                placeholder="Client"
                onChange={(event) =>
                  update(line.key, { clientText: event.target.value })
                }
                style={{ ...input, width: 150 }}
              />
              <input
                type="text"
                list="log-my-day-jobs"
                value={line.jobText}
                placeholder="Job"
                onChange={(event) =>
                  update(line.key, { jobText: event.target.value })
                }
                style={{ ...input, width: 150 }}
              />
              <input
                type="text"
                value={line.description}
                placeholder="Anything else you did"
                onChange={(event) =>
                  update(line.key, { description: event.target.value })
                }
                style={{ ...input, flex: 1 }}
              />
              <input
                type="text"
                value={line.notes}
                placeholder="Notes"
                onChange={(event) =>
                  update(line.key, { notes: event.target.value })
                }
                style={{ ...input, flex: 1 }}
              />
              <input
                type="number"
                min={0}
                step={5}
                value={line.minutesText}
                placeholder="min"
                onChange={(event) =>
                  update(line.key, { minutesText: event.target.value })
                }
                style={{ ...input, width: 72 }}
              />
            </div>
          ))}

          <div style={{ display: 'flex', gap: theme.spacing[2] }}>
            <Button
              title="Add a line"
              onClick={() => setLines((current) => [...current, blankLine()])}
            />
            <Button
              title={
                isSaving ? 'Saving…' : `Save ${saveable.length} of ${lines.length}`
              }
              variant="primary"
              isDisabled={isSaving || saveable.length === 0}
              onClick={save}
            />
          </div>

          {saveable.length < lines.length && (
            <span style={label}>
              Lines with nothing written in them are not saved.
            </span>
          )}
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
