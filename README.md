# Retool Draggable Table

`RetoolDraggableTable` is a custom Retool component for reorder-heavy workflows. It combines drag-and-drop row ordering, optional grouped views, inline editing, add-row actions, selection state, and Retool-friendly output models so the parent app can save exactly what changed.

## What it does

- Reorders rows with drag handles.
- Supports grouped tables with optional group-level reordering.
- Supports dragging rows across groups and writing the new group value back into the row.
- Supports inline editing for most common table value types.
- Tracks dirty state, edits, reorder changes, selected rows, and newly inserted rows.
- Exposes Retool events for row clicks, saves, cancels, cell edits, selection changes, and reorder actions.
- Accepts Retool theme tokens plus simple shell-level style overrides.

## Main features

- Row drag and drop.
- Multi-select row movement when `multiSelectEnabled` is on.
- Add row at top, bottom, or after the currently selected row.
- Inline editors for text, email, dates, booleans, tags, and multiple tags.
- Configurable columns using JSON.
- Configurable visible column order using JSON.
- Optional single-level or multi-level grouping using JSON.
- Sticky headers, title/header toggles, row density controls, loading state, and toolbar controls.

## Local development

Requires Node `>=20`.

```bash
npm install
npm run dev
```

Useful scripts:

```bash
npm run build
npm run preview
npm run retool:login
npm run retool:init
npm run retool:dev
npm run retool:deploy
```

## Build and deploy

Build the component bundle:

```bash
npm run build
```

Retool custom component workflow:

1. `npm run retool:login`
2. `npm run retool:init`
3. `npm run retool:dev`
4. `npm run retool:deploy`

The export used by Retool is `RetoolDraggableTable` from `src/index.tsx`.

## Retool setup

At a minimum, configure these inputs:

1. `dataSource`
2. `primaryKey`
3. `columnsJson`
4. `columnOrderingJson`
5. `groupByColumnsJson` if you want grouped rows

The shipped defaults already provide working sample data and sample columns, so the component renders immediately after adding it to an app.

## Input reference

### `dataSource`

`dataSource` is an array of row objects. Each object becomes one row in the table.

Typical binding:

```js
{{ query1.data }}
```

Default sample row shape:

```json
{
  "id": 0,
  "email": "chic.footitt@yahoo.com",
  "role": "Viewer",
  "enabled": true,
  "createdAt": "2023-01-16",
  "teams": ["Workplace", "Infrastructure"],
  "website": "https://chic.footitt.com",
  "bio": "Nulla sit amet nibh at augue facilisis viverra quis id dui."
}
```

Guidance:

- Every row should have a stable unique value in the field used by `primaryKey`.
- If `primaryKey` is missing or blank for a row, the component falls back to `indexColumn`, then finally to the row index.
- If you want reorder changes to be persisted to your database, include a dedicated sort field in your data and point `indexColumn` at it.
- Arrays are supported, especially for `multiple tags` columns.
- Objects are supported, especially for `json` columns.

Good uses:

- Query results.
- Transformer output.
- Temporary app state that you save later from `changesetArray`, `changesetObject`, `newRows`, and `reorderChangeset`.

### `columnsJson`

`columnsJson` controls which fields are shown and how each field behaves.

Default value:

```json
[
  { "sourceKey": "email", "label": "Email", "format": "email", "editable": true, "width": 260 },
  { "sourceKey": "role", "label": "Role", "format": "tag", "editable": true, "width": 110 },
  { "sourceKey": "enabled", "label": "Enabled", "format": "boolean", "editable": true, "width": 100, "align": "center" },
  { "sourceKey": "createdAt", "label": "Created at", "format": "date", "editable": true, "width": 140 },
  { "sourceKey": "teams", "label": "Teams", "format": "multiple tags", "editable": true, "width": 240 },
  { "sourceKey": "website", "label": "Website", "format": "link", "editable": true, "width": 240 },
  { "sourceKey": "bio", "label": "Bio", "format": "markdown", "editable": true }
]
```

Supported column properties:

