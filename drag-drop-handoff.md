# Drag And Drop Handoff

## Current status

The recent slot-based drag/drop changes were rolled back from:

- `src/components/DraggableTable/DraggableTable.tsx`
- `src/components/DraggableTable/DraggableTable.module.css`

The codebase is back to the pre-experiment state from `HEAD`.

## Problem to solve

Grouped row dragging in `DraggableTable` is ambiguous and unreliable.

Observed issues from the original implementation:

- In grouped mode, the same visual boundary can behave like multiple drop targets.
- Drag targets can disappear while hovering group headers.
- Empty groups need a usable way to accept dragged rows.
- The blue indicator position can be inconsistent with the actual insertion result.
- Multi-row drag becomes hard to trust because drop semantics are unclear.

## Intended behavior

The desired behavior is:

- A gap between two visible data rows should count as exactly one drop position.
- Group headers should not themselves be row-drop targets.
- To drop at the top of a group, the user should target the gap above that group's first data row, not the header row.
- To drop at the bottom of a group, there should be one clear drop position below that group's last data row.
- Empty groups should still expose a small, explicit target so rows can be dragged back into them.
- The blue indicator should appear in exactly one place for the active drop target.
- The final insertion result should match the shown indicator.
- Drag hover should feel stable, without flickering or disappearing because of tiny mouse movements.

## What was tried

I attempted to replace the row-half hit-testing model with a slot-based model.

The approach was:

- derive explicit insertion slots
- render or infer row drop targets from those slots
- stop using group headers as row targets
- add special support for empty groups
- make insertion validate against a slot destination rather than an inferred hovered row

## What did not work

The attempted implementation introduced multiple regressions:

- visible extra blue lines across many rows
- indicator flicker while moving over rows or whitespace
- overlapping ownership of the same visible boundary
- wrong insertion side in some cases
- unstable hover behavior in grouped layouts
- visual noise from trying to paint both top and bottom row edges

In short, the idea of canonical insertion slots was reasonable, but the implementation layered too much new behavior into the existing renderer and made the geometry worse instead of clearer.

## Likely root issue in the original code

The original implementation appears to infer row-drop intent from whatever element is under the pointer:

- hovered row
- top half vs bottom half of that row
- separate empty-group drop zone

That means grouped mode can produce more visual boundaries than logical insertion points.

## Recommendation for the next attempt

Take a smaller, more controlled pass.

Suggested direction:

- Keep the existing rendering structure mostly intact.
- Do not add extra visual rows between data rows.
- Define one canonical drop target per visible boundary.
- Ensure a boundary is owned by only one target, never both adjacent rows.
- Keep group headers non-droppable for row dragging.
- Add a very small dedicated empty-group target.
- Make hover sticky enough to avoid flicker through tiny dead zones.
- Verify insertion math separately from indicator rendering.

## User-reported acceptance criteria

- No extra visible spacing between rows.
- No extra blue lines beyond the single active drop indicator.
- No flickering when dragging through grouped content.
- Dropping above the first row of a group inserts above it.
- Dropping below a row inserts below it.
- Dropping below the last row in a group is possible.
- Empty groups can accept rows again.
- Group headers are not row drop targets.
