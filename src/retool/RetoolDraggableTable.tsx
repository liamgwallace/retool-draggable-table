import React from 'react';
import { Retool } from '@tryretool/custom-component-support';
import { DraggableTable } from '../components/DraggableTable/DraggableTable';
import type { RowData, TableColumn, ThemeTokens } from '../types';

/*
const useTableState = () => {
  const [dataSource] = Retool.useStateArray({ name: 'dataSource', initialValue: [{ id: 0, user: 'Chic Footitt', email: 'chic.footitt@yahoo.com', role: 'Viewer', enabled: true, createdAt: '2023-01-16', teams: ['Workplace', 'Infrastructure'], website: 'https://chic.footitt.com', bio: 'Nulla sit amet nibh at augue facilisis viverra quis id dui.' }, { id: 1, user: 'Kenton Worling', email: 'kentonworling@icloud.com', role: 'Viewer', enabled: false, createdAt: '2021-12-24', teams: ['Workplace'], website: 'https://kenton.worling.com', bio: 'Duis viverra elementum ante, placerat sollicitudin ipsum laoreet nec.' }, { id: 2, user: 'Evelina Fender', email: 'efender@outlook.com', role: 'Editor', enabled: true, createdAt: '2022-01-03', teams: ['Product', 'Sales'], website: 'https://evelina.fender.com', bio: 'Donec in lorem a dolor placerat gravida.' }], inspector: 'text', label: 'Data Source', description: 'Array of row objects. Leave the sample data or bind a query result, for example `{{query.data}}`.' });
  const [primaryKey] = Retool.useStateEnumeration({ name: 'primaryKey', enumDefinition: ['id', 'user', 'email', 'role'], initialValue: 'id', inspector: 'select', label: 'Primary Key', description: 'Unique field used to identify rows across edits and reorder. Example: `id`, `uuid`, or `user_id`.' });
  const [indexColumn] = Retool.useStateEnumeration({ name: 'indexColumn', enumDefinition: ['none', 'order', 'sortOrder'], initialValue: 'none', inspector: 'select', label: 'Index Column', description: 'Optional order field to write back row position. Choose `none` if you do not want a persisted order field.' });
  const [userVisible] = Retool.useStateBoolean({ name: 'userVisible', initialValue: true, inspector: 'checkbox', label: 'User Visible', description: 'Show or hide the User column.' });
  const [userEditable] = Retool.useStateBoolean({ name: 'userEditable', initialValue: true, inspector: 'checkbox', label: 'User Editable', description: 'Allow editing the User value.' });
  const [userFormat] = Retool.useStateEnumeration({ name: 'userFormat', enumDefinition: ['avatar', 'string', 'tag'], initialValue: 'avatar', inspector: 'select', label: 'User Format', description: 'Display mode for the User column.' });
  const [roleVisible] = Retool.useStateBoolean({ name: 'roleVisible', initialValue: true, inspector: 'checkbox', label: 'Role Visible', description: 'Show or hide the Role column.' });
  const [roleEditable] = Retool.useStateBoolean({ name: 'roleEditable', initialValue: true, inspector: 'checkbox', label: 'Role Editable', description: 'Allow editing the Role value.' });
  const [roleFormat] = Retool.useStateEnumeration({ name: 'roleFormat', enumDefinition: ['tag', 'string'], initialValue: 'tag', inspector: 'select', label: 'Role Format', description: 'Display mode for the Role column.' });
  const [enabledVisible] = Retool.useStateBoolean({ name: 'enabledVisible', initialValue: true, inspector: 'checkbox', label: 'Enabled Visible', description: 'Show or hide the Enabled column.' });
  const [enabledEditable] = Retool.useStateBoolean({ name: 'enabledEditable', initialValue: true, inspector: 'checkbox', label: 'Enabled Editable', description: 'Allow editing the Enabled value.' });
  const [enabledFormat] = Retool.useStateEnumeration({ name: 'enabledFormat', enumDefinition: ['boolean', 'string'], initialValue: 'boolean', inspector: 'select', label: 'Enabled Format', description: 'Display mode for the Enabled column.' });
  const [createdAtVisible] = Retool.useStateBoolean({ name: 'createdAtVisible', initialValue: true, inspector: 'checkbox', label: 'Created At Visible', description: 'Show or hide the Created at column.' });
  const [createdAtEditable] = Retool.useStateBoolean({ name: 'createdAtEditable', initialValue: true, inspector: 'checkbox', label: 'Created At Editable', description: 'Allow editing the Created at value.' });
  const [createdAtFormat] = Retool.useStateEnumeration({ name: 'createdAtFormat', enumDefinition: ['date', 'date time', 'string'], initialValue: 'date', inspector: 'select', label: 'Created At Format', description: 'Display mode for the Created at column.' });
  const [teamsVisible] = Retool.useStateBoolean({ name: 'teamsVisible', initialValue: true, inspector: 'checkbox', label: 'Teams Visible', description: 'Show or hide the Teams column.' });
  const [teamsEditable] = Retool.useStateBoolean({ name: 'teamsEditable', initialValue: true, inspector: 'checkbox', label: 'Teams Editable', description: 'Allow editing the Teams list.' });
  const [teamsFormat] = Retool.useStateEnumeration({ name: 'teamsFormat', enumDefinition: ['multiple tags', 'string'], initialValue: 'multiple tags', inspector: 'select', label: 'Teams Format', description: 'Display mode for the Teams column.' });
  const [websiteVisible] = Retool.useStateBoolean({ name: 'websiteVisible', initialValue: true, inspector: 'checkbox', label: 'Website Visible', description: 'Show or hide the Website column.' });
  const [websiteEditable] = Retool.useStateBoolean({ name: 'websiteEditable', initialValue: true, inspector: 'checkbox', label: 'Website Editable', description: 'Allow editing the Website value.' });
  const [websiteFormat] = Retool.useStateEnumeration({ name: 'websiteFormat', enumDefinition: ['link', 'string'], initialValue: 'link', inspector: 'select', label: 'Website Format', description: 'Display mode for the Website column.' });
  const [bioVisible] = Retool.useStateBoolean({ name: 'bioVisible', initialValue: true, inspector: 'checkbox', label: 'Bio Visible', description: 'Show or hide the Bio column.' });
  const [bioEditable] = Retool.useStateBoolean({ name: 'bioEditable', initialValue: true, inspector: 'checkbox', label: 'Bio Editable', description: 'Allow editing the Bio value.' });
  const [bioFormat] = Retool.useStateEnumeration({ name: 'bioFormat', enumDefinition: ['html', 'markdown', 'string'], initialValue: 'html', inspector: 'select', label: 'Bio Format', description: 'Display mode for the Bio column.' });
  const [progressVisible] = Retool.useStateBoolean({ name: 'progressVisible', initialValue: true, inspector: 'checkbox', label: 'Progress Visible', description: 'Show or hide the Progress column.' });
  const [progressEditable] = Retool.useStateBoolean({ name: 'progressEditable', initialValue: true, inspector: 'checkbox', label: 'Progress Editable', description: 'Allow the Progress value to be edited with a slider.' });
  const [progressFormat] = Retool.useStateEnumeration({ name: 'progressFormat', enumDefinition: ['progress', 'number', 'string'], initialValue: 'progress', inspector: 'select', label: 'Progress Format', description: 'Display mode for the Progress column.' });
  const [columnOrder1] = Retool.useStateEnumeration({ name: 'columnOrder1', enumDefinition: ['user', 'role', 'enabled', 'createdAt', 'teams', 'website', 'bio', 'progress', 'none'], initialValue: 'user', inspector: 'select', label: 'Column 1', description: 'First visible column.' });
  const [columnOrder2] = Retool.useStateEnumeration({ name: 'columnOrder2', enumDefinition: ['user', 'role', 'enabled', 'createdAt', 'teams', 'website', 'bio', 'progress', 'none'], initialValue: 'role', inspector: 'select', label: 'Column 2', description: 'Second visible column.' });
  const [columnOrder3] = Retool.useStateEnumeration({ name: 'columnOrder3', enumDefinition: ['user', 'role', 'enabled', 'createdAt', 'teams', 'website', 'bio', 'progress', 'none'], initialValue: 'enabled', inspector: 'select', label: 'Column 3', description: 'Third visible column.' });
  const [columnOrder4] = Retool.useStateEnumeration({ name: 'columnOrder4', enumDefinition: ['user', 'role', 'enabled', 'createdAt', 'teams', 'website', 'bio', 'progress', 'none'], initialValue: 'createdAt', inspector: 'select', label: 'Column 4', description: 'Fourth visible column.' });
  const [columnOrder5] = Retool.useStateEnumeration({ name: 'columnOrder5', enumDefinition: ['user', 'role', 'enabled', 'createdAt', 'teams', 'website', 'bio', 'progress', 'none'], initialValue: 'teams', inspector: 'select', label: 'Column 5', description: 'Fifth visible column.' });
  const [columnOrder6] = Retool.useStateEnumeration({ name: 'columnOrder6', enumDefinition: ['user', 'role', 'enabled', 'createdAt', 'teams', 'website', 'bio', 'progress', 'none'], initialValue: 'website', inspector: 'select', label: 'Column 6', description: 'Sixth visible column.' });
  const [columnOrder7] = Retool.useStateEnumeration({ name: 'columnOrder7', enumDefinition: ['user', 'role', 'enabled', 'createdAt', 'teams', 'website', 'bio', 'progress', 'none'], initialValue: 'bio', inspector: 'select', label: 'Column 7', description: 'Seventh visible column.' });
  const [columnOrder8] = Retool.useStateEnumeration({ name: 'columnOrder8', enumDefinition: ['user', 'role', 'enabled', 'createdAt', 'teams', 'website', 'bio', 'progress', 'none'], initialValue: 'progress', inspector: 'select', label: 'Column 8', description: 'Eighth visible column.' });
  const [groupByColumns] = Retool.useStateEnumeration({ name: 'groupByColumns', enumDefinition: ['none', 'role', 'enabled', 'createdAt', 'teams'], initialValue: 'none', inspector: 'select', label: 'Group By Column', description: 'Choose a field to group rows by. Use `none` for no grouping.' });
  const [allowGroupReorder] = Retool.useStateBoolean({ name: 'allowGroupReorder', initialValue: false, inspector: 'checkbox', label: 'Allow Group Reorder', description: 'If enabled, grouped sections can be reordered as whole blocks.' });
  const [allowCrossGroupDrag] = Retool.useStateBoolean({ name: 'allowCrossGroupDrag', initialValue: true, inspector: 'checkbox', label: 'Allow Cross Group Drag', description: 'If enabled, dragging a row into another group updates the grouped field value.' });
  const [multiSelectEnabled] = Retool.useStateBoolean({ name: 'multiSelectEnabled', initialValue: true, inspector: 'checkbox', label: 'Multi Select', description: 'Adds row checkboxes so selected rows can move as a block.' });
  const [editable] = Retool.useStateBoolean({ name: 'editable', initialValue: true, inspector: 'checkbox', label: 'Editable', description: 'Turns on inline editing for editable columns.' });
  const [showSavePrompt] = Retool.useStateBoolean({ name: 'showSavePrompt', initialValue: true, inspector: 'checkbox', label: 'Show Save Prompt', description: 'Shows the unsaved changes badge when the table is dirty.' });
  const [saveVisible] = Retool.useStateBoolean({ name: 'saveVisible', initialValue: true, inspector: 'checkbox', label: 'Save Visible', description: 'Shows the save action in the toolbar.' });
  const [loading] = Retool.useStateBoolean({ name: 'loading', initialValue: false, inspector: 'checkbox', label: 'Loading', description: 'Displays loading treatment and blocks edits/reordering.' });
  const [addRowPosition] = Retool.useStateEnumeration({ name: 'addRowPosition', enumDefinition: ['top', 'bottom'], initialValue: 'bottom', inspector: 'segmented', label: 'Button Position', description: 'Where the add-row icon buttons appear: toolbar top or below the table.' });
  const [rowHeight] = Retool.useStateEnumeration({ name: 'rowHeight', enumDefinition: ['extra small', 'small', 'medium', 'high', 'auto'], initialValue: 'small', inspector: 'select', label: 'Row Height', description: 'Controls row density. Use `auto` for taller, more wrapped rows.' });
  const [theme] = Retool.useStateObject({ name: 'theme', initialValue: {}, inspector: 'text', label: 'Theme', description: 'Optional Retool theme token object. Normally bind this to `{{ theme }}`.' });
  const [themeStyles] = Retool.useStateObject({ name: 'themeStyles', initialValue: { maxHeight: '720px' }, inspector: 'text', label: 'Theme Styles', description: 'CSS-style overrides for the component shell. Example: `{ "maxHeight": "720px" }` or `{ "fontSize": "13px" }`.' });
  const [disableEdits] = Retool.useStateBoolean({ name: 'disableEdits', initialValue: false, inspector: 'checkbox', label: 'Disable Edits', description: 'Blocks inline cell editing without disabling row drag.' });
  const [disableSave] = Retool.useStateBoolean({ name: 'disableSave', initialValue: false, inspector: 'checkbox', label: 'Disable Save', description: 'Hides or disables the save action.' });
  const [disableReorder] = Retool.useStateBoolean({ name: 'disableReorder', initialValue: false, inspector: 'checkbox', label: 'Disable Reorder', description: 'Prevents drag-to-reorder interactions.' });
  const [disableAddRow] = Retool.useStateBoolean({ name: 'disableAddRow', initialValue: false, inspector: 'checkbox', label: 'Disable Add Row', description: 'Removes the add-row actions from the UI.' });
  const [emptyMessage] = Retool.useStateString({ name: 'emptyMessage', initialValue: 'No rows to display', inspector: 'text', label: 'Empty Message', description: 'Text shown when the table has no rows.' });

  const [selectedRow, setSelectedRow] = Retool.useStateObject({ name: 'selectedRow', initialValue: {}, inspector: 'hidden', label: 'Selected Row' });
  const [selectedRows, setSelectedRows] = Retool.useStateArray({ name: 'selectedRows', initialValue: [], inspector: 'hidden', label: 'Selected Rows' });
  const [selectedRowKey, setSelectedRowKey] = Retool.useStateString({ name: 'selectedRowKey', initialValue: '', inspector: 'hidden', label: 'Selected Row Key' });
  const [selectedRowKeys, setSelectedRowKeys] = Retool.useStateArray({ name: 'selectedRowKeys', initialValue: [], inspector: 'hidden', label: 'Selected Row Keys' });
  const [selectedDataIndex, setSelectedDataIndex] = Retool.useStateNumber({ name: 'selectedDataIndex', initialValue: -1, inspector: 'hidden', label: 'Selected Data Index' });
  const [selectedDataIndexes, setSelectedDataIndexes] = Retool.useStateArray({ name: 'selectedDataIndexes', initialValue: [], inspector: 'hidden', label: 'Selected Data Indexes' });
  const [selectedDisplayIndex, setSelectedDisplayIndex] = Retool.useStateNumber({ name: 'selectedDisplayIndex', initialValue: -1, inspector: 'hidden', label: 'Selected Display Index' });
  const [selectedDisplayIndexes, setSelectedDisplayIndexes] = Retool.useStateArray({ name: 'selectedDisplayIndexes', initialValue: [], inspector: 'hidden', label: 'Selected Display Indexes' });
  const [selectedCell, setSelectedCell] = Retool.useStateObject({ name: 'selectedCell', initialValue: {}, inspector: 'hidden', label: 'Selected Cell' });
  const [orderedRows, setOrderedRows] = Retool.useStateArray({ name: 'orderedRows', initialValue: [], inspector: 'hidden', label: 'Ordered Rows' });
  const [orderedRowKeys, setOrderedRowKeys] = Retool.useStateArray({ name: 'orderedRowKeys', initialValue: [], inspector: 'hidden', label: 'Ordered Row Keys' });
  const [reorderChangeset, setReorderChangeset] = Retool.useStateArray({ name: 'reorderChangeset', initialValue: [], inspector: 'hidden', label: 'Reorder Changeset' });
  const [changesetArray, setChangesetArray] = Retool.useStateArray({ name: 'changesetArray', initialValue: [], inspector: 'hidden', label: 'Changeset Array' });
  const [changesetObject, setChangesetObject] = Retool.useStateString({ name: 'changesetObject', initialValue: '{}', inspector: 'hidden', label: 'Changeset Object' });
  const [newRows, setNewRows] = Retool.useStateArray({ name: 'newRows', initialValue: [], inspector: 'hidden', label: 'New Rows' });
  const [isDirty, setIsDirty] = Retool.useStateBoolean({ name: 'isDirty', initialValue: false, inspector: 'hidden', label: 'Is Dirty' });
  const [isLoading, setIsLoading] = Retool.useStateBoolean({ name: 'isLoading', initialValue: false, inspector: 'hidden', label: 'Is Loading' });

  const [eventContext, setEventContext] = Retool.useStateString({ name: 'eventContext', initialValue: '', inspector: 'hidden', label: 'Event Context' });

  const rowClick = Retool.useEventCallback({ name: 'rowClick' });
  const doubleClickRow = Retool.useEventCallback({ name: 'doubleClickRow' });
  const selectRow = Retool.useEventCallback({ name: 'selectRow' });
  const deselectRow = Retool.useEventCallback({ name: 'deselectRow' });
  const changeRowSelection = Retool.useEventCallback({ name: 'changeRowSelection' });
  const clickCell = Retool.useEventCallback({ name: 'clickCell' });
  const changeCell = Retool.useEventCallback({ name: 'changeCell' });
  const clickAction = Retool.useEventCallback({ name: 'clickAction' });
  const clickToolbar = Retool.useEventCallback({ name: 'clickToolbar' });
  const rowReorderStart = Retool.useEventCallback({ name: 'rowReorderStart' });
  const rowReorder = Retool.useEventCallback({ name: 'rowReorder' });
  const rowReorderCancel = Retool.useEventCallback({ name: 'rowReorderCancel' });
  const save = Retool.useEventCallback({ name: 'save' });
  const cancel = Retool.useEventCallback({ name: 'cancel' });
  const expandRow = Retool.useEventCallback({ name: 'expandRow' });
  const focus = Retool.useEventCallback({ name: 'focus' });
  const blur = Retool.useEventCallback({ name: 'blur' });
  const change = Retool.useEventCallback({ name: 'change' });

  return {
    inputs: {
      dataSource: (dataSource as RowData[]) ?? [],
      primaryKey,
      indexColumn: indexColumn === 'none' ? '' : indexColumn,
      columns: [{ sourceKey: 'user', label: 'User', format: userFormat, editable: userEditable, hidden: !userVisible, width: 260 }, { sourceKey: 'role', label: 'Role', format: roleFormat, editable: roleEditable, hidden: !roleVisible, width: 110 }, { sourceKey: 'enabled', label: 'Enabled', format: enabledFormat, editable: enabledEditable, hidden: !enabledVisible, width: 100, align: 'center' }, { sourceKey: 'createdAt', label: 'Created at', format: createdAtFormat, editable: createdAtEditable, hidden: !createdAtVisible, width: 140 }, { sourceKey: 'teams', label: 'Teams', format: teamsFormat, editable: teamsEditable, hidden: !teamsVisible, width: 240 }, { sourceKey: 'website', label: 'Website', format: websiteFormat, editable: websiteEditable, hidden: !websiteVisible, width: 240 }, { sourceKey: 'bio', label: 'Bio', format: bioFormat, editable: bioEditable, hidden: !bioVisible }, { sourceKey: 'progress', label: 'Progress', format: progressFormat, editable: progressEditable, hidden: !progressVisible, width: 180, align: 'center' }],
      columnOrdering: [columnOrder1, columnOrder2, columnOrder3, columnOrder4, columnOrder5, columnOrder6, columnOrder7, columnOrder8].filter((item) => item !== 'none') as string[],
      groupByColumns: groupByColumns === 'none' ? [] : [groupByColumns],
      allowGroupReorder,
      allowCrossGroupDrag,
      multiSelectEnabled,
      editable,
      showSavePrompt,
      saveVisible,
      loading,
      addRowPosition,
      rowHeight,
      theme: theme as ThemeTokens,
      themeStyles,
      disableEdits,
      disableSave,
      disableReorder,
      disableAddRow,
      emptyMessage,
    },
    outputs: {
      setSelectedRow,
      setSelectedRows,
      setSelectedRowKey,
      setSelectedRowKeys,
      setSelectedDataIndex,
      setSelectedDataIndexes,
      setSelectedDisplayIndex,
      setSelectedDisplayIndexes,
      setSelectedCell,
      setOrderedRows,
      setOrderedRowKeys,
      setReorderChangeset,
      setChangesetArray,
      setChangesetObject,
      setNewRows,
      setIsDirty,
      setIsLoading,
      setEventContext,
    },
    events: {
      rowClick,
      doubleClickRow,
      selectRow,
      deselectRow,
      changeRowSelection,
      clickCell,
      changeCell,
      clickAction,
      clickToolbar,
      rowReorderStart,
      rowReorder,
      rowReorderCancel,
      save,
      cancel,
      expandRow,
      focus,
      blur,
      change,
    },
  };
};
*/

