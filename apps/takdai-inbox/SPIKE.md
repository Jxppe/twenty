# Inbox spike checklist

This app exists to answer questions about the Twenty front-component sandbox before we design the
real Inbox. It is deliberately more than a mockup: it reads and writes real records, so the answers
below are about the platform, not about a drawing.

Fill this in while running it. The answers decide how much of the Inbox stays a front component and
how much becomes native Twenty views.

## Running it

You do **not** need to build the Twenty monorepo. The CLI runs a prebuilt Twenty
in Docker with a seeded demo workspace, and authenticates itself against it.

```sh
cd apps/takdai-inbox
yarn install
yarn twenty docker:start   # pulls the image, serves on http://localhost:2020
yarn twenty dev            # watch and sync on every change
```

Open http://localhost:2020 and sign in with `tim@apple.dev` / `tim@apple.dev`.
`yarn twenty docker:status` prints the URL, version and credentials if you lose them.

To sync into an existing Twenty instead, `yarn twenty remote:add --url <url>` and skip `docker:start`.

The sidebar gets an **Inbox** folder with three entries:

| Entry | What it is |
| --- | --- |
| All conversations | the custom front-component Inbox (`STANDALONE_PAGE`) |
| Conversation list | the *native* Twenty record view over the same data |
| Unassigned | native view, filtered to conversations with no assignee |

Open the Inbox with no data and click **Create demo data**. That calls the `seed-demo-data` logic
function, which creates three conversations with messages.

The two surfaces over identical data are the point: compare them directly.

## Questions to answer

### 1. Does the hand-rolled dropdown render?

`src/ui/Dropdown.tsx` is written portal-free on purpose, because `createPortal` renders nothing in
the sandbox while reporting success. Click the channel filter in the Inbox header.

- [ ] Menu appears
- [ ] Clicking an option selects it and filters the list
- [ ] Clicking elsewhere closes it (the blur fallback works; `document.addEventListener` does not)
- [ ] It is not clipped by the widget bounds

If any of these fail, the whole overlay layer needs a different approach, and that is a large chunk
of Inbox UI.

**Answer:**

### 2. How does a long list behave?

Seed data gives three conversations. Create a few hundred by running the seed repeatedly, or with a
loop against the REST API.

- [ ] 100 rows scrolls smoothly
- [ ] 500 rows scrolls smoothly
- [ ] Selecting a row stays responsive

There is no `ResizeObserver` in the sandbox, so standard virtualization libraries will not work. If
500 rows is already bad, the conversation list should be a native view.

**Answer:**

### 3. How native does it look?

Every colour, space and radius comes from `useTheme()` (`twenty-ui/theme-constants`), and the
buttons, tags, status pills and avatars are real `twenty-ui` components. Put the Inbox and the
native "Conversation list" side by side.

- [ ] Fonts and spacing match
- [ ] Light and dark theme both look right (toggle the workspace theme)
- [ ] Nothing in Twenty's own chrome broke (component CSS is injected unscoped)

**Answer:**

### 4. How stale is polled data?

The header shows conversation count, last fetch duration and last sync time. `POLL_INTERVAL_MS` in
`src/front-components/inbox.front-component.tsx` is 5s.

- Change a conversation in the native view, then watch the Inbox.
- Do the same in reverse, and watch the native view (it updates over SSE).

- [ ] Fetch duration with ~10 conversations: ____ ms
- [ ] Fetch duration with ~500 conversations: ____ ms
- [ ] Delay before a change shows up in the Inbox: ____ s
- [ ] Delay in the native view: ____ s

If polling feels bad at realistic volumes, the conversation list belongs in a native view and the
front component shrinks to the message thread.

**Answer:**

### 5. Does keyboard interaction work?

- [ ] Tab reaches the filter, the list and the reply box
- [ ] Typing in the reply box works (controlled input, since `ref.focus()` throws)
- [ ] Enter or the Send button posts a reply and it appears in the thread

**Answer:**

### 6. Does the record-page tab work?

Open any Person record and look for the **Conversations** tab.

- [ ] The tab appears
- [ ] It loads conversations for that person
- [ ] It sizes correctly (it is `VERTICAL_LIST`, not `CANVAS`, so it must fit its content)

**Answer:**

## Findings already banked

Things this spike established before it ever ran, worth keeping:

- `twenty-ui` **is** importable in front components: `Button`, `Tag`, `Status`, `Avatar`, `Chip`,
  the `Icon*` set, and `useTheme()` for real design tokens. It is MIT and bundled at build time.
- `theme.spacing` is a **token record**, not the callable the Twenty source exposes:
  `theme.spacing[2]`, not `theme.spacing(2)`.
- `twenty-shared/types` is not an app dependency. `ViewType`, `ViewSortDirection`,
  `ViewFilterOperand`, `NavigationMenuItemType` and friends are re-exported from `twenty-sdk/define`.
- `navigate()` is typed against the `AppPath` enum with named params, not free-form URLs:
  `navigate(AppPath.RecordShowPage, { objectNameSingular, objectRecordId })`.
- `RestApiClient` typechecks without codegen (generic `<TResponse>`), so it is the right client for
  app code that has to build before a server exists. `CoreApiClient` needs
  `yarn twenty dev:generate-client` against a live instance for typed custom objects.

## Known shortcuts

Deliberate, and not to be carried into the real Inbox:

- `Conversation.lastMessagePreview` / `lastMessageAt` are updated from the client after sending. A
  database-event logic function should own that.
- The reply writes an `OUTBOUND` message record but does not send anything to a provider. That is
  milestone 4.
- No assignment UI, no tags, no internal notes, no attachments, no search.
- `seed-demo-data` creates contact identities but does not link them to `Person` records; contact
  matching is milestone 3.