| Property | Required | What it does |
| --- | --- | --- |
| `sourceKey` | Yes | Field name in each row object. |
| `label` | No | Header text. Falls back to `sourceKey`. |
| `format` | No | Rendering and editing mode. Defaults to `string`. |
| `editable` | No | If `false`, the cell will not open an editor. |
| `hidden` | No | If `true`, the column is excluded from the visible table. |
| `width` | No | Starting width in pixels. |
| `resizable` | No | If `false`, the resize handle is hidden. |
| `align` | No | `left`, `center`, or `right`. |
| `currencyCode` | No | Reserved in the type, not currently used by rendering. |
| `description` | No | Shown as the header tooltip. |
| `colorSeed` | No | Reserved in the type, not currently used by rendering. |

Supported `format` values:

| Format | Display behavior | Edit behavior |
| --- | --- | --- |
| `string` | Plain text | Text input / textarea-style editing |
| `number` | Plain text | Numeric input |
| `date` | Localized date | Native date picker |
| `date time` | Localized date + time | Native datetime input |
| `boolean` | Checkbox-style toggle | Click to toggle or choose true/false |
| `tag` | Colored tag chip | Text input with suggested values from existing rows |
| `multiple tags` | Multiple colored chips | Add/remove tag values from existing and typed options |
| `avatar` | Initials avatar plus subtext from `row.email` or `row.owner` | Text editing |
| `link` | Clickable external link | Text editing |
| `email` | `mailto:` link | Email input |
| `json` | JSON text | Multiline editing |
| `markdown` | Plain markdown text display | Multiline editing |
| `progress` | Progress bar | Not editable |

Notes:

- If you omit `columnsJson`, the component derives columns from the first row of `dataSource`.
- If a column has no `width` and `resizable` is not `false`, the component estimates a starting width.
- `markdown` is shown as text, not rendered HTML.
- `progress` expects a numeric value and draws a 0-100 bar.

Example with a hidden field and tooltip:

```json
[
  { "sourceKey": "email", "label": "Email", "format": "email", "editable": true, "width": 260 },
  { "sourceKey": "role", "label": "Role", "format": "tag", "editable": true, "description": "User access level" },
  { "sourceKey": "enabled", "label": "Enabled", "format": "boolean", "align": "center", "width": 100 },
  { "sourceKey": "bio", "label": "Internal notes", "format": "markdown", "hidden": true }
]
```

### `columnOrderingJson`

`columnOrderingJson` is an array of `sourceKey` values. It decides the visible left-to-right order of the columns.

Default value:

```json
["email", "role", "enabled", "createdAt", "teams", "website", "bio"]
```

How it works:

- Each value should match a `sourceKey` from `columnsJson`.
- The component maps this list to the column definitions in order.
- If you include a key that is not present in `columnsJson`, it is ignored.
- If you forget to include a defined column, that column will not appear, because the component uses the ordering list to construct the final column set when `columnsJson` is provided.

Examples:

Put `role` first:

```json
["role", "email", "enabled", "createdAt", "teams", "website", "bio"]
```

Show a reduced set of visible columns:

```json
["email", "role", "enabled"]
```

Practical tip:

- Keep `columnOrderingJson` and `columnsJson` in sync. The safest pattern is to define all columns in `columnsJson`, then list the exact visible order in `columnOrderingJson`.

### `groupByColumnsJson`

`groupByColumnsJson` is an array of row field names used to create grouped sections.

Default value:

```json
[]
```

How it works:

- `[]` means no grouping.
- `["role"]` creates top-level groups like `Admin`, `Editor`, and `Viewer` using the sample data.
- `["role", "enabled"]` creates nested groups. First by role, then by enabled state inside each role.
- Missing values are grouped under `Ungrouped`.
- Group headers show the group label and row count.
- Empty groups can still act as drop zones when cross-group dragging is enabled.

Examples based on the default sample data:

Group by role:

```json
["role"]
```

This produces groups such as:

- `Viewer`
- `Editor`
- `Admin`

Group by role, then enabled state:

```json
["role", "enabled"]
```

