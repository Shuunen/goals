# Changelog

All notable changes to this project are documented here.

## [Unreleased]

## [0.2.0] - 2026-10-31

### Added in 0.2.0

- You can install Goals and use it offline. A new version waits for you, and a toast offers Reload instead of swapping the app under your hands.
- Your list is remembered by the browser once you change something, so reopening the installed app brings it back. A shared link still wins and never overwrites what your browser remembers.
- Undo for every destructive action, from removing a goal to replacing the whole list.
- Settings can export your list, import one (pasted or from a file), and clear everything.
- A share section copies or shares your link, and warns when the link gets long enough for some apps to cut it.
- Paste several lines to add several goals, an explicit + button, delete in one click, Escape to leave edit mode, and goals as cards you reorder by drag or keyboard.
- A thin progress bar under the title, a light haptic tick when you check a goal, and a random animated illustration once every goal is done.
- A theme that follows your system until you pick one, a bigger size stepper with Reset, and settings that open as a bottom sheet on narrow screens.

### Changed in 0.2.0

- A goal you check goes to the top of the done ones, so a goal already next to that boundary does not move.
- Done goals stay readable in every theme, and keyboard focus is visible everywhere.

### Fixed in 0.2.0

- A blocked or full browser memory no longer crashes the app. It runs from the link alone.
- A link ending in `theme=constructor` is no longer taken as a theme.
- A plain edit ends the Undo offer, so Undo never wipes it. The toast says "1 goal" instead of "1 goals".
