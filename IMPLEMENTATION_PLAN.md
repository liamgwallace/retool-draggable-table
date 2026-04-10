# Draggable Table Enhancement Plan

## Goals

1. Improve `tag` and `multiple tags` editing so option sources are explicit, reusable, and not limited to values currently present in visible rows.
2. Add controlled null/blank behavior for chips and date editors.
3. Make the left display-index column optional and off by default.
4. Add a consistent empty-cell affordance for editable cells, including placeholder text and hover treatment.
5. Keep the API small enough to remain usable inside Retool, while still supporting multiple independent tag sets.

## Current Behavior Summary

### Chips and tag options

- Suggestions are currently derived only from existing row values in that column.
- Single `tag` accepts any typed value already.
- `multiple tags` also accepts any typed value already.
- There is no way to point a column at an external/shared tag list.

Relevant code:

- `src/components/DraggableTable/DraggableTable.tsx:578-586`
- `src/components/DraggableTable/DraggableTable.tsx:1062-1089`
- `src/components/DraggableTable/DraggableTable.tsx:1121-1129`

### Null and blank values

- Empty date edits save `''`, not `null`.
- `multiple tags` saves `[]`, not `null`.
- New blank rows default most fields to `''` and multi-tag fields to `[]`.
- Empty cells usually render as visually empty, except blank `tag` can still render an empty chip.

Relevant code:

- `src/components/DraggableTable/DraggableTable.tsx:549-576`
- `src/components/DraggableTable/DraggableTable.tsx:665-669`
- `src/lib/tableUtils.ts:181-190`

### Left "ID" column

- The table always renders a leading `ID` column.
- That value is actually the zero-based display index, not the row's real `id` and not `indexColumn`.

Relevant code:

- `src/components/DraggableTable/DraggableTable.tsx:749-766`
- `src/components/DraggableTable/DraggableTable.tsx:842-845`

### Empty-cell affordance

- There is row hover styling, but no cell-level editable affordance.
- Editable empty cells do not show placeholder text.
- Non-editable and editable empty cells look almost identical.

Relevant code:

- `src/components/DraggableTable/DraggableTable.tsx:766-775`
- `src/components/DraggableTable/DraggableTable.module.css:203-215`
- `src/components/DraggableTable/DraggableTable.tsx:912-968`

## Recommended Product/API Decisions

## 1. Tag option sourcing: support both inline and shared sources

Recommendation: support both.

Why:

- Inline options in `columnsJson` are the simplest setup for one-off columns.
- Shared tag sets avoid duplicating large lists across many columns.
- Retool users already expect JSON-driven configuration, so both forms fit the current product shape.
- We should keep row-derived options as the fallback/default for backward compatibility.

Recommended precedence for tag options:

1. `column.tagOptions` if present
2. `column.tagOptionsSource` resolved from a new top-level `tagOptionsSources` input
3. values derived from current row data for that column

This gives the most explicit configuration priority while preserving current behavior when no new config is supplied.

### Proposed column config additions

Add optional fields to `TableColumn`:

```ts
tagOptions?: string[];
tagOptionsSource?: string;
allowFreeText?: boolean;
allowNull?: boolean;
emptyDisplayValue?: string;
```

Scope rules:

- `tagOptions`, `tagOptionsSource`, `allowFreeText`, and `allowNull` apply only to `tag` and `multiple tags`, except `allowNull` also applies to `date` and `date time`.
- `emptyDisplayValue` applies to any column format.

### Proposed shared tag source input

Add one new Retool input:

```ts
tagOptionsSources: Record<string, string[]>
```

Example:

```json
{
  "roleTags": ["Admin", "Editor", "Viewer"],
  "teamTags": ["Design", "Infrastructure", "Product", "Sales"]
}
```

Example column usage:

```json
[
  { "sourceKey": "role", "format": "tag", "tagOptionsSource": "roleTags", "allowFreeText": false },
  { "sourceKey": "teams", "format": "multiple tags", "tagOptionsSource": "teamTags", "allowFreeText": true }
]
```

This is better than separate top-level inputs per tag set because:

- one manifest input scales to many columns
- `columnsJson` stays self-describing
- it avoids adding 10+ separate Retool controls for different tag arrays

## 2. Free text behavior

Recommendation:

- Default `allowFreeText` to `true` for backward compatibility.
- When `allowFreeText === false`, hide the tag text input and restrict the editor to selectable options only.
- For single `tag`, disallow saving values outside the resolved option list when free text is off.
- For `multiple tags`, disallow adding custom chips when free text is off.

This preserves current behavior unless a user explicitly opts into stricter selection.

## 3. Null and blank behavior

Recommendation: distinguish between blank display and stored null.

### Chips

- Add `allowNull?: boolean` support for `tag` and `multiple tags`.
- When enabled, include a visible blank option in the editor.
- Selecting blank should save `null`.
- For `multiple tags`, blank/null should replace the current value with `null`, not `[]`.
- Clearing all selected tags manually should remain valid; if `allowNull` is off, empty selection saves `[]`; if `allowNull` is on, explicit blank option saves `null`.

This gives a clear difference between:

- `[]`: intentionally empty list
- `null`: unknown / cleared / no value

### Dates

- Add `allowNull?: boolean` support for `date` and `date time`.
- When enabled, include a clear action in the popover, for example `Clear date`.
- Clearing should save `null`.
- Keep normal date input behavior otherwise.

This is better than trying to infer null from an emptied native input because browser date inputs are inconsistent during editing.

### Strings and other formats

- Do not add global `allowNull` immediately to all formats.
- Keep this first pass focused on the formats you explicitly called out: chips and dates.
- Text-like fields can continue using `''` for now.

That keeps the change set smaller and avoids a broader serialization contract change.

## 4. Empty-cell placeholder and editable hover affordance

Recommendation:

- Add a shared empty display treatment for all formats.
- Default placeholder text should be `Enter value`.
- Allow per-column override through `emptyDisplayValue`.
- Only show the hover/focus affordance for editable cells.
- Non-editable cells should not suggest interactivity.

Display behavior:

- If the rendered value is effectively empty, show faded placeholder text.
- For editable empty cells, show a subtle inset background or border on hover.
- For editable non-empty cells, apply a lighter hover/focus cell treatment so users can discover editability consistently.
- Boolean cells should keep their own control styling but still participate in editable cell affordance if possible.

Definition of "empty" for this work:

- `null`
- `undefined`
- `''`
- empty array

Not empty:

- `0`
- `false`

## 5. Left display-index column

Recommendation:

- Rename the concept internally from `ID column` to `display index column`.
- Add a top-level prop/input like `showDisplayIndexColumn?: boolean`.
- Default it to `false`.
- If enabled, render the column label as `#` or `Index`, not `ID`.

Why:

- The current label is misleading because it is not the primary key.
- This is a table UI convenience column, not row identity.

Potential future enhancement, not required now:

- `displayIndexColumnLabel?: string`

## Proposed API Shape

### Type changes

```ts
export interface TableColumn {
  sourceKey: string;
  label?: string;
  format?: ColumnFormat;
  editable?: boolean;
  hidden?: boolean;
  width?: number;
  resizable?: boolean;
  align?: Align;
  currencyCode?: string;
  description?: string;
  colorSeed?: string;
  tagOptions?: string[];
  tagOptionsSource?: string;
  allowFreeText?: boolean;
  allowNull?: boolean;
  emptyDisplayValue?: string;
}

export interface DraggableTableProps {
  ...
  tagOptionsSources?: Record<string, string[]>;
  showDisplayIndexColumn?: boolean;
}
```

### Behavior defaults

- `allowFreeText`: `true`
- `allowNull`: `false`
- `emptyDisplayValue`: `'Enter value'`
- `showDisplayIndexColumn`: `false`

## Implementation Plan

## Stage 1. Contract and data plumbing

Goal: add the new config surface without changing behavior yet.

Work:

1. Extend `TableColumn` and `DraggableTableProps` types.
2. Add `tagOptionsSources` and `showDisplayIndexColumn` to the Retool wrapper.
3. Add the same inputs to `retool-custom-component-manifest.json`.
4. Update README input and column-property documentation.

Notes:

- This stage should be mergeable independently.
- Keep defaults aligned so existing consumers behave the same.

Suggested owner: API/config agent.

## Stage 2. Tag option resolution and free-text rules

Goal: centralize tag option logic and make editor behavior predictable.

Work:

1. Introduce a single helper to resolve tag options for a column using the precedence defined above.
2. Normalize/dedupe resolved options.
3. Update single-tag editor to:
   - show inline/shared/resolved options
   - hide free-text input when `allowFreeText === false`
   - reject non-listed values when `allowFreeText === false`
4. Update multi-tag editor to:
   - show resolved options
   - hide custom chip input when `allowFreeText === false`
   - prevent custom additions when `allowFreeText === false`
5. Fix the existing edge case where string-backed multi-tag values display as tags but do not initialize editor selections correctly.

Notes:

- Keep row-derived values in the fallback path for compatibility.
- The option resolver should live near other table utility logic or close to editor logic, but only in one place.

Suggested owner: tag editor agent.

## Stage 3. Null handling for chips and dates

Goal: support real `null` values where requested.

Work:

1. Add per-column null-aware parsing/commit behavior.
2. For `tag` and `multiple tags`, surface a blank option when `allowNull === true`.
3. For `date` and `date time`, add a clear button/action when `allowNull === true`.
4. Ensure blank tag display does not render as an empty chip.
5. Update add-row defaults only if needed for consistency. Recommendation: leave new rows as `''`/`[]` in this pass unless a column explicitly initializes null later.

Notes:

- Do not broaden null behavior to all formats yet.
- Make sure `null`, `[]`, and `''` render distinctly enough for the placeholder system to work.

Suggested owner: null-handling agent.

## Stage 4. Empty-cell rendering and editable affordance

Goal: make editable cells discoverable and blanks actionable.

Work:

1. Add a shared empty-state check used by `CellRenderer`.
2. Render placeholder text using `column.emptyDisplayValue ?? 'Enter value'`.
3. Add CSS classes/data attributes for:
   - editable cell
   - non-editable cell
   - empty cell
4. Add subtle hover/focus styling only for editable cells.
5. Ensure links, emails, tags, markdown, html, numbers, dates, and plain text all fall back to the same placeholder behavior when empty.

Notes:

- Be careful not to treat `false` or `0` as empty.
- Placeholder rendering should happen at cell-display level, not by mutating source data.

Suggested owner: cell rendering/styling agent.

## Stage 5. Display-index column toggle

Goal: remove the always-on misleading left column.

Work:

1. Add `showDisplayIndexColumn` prop plumbing.
2. Update table header rendering.
3. Update row rendering.
4. Update `totalColumnCount` for grouped rows and empty group rows.
5. Rename displayed header text from `ID` to `#` or `Index` when enabled.
6. Update docs to clarify that this is a display position column only.

Suggested owner: table layout agent.

## Stage 6. Documentation, examples, and regression pass

Goal: make the new behavior usable and safe.

Work:

1. Add README examples for:
   - inline tag options
   - shared tag option sources
   - strict tags with `allowFreeText: false`
   - nullable tags and dates
   - custom `emptyDisplayValue`
   - hiding/showing display index column
2. Update sample/default config if useful, but keep it conservative.
3. Run the local build and fix any type or render regressions.

Suggested owner: docs/verification agent.

## Agent Split Recommendation

If we execute this with separate agents/tasks, use this order:

1. API/config agent: Stage 1
2. Tag editor agent: Stage 2
3. Null-handling agent: Stage 3
4. Cell rendering/styling agent: Stage 4
5. Table layout agent: Stage 5
6. Docs/verification agent: Stage 6

Parallelization guidance:

- Stage 1 should land first because the later stages depend on the new prop/type surface.
- After Stage 1, Stages 2, 4, and 5 can mostly proceed in parallel.
- Stage 3 should coordinate with Stage 2 because tag null handling touches the same editor code paths.
- Stage 6 should be last.

## Agent-Ready Task Prompts

Use these prompts as the handoff text for separate implementation agents. Each agent should make the smallest correct change set for its stage, avoid unrelated refactors, and update `README.md` anywhere the public API, configuration, behavior, or examples change.

### Prompt 1: API/config agent

Implement Stage 1 from `IMPLEMENTATION_PLAN.md` in this repo.

Scope:

1. Extend the public TypeScript types to support:
   - `TableColumn.tagOptions?: string[]`
   - `TableColumn.tagOptionsSource?: string`
   - `TableColumn.allowFreeText?: boolean`
   - `TableColumn.allowNull?: boolean`
   - `TableColumn.emptyDisplayValue?: string`
   - `DraggableTableProps.tagOptionsSources?: Record<string, string[]>`
   - `DraggableTableProps.showDisplayIndexColumn?: boolean`