const DEFAULT_SAMPLE_ROWS = [{ id: 0, email: 'chic.footitt@yahoo.com', role: 'Viewer', enabled: true, createdAt: '2023-01-16', teams: ['Workplace', 'Infrastructure'], website: 'https://chic.footitt.com', bio: 'Nulla sit amet nibh at augue facilisis viverra quis id dui.' }, { id: 1, email: 'kentonworling@icloud.com', role: 'Viewer', enabled: false, createdAt: '2021-12-24', teams: ['Workplace'], website: 'https://kenton.worling.com', bio: 'Duis viverra elementum ante, placerat sollicitudin ipsum laoreet nec.' }, { id: 2, email: 'efender@outlook.com', role: 'Editor', enabled: true, createdAt: '2022-01-03', teams: ['Product', 'Sales'], website: 'https://evelina.fender.com', bio: 'Donec in lorem a dolor placerat gravida.' }, { id: 3, email: 'lexisspeers@icloud.com', role: 'Admin', enabled: true, createdAt: '2022-12-13', teams: ['Infrastructure', 'Design'], website: 'https://lexis.speers.com', bio: 'Suspendisse et lacus augue. Donec in lorem a dolor placerat gravida.' }, { id: 4, email: 'kenton.antonioni@icloud.com', role: 'Admin', enabled: true, createdAt: '2022-04-15', teams: ['Success', 'Recruiting', 'Data'], website: 'https://kenton.antonioni.com', bio: 'Etiam bibendum auctor aliquet. Nullam mattis ultricies metus.' }, { id: 5, email: 'nanonstit@gmail.com', role: 'Editor', enabled: false, createdAt: '2022-10-14', teams: ['Data'], website: 'https://nanon.stit.com', bio: 'Sed eu mollis felis. Nulla sit amet augue facilisis viverra.' }, { id: 6, email: 'shaylah.aynscombe@outlook.com', role: 'Viewer', enabled: true, createdAt: '2022-01-16', teams: ['Customer Success'], website: 'https://shaylah.aynscombe.com', bio: 'Phasellus bibendum luctus dignissim. Donec in lorem a dolor placerat gravida.' }, { id: 7, email: 'lscad@gmail.com', role: 'Editor', enabled: true, createdAt: '2022-01-03', teams: ['Product'], website: 'https://lexis.scad.com', bio: 'Nulla sit amet augue facilisis viverra quis id dui.' }, { id: 8, email: 'jspeers@outlook.com', role: 'Editor', enabled: true, createdAt: '2022-08-14', teams: ['Product', 'Design'], website: 'https://joan.speers.com', bio: 'Proin scelerisque molestie lacinia.' }, { id: 9, email: 'c.anstey@yahoo.com', role: 'Admin', enabled: false, createdAt: '2023-03-21', teams: ['Infrastructure'], website: 'https://cassandre.anstey.com', bio: 'Vivamus sit amet metus velit. Lorem ipsum dolor sit amet.' }, { id: 10, email: 'amberlyfender@outlook.com', role: 'Editor', enabled: true, createdAt: '2022-11-02', teams: ['Product'], website: 'https://amberly.fender.com', bio: 'Donec in lorem a dolor placerat gravida.' }, { id: 11, email: 'd.scad@outlook.com', role: 'Admin', enabled: true, createdAt: '2022-06-30', teams: ['Security'], website: 'https://di.scad.com', bio: 'Ut ullamcorper gravida pretium. Suspendisse et lacus augue.' }];
const DEFAULT_SAMPLE_COLUMNS: TableColumn[] = [{ sourceKey: 'email', label: 'Email', format: 'email', editable: true, width: 260 }, { sourceKey: 'role', label: 'Role', format: 'tag', editable: true, width: 110 }, { sourceKey: 'enabled', label: 'Enabled', format: 'boolean', editable: true, width: 100, align: 'center' }, { sourceKey: 'createdAt', label: 'Created at', format: 'date', editable: true, width: 140 }, { sourceKey: 'teams', label: 'Teams', format: 'multiple tags', editable: true, width: 240 }, { sourceKey: 'website', label: 'Website', format: 'link', editable: true, width: 240 }, { sourceKey: 'bio', label: 'Bio', format: 'html', editable: true }, { sourceKey: 'progress', label: 'Progress', format: 'progress', editable: true, width: 180, align: 'center' }];