This produces nested groups such as:

- `Admin / true`
- `Admin / false`
- `Editor / true`
- `Editor / false`

Important behavior:

- `allowGroupReorder` only reorders top-level groups.
- `allowCrossGroupDrag` updates each moved row's grouped field values to match the target group path.
- If `allowCrossGroupDrag` is `false`, rows cannot be dropped into a different group.
- When adding a new row inside a grouped table, the new row inherits the selected row's group path when exactly one row is selected.

### `theme`

Short version: leave `theme` bound to Retool's built-in theme object unless you have a specific reason to override it.

The component reads common Retool-style tokens such as colors, fonts, radius, borders, and elevation values. Missing values fall back to internal defaults.

Example override:

```json
{
  "primary": "#0f766e",
  "highlight": "#ccfbf1",
  "borderRadius": "10px"
}
```

### `themeStyles`

Short version: use `themeStyles` for simple shell-level CSS overrides like height, max height, or font sizing.

Example:

```json
{
  "maxHeight": "720px",
  "fontSize": "13px"
}
```

This object is spread directly into the outer component style.

## Other useful inputs

| Input | Purpose |
| --- | --- |
| `primaryKey` | Stable unique field for row identity. Default: `id`. |
| `indexColumn` | Optional field representing saved order. Default: none. |
| `allowGroupReorder` | Enables drag handles on top-level group headers. |
| `allowCrossGroupDrag` | Lets rows move between groups and updates grouped fields. |
| `multiSelectEnabled` | Enables checkboxes and multi-row block movement. |
| `editable` | Master on/off switch for inline editing. |
| `showSavePrompt` | Shows the unsaved changes badge. |
| `saveVisible` | Shows the save button. |
| `showHeader` | Shows the table header row. |
| `showTitle` | Shows the title in the top bar. |
| `stickyHeader` | Keeps headers pinned while scrolling. |
| `loading` | Shows loading overlay and blocks interaction. |
| `addRowPosition` | Places add-row controls in the top bar or bottom bar. |
| `rowHeight` | `extra small`, `small`, `medium`, `large`, or `dynamic`. |
| `disableEdits` | Temporarily blocks editing without fully disabling the component. |
| `disableSave` | Disables save actions. |
| `disableReorder` | Disables row drag-and-drop. |
| `disableAddRow` | Removes add-row buttons. |
| `title` | Header title text. |
| `emptyMessage` | Empty-state message when there are no rows. |

## How editing works

- Single click selects a row.
- `Ctrl`, `Cmd`, or `Shift` click adds or removes a row from the multi-selection set.
- Double click on an editable non-boolean cell opens the editor popover.
- Boolean cells toggle directly from the table.
- Edits update the component model immediately.
- Save clears the dirty state after the `save` handler resolves.
- Cancel restores the original `dataSource` ordering and values.

## Add row behavior

The component exposes three add-row actions:

- Add top
- Add bottom
- Add after selected

New rows are created with blank values for visible columns.

- Most fields start as `""`.
- `multiple tags` fields start as `[]`.
- In grouped mode, grouping fields are prefilled from the selected row's group, or from the first known top-level group.

New rows are tracked separately in `newRows` until you save.

## Outputs and state you can use in Retool

These values are continuously written back to the component model:

| Output | Meaning |
| --- | --- |
| `selectedRow` | First selected row object. |
| `selectedRows` | All selected row objects. |
| `selectedRowKey` | First selected row key. |
| `selectedRowKeys` | All selected row keys. |
| `selectedDataIndex` | Index of the first selected row in the original `dataSource`. |
| `selectedDataIndexes` | Indexes of all selected rows in the original `dataSource`. |
| `selectedDisplayIndex` | Index of the first selected row in the current rendered order. |
| `selectedDisplayIndexes` | Display indexes of all selected rows. |
| `selectedCell` | Last clicked or edited cell. |
| `orderedRows` | Row objects in their current visual order. |
| `orderedRowKeys` | Row keys in current visual order. |
| `reorderChangeset` | Array of `{ key, from, to }` reorder operations relative to the baseline order. |
| `changesetArray` | Array of edited rows as `{ key, changes }`. |
| `changesetObject` | JSON string of the keyed edit map. |
| `newRows` | Rows added in the component and not yet cleared by save/cancel. |
| `isDirty` | `true` when there are edits, reorders, or unsaved new rows. |
| `isLoading` | `true` while loading or awaiting save completion. |
| `eventContext` | JSON string with the last event payload sent through a Retool event callback. |