2. Plumb the new props through `src/retool/RetoolDraggableTable.tsx`.
3. Add the corresponding new Retool inputs to `retool-custom-component-manifest.json` with sensible defaults.
4. Preserve backward compatibility by default.
5. Update `README.md` to document the new input and new column properties, even if behavior is not fully implemented yet.

Constraints:

- Do not implement the editor behavior changes yet.
- Do not change unrelated rendering.
- Keep defaults aligned with the implementation plan:
  - `allowFreeText` default behavior should remain permissive
  - `allowNull` default should remain off
  - `emptyDisplayValue` default should remain `Enter value`
  - `showDisplayIndexColumn` default should be `false`

Verification:

- Run the local build and fix any type errors caused by the contract changes.

Return:

- Files changed
- Short summary of the new contract surface
- Any follow-up notes for the later agents

### Prompt 2: tag editor agent

Implement Stage 2 from `IMPLEMENTATION_PLAN.md` in this repo.

Precondition:

- Assume Stage 1 contract changes already exist. If they do not, add only the minimal missing type/plumbing needed for this stage.

Scope:

1. Create one central option-resolution path for `tag` and `multiple tags` columns using this precedence:
   - `column.tagOptions`
   - `column.tagOptionsSource` resolved from `tagOptionsSources`
   - values derived from current row data in that column
2. Normalize, trim, and dedupe the resolved options.
3. Update the single-tag editor so that:
   - it uses the resolved option list
   - it hides or disables free-text entry when `allowFreeText === false`
   - it does not allow saving non-listed values when `allowFreeText === false`
4. Update the multi-tag editor so that:
   - it uses the resolved option list
   - it hides or disables custom tag entry when `allowFreeText === false`
   - it prevents custom additions when `allowFreeText === false`
5. Fix the existing edge case where string-backed multi-tag values display as tags but do not initialize editor selections correctly.
6. Update `README.md` to explain tag option precedence, inline vs shared option sources, and `allowFreeText` behavior.

Constraints:

- Keep row-derived options as the fallback for backward compatibility.
- Do not implement null handling in this stage beyond what is required not to break current behavior.
- Make the smallest correct changes in the table/editor code.

Verification:

- Run the local build.
- If there is a local demo path that exercises tags, ensure it still renders and compiles.

Return:

- Files changed
- Short summary of the option-resolution behavior
- Any edge cases left for the null-handling agent

### Prompt 3: null-handling agent

Implement Stage 3 from `IMPLEMENTATION_PLAN.md` in this repo.

Precondition:

- Assume Stage 1 exists.
- Coordinate with the Stage 2 tag editor behavior, but do not rework option sourcing unnecessarily.

Scope:

1. Add `allowNull` behavior for `tag`, `multiple tags`, `date`, and `date time`.
2. For `tag` and `multiple tags`, expose a visible blank/null option when `allowNull === true`.
3. Selecting that blank/null option should save `null`.
4. For `date` and `date time`, add a clear action in the popover when `allowNull === true` that saves `null`.
5. Ensure blank tags no longer render as empty pills/chips.
6. Keep `[]` and `''` behavior unchanged unless the user explicitly chooses the null action.
7. Update `README.md` to document nullable chip/date behavior and clarify the distinction between blank and null where needed.

Constraints:

- Do not broaden null handling to all formats.
- Do not silently convert existing blank values into null.
- Keep the UX explicit: null should come from a deliberate user action.

Verification:

- Run the local build.
- Check that the nullable editor paths compile cleanly for both single-tag and multi-tag columns and for date/date-time.

Return:

- Files changed
- Summary of null semantics implemented
- Any interactions to watch for with empty-state rendering

### Prompt 4: cell rendering/styling agent

Implement Stage 4 from `IMPLEMENTATION_PLAN.md` in this repo.

Precondition:

- Assume Stage 1 exists.

Scope:

1. Add a shared empty-state check for cell rendering.
2. Show placeholder text using `column.emptyDisplayValue ?? 'Enter value'` for effectively empty values.
3. Treat these as empty for display purposes:
   - `null`
   - `undefined`
   - `''`
   - empty array