const useTableState = () => {
  const [dataSource] = Retool.useStateArray({ name: 'dataSource', initialValue: [{ id: 0, email: 'chic.footitt@yahoo.com', role: 'Viewer', enabled: true, createdAt: '2023-01-16', teams: ['Workplace', 'Infrastructure'], website: 'https://chic.footitt.com', bio: 'Nulla sit amet nibh at augue facilisis viverra quis id dui.' }, { id: 1, email: 'kentonworling@icloud.com', role: 'Viewer', enabled: false, createdAt: '2021-12-24', teams: ['Workplace'], website: 'https://kenton.worling.com', bio: 'Duis viverra elementum ante, placerat sollicitudin ipsum laoreet nec.' }, { id: 2, email: 'efender@outlook.com', role: 'Editor', enabled: true, createdAt: '2022-01-03', teams: ['Product', 'Sales'], website: 'https://evelina.fender.com', bio: 'Donec in lorem a dolor placerat gravida.' }, { id: 3, email: 'lexisspeers@icloud.com', role: 'Admin', enabled: true, createdAt: '2022-12-13', teams: ['Infrastructure', 'Design'], website: 'https://lexis.speers.com', bio: 'Suspendisse et lacus augue. Donec in lorem a dolor placerat gravida.' }, { id: 4, email: 'kenton.antonioni@icloud.com', role: 'Admin', enabled: true, createdAt: '2022-04-15', teams: ['Success', 'Recruiting', 'Data'], website: 'https://kenton.antonioni.com', bio: 'Etiam bibendum auctor aliquet. Nullam mattis ultricies metus.' }, { id: 5, email: 'nanonstit@gmail.com', role: 'Editor', enabled: false, createdAt: '2022-10-14', teams: ['Data'], website: 'https://nanon.stit.com', bio: 'Sed eu mollis felis. Nulla sit amet augue facilisis viverra.' }, { id: 6, email: 'shaylah.aynscombe@outlook.com', role: 'Viewer', enabled: true, createdAt: '2022-01-16', teams: ['Customer Success'], website: 'https://shaylah.aynscombe.com', bio: 'Phasellus bibendum luctus dignissim. Donec in lorem a dolor placerat gravida.' }, { id: 7, email: 'lscad@gmail.com', role: 'Editor', enabled: true, createdAt: '2022-01-03', teams: ['Product'], website: 'https://lexis.scad.com', bio: 'Nulla sit amet augue facilisis viverra quis id dui.' }, { id: 8, email: 'jspeers@outlook.com', role: 'Editor', enabled: true, createdAt: '2022-08-14', teams: ['Product', 'Design'], website: 'https://joan.speers.com', bio: 'Proin scelerisque molestie lacinia.' }, { id: 9, email: 'c.anstey@yahoo.com', role: 'Admin', enabled: false, createdAt: '2023-03-21', teams: ['Infrastructure'], website: 'https://cassandre.anstey.com', bio: 'Vivamus sit amet metus velit. Lorem ipsum dolor sit amet.' }, { id: 10, email: 'amberlyfender@outlook.com', role: 'Editor', enabled: true, createdAt: '2022-11-02', teams: ['Product'], website: 'https://amberly.fender.com', bio: 'Donec in lorem a dolor placerat gravida.' }, { id: 11, email: 'd.scad@outlook.com', role: 'Admin', enabled: true, createdAt: '2022-06-30', teams: ['Security'], website: 'https://di.scad.com', bio: 'Ut ullamcorper gravida pretium. Suspendisse et lacus augue.' }], inspector: 'text', label: 'Data Source', description: 'Array of row objects. Leave the sample data or bind a query result, for example `{{query.data}}`.' });
  const [primaryKey] = Retool.useStateEnumeration({ name: 'primaryKey', enumDefinition: ['id', 'email', 'role'], initialValue: 'id', inspector: 'select', label: 'Primary Key', description: 'Unique field used to identify rows across edits and reorder. Example: `id`, `uuid`, or `user_id`.' });
  const [indexColumn] = Retool.useStateEnumeration({ name: 'indexColumn', enumDefinition: ['none', 'order', 'sortOrder'], initialValue: 'none', inspector: 'select', label: 'Index Column', description: 'Optional order field to write back row position. Choose `none` if you do not want a persisted order field.' });
  const [columnsJson] = Retool.useStateArray({ name: 'columnsJson', initialValue: [{ sourceKey: 'email', label: 'Email', format: 'email', editable: true, width: 260 }, { sourceKey: 'role', label: 'Role', format: 'tag', editable: true, width: 110 }, { sourceKey: 'enabled', label: 'Enabled', format: 'boolean', editable: true, width: 100, align: 'center' }, { sourceKey: 'createdAt', label: 'Created at', format: 'date', editable: true, width: 140 }, { sourceKey: 'teams', label: 'Teams', format: 'multiple tags', editable: true, width: 240 }, { sourceKey: 'website', label: 'Website', format: 'link', editable: true, width: 240 }, { sourceKey: 'bio', label: 'Bio', format: 'html', editable: true }, { sourceKey: 'progress', label: 'Progress', format: 'progress', editable: true, width: 180, align: 'center' }], inspector: 'text', label: 'Columns JSON', description: 'Array of column definitions. Supports `width`, `editable`, `hidden`, `resizable`, and formats like `progress`, `markdown`, and `html`.' });
  const [columnOrderingJson] = Retool.useStateArray({ name: 'columnOrderingJson', initialValue: ['email', 'role', 'enabled', 'createdAt', 'teams', 'website', 'bio', 'progress'], inspector: 'text', label: 'Column Ordering JSON', description: 'Array of `sourceKey` values in the order they should display.' });
  const [groupByColumnsJson] = Retool.useStateArray({ name: 'groupByColumnsJson', initialValue: [], inspector: 'text', label: 'Group By JSON', description: 'Array of fields used to group rows. Use `[]` for no grouping.' });
  const [allowGroupReorder] = Retool.useStateBoolean({ name: 'allowGroupReorder', initialValue: false, inspector: 'checkbox', label: 'Allow Group Reorder', description: 'Shows a drag handle on each group header so grouped sections can be reordered.' });
  const [allowCrossGroupDrag] = Retool.useStateBoolean({ name: 'allowCrossGroupDrag', initialValue: true, inspector: 'checkbox', label: 'Allow Cross Group Drag', description: 'If enabled, dragging a row into another group updates the grouped field value.' });
  const [multiSelectEnabled] = Retool.useStateBoolean({ name: 'multiSelectEnabled', initialValue: true, inspector: 'checkbox', label: 'Multi Select', description: 'Adds row checkboxes so selected rows can move as a block.' });
  const [editable] = Retool.useStateBoolean({ name: 'editable', initialValue: true, inspector: 'checkbox', label: 'Editable', description: 'Master switch for inline editing. Turn this off to make the whole table read-only.' });
  const [showSavePrompt] = Retool.useStateBoolean({ name: 'showSavePrompt', initialValue: true, inspector: 'checkbox', label: 'Show Save Prompt', description: 'Shows the unsaved changes badge when the table is dirty.' });
  const [saveVisible] = Retool.useStateBoolean({ name: 'saveVisible', initialValue: true, inspector: 'checkbox', label: 'Save Visible', description: 'Shows the save action in the toolbar.' });
  const [showHeader] = Retool.useStateBoolean({ name: 'showHeader', initialValue: true, inspector: 'checkbox', label: 'Show Header', description: 'Shows the table column headers.' });
  const [showTitle] = Retool.useStateBoolean({ name: 'showTitle', initialValue: true, inspector: 'checkbox', label: 'Show Title', description: 'Shows the title text in the top bar.' });
  const [stickyHeader] = Retool.useStateBoolean({ name: 'stickyHeader', initialValue: true, inspector: 'checkbox', label: 'Sticky Header', description: 'Keeps the column headers pinned while scrolling.' });
  const [loading] = Retool.useStateBoolean({ name: 'loading', initialValue: false, inspector: 'checkbox', label: 'Loading', description: 'Displays loading treatment and blocks edits/reordering.' });
  const [addRowPosition] = Retool.useStateEnumeration({ name: 'addRowPosition', enumDefinition: ['top', 'bottom'], initialValue: 'bottom', inspector: 'segmented', label: 'Button Position', description: 'Where the add-row icon buttons appear: toolbar top or below the table.' });
  const [rowHeight] = Retool.useStateEnumeration({ name: 'rowHeight', enumDefinition: ['extra small', 'small', 'medium', 'large', 'dynamic'], initialValue: 'small', inspector: 'select', label: 'Row Height', description: 'Controls row density. Use `dynamic` for taller, more wrapped rows.' });
  const [theme] = Retool.useStateObject({ name: 'theme', initialValue: {}, inspector: 'text', label: 'Theme', description: 'Optional Retool theme token object. Normally bind this to `{{ theme }}`.' });
  const [themeStyles] = Retool.useStateObject({ name: 'themeStyles', initialValue: {}, inspector: 'text', label: 'Theme Styles', description: 'CSS-style overrides for the component shell.' });
  const [disableEdits] = Retool.useStateBoolean({ name: 'disableEdits', initialValue: false, inspector: 'checkbox', label: 'Disable Edits', description: 'Temporary lock for edits while leaving the table otherwise interactive.' });
  const [disableSave] = Retool.useStateBoolean({ name: 'disableSave', initialValue: false, inspector: 'checkbox', label: 'Disable Save', description: 'Hides or disables the save action.' });
  const [disableReorder] = Retool.useStateBoolean({ name: 'disableReorder', initialValue: false, inspector: 'checkbox', label: 'Disable Reorder', description: 'Prevents drag-to-reorder interactions.' });
  const [disableAddRow] = Retool.useStateBoolean({ name: 'disableAddRow', initialValue: false, inspector: 'checkbox', label: 'Disable Add Row', description: 'Removes the add-row actions from the UI.' });
  const [title] = Retool.useStateString({ name: 'title', initialValue: 'Draggable Table', inspector: 'text', label: 'Title', description: 'Title text shown in the top bar.' });
  const [emptyMessage] = Retool.useStateString({ name: 'emptyMessage', initialValue: 'No rows to display', inspector: 'text', label: 'Empty Message', description: 'Text shown when the table has no rows.' });

  const [selectedRow, setSelectedRow] = Retool.useStateObject({ name: 'selectedRow', initialValue: {}, inspector: 'hidden', label: 'Selected Row' });
  const [selectedRows, setSelectedRows] = Retool.useStateArray({ name: 'selectedRows', initialValue: [], inspector: 'hidden', label: 'Selected Rows' });
  const [selectedRowKey, setSelectedRowKey] = Retool.useStateString({ name: 'selectedRowKey', initialValue: '', inspector: 'hidden', label: 'Selected Row Key' });
  const [selectedRowKeys, setSelectedRowKeys] = Retool.useStateArray({ name: 'selectedRowKeys', initialValue: [], inspector: 'hidden', label: 'Selected Row Keys' });
  const [selectedDataIndex, setSelectedDataIndex] = Retool.useStateNumber({ name: 'selectedDataIndex', initialValue: -1, inspector: 'hidden', label: 'Selected Data Index' });
  const [selectedDataIndexes, setSelectedDataIndexes] = Retool.useStateArray({ name: 'selectedDataIndexes', initialValue: [], inspector: 'hidden', label: 'Selected Data Indexes' });
  const [selectedDisplayIndex, setSelectedDisplayIndex] = Retool.useStateNumber({ name: 'selectedDisplayIndex', initialValue: -1, inspector: 'hidden', label: 'Selected Display Index' });
  const [selectedDisplayIndexes, setSelectedDisplayIndexes] = Retool.useStateArray({ name: 'selectedDisplayIndexes', initialValue: [], inspector: 'hidden', label: 'Selected Display Indexes' });
  const [selectedCell, setSelectedCell] = Retool.useStateObject({ name: 'selectedCell', initialValue: {}, inspector: 'hidden', label: 'Selected Cell' });
  const [orderedRows, setOrderedRows] = Retool.useStateArray({ name: 'orderedRows', initialValue: [], inspector: 'hidden', label: 'Ordered Rows' });
  const [orderedRowKeys, setOrderedRowKeys] = Retool.useStateArray({ name: 'orderedRowKeys', initialValue: [], inspector: 'hidden', label: 'Ordered Row Keys' });
  const [reorderChangeset, setReorderChangeset] = Retool.useStateArray({ name: 'reorderChangeset', initialValue: [], inspector: 'hidden', label: 'Reorder Changeset' });
  const [changesetArray, setChangesetArray] = Retool.useStateArray({ name: 'changesetArray', initialValue: [], inspector: 'hidden', label: 'Changeset Array' });
  const [changesetObject, setChangesetObject] = Retool.useStateString({ name: 'changesetObject', initialValue: '{}', inspector: 'hidden', label: 'Changeset Object' });
  const [newRows, setNewRows] = Retool.useStateArray({ name: 'newRows', initialValue: [], inspector: 'hidden', label: 'New Rows' });
  const [isDirty, setIsDirty] = Retool.useStateBoolean({ name: 'isDirty', initialValue: false, inspector: 'hidden', label: 'Is Dirty' });
  const [isLoading, setIsLoading] = Retool.useStateBoolean({ name: 'isLoading', initialValue: false, inspector: 'hidden', label: 'Is Loading' });
  const [eventContext, setEventContext] = Retool.useStateString({ name: 'eventContext', initialValue: '', inspector: 'hidden', label: 'Event Context' });

  const rowClick = Retool.useEventCallback({ name: 'rowClick' });
  const doubleClickRow = Retool.useEventCallback({ name: 'doubleClickRow' });
  const selectRow = Retool.useEventCallback({ name: 'selectRow' });
  const deselectRow = Retool.useEventCallback({ name: 'deselectRow' });
  const changeRowSelection = Retool.useEventCallback({ name: 'changeRowSelection' });
  const clickCell = Retool.useEventCallback({ name: 'clickCell' });
  const changeCell = Retool.useEventCallback({ name: 'changeCell' });
  const clickAction = Retool.useEventCallback({ name: 'clickAction' });
  const clickToolbar = Retool.useEventCallback({ name: 'clickToolbar' });
  const rowReorderStart = Retool.useEventCallback({ name: 'rowReorderStart' });
  const rowReorder = Retool.useEventCallback({ name: 'rowReorder' });
  const rowReorderCancel = Retool.useEventCallback({ name: 'rowReorderCancel' });
  const save = Retool.useEventCallback({ name: 'save' });
  const cancel = Retool.useEventCallback({ name: 'cancel' });
  const expandRow = Retool.useEventCallback({ name: 'expandRow' });
  const focus = Retool.useEventCallback({ name: 'focus' });
  const blur = Retool.useEventCallback({ name: 'blur' });
  const change = Retool.useEventCallback({ name: 'change' });

  return {
    inputs: {
      dataSource: (dataSource as RowData[]) ?? [],
      primaryKey,
      indexColumn: indexColumn === 'none' ? '' : indexColumn,
      columns: (columnsJson as TableColumn[]) ?? DEFAULT_SAMPLE_COLUMNS,
      columnOrdering: (columnOrderingJson as string[]) ?? ['email', 'role', 'enabled', 'createdAt', 'teams', 'website', 'bio'],
      groupByColumns: (groupByColumnsJson as string[]) ?? [],
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
      theme: theme as ThemeTokens,
      themeStyles,
      disableEdits,
      disableSave,
      disableReorder,
      disableAddRow,
      title,
      emptyMessage,
    },
    outputs: {
      setSelectedRow,
      setSelectedRows,
      setSelectedRowKey,
      setSelectedRowKeys,
      setSelectedDataIndex,
      setSelectedDataIndexes,
      setSelectedDisplayIndex,
      setSelectedDisplayIndexes,
      setSelectedCell,
      setOrderedRows,
      setOrderedRowKeys,
      setReorderChangeset,
      setChangesetArray,
      setChangesetObject,
      setNewRows,
      setIsDirty,
      setIsLoading,
      setEventContext,
    },
    events: { rowClick, doubleClickRow, selectRow, deselectRow, changeRowSelection, clickCell, changeCell, clickAction, clickToolbar, rowReorderStart, rowReorder, rowReorderCancel, save, cancel, expandRow, focus, blur, change },
  };
};