Typical save pattern:

1. Read `changesetArray` for field edits.
2. Read `reorderChangeset` or `orderedRows` for sort changes.
3. Read `newRows` for inserted records.
4. Persist those changes in your Retool queries.

## Events

The component defines these Retool events:

- `rowClick`
- `doubleClickRow`
- `selectRow`
- `deselectRow`
- `changeRowSelection`
- `clickCell`
- `changeCell`
- `clickAction`
- `clickToolbar`
- `rowReorderStart`
- `rowReorder`
- `rowReorderCancel`
- `save`
- `cancel`
- `expandRow`
- `focus`
- `blur`
- `change`

`eventContext` contains the most recent event payload as a JSON string.

Note: `expandRow` is defined in the Retool component manifest, but the current table implementation does not emit it.

Examples:

- After a save: `eventContext.type === "save"`
- After row selection changes: `eventContext.type === "changeRowSelection"`
- After clicking the add-top button: `eventContext.type === "clickToolbar"`

## Example configurations

### Basic table using the shipped sample data

```json
{
  "dataSource": {{ retoolDraggableTable1.dataSource }},
  "primaryKey": "id",
  "columnsJson": [
    { "sourceKey": "email", "label": "Email", "format": "email", "editable": true, "width": 260 },
    { "sourceKey": "role", "label": "Role", "format": "tag", "editable": true, "width": 110 },
    { "sourceKey": "enabled", "label": "Enabled", "format": "boolean", "editable": true, "width": 100, "align": "center" },
    { "sourceKey": "createdAt", "label": "Created at", "format": "date", "editable": true, "width": 140 },
    { "sourceKey": "teams", "label": "Teams", "format": "multiple tags", "editable": true, "width": 240 },
    { "sourceKey": "website", "label": "Website", "format": "link", "editable": true, "width": 240 },
    { "sourceKey": "bio", "label": "Bio", "format": "markdown", "editable": true }
  ],
  "columnOrderingJson": ["email", "role", "enabled", "createdAt", "teams", "website", "bio"],
  "groupByColumnsJson": []
}
```

### Group the default sample data by role

```json
{
  "groupByColumnsJson": ["role"],
  "allowGroupReorder": true,
  "allowCrossGroupDrag": true
}
```

### Group by role, then enabled state

```json
{
  "groupByColumnsJson": ["role", "enabled"]
}
```

### Minimal three-column table

```json
{
  "columnsJson": [
    { "sourceKey": "email", "label": "Email", "format": "email", "editable": true },
    { "sourceKey": "role", "label": "Role", "format": "tag", "editable": true },
    { "sourceKey": "enabled", "label": "Enabled", "format": "boolean", "editable": true, "align": "center" }
  ],
  "columnOrderingJson": ["email", "role", "enabled"]
}
```

## Practical recommendations

- Use a real database key such as `id` or `uuid` for `primaryKey`.
- If row order matters after save, keep a dedicated sort field and use `indexColumn` plus `orderedRows` or `reorderChangeset` in your save logic.
- For grouped workflows, group by stable scalar fields like `role`, `status`, or `enabled`.
- Avoid grouping by high-cardinality free-text fields unless that is intentional.
- Keep `columnsJson` and `columnOrderingJson` managed together.

## Known behavior notes

- `changesetObject` is exposed to Retool as a JSON string, not a live object.
- `markdown` values are editable and displayed as plain text.
- The leftmost numeric `ID` column in the UI is the current display index, not necessarily your row's database `id`.
- Group reordering only affects top-level groups.
- `expandRow` exists as a declared Retool event but is not currently triggered by the component.
