import React from 'react';
import { Retool } from '@tryretool/custom-component-support';
import { DraggableTable } from '../components/DraggableTable/DraggableTable';
import type { RowData, TableColumn, ThemeTokens, TableModel } from '../types';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseJsonArray = (value: string) => {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizeArrayInput = <T,>(value: unknown): T[] => {
  if (!Array.isArray(value)) return [];
  if (!value.length) return [];

  const [first] = value;

  // Retool SQL queries commonly expose a single JSON-valued column as an array
  // with one element, so unwrap that shape for component inputs.
  if (value.length === 1) {
    if (Array.isArray(first)) return first as T[];
    if (typeof first === 'string') return parseJsonArray(first) as T[];
  }

  return value as T[];
};

const normalizeObjectInput = <T extends Record<string, unknown>>(value: unknown): T => {
  if (isPlainObject(value)) return value as T;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return isPlainObject(parsed) ? parsed as T : {} as T;
    } catch {
      return {} as T;
    }
  }
  return {} as T;
};

const useTableState = () => {
  const [dataSource] = Retool.useStateArray({ name: 'dataSource', initialValue: [{ id: 0, sortOrder: 0, user: 'Chic Footitt', department: 'Operations', email: 'chic.footitt@yahoo.com', role: 'Viewer', enabled: true, employeeNumber: 1042, createdAt: '2023-01-16', lastLoginAt: '2025-03-18T09:45:00', teams: ['Workplace', 'Infrastructure'], website: 'https://chic.footitt.com', bioHtml: '<strong>Nulla sit amet nibh</strong> at augue facilisis viverra quis id dui.', notesMarkdown: '## Quick note\n- Prefers async updates\n- Uses the customer inbox', progress: 12, internalNotes: 'Hidden sample row note\nNeeds review before export.' }, { id: 1, sortOrder: 1, user: 'Kenton Worling', department: 'Support', email: 'kentonworling@icloud.com', role: 'Viewer', enabled: false, employeeNumber: 1043, createdAt: '2021-12-24', lastLoginAt: '2025-03-12T17:10:00', teams: ['Workplace'], website: 'https://kenton.worling.com', bioHtml: '<p>Duis viverra elementum ante, placerat sollicitudin ipsum laoreet nec.</p>', notesMarkdown: 'Supports the **string** and `markdown` renderers.', progress: 28, internalNotes: 'Hidden sample row note\nFollow up with support lead.' }, { id: 2, sortOrder: 2, user: 'Evelina Fender', department: 'Product', email: 'efender@outlook.com', role: 'Editor', enabled: true, employeeNumber: 1044, createdAt: '2022-01-03', lastLoginAt: '2025-03-20T11:05:00', teams: ['Product', 'Sales'], website: 'https://evelina.fender.com', bioHtml: '<ul><li>Donec in lorem</li><li>Sed eu mollis felis</li></ul>', notesMarkdown: '> Quote block for the markdown cell\n\n- First item\n- Second item', progress: 46, internalNotes: 'Hidden sample row note\nEscalated once this quarter.' }, { id: 3, sortOrder: 3, user: 'Lexis Speers', department: 'Design', email: 'lexisspeers@icloud.com', role: 'Admin', enabled: true, employeeNumber: 1045, createdAt: '2022-12-13', lastLoginAt: '2025-03-21T08:30:00', teams: ['Infrastructure', 'Design'], website: 'https://lexis.speers.com', bioHtml: '<a href="https://example.com">Linked note</a> with extra context.', notesMarkdown: '# Markdown title\n\nEmail support for `code` samples.', progress: 64, internalNotes: 'Hidden sample row note\nWaiting on design sign-off.' }, { id: 4, sortOrder: 4, user: 'Marina Croot', department: 'Finance', email: 'marina.croot@example.com', role: 'Admin', enabled: false, employeeNumber: 1046, createdAt: '', lastLoginAt: '', teams: [], website: '', bioHtml: '', notesMarkdown: '', progress: 8, internalNotes: 'Nullable date and tag sample.' }, { id: 5, sortOrder: 5, user: 'Darian Pell', department: 'Support', email: 'darian.pell@example.com', role: 'Editor', enabled: false, employeeNumber: 1047, createdAt: '2024-02-14', lastLoginAt: '', teams: [], website: '', bioHtml: '<p>Owns weekend escalation coverage.</p>', notesMarkdown: '', progress: 33, internalNotes: 'Shows empty list vs null tag behavior.' }, { id: 6, sortOrder: 6, user: 'Nadia Skerrit', department: 'Operations', email: 'nadia.skerrit@example.com', role: 'Viewer', enabled: true, employeeNumber: 1048, createdAt: '2023-06-02', lastLoginAt: '2025-03-10T07:20:00', teams: ['Compliance'], website: 'https://nadia.example.com', bioHtml: '', notesMarkdown: 'Tracks handoff quality checks.', progress: 57, internalNotes: 'Uses shared team tag list.' }, { id: 7, sortOrder: 7, user: 'Orson Hale', department: 'Engineering', email: 'orson.hale@example.com', role: 'Admin', enabled: true, employeeNumber: 1049, createdAt: '2021-09-18', lastLoginAt: '2025-03-22T13:05:00', teams: ['Infrastructure', 'Security'], website: 'https://orson.example.com', bioHtml: '<p>Maintains audit-ready deployment flows.</p>', notesMarkdown: 'Pairs with the **Ops** team on releases.', progress: 71, internalNotes: 'Good candidate for grouped drag testing.' }, { id: 8, sortOrder: 8, user: 'Priya Merson', department: 'Product', email: 'priya.merson@example.com', role: 'Editor', enabled: true, employeeNumber: 1050, createdAt: '2024-04-09', lastLoginAt: '2025-03-16T16:42:00', teams: ['Product'], website: 'https://priya.example.com', bioHtml: '<p>Owns roadmap review artifacts.</p>', notesMarkdown: '- Keeps release notes current\n- Reviews customer-facing copy', progress: 52, internalNotes: 'Exercises single-team selection.' }, { id: 9, sortOrder: 9, user: 'Joel Bather', department: 'Sales', email: 'joel.bather@example.com', role: 'Viewer', enabled: false, employeeNumber: 1051, createdAt: '', lastLoginAt: '2025-02-28T10:10:00', teams: ['Sales'], website: '', bioHtml: '', notesMarkdown: 'Placeholder-friendly row for link/html cells.', progress: 19, internalNotes: 'Website intentionally blank.' }, { id: 10, sortOrder: 10, user: 'Amina Vos', department: 'Security', email: 'amina.vos@example.com', role: 'Admin', enabled: false, employeeNumber: 1052, createdAt: '2020-05-11', lastLoginAt: '2025-03-01T05:55:00', teams: ['Security'], website: 'https://amina.example.com', bioHtml: '<p>Runs quarterly access reviews.</p>', notesMarkdown: 'Has **strict** tag options in demos.', progress: 88, internalNotes: 'Security admin sample.' }, { id: 11, sortOrder: 11, user: 'Rory Plaskett', department: 'Marketing', email: 'rory.plaskett@example.com', role: 'Viewer', enabled: true, employeeNumber: 1053, createdAt: '2024-07-22', lastLoginAt: '', teams: ['Sales', 'Product'], website: 'https://rory.example.com', bioHtml: '', notesMarkdown: '', progress: 41, internalNotes: 'Nullable datetime example.' }, { id: 12, sortOrder: 12, user: 'Ivy Tann', department: 'People Ops', email: 'ivy.tann@example.com', role: 'Editor', enabled: false, employeeNumber: 1054, createdAt: '2023-03-30', lastLoginAt: '2025-03-11T14:18:00', teams: ['Workplace', 'Compliance'], website: 'https://ivy.example.com', bioHtml: '<p>Coordinates onboarding changes.</p>', notesMarkdown: 'Prefers async approvals.', progress: 60, internalNotes: 'Multi-tag strict option sample.' }, { id: 13, sortOrder: 13, user: 'Milo Serrano', department: 'Customer Success', email: 'milo.serrano@example.com', role: 'Editor', enabled: true, employeeNumber: 1055, createdAt: '2022-11-08', lastLoginAt: '2025-03-19T12:00:00', teams: [], website: '', bioHtml: '<p>Working on migration guides.</p>', notesMarkdown: '', progress: 49, internalNotes: 'Uses null team value.' }, { id: 14, sortOrder: 14, user: 'Tessa Brindle', department: 'Operations', email: 'tessa.brindle@example.com', role: 'Viewer', enabled: false, employeeNumber: 1056, createdAt: '2021-08-17', lastLoginAt: '2025-03-07T09:12:00', teams: ['Infrastructure'], website: 'https://tessa.example.com', bioHtml: '', notesMarkdown: 'Last row for scroll and reorder checks.', progress: 25, internalNotes: 'Bottom-of-list reorder sample.' }], inspector: 'text', label: 'Data Source', description: 'Array of row objects. Leave the sample data or bind a query result.' });
  const [primaryKey] = Retool.useStateString({ name: 'primaryKey', initialValue: 'id', inspector: 'text', label: 'Primary Key' });
  const [indexColumn] = Retool.useStateString({ name: 'indexColumn', initialValue: 'sortOrder', inspector: 'text', label: 'Index Column' });
  const [columnsJson] = Retool.useStateArray({ name: 'columnsJson', initialValue: [{ sourceKey: 'user', label: 'User', format: 'avatar', editable: true, width: 260, description: 'Avatar-style name column.' }, { sourceKey: 'department', label: 'Department', format: 'string', editable: true, width: 160, description: 'Plain text string column.', emptyDisplayValue: 'Add department' }, { sourceKey: 'email', label: 'Email', format: 'email', editable: true, width: 260, description: 'Click-to-email address.', resizable: false }, { sourceKey: 'role', label: 'Role', format: 'tag', editable: true, width: 120, description: 'Strict single-tag role column.', tagOptionsSource: 'roleTags', allowFreeText: false, allowNull: true }, { sourceKey: 'enabled', label: 'Enabled', format: 'boolean', editable: true, width: 100, align: 'center', description: 'Boolean toggle column.' }, { sourceKey: 'employeeNumber', label: 'Employee #', format: 'number', editable: true, width: 120, align: 'right', description: 'Numeric editor column.' }, { sourceKey: 'createdAt', label: 'Created at', format: 'date', editable: true, width: 140, description: 'Date picker column.', allowNull: true, emptyDisplayValue: 'No start date' }, { sourceKey: 'lastLoginAt', label: 'Last login', format: 'date time', editable: true, width: 180, description: 'Date and time editor column.', allowNull: true, emptyDisplayValue: 'No recent login' }, { sourceKey: 'teams', label: 'Teams', format: 'multiple tags', editable: true, width: 260, description: 'Shared multi-tag chip column.', tagOptionsSource: 'teamTags', allowFreeText: false, allowNull: true, emptyDisplayValue: 'No teams assigned' }, { sourceKey: 'website', label: 'Website', format: 'link', editable: true, width: 240, description: 'External link column.', emptyDisplayValue: 'Add website' }, { sourceKey: 'bioHtml', label: 'Bio HTML', format: 'html', editable: true, width: 320, description: 'Raw HTML rendering column.', emptyDisplayValue: 'Add HTML bio' }, { sourceKey: 'notesMarkdown', label: 'Notes', format: 'markdown', editable: true, width: 320, description: 'Markdown rendering column.', emptyDisplayValue: 'Add markdown notes' }, { sourceKey: 'progress', label: 'Progress', format: 'progress', editable: true, width: 180, align: 'center', description: '0-100 progress slider column.' }, { sourceKey: 'internalNotes', label: 'Internal notes', format: 'multiline string', editable: true, hidden: true, resizable: false, description: 'Hidden multiline text sample column.', emptyDisplayValue: 'Add internal notes' }], inspector: 'text', label: 'Columns JSON' });
  const [columnOrderingJson] = Retool.useStateArray({ name: 'columnOrderingJson', initialValue: ['user', 'department', 'email', 'role', 'enabled', 'employeeNumber', 'createdAt', 'lastLoginAt', 'teams', 'website', 'bioHtml', 'notesMarkdown', 'progress', 'internalNotes'], inspector: 'text', label: 'Column Ordering JSON' });
  const [groupByColumnsJson] = Retool.useStateArray({ name: 'groupByColumnsJson', initialValue: ['role', 'enabled'], inspector: 'text', label: 'Group By JSON' });
  const [tagOptionsSources] = Retool.useStateObject({ name: 'tagOptionsSources', initialValue: { roleTags: ['Admin', 'Editor', 'Viewer'], teamTags: ['Compliance', 'Design', 'Infrastructure', 'Product', 'Sales', 'Security', 'Workplace'] }, inspector: 'text', label: 'Tag Options Sources' });
  const [collapsibleGroups] = Retool.useStateBoolean({ name: 'collapsibleGroups', initialValue: true, inspector: 'checkbox', label: 'Collapsible Groups' });
  const [allowGroupReorder] = Retool.useStateBoolean({ name: 'allowGroupReorder', initialValue: true, inspector: 'checkbox', label: 'Allow Group Reorder' });
  const [allowCrossGroupDrag] = Retool.useStateBoolean({ name: 'allowCrossGroupDrag', initialValue: true, inspector: 'checkbox', label: 'Allow Cross Group Drag' });
  const [multiSelectEnabled] = Retool.useStateBoolean({ name: 'multiSelectEnabled', initialValue: true, inspector: 'checkbox', label: 'Multi Select' });
  const [editable] = Retool.useStateBoolean({ name: 'editable', initialValue: true, inspector: 'checkbox', label: 'Editable' });
  const [showSavePrompt] = Retool.useStateBoolean({ name: 'showSavePrompt', initialValue: true, inspector: 'checkbox', label: 'Show Save Prompt' });
  const [saveVisible] = Retool.useStateBoolean({ name: 'saveVisible', initialValue: true, inspector: 'checkbox', label: 'Save Visible' });
  const [showHeader] = Retool.useStateBoolean({ name: 'showHeader', initialValue: true, inspector: 'checkbox', label: 'Show Header' });
  const [showTitle] = Retool.useStateBoolean({ name: 'showTitle', initialValue: true, inspector: 'checkbox', label: 'Show Title' });
  const [stickyHeader] = Retool.useStateBoolean({ name: 'stickyHeader', initialValue: true, inspector: 'checkbox', label: 'Sticky Header' });
  const [loading] = Retool.useStateBoolean({ name: 'loading', initialValue: false, inspector: 'checkbox', label: 'Loading' });
  const [addRowPosition] = Retool.useStateEnumeration({ name: 'addRowPosition', enumDefinition: ['top', 'bottom'], initialValue: 'bottom', inspector: 'segmented', label: 'Button Position' });
  const [rowHeight] = Retool.useStateEnumeration({ name: 'rowHeight', enumDefinition: ['extra small', 'small', 'medium', 'high', 'auto'], initialValue: 'small', inspector: 'select', label: 'Row Height' });
  const [theme] = Retool.useStateObject({ name: 'theme', initialValue: '{{ theme }}', inspector: 'text', label: 'Theme' });
  const [themeStyles] = Retool.useStateObject({ name: 'themeStyles', initialValue: {}, inspector: 'text', label: 'Theme Styles' });
  const [disableEdits] = Retool.useStateBoolean({ name: 'disableEdits', initialValue: false, inspector: 'checkbox', label: 'Disable Edits' });
  const [disableSave] = Retool.useStateBoolean({ name: 'disableSave', initialValue: false, inspector: 'checkbox', label: 'Disable Save' });
  const [disableReorder] = Retool.useStateBoolean({ name: 'disableReorder', initialValue: false, inspector: 'checkbox', label: 'Disable Reorder' });
  const [disableAddRow] = Retool.useStateBoolean({ name: 'disableAddRow', initialValue: false, inspector: 'checkbox', label: 'Disable Add Row' });
  const [showDisplayIndexColumn] = Retool.useStateBoolean({ name: 'showDisplayIndexColumn', initialValue: false, inspector: 'checkbox', label: 'Show Display Index Column' });
  const [title] = Retool.useStateString({ name: 'title', initialValue: 'Draggable Table', inspector: 'text', label: 'Title' });
  const [emptyMessage] = Retool.useStateString({ name: 'emptyMessage', initialValue: 'No rows to display', inspector: 'text', label: 'Empty Message' });

  const [selectedRow, setSelectedRow] = Retool.useStateObject({ name: 'selectedRow', initialValue: {}, inspector: 'hidden', label: 'Selected Row' });
  const [selectedRowKey, setSelectedRowKey] = Retool.useStateString({ name: 'selectedRowKey', initialValue: '', inspector: 'hidden', label: 'Selected Row Key' });
  const [selectedCell, setSelectedCell] = Retool.useStateObject({ name: 'selectedCell', initialValue: {}, inspector: 'hidden', label: 'Selected Cell' });
  const [isDirty, setIsDirty] = Retool.useStateBoolean({ name: 'isDirty', initialValue: false, inspector: 'hidden', label: 'Is Dirty' });
  const [isLoading, setIsLoading] = Retool.useStateBoolean({ name: 'isLoading', initialValue: false, inspector: 'hidden', label: 'Is Loading' });

  return {
    inputs: {
      dataSource: normalizeArrayInput<RowData>(dataSource),
      primaryKey: primaryKey.trim(),
      indexColumn: indexColumn.trim(),
      columns: normalizeArrayInput<TableColumn>(columnsJson),
      columnOrdering: normalizeArrayInput<string>(columnOrderingJson),
      groupByColumns: normalizeArrayInput<string>(groupByColumnsJson),
      tagOptionsSources: normalizeObjectInput<Record<string, string[]>>(tagOptionsSources),
      collapsibleGroups,
      allowGroupReorder,
      allowCrossGroupDrag,
      multiSelectEnabled,
      editable,
      showSavePrompt,
      saveVisible,
      showHeader,
      showTitle,
      stickyHeader,
      loading,
      addRowPosition,
      rowHeight,
      theme: normalizeObjectInput<ThemeTokens>(theme),
      themeStyles: normalizeObjectInput<React.CSSProperties>(themeStyles),
      disableEdits,
      disableSave,
      disableReorder,
      disableAddRow,
      showDisplayIndexColumn,
      title,
      emptyMessage,
    },
    outputs: {
      setSelectedRow,
      setSelectedRowKey,
      setSelectedCell,
      setIsDirty,
      setIsLoading,
    },
  };
};

export const RetoolDraggableTable: React.FC = () => {
  const { inputs, outputs } = useTableState();

  const handleModelChange = (model: TableModel) => {
    outputs.setSelectedRow(model.selectedRow ?? {});
    outputs.setSelectedRowKey(model.selectedRowKey ?? '');
    outputs.setSelectedCell(model.selectedCell ?? {});
    outputs.setIsDirty(model.isDirty);
    outputs.setIsLoading(model.isLoading);
  };

  return (
    <div style={{ minWidth: '100%', height: '100%', verticalAlign: 'top' }}>
      <DraggableTable
        {...inputs}
        onModelChange={handleModelChange}
      />
    </div>
  );
};
