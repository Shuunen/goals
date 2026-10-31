# TODOS

## Storage

### Handle multiple lists in local storage

**What:** Let the browser remember several named lists instead of a single one.

**Why:** Today opening a shared link or editing a second list replaces what the browser remembers, so a user can only keep one list per browser.

**Context:** The app keeps one list under the single `goals-saved` key (`src/hooks/use-goals.ts`, `src/utils/storage.utils.ts`). A shared link wins at load and the first local edit saves over the stored list. Each list is already a self-contained hash (`src/utils/hash.utils.ts`), so a list of lists could reuse that format. Needs a way to pick, create, rename and delete lists in the UI, a migration of the existing `goals-saved` key, and a decision about what opening a shared link does (open as a new list instead of overwriting). Opening a shared link should never replace the user's own list.

**Effort:** L
**Priority:** P2
**Depends on:** None

### Make storage failures and multiple tabs safe

**What:** Tell the user when the browser could not save, make "Clear everything" all-or-nothing, and keep two open tabs from overwriting each other.

**Why:** A failed write keeps the previous saved list without a word, so a PWA relaunch can bring back an older list. Two tabs silently overwrite each other, and accepting an update in one tab reloads the others mid-edit.

**Context:** `writeStored` in `src/utils/storage.utils.ts` swallows every error. On failure it could remove the key (so a stale list is never restored) or raise a one-time "not saved" toast. `removeStoredWithPrefix` runs its loop inside one `try`, so the first `removeItem` that throws leaves the remaining keys, while `clearEverything` still reloads as if all was erased. Use a `storage` event listener for multi-tab sync, and in `onControllerChange` (`src/hooks/use-service-worker.ts`) avoid reloading tabs that are being edited. Also `replaceHash` can throw after storage was written (Safari `replaceState` rate limit), leaving storage ahead of the URL.

**Effort:** M
**Priority:** P2
**Depends on:** None

## Service worker

### Make the service worker and the update prompt robust

**What:** Harden `src/plugins/offline.ts` and the update flow so a flaky network or cache never leaves the app broken or stuck on an old version.

**Why:** The install is all-or-nothing, so one failed file keeps users on the old version with no signal. An offline fetch error shows the browser error page instead of the app shell, and the "New version available" toast can be replaced by an Undo toast and never come back.

**Context:** `cache.addAll` rejects the whole install on a single 404 or timeout. `cacheFirst` and the `page()` fallback do not catch a failed `fetch`. `staleWhileRevalidate` calls `cache.put` without `event.waitUntil` and caches opaque responses. The precache list includes the ten lazy illustration chunks, so every user downloads all of them on first install, and file names are not URL-encoded. In `src/hooks/use-service-worker.ts`, `hadController` is read once at mount (a first-ever visit never gets the prompt), the `updatefound` and `statechange` listeners are never removed, and the single-slot toast in `app.page.tsx` can drop the update offer.

**Effort:** M
**Priority:** P2
**Depends on:** None

## Features

### Add due dates, notes and sub-goals

**What:** Let a goal carry a due date, a note, and sub-goals.

**Why:** A goal is plain text today, so there is no way to say when it is due, add detail, or break a big goal into steps.

**Context:** An item is only a title and a done flag (`src/models/item.model.ts`), and the whole list lives in the URL hash (`src/utils/hash.utils.ts`), so every new field must fit that grammar and keep old links working (legacy link tests are in `hash.utils.test.ts`). It also grows the link, which already warns past 2000 characters (`src/utils/url.utils.ts`). Needs a hash grammar extension, export and import of the new fields (`src/utils/goals-file.utils.ts`), edit-mode UI, and a decision on how sub-goals count in the progress bar and the done illustration. Split into three separate pieces when picked up, starting with notes or due dates.

**Effort:** XL
**Priority:** P3
**Depends on:** None

## Security

### Harden links, import and export

**What:** Sanitize and bound what comes from a shared link or an imported file.

**Why:** A crafted link can carry odd text, a huge number of goals, or titles that inject extra lines into an exported Markdown file, and an import has no size guard.

**Context:** `hashToItem` and `hashToData` in `src/utils/hash.utils.ts` do not apply `sanitizeText` and have no goal-count cap, while the 500-goal cap only applies to imports. `toMarkdown` in `src/utils/goals-file.utils.ts` writes `# ${title}` and `- [ ] ${item.title}` without escaping newlines, and `parseImport` reads those back as extra goals. `src/components/import-actions.tsx` re-parses the whole text on every keystroke and `file.text()` has no size limit or `try/catch`. Settings from a link are echoed back into every later shared link without a whitelist of known names. The static CSP nonce in `public/_headers` sits next to `'unsafe-inline'`, which weakens the script policy (pre-existing).

**Effort:** M
**Priority:** P3
**Depends on:** None

## Maintenance

### Small cleanups from the PR #278 review

**What:** A batch of small fixes, each under an hour.

**Why:** None is urgent, but together they remove rough edges and dead weight.

**Context:**

- Delete or move out of `src/` the ten `src/assets/*.svg` files that nothing imports (the animated `.tsx` versions are the runtime source).
- Undo: a no-op edit (a drag released on its own row, an empty add) also ends a pending Undo offer, a link change leaves an Undo toast with nothing to undo, and the edit wrappers in `src/hooks/use-undoable-goals.ts` are re-created each render and match the literal `'Undo'`.
- `use-flip` reads layout on every render, the progress bar transitions `width` and the bottom sheet easing overshoots slightly (`src/styles.css`).
- `src/utils/download.utils.ts` revokes the blob URL on the next tick, which some Firefox and Safari versions need later.
- Document the dev and preview ports (5103 and 4103), the scripts, and how the offline mode works (`/document-generate` can help).

**Effort:** S
**Priority:** P4
**Depends on:** None

## Completed