4. Do not treat `0` or `false` as empty.
5. Add cell-level editable affordance styling so editable cells get subtle hover/focus treatment and non-editable cells do not imply interactivity.
6. Make the placeholder/empty-state behavior consistent across plain text, numbers, dates, tags, links, email, markdown, and html cells.
7. Update `README.md` to describe the default empty placeholder behavior and the per-column `emptyDisplayValue` override.

Constraints:

- Do not mutate source data just to drive placeholder rendering.
- Keep the styling subtle and consistent with the existing visual system.
- Preserve boolean cell usability.

Verification:

- Run the local build.
- Confirm the placeholder behavior compiles across the affected render paths.

Return:

- Files changed
- Summary of empty-state and hover-affordance behavior
- Any residual UI inconsistencies noticed

### Prompt 5: table layout agent

Implement Stage 5 from `IMPLEMENTATION_PLAN.md` in this repo.

Precondition:

- Assume Stage 1 exists.

Scope:

1. Add support for `showDisplayIndexColumn` in the table layout.
2. Hide the left display-index column by default.
3. When enabled, render that column consistently in both the header and row body.
4. Update `totalColumnCount` and any grouped-row colspan logic so grouping still renders correctly when the column is hidden.
5. Rename the visible header label from `ID` to a less misleading label such as `#` or `Index`.
6. Update `README.md` to explain that this is a display-order/index column, not the row's primary key.

Constraints:

- Do not change row identity logic.
- Do not rename `primaryKey` or `indexColumn` APIs.
- Keep the implementation limited to layout and display-column visibility.

Verification:

- Run the local build.
- Check grouped and ungrouped table rendering paths for colspan correctness.

Return:

- Files changed
- Summary of display-index column behavior
- Any edge cases in grouped mode

### Prompt 6: docs/verification agent

Implement Stage 6 from `IMPLEMENTATION_PLAN.md` in this repo.

Precondition:

- Assume the implementation stages are already complete.

Scope:

1. Update `README.md` comprehensively for the shipped behavior.
2. Add examples covering:
   - inline tag options
   - shared `tagOptionsSources`
   - `allowFreeText: false`
   - `allowNull` for tags and dates
   - `emptyDisplayValue`
   - `showDisplayIndexColumn`
3. Update any sample/default config only where it improves clarity without creating extra churn.
4. Run the local build and address any remaining doc-related drift or typing issues.

Constraints:

- Do not introduce new behavior unless required to align docs with the actual implementation.
- Prefer precise examples over broad prose.

Verification:

- Run the local build.
- Make sure `README.md` reflects the final implemented API and not just the original plan.

Return:

- Files changed
- Summary of README additions/changes
- Any remaining documentation gaps

## Key Risks To Watch

1. Backward compatibility: current tag editing is permissive, so `allowFreeText` must default to `true`.
2. Null semantics: we must not accidentally convert valid `''` or `[]` existing data into `null` without an explicit user action.
3. Empty rendering consistency: blank tags, blank links, and blank markdown/html currently behave differently and should converge on one placeholder treatment.
4. Retool ergonomics: avoid adding too many top-level inputs; one `tagOptionsSources` object is the best scaling point.
5. Terminology: the current visible `ID` label is misleading and should be renamed in docs and UI.

## Suggested Acceptance Criteria

1. A `tag` column can use row-derived options, inline options, or shared named options.
2. A `multiple tags` column can use row-derived options, inline options, or shared named options.
3. `allowFreeText: false` removes custom tag entry and limits edits to resolved options.
4. `allowNull: true` allows saving `null` for `tag`, `multiple tags`, `date`, and `date time`.
5. Empty editable cells show placeholder text and an editable hover affordance.
6. Empty non-editable cells show placeholder text but no interactive hover affordance.
7. The display-index column is hidden by default and can be enabled explicitly.
8. When enabled, that column is clearly labeled as display order, not row identity.

## Recommended First Implementation Slice

If we want the safest first slice, do:

1. Stage 1
2. Stage 5
3. Stage 4
4. Stage 2
5. Stage 3
6. Stage 6

Reason:

- The display-index toggle and empty-cell affordance are user-visible wins with low behavioral risk.
- Tag sourcing and nullable editing are more invasive and should follow after the new config surface is in place.