export const RetoolDraggableTable: React.FC = () => {
  Retool.useComponentSettings({ defaultWidth: 12, defaultHeight: 54 });
  const { inputs, outputs, events } = useTableState();

  return (
    <DraggableTable
      {...inputs}
      onModelChange={(model) => {
        outputs.setSelectedRow(model.selectedRow ?? {});
        outputs.setSelectedRows(model.selectedRows);
        outputs.setSelectedRowKey(model.selectedRowKey ?? '');
        outputs.setSelectedRowKeys(model.selectedRowKeys);
        outputs.setSelectedDataIndex(model.selectedDataIndex ?? -1);
        outputs.setSelectedDataIndexes(model.selectedDataIndexes);
        outputs.setSelectedDisplayIndex(model.selectedDisplayIndex ?? -1);
        outputs.setSelectedDisplayIndexes(model.selectedDisplayIndexes);
        outputs.setSelectedCell(model.selectedCell ?? {});
        outputs.setOrderedRows(model.orderedRows);
        outputs.setOrderedRowKeys(model.orderedRowKeys);
        outputs.setReorderChangeset(model.reorderChangeset);
        outputs.setChangesetArray(model.changesetArray);
        outputs.setChangesetObject(JSON.stringify(model.changesetObject));
        outputs.setNewRows(model.newRows);
        outputs.setIsDirty(model.isDirty);
        outputs.setIsLoading(model.isLoading);
      }}
      onRowClick={(rowKey, row) => { outputs.setEventContext(JSON.stringify({ type: 'rowClick', rowKey, row })); events.rowClick(); }}
      onDoubleClickRow={(rowKey, row) => { outputs.setEventContext(JSON.stringify({ type: 'doubleClickRow', rowKey, row })); events.doubleClickRow(); }}
      onSelectRow={(rowKey, row) => { outputs.setEventContext(JSON.stringify({ type: 'selectRow', rowKey, row })); events.selectRow(); }}
      onDeselectRow={(rowKey, row) => { outputs.setEventContext(JSON.stringify({ type: 'deselectRow', rowKey, row })); events.deselectRow(); }}
      onChangeRowSelection={(rowKeys) => { outputs.setEventContext(JSON.stringify({ type: 'changeRowSelection', rowKeys })); events.changeRowSelection(); }}
      onClickCell={(cell) => { outputs.setEventContext(JSON.stringify({ type: 'clickCell', cell })); events.clickCell(); }}
      onChangeCell={(cell) => { outputs.setEventContext(JSON.stringify({ type: 'changeCell', cell })); events.changeCell(); }}
      onClickAction={(action) => { outputs.setEventContext(JSON.stringify({ type: 'clickAction', action })); events.clickAction(); }}
      onClickToolbar={(action) => { outputs.setEventContext(JSON.stringify({ type: 'clickToolbar', action })); events.clickToolbar(); }}
      onRowReorderStart={(model) => { outputs.setEventContext(JSON.stringify({ type: 'rowReorderStart', model })); events.rowReorderStart(); }}
      onRowReorderCancel={() => { outputs.setEventContext(JSON.stringify({ type: 'rowReorderCancel' })); events.rowReorderCancel(); }}
      onFocus={() => { outputs.setEventContext(JSON.stringify({ type: 'focus' })); events.focus(); }}
      onBlur={() => { outputs.setEventContext(JSON.stringify({ type: 'blur' })); events.blur(); }}
      onChange={(model) => { outputs.setEventContext(JSON.stringify({ type: 'change', model })); events.change(); }}
      onRowReorder={(model) => { outputs.setEventContext(JSON.stringify({ type: 'rowReorder', ...model })); events.rowReorder(); }}
      onSave={async (model) => { outputs.setEventContext(JSON.stringify({ type: 'save', ...model })); events.save(); }}
      onCancel={() => { outputs.setEventContext(JSON.stringify({ type: 'cancel' })); events.cancel(); }}
    />
  );
};
