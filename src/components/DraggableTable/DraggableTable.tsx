import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IconArrowBackUp, IconDeviceFloppy, IconRowInsertBottom, IconRowInsertTop } from '@tabler/icons-react';
import type { DraggableTableProps, RowData, SelectedCell, TableColumn, TableModel } from '../../types';
import { DEFAULT_THEME, buildReorderChangeset, chipColor, chipTextColor, cloneRows, createRowKey, fontFamilyValue, fontSizeValue, fontWeightValue, formatCellText, hexToRgba, initials, isEditableFormat, moveKeys } from '../../lib/tableUtils';
import styles from './DraggableTable.module.css';

type DragState = {
  rowKey: string;
  startX: number;
  startY: number;
  active: boolean;
  targetKey: string | null;
  insertBefore: boolean;
} | null;

type RenderRow = RowData & { __key: string };
type ActiveEditor = { rowKey: string; columnKey: string; x: number; y: number; rect: DOMRect } | null;
type GroupDragState = {
  key: string;
  startY: number;
  active: boolean;
  targetKey: string | null;
  insertBefore: boolean;
  invalid: boolean;
} | null;
type EditorPosition = { left: number; top: number };
type DragTarget = { key: string | null; before: boolean; groupKey?: string | null; groupPath?: string[] | null; invalid: boolean } | null;
type GroupNode = {
  key: string;
  label: string;
  path: string[];
  rows: RenderRow[];
  children: GroupNode[];
  depth: number;
};
type GroupOrderMap = Record<string, string[]>;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const ROOT_GROUP_KEY = '__root__';
const groupKeyFromPath = (path: string[]) => path.join('::');
const groupPathForRow = (row: RowData, fields: string[]) => fields.map((field) => String(row[field] ?? 'Ungrouped'));
const parentGroupKeyFromPath = (path: string[]) => path.length ? groupKeyFromPath(path) : ROOT_GROUP_KEY;
const samePath = (left: string[] | null, right: string[] | null) => Boolean(left && right && left.length === right.length && left.every((value, index) => value === right[index]));
const countGroupRows = (group: GroupNode): number => group.rows.length + group.children.reduce((sum, child) => sum + countGroupRows(child), 0);
const flattenGroupRowKeys = (group: GroupNode): string[] => [...group.rows.map((row) => row.__key), ...group.children.flatMap((child) => flattenGroupRowKeys(child))];
const flattenGroups = (groups: GroupNode[]): GroupNode[] => groups.flatMap((group) => [group, ...flattenGroups(group.children)]);
const flattenGroupedRowKeys = (groups: GroupNode[]): string[] => groups.flatMap((group) => flattenGroupRowKeys(group));
const mergeGroupOrdersFromRows = (current: GroupOrderMap, rows: RowData[], groupByColumns: string[]): GroupOrderMap => {
  if (!groupByColumns.length) return {};
  const next = { ...current };
  rows.forEach((row) => {
    const path: string[] = [];
    groupByColumns.forEach((field) => {
      const value = String(row[field] ?? 'Ungrouped');
      const parentKey = parentGroupKeyFromPath(path);
      const existing = next[parentKey] ?? [];
      if (!existing.includes(value)) next[parentKey] = [...existing, value];
      path.push(value);
    });
  });
  return next;
};

const moveGroupLabel = (orderedLabels: string[], movingLabel: string, targetLabel: string, insertBefore: boolean) => {
  const remaining = orderedLabels.filter((label) => label !== movingLabel);
  let targetIndex = remaining.indexOf(targetLabel);
  if (targetIndex < 0) targetIndex = remaining.length;
  if (!insertBefore) targetIndex += 1;
  remaining.splice(targetIndex, 0, movingLabel);
  return remaining;
};

const isTextAreaFormat = (format?: string) => new Set(['string', 'markdown', 'json']).has((format ?? 'string').toLowerCase());

const estimateColumnWidth = (rows: RowData[], column: TableColumn) => {
  const labelWidth = (column.label ?? column.sourceKey).length * 9;
  const valueWidth = rows.reduce((max, row) => {
    const cell = formatCellText(row[column.sourceKey], column);
    return Math.max(max, cell.length * 7.5);
  }, 0);
  return clamp(Math.round(Math.max(labelWidth, valueWidth) + 36), 100, 420);
};

const ToolbarIcon = ({ kind }: { kind: 'save' | 'cancel' | 'add-top' | 'add-bottom' | 'add-after' }) => {
  const props = { 'aria-hidden': true, size: 16, stroke: 1.8 } as const;
  if (kind === 'save') return <IconDeviceFloppy {...props} />;
  if (kind === 'cancel') return <IconArrowBackUp {...props} />;
  if (kind === 'add-top') return <IconRowInsertTop {...props} />;
  if (kind === 'add-bottom') return <IconRowInsertBottom {...props} />;
  return <IconRowInsertBottom {...props} />;
};

const inputValueFor = (value: unknown, column: TableColumn) => {
  const format = (column.format ?? 'string').toLowerCase();
  if (format === 'boolean') return String(Boolean(value));
  if (Array.isArray(value)) return value.join(', ');
  return value === null || value === undefined ? '' : String(value);
};

const parseInputValue = (value: string, column: TableColumn) => {
  const format = (column.format ?? 'string').toLowerCase();
  if (format === 'number' || format === 'progress') return value === '' ? '' : Number(value);
  if (format === 'boolean') return value === 'true';
  if (format === 'multiple tags') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return value;
};

const deriveColumns = (rows: RowData[], columns?: TableColumn[], columnOrdering?: string[]) => {
  if (columns?.length) {
    const byKey = new Map(columns.map((column) => [column.sourceKey, column]));
    const ordering = columnOrdering?.length ? columnOrdering : columns.map((column) => column.sourceKey);
    return ordering.map((key) => byKey.get(key)).filter(Boolean) as TableColumn[];
  }

  const sample = rows[0] ?? {};
  return Object.keys(sample)
    .filter((key) => !key.startsWith('__'))
    .map((key) => ({ sourceKey: key, label: key, format: 'string', editable: true })) as TableColumn[];
};

const buildGroupedTree = (rows: RenderRow[], groupByColumns: string[], groupOrders: GroupOrderMap, depth = 0, parentPath: string[] = []): GroupNode[] => {
  if (!groupByColumns.length) return [];
  const field = groupByColumns[depth]!;
  const groups = new Map<string, RenderRow[]>();
  rows.forEach((row) => {
    const value = String(row[field] ?? 'Ungrouped');
    if (!groups.has(value)) groups.set(value, []);
    groups.get(value)!.push(row);
  });
  const parentKey = parentGroupKeyFromPath(parentPath);
  const orderedKeys = [...(groupOrders[parentKey] ?? []), ...groups.keys()].filter((value, index, values) => values.indexOf(value) === index);
  return orderedKeys.map((value) => {
    const path = [...parentPath, value];
    const groupRows = groups.get(value) ?? [];
    const children = depth < groupByColumns.length - 1 ? buildGroupedTree(groupRows, groupByColumns, groupOrders, depth + 1, path) : [];
    return {
      key: groupKeyFromPath(path),
      label: value,
      path,
      rows: depth === groupByColumns.length - 1 ? groupRows : [],
      children,
      depth,
    };
  });
};

export const DraggableTable: React.FC<DraggableTableProps> = ({
  dataSource,
  primaryKey = 'id',
  indexColumn,
  columns,
  columnOrdering,
  groupByColumns = [],
  allowCrossGroupDrag = false,
  multiSelectEnabled = false,
  editable = true,
  showSavePrompt = true,
  saveVisible = true,
  showHeader = true,
  showTitle = true,
  stickyHeader = true,
  loading = false,
  addRowPosition = 'bottom',
  rowHeight = 'small',
  theme,
  themeStyles,
  allowGroupReorder = false,
  disableEdits = false,
  disableSave = false,
  disableReorder = false,
  disableAddRow = false,
  emptyMessage = 'No rows to display',
  title = 'Draggable Table',
  onModelChange,
  onRowClick,
  onDoubleClickRow,
  onSelectRow,
  onDeselectRow,
  onChangeRowSelection,
  onClickCell,
  onChangeCell,
  onClickAction,
  onClickToolbar,
  onRowReorderStart,
  onRowReorderCancel,
  onFocus,
  onBlur,
  onChange,
  onRowReorder,
  onSave,
  onCancel,
}) => {
  const initialRows = useMemo(() => cloneRows(dataSource), [dataSource]);
  const [rowsByKey, setRowsByKey] = useState<Record<string, RowData>>(() => Object.fromEntries(initialRows.map((row, index) => [createRowKey(row, primaryKey, indexColumn, index), { ...row }])))
  const [orderedKeys, setOrderedKeys] = useState<string[]>(() => initialRows.map((row, index) => createRowKey(row, primaryKey, indexColumn, index)));
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [edits, setEdits] = useState<Record<string, Partial<RowData>>>({});
  const [newRows, setNewRows] = useState<RowData[]>([]);
  const [baselineKeys, setBaselineKeys] = useState<string[]>(orderedKeys);
  const [groupOrders, setGroupOrders] = useState<GroupOrderMap>({});
  const [dragState, setDragState] = useState<DragState>(null);
  const [groupDragState, setGroupDragState] = useState<GroupDragState>(null);
  const [dropTarget, setDropTarget] = useState<DragTarget>(null);
  const [activeEditor, setActiveEditor] = useState<ActiveEditor>(null);
  const [editorPosition, setEditorPosition] = useState<EditorPosition | null>(null);
  const [editorText, setEditorText] = useState('');
  const [editorMultiText, setEditorMultiText] = useState('');
  const [editorSelections, setEditorSelections] = useState<string[]>([]);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [internalLoading, setInternalLoading] = useState(false);
  const dragCleanup = useRef<(() => void) | null>(null);
  const tableRef = useRef<HTMLDivElement | null>(null);
  const editorPopoverRef = useRef<HTMLDivElement | null>(null);
  const hasMountedRef = useRef(false);
  const selectionMountedRef = useRef(false);

  useEffect(() => {
    const nextKeys = initialRows.map((row, index) => createRowKey(row, primaryKey, indexColumn, index));
    const nextMap = Object.fromEntries(initialRows.map((row, index) => [nextKeys[index]!, { ...row }]));
    setRowsByKey((current) => {
      const merged: Record<string, RowData> = {};
      for (const key of nextKeys) merged[key] = current[key] ? { ...nextMap[key], ...current[key] } : nextMap[key]!;
      Object.entries(current).forEach(([key, row]) => {
        if (!merged[key]) merged[key] = row;
      });
      return merged;
    });
    setOrderedKeys((current) => {
      const preserved = current.filter((key) => nextKeys.includes(key) || !(key in nextMap));
      const appended = nextKeys.filter((key) => !preserved.includes(key));
      return preserved.length ? [...preserved, ...appended] : nextKeys;
    });
    setBaselineKeys((current) => current.length ? current : nextKeys);
  }, [initialRows, primaryKey, indexColumn]);

  useEffect(() => {
    if (!groupByColumns.length) {
      setGroupOrders({});
      return;
    }
    setGroupOrders((current) => mergeGroupOrdersFromRows(current, initialRows, groupByColumns));
  }, [groupByColumns, initialRows]);

  useEffect(() => {
    if (!groupByColumns.length) return;
    setGroupOrders((current) => mergeGroupOrdersFromRows(current, Object.values(rowsByKey), groupByColumns));
  }, [groupByColumns, rowsByKey]);

  const allColumns = useMemo(() => deriveColumns(Object.values(rowsByKey), columns, columnOrdering), [rowsByKey, columns, columnOrdering]);
  const visibleColumns = useMemo(() => allColumns.filter((column) => !column.hidden), [allColumns]);
  const initialGroupOrders = useMemo(() => mergeGroupOrdersFromRows({}, initialRows, groupByColumns), [groupByColumns, initialRows]);

  useEffect(() => {
    setColumnWidths((current) => {
      const next = { ...current };
      allColumns.forEach((column) => {
        if (column.width && !next[column.sourceKey]) next[column.sourceKey] = column.width;
        if (!column.width && column.resizable !== false && !next[column.sourceKey]) next[column.sourceKey] = estimateColumnWidth(Object.values(rowsByKey), column);
      });
      return next;
    });
  }, [allColumns, rowsByKey]);

  const orderedRows = useMemo<RenderRow[]>(() => orderedKeys.map((key) => ({ __key: key, ...(rowsByKey[key] ?? {}) })), [orderedKeys, rowsByKey]);
  const groupedRows = useMemo<GroupNode[]>(() => {
    if (!groupByColumns.length) return [];
    return buildGroupedTree(orderedRows, groupByColumns, groupOrders);
  }, [groupByColumns, orderedRows, groupOrders]);
  const groupsByKey = useMemo(() => new Map(flattenGroups(groupedRows).map((group) => [group.key, group])), [groupedRows]);

  const reorderChangeset = useMemo(() => buildReorderChangeset(orderedKeys, baselineKeys), [orderedKeys, baselineKeys]);
  const changesetArray = useMemo(() => Object.entries(edits).map(([key, changes]) => ({ key, changes })), [edits]);
  const changesetObject = useMemo(() => edits, [edits]);
  const selectedRows = useMemo<RenderRow[]>(() => selectedKeys.map((key) => ({ __key: key, ...(rowsByKey[key] ?? {}) })), [selectedKeys, rowsByKey]);
  const selectedRow = selectedRows[0] ?? null;
  const isDirty = changesetArray.length > 0 || reorderChangeset.length > 0 || newRows.length > 0;

  const model: TableModel = useMemo(() => ({
    selectedRow,
    selectedRows: selectedRows.map(({ __key, ...row }) => row),
    selectedRowKey: selectedRow?.__key ?? null,
    selectedRowKeys: selectedKeys,
    selectedDataIndex: selectedRow ? (() => {
      const index = dataSource.findIndex((row, itemIndex) => createRowKey(row, primaryKey, indexColumn, itemIndex) === selectedRow.__key);
      return index >= 0 ? index : null;
    })() : null,
    selectedDataIndexes: selectedKeys.map((key) => dataSource.findIndex((row, itemIndex) => createRowKey(row, primaryKey, indexColumn, itemIndex) === key)).filter((index) => index >= 0),
    selectedDisplayIndex: selectedRow ? (() => {
      const index = orderedKeys.indexOf(selectedRow.__key);
      return index >= 0 ? index : null;
    })() : null,
    selectedDisplayIndexes: selectedKeys.map((key) => orderedKeys.indexOf(key)).filter((index) => index >= 0),
    selectedCell,
    orderedRows: orderedRows.map(({ __key, ...row }) => row),
    orderedRowKeys: orderedKeys,
    reorderChangeset,
    changesetArray,
    changesetObject,
    newRows,
    isDirty,
    disableEdits,
    disableSave,
    isLoading: loading || internalLoading,
  }), [changesetArray, changesetObject, dataSource, disableEdits, disableSave, indexColumn, internalLoading, isDirty, loading, newRows, orderedKeys, orderedRows, primaryKey, reorderChangeset, selectedKeys, selectedRow, selectedCell]);

  useEffect(() => {
    onModelChange?.(model);
    if (hasMountedRef.current) onChange?.(model);
    else hasMountedRef.current = true;
  }, [model, onChange, onModelChange]);

  useEffect(() => {
    if (selectionMountedRef.current) onChangeRowSelection?.(selectedKeys);
    else selectionMountedRef.current = true;
  }, [onChangeRowSelection, selectedKeys]);

  const syncRow = (rowKey: string, nextRow: RowData) => {
    setRowsByKey((current) => ({ ...current, [rowKey]: nextRow }));
  };

  const clearDragListeners = () => {
    dragCleanup.current?.();
    dragCleanup.current = null;
  };

  const isInvalidRowDrop = (movingKeys: string[], targetKey: string | null, targetGroupPath?: string[] | null) => {
    if (!groupByColumns.length) return false;
    const movingRows = movingKeys.map((key) => rowsByKey[key]).filter(Boolean) as RowData[];
    const sourceGroups = new Set(movingRows.map((row) => groupKeyFromPath(groupPathForRow(row, groupByColumns))));
    const nextGroup = targetGroupPath ?? (targetKey ? groupPathForRow(rowsByKey[targetKey] ?? {}, groupByColumns) : null);
    if (allowCrossGroupDrag) return false;
    return sourceGroups.size > 1 || (nextGroup !== null && !sourceGroups.has(groupKeyFromPath(nextGroup)));
  };

  useEffect(() => () => clearDragListeners(), []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(`.${styles.editorPopover}`)) return;
      setActiveEditor(null);
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const startDrag = (rowKey: string, event: React.PointerEvent) => {
    if (disableReorder || loading || internalLoading) return;
    if (selectedKeys.length > 0 && !selectedKeys.includes(rowKey)) return;
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const movingKeys = multiSelectEnabled && selectedKeys.includes(rowKey) ? selectedKeys : [rowKey];
    let dropSnapshot: DragTarget = null;
    setDragState({ rowKey, startX, startY, active: false, targetKey: null, insertBefore: true });
    onRowReorderStart?.(model);

    const onMove = (moveEvent: PointerEvent) => {
      setDragState((current) => {
        if (!current) return current;
        const dx = Math.abs(moveEvent.clientX - current.startX);
        const dy = Math.abs(moveEvent.clientY - current.startY);
        const active = current.active || Math.max(dx, dy) > 4;
        const pointerTarget = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY) as HTMLElement | null;
        const targetEl = pointerTarget?.closest?.('[data-row-key]') as HTMLElement | null;
        const emptyGroupEl = pointerTarget?.closest?.('[data-group-drop-zone]') as HTMLElement | null;
        const targetKey = targetEl?.dataset.rowKey ?? null;
        const targetGroupKey = emptyGroupEl?.dataset.groupDropZone ?? null;
        const targetGroupPath = emptyGroupEl?.dataset.groupPath ? JSON.parse(emptyGroupEl.dataset.groupPath) as string[] : (targetKey ? groupPathForRow(rowsByKey[targetKey] ?? {}, groupByColumns) : null);
        const insertBefore = targetEl ? moveEvent.clientY < targetEl.getBoundingClientRect().top + targetEl.getBoundingClientRect().height / 2 : true;
        const invalid = isInvalidRowDrop(movingKeys, targetKey, targetGroupPath);
        dropSnapshot = targetKey || targetGroupKey ? { key: targetKey, before: insertBefore, groupKey: targetGroupKey, groupPath: targetGroupPath, invalid } : null;
        setDropTarget(dropSnapshot);
        return { ...current, active, targetKey, insertBefore };
      });
    };

    const finishDrag = () => {
      clearDragListeners();
      setInternalLoading(false);
      setDropTarget(null);
      setDragState((current) => {
        if (!current?.active) {
          onRowReorderCancel?.();
          return null;
        }
        if (dropSnapshot?.invalid) {
          onRowReorderCancel?.();
          return null;
        }
        if (!current.targetKey && !dropSnapshot?.groupKey) {
          onRowReorderCancel?.();
          return null;
        }
        if (current.targetKey && movingKeys.includes(current.targetKey)) {
          onRowReorderCancel?.();
          return null;
        }
        const targetRow = rowsByKey[current.targetKey];
        const movingRows = movingKeys.map((key) => ({ key, row: rowsByKey[key] })).filter((item) => item.row) as Array<{ key: string; row: RowData }>;
        const nextOrder = current.targetKey ? moveKeys(orderedKeys, movingKeys, current.targetKey, current.insertBefore) : [...orderedKeys.filter((key) => !movingKeys.includes(key)), ...movingKeys];
        setOrderedKeys(nextOrder);
        if (groupByColumns.length && allowCrossGroupDrag) {
          const targetPath = dropSnapshot?.groupPath ?? (targetRow ? groupPathForRow(targetRow, groupByColumns) : null);
          setRowsByKey((currentRows) => {
            const copy = { ...currentRows };
            movingKeys.forEach((key) => {
              const updated = { ...copy[key] };
              groupByColumns.forEach((field, index) => {
                updated[field] = targetPath?.[index] ?? 'Ungrouped';
              });
              copy[key] = updated;
            });
            return copy;
          });
          if (targetPath) {
            setGroupOrders((current) => mergeGroupOrdersFromRows(current, [Object.fromEntries(groupByColumns.map((field, index) => [field, targetPath[index] ?? 'Ungrouped']))], groupByColumns));
          }
        }
        const nextModel = { ...model, orderedRowKeys: nextOrder, reorderChangeset: buildReorderChangeset(nextOrder, baselineKeys) };
        onRowReorder?.(nextModel);
        return null;
      });
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', finishDrag, { once: true });
    window.addEventListener('pointercancel', finishDrag, { once: true });
    dragCleanup.current = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', finishDrag);
      window.removeEventListener('pointercancel', finishDrag);
    };
  };

  const startGroupDrag = (groupKey: string, event: React.PointerEvent) => {
    if (!allowGroupReorder || loading || internalLoading || !groupByColumns.length) return;
    const sourceGroup = groupsByKey.get(groupKey);
    if (!sourceGroup) return;
    event.preventDefault();
    event.stopPropagation();
    setGroupDragState({ key: groupKey, startY: event.clientY, active: false, targetKey: null, insertBefore: true, invalid: false });

    const onMove = (moveEvent: PointerEvent) => {
      setGroupDragState((current) => {
        if (!current) return current;
        const dy = Math.abs(moveEvent.clientY - current.startY);
        const active = current.active || dy > 4;
        const targetEl = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY)?.closest?.('[data-group-key]') as HTMLElement | null;
        const targetKey = targetEl?.dataset.groupKey ?? null;
        const targetGroup = targetKey ? groupsByKey.get(targetKey) : null;
        const insertBefore = targetEl ? moveEvent.clientY < targetEl.getBoundingClientRect().top + targetEl.getBoundingClientRect().height / 2 : true;
        const invalid = Boolean(targetGroup && (targetGroup.depth !== sourceGroup.depth || (!allowCrossGroupDrag && !samePath(sourceGroup.path.slice(0, -1), targetGroup.path.slice(0, -1)))));
        return { ...current, active, targetKey, insertBefore, invalid };
      });
    };

    const finishDrag = () => {
      clearDragListeners();
      setGroupDragState((current) => {
        if (!current?.active || !current.targetKey || current.targetKey === current.key || current.invalid) return null;
        const latestSource = groupsByKey.get(current.key);
        const latestTarget = groupsByKey.get(current.targetKey);
        if (!latestSource || !latestTarget || latestSource.depth !== latestTarget.depth) return null;

        const sourceParentPath = latestSource.path.slice(0, -1);
        const targetParentPath = latestTarget.path.slice(0, -1);
        const sourceParentKey = parentGroupKeyFromPath(sourceParentPath);
        const targetParentKey = parentGroupKeyFromPath(targetParentPath);
        const movingRowKeys = flattenGroupRowKeys(latestSource);
        const siblingOrder = groupOrders[targetParentKey] ?? [];
        const nextTargetOrder = moveGroupLabel(siblingOrder, latestSource.label, latestTarget.label, current.insertBefore);
        const nextGroupOrders: GroupOrderMap = { ...groupOrders, [targetParentKey]: nextTargetOrder };

        if (!samePath(sourceParentPath, targetParentPath) && movingRowKeys.length) {
          setRowsByKey((currentRows) => {
            const copy = { ...currentRows };
            movingRowKeys.forEach((rowKey) => {
              const updated = { ...copy[rowKey] };
              targetParentPath.forEach((value, index) => {
                updated[groupByColumns[index]!] = value;
              });
              copy[rowKey] = updated;
            });
            return copy;
          });
        }

        setGroupOrders(nextGroupOrders);
        const nextRowsByKey = !samePath(sourceParentPath, targetParentPath) && movingRowKeys.length
          ? Object.fromEntries(Object.entries(rowsByKey).map(([rowKey, row]) => {
            if (!movingRowKeys.includes(rowKey)) return [rowKey, row];
            const updated = { ...row };
            targetParentPath.forEach((value, index) => {
              updated[groupByColumns[index]!] = value;
            });
            return [rowKey, updated];
          })) as Record<string, RowData>
          : rowsByKey;
        const nextOrderedRows = orderedKeys.map((key) => ({ __key: key, ...(nextRowsByKey[key] ?? {}) }));
        const nextOrder = flattenGroupedRowKeys(buildGroupedTree(nextOrderedRows, groupByColumns, nextGroupOrders));
        setOrderedKeys(nextOrder);
        return null;
      });
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', finishDrag, { once: true });
    window.addEventListener('pointercancel', finishDrag, { once: true });
    dragCleanup.current = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', finishDrag);
      window.removeEventListener('pointercancel', finishDrag);
    };
  };

  const toggleSelection = (rowKey: string, additive: boolean) => {
    setSelectedCell(null);
    setSelectedKeys((current) => {
      if (!multiSelectEnabled || !additive) {
        onSelectRow?.(rowKey, rowsByKey[rowKey] ?? {});
        return [rowKey];
      }
      if (current.includes(rowKey)) {
        onDeselectRow?.(rowKey, rowsByKey[rowKey] ?? {});
        return current.filter((key) => key !== rowKey);
      }
      onSelectRow?.(rowKey, rowsByKey[rowKey] ?? {});
      return [...current, rowKey];
    });
  };

  const commitEdit = (rowKey: string, field: string, rawValue: string) => {
    if (!editable || disableEdits || loading || internalLoading) return;
    const column = allColumns.find((item) => item.sourceKey === field);
    if (!column) return;
    const nextRow = { ...rowsByKey[rowKey], [field]: parseInputValue(rawValue, column) };
    syncRow(rowKey, nextRow);
    setEdits((current) => ({ ...current, [rowKey]: { ...(current[rowKey] ?? {}), [field]: nextRow[field] } }));
  const cell: SelectedCell = { rowKey, columnKey: field, value: nextRow[field] };
    setSelectedCell(cell);
    onChangeCell?.(cell);
  };

  const updateArrayCell = (rowKey: string, field: string, nextValue: string[]) => {
    if (!editable || disableEdits || loading || internalLoading) return;
    const nextRow = { ...rowsByKey[rowKey], [field]: nextValue };
    syncRow(rowKey, nextRow);
    setEdits((current) => ({ ...current, [rowKey]: { ...(current[rowKey] ?? {}), [field]: nextValue } }));
    const cell: SelectedCell = { rowKey, columnKey: field, value: nextValue };
    setSelectedCell(cell);
    onChangeCell?.(cell);
  };

  const availableOptionsForColumn = (column: TableColumn) => {
    const values = Object.values(rowsByKey).flatMap((row) => {
      const value = row[column.sourceKey];
      if (Array.isArray(value)) return value.map(String);
      if (value === null || value === undefined || value === '') return [];
      return [String(value)];
    });
    return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)));
  };

  const openEditor = (rowKey: string, column: TableColumn, value: unknown, rect: DOMRect, point: { x: number; y: number }) => {
    const format = (column.format ?? 'string').toLowerCase();
    setActiveEditor({ rowKey, columnKey: column.sourceKey, rect, x: point.x, y: point.y });
    setEditorPosition(null);
    setEditorMultiText('');
    if (format === 'multiple tags') {
      setEditorSelections(Array.isArray(value) ? value.map(String) : []);
      setEditorText('');
      return;
    }
    setEditorSelections([]);
    setEditorText(value === null || value === undefined ? '' : String(value));
  };

  const closeEditor = () => {
    setActiveEditor(null);
    setEditorPosition(null);
    setEditorText('');
    setEditorMultiText('');
    setEditorSelections([]);
  };

  const commitArrayEditor = (nextValue: string[]) => {
    if (!activeEditor) return;
    updateArrayCell(activeEditor.rowKey, activeEditor.columnKey, nextValue);
  };

  const startResize = (columnKey: string, event: React.PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const column = visibleColumns.find((item) => item.sourceKey === columnKey);
    if (column?.resizable === false) return;
    const startX = event.clientX;
    const startWidth = columnWidths[columnKey] ?? column?.width ?? 160;
    const onMove = (moveEvent: PointerEvent) => {
      const delta = moveEvent.clientX - startX;
      setColumnWidths((current) => ({ ...current, [columnKey]: Math.max(80, startWidth + delta) }));
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
  };

  const activeColumn = activeEditor ? allColumns.find((column) => column.sourceKey === activeEditor.columnKey) ?? null : null;
  const activeValue = activeEditor ? rowsByKey[activeEditor.rowKey]?.[activeEditor.columnKey] : undefined;
  const activeText = activeColumn ? formatCellText(activeValue, activeColumn) : '';

  useEffect(() => {
    if (!activeEditor || !tableRef.current || !editorPopoverRef.current) return;
    const shellRect = tableRef.current.getBoundingClientRect();
    const popoverRect = editorPopoverRef.current.getBoundingClientRect();
    const gap = 8;
    const desiredLeft = activeEditor.x - shellRect.left;
    const belowTop = activeEditor.y - shellRect.top + gap;
    const aboveTop = activeEditor.y - shellRect.top - popoverRect.height - gap;
    const roomBelow = shellRect.bottom - activeEditor.y;
    const roomAbove = activeEditor.y - shellRect.top;
    const left = clamp(desiredLeft, 8, Math.max(8, shellRect.width - popoverRect.width - 8));
    const top = roomBelow >= popoverRect.height + gap || roomBelow >= roomAbove
      ? clamp(belowTop, 8, Math.max(8, shellRect.height - popoverRect.height - 8))
      : clamp(aboveTop, 8, Math.max(8, shellRect.height - popoverRect.height - 8));
    setEditorPosition((current) => current && current.left === left && current.top === top ? current : { left, top });
  }, [activeEditor, editorText, editorMultiText, editorSelections, activeColumn]);

  const editorStyle = editorPosition ? { left: `${editorPosition.left}px`, top: `${editorPosition.top}px` } : undefined;

  const addRow = (position: 'top' | 'bottom' | 'after') => {
    if (disableAddRow || loading || internalLoading) return;
    const blank: RowData = {};
    visibleColumns.forEach((column) => { blank[column.sourceKey] = column.format === 'multiple tags' ? [] : ''; });
    if (groupByColumns.length) {
      const selectedGroupPath = selectedKeys.length === 1 ? groupPathForRow(rowsByKey[selectedKeys[0]!] ?? {}, groupByColumns) : null;
      groupByColumns.forEach((field, index) => {
        blank[field] = selectedGroupPath?.[index] ?? (index === 0 ? groupValues[0] ?? 'Ungrouped' : 'Ungrouped');
      });
    }
    const key = `new_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const rowsCopy = { ...rowsByKey, [key]: blank };
    setRowsByKey(rowsCopy);
    setNewRows((current) => [...current, blank]);
    onClickAction?.(`add-${position}`);
    if (position === 'top') setOrderedKeys((current) => [key, ...current]);
    else if (position === 'after' && selectedKeys.length === 1) setOrderedKeys((current) => {
      const index = current.indexOf(selectedKeys[0]!);
      const next = [...current];
      next.splice(index + 1, 0, key);
      return next;
    });
    else if (position === 'bottom' && selectedKeys.length === 1) setOrderedKeys((current) => {
      const index = current.indexOf(selectedKeys[0]!);
      const next = [...current];
      next.splice(index + 1, 0, key);
      return next;
    });
    else setOrderedKeys((current) => [...current, key]);
    setSelectedKeys([key]);
  };

  const clearChanges = () => {
    setRowsByKey(Object.fromEntries(initialRows.map((row, index) => [createRowKey(row, primaryKey, indexColumn, index), { ...row }])));
    setOrderedKeys(initialRows.map((row, index) => createRowKey(row, primaryKey, indexColumn, index)));
    setGroupOrders(initialGroupOrders);
    setSelectedKeys([]);
    setSelectedCell(null);
    setEdits({});
    setNewRows([]);
    setBaselineKeys(initialRows.map((row, index) => createRowKey(row, primaryKey, indexColumn, index)));
    onCancel?.();
  };

  const save = async () => {
    if (disableSave || loading || internalLoading) return;
    setInternalLoading(true);
    try {
      await onSave?.(model);
      setEdits({});
      setNewRows([]);
      setBaselineKeys(orderedKeys);
    } finally {
      setInternalLoading(false);
    }
  };

  const themeVars = {
    '--rdt-primary': theme?.primary ?? DEFAULT_THEME.primary,
    '--rdt-secondary': theme?.secondary ?? DEFAULT_THEME.secondary,
    '--rdt-tertiary': theme?.tertiary ?? DEFAULT_THEME.tertiary,
    '--rdt-danger': theme?.danger ?? DEFAULT_THEME.danger,
    '--rdt-highlight': theme?.highlight ?? DEFAULT_THEME.highlight,
    '--rdt-canvas': theme?.canvas ?? DEFAULT_THEME.canvas,
    '--rdt-surface': theme?.surfacePrimary ?? DEFAULT_THEME.surfacePrimary,
    '--rdt-surface-2': theme?.surfaceSecondary || theme?.surfacePrimary || DEFAULT_THEME.surfaceSecondary,
    '--rdt-border': theme?.surfacePrimaryBorder || hexToRgba(theme?.primary, 0.18, DEFAULT_THEME.surfacePrimaryBorder),
    '--rdt-border-2': theme?.surfaceSecondaryBorder || hexToRgba(theme?.secondary ?? theme?.primary, 0.14, DEFAULT_THEME.surfaceSecondaryBorder),
    '--rdt-text': theme?.textDark ?? DEFAULT_THEME.textDark,
    '--rdt-text-soft': hexToRgba(theme?.textDark ?? DEFAULT_THEME.textDark, 0.68, DEFAULT_THEME.textLight),
    '--rdt-radius': theme?.borderRadius ?? DEFAULT_THEME.borderRadius,
    '--rdt-font': fontFamilyValue(theme?.defaultFont, DEFAULT_THEME.defaultFont),
    '--rdt-label-font': fontFamilyValue(theme?.labelFont, DEFAULT_THEME.labelFont),
    '--rdt-label-weight': fontWeightValue(theme?.labelEmphasizedFont ?? theme?.labelFont, 700),
    '--rdt-label-size': fontSizeValue(theme?.labelFont, '12px'),
    '--rdt-low': theme?.lowElevation ?? DEFAULT_THEME.lowElevation,
    '--rdt-medium': theme?.mediumElevation ?? DEFAULT_THEME.mediumElevation,
    '--rdt-high': theme?.highElevation ?? DEFAULT_THEME.highElevation,
    '--rdt-primary-soft': hexToRgba(theme?.primary, 0.12, 'rgba(37, 99, 235, 0.12)'),
    '--rdt-primary-strong': hexToRgba(theme?.primary, 0.22, 'rgba(37, 99, 235, 0.22)'),
    '--rdt-selected': hexToRgba(theme?.highlight ?? theme?.primary, 0.24, 'rgba(219, 234, 254, 0.95)'),
    '--rdt-hover': hexToRgba(theme?.surfaceSecondary ?? theme?.primary, 0.18, 'rgba(248, 250, 252, 0.98)'),
    '--rdt-overlay': hexToRgba(theme?.canvas ?? theme?.surfaceSecondary ?? theme?.primary, 0.66, 'rgba(226, 232, 240, 0.66)'),
    '--rdt-row-height': rowHeight === 'extra small' ? '20px' : rowHeight === 'small' ? '32px' : rowHeight === 'medium' ? '48px' : rowHeight === 'large' ? '64px' : 'auto',
    '--rdt-row-pad-y': rowHeight === 'dynamic' ? '8px' : '0px',
    '--rdt-row-font': rowHeight === 'extra small' ? '12px' : rowHeight === 'small' ? '13px' : rowHeight === 'medium' ? '13px' : rowHeight === 'large' ? '14px' : '13px',
    '--rdt-row-line': rowHeight === 'dynamic' ? '1.35' : '1.2',
    height: '100%',
    maxHeight: '100%',
    ...themeStyles,
  } as React.CSSProperties;

  const totalColumnCount = visibleColumns.length + 2 + (multiSelectEnabled ? 1 : 0);

  const renderRow = (row: RenderRow, indentLevel = 0) => {
    const rowKey = row.__key as string;
    const isSelected = selectedKeys.includes(rowKey);
    const isNew = newRows.includes(rowsByKey[rowKey]);
    const isDirtyRow = isNew || Boolean(edits[rowKey]);
    const isDropBefore = dropTarget?.key === rowKey && dropTarget.before;
    const isDropAfter = dropTarget?.key === rowKey && !dropTarget.before;
    const isInvalidDrop = dropTarget?.key === rowKey && dropTarget.invalid;
    return (
      <tr key={rowKey} data-row-key={rowKey} className={`${isSelected ? styles.selectedRow : ''} ${isDirtyRow ? styles.dirtyRow : ''} ${dragState?.rowKey === rowKey ? styles.draggingRow : ''} ${isDropBefore ? styles.dropBefore : ''} ${isDropAfter ? styles.dropAfter : ''} ${isInvalidDrop ? styles.invalidDrop : ''}`} onClick={(event) => { onRowClick?.(rowKey, row); toggleSelection(rowKey, event.metaKey || event.ctrlKey || event.shiftKey); }} onDoubleClick={() => onDoubleClickRow?.(rowKey, row)}>
        <td className={styles.handleCell}>
          <button className={styles.handleButton} style={{ marginLeft: `${indentLevel * 16}px` }} onPointerDown={(event) => { event.stopPropagation(); startDrag(rowKey, event); }} onClick={(event) => event.stopPropagation()} aria-label="Drag row">⋮⋮</button>
        </td>
        {multiSelectEnabled && <td className={styles.checkboxCell}><label className={styles.checkboxWrap}><input type="checkbox" checked={isSelected} onChange={() => toggleSelection(rowKey, true)} onClick={(event) => event.stopPropagation()} /><span className={styles.checkboxUi} aria-hidden="true" /></label></td>}
        <td className={styles.indexCell}>{orderedKeys.indexOf(rowKey)}</td>
        {visibleColumns.map((column) => {
          const value = row[column.sourceKey];
          const text = formatCellText(value, column);
          const editableCell = editable && !disableEdits && column.editable !== false && isEditableFormat(column.format) && !loading && !internalLoading && !column.hidden;
          return (
            <td key={column.sourceKey} className={styles.cell} data-editor-anchor="true" style={{ width: `${columnWidths[column.sourceKey] ?? column.width ?? 160}px`, textAlign: column.align ?? 'left' }} onClick={() => { const cell = { rowKey, columnKey: column.sourceKey, value }; setSelectedCell(cell); onClickCell?.(cell); }} onDoubleClick={(event) => { event.stopPropagation(); if (editableCell && (column.format ?? 'string').toLowerCase() !== 'boolean') openEditor(rowKey, column, value, (event.currentTarget as HTMLElement).getBoundingClientRect(), { x: event.clientX, y: event.clientY }); }}>
              <div className={styles.cellInner}>
                <CellRenderer column={column} value={value} row={row} text={text} editable={editableCell} onToggleBoolean={() => commitEdit(rowKey, column.sourceKey, String(!Boolean(value)))} />
              </div>
            </td>
          );
        })}
      </tr>
    );
  };

  const renderGroupNode = (group: GroupNode): React.ReactNode => (
    <React.Fragment key={group.key}>
      <tr className={`${styles.groupRow} ${groupDragState?.targetKey === group.key ? (groupDragState.invalid ? styles.invalidDrop : groupDragState.insertBefore ? styles.dropBefore : styles.dropAfter) : ''}`} data-group-key={group.key}>
        <td colSpan={totalColumnCount}>
          <div className={styles.groupChipWrap} style={{ paddingLeft: `${group.depth * 16}px` }}>
            {allowGroupReorder ? <button type="button" className={styles.groupHandleButton} aria-label={`Drag group ${group.path.join(' / ')}`} onPointerDown={(event) => startGroupDrag(group.key, event)}>⋮⋮</button> : <span className={styles.groupSpacer} aria-hidden="true" />}
            <div className={styles.groupChip}>{group.label}<span>{countGroupRows(group)}</span></div>
          </div>
        </td>
      </tr>
      {!group.children.length && !group.rows.length ? (
        <tr>
          <td colSpan={totalColumnCount}>
            <div data-group-drop-zone={group.key} data-group-path={JSON.stringify(group.path)} className={`${styles.emptyGroupDropZone} ${samePath(dropTarget?.groupPath ?? null, group.path) ? (dropTarget?.invalid ? styles.invalidDropZone : styles.activeDropZone) : ''}`} style={{ marginLeft: `${group.depth * 16}px` }}>Drop rows into {group.path.join(' / ')}</div>
          </td>
        </tr>
      ) : null}
      {group.children.map((child) => renderGroupNode(child))}
      {group.rows.map((row) => renderRow(row, group.depth + 1))}
    </React.Fragment>
  );

  return (
    <div className={styles.shell} ref={tableRef} style={themeVars} tabIndex={0} onFocus={onFocus} onBlur={onBlur}>
      <div className={styles.headerBar}>
        <div className={styles.headerTitleWrap}>
          {showTitle ? <div className={styles.headerTitle}>{title}</div> : null}
          <div className={styles.headerMeta}>{orderedRows.length} rows</div>
          {showSavePrompt && isDirty && <div className={styles.dirtyBadge}>Unsaved changes</div>}
        </div>
        {addRowPosition === 'top' && <div className={styles.headerActions}>
          {saveVisible && (
            <button className={`${styles.iconButton} ${styles.primaryIconButton}`} title="Save" aria-label="Save" disabled={disableSave || loading || internalLoading} onClick={() => { onClickToolbar?.('save'); void save(); }}>
              <ToolbarIcon kind="save" />
            </button>
          )}
          <button className={styles.iconButton} title="Undo changes" aria-label="Undo changes" onClick={() => { onClickToolbar?.('cancel'); clearChanges(); }} disabled={loading || internalLoading}>
            <ToolbarIcon kind="cancel" />
          </button>
          {addRowPosition === 'top' && !disableAddRow && (
            <>
              <button className={styles.iconButton} title="Insert row top" aria-label="Insert row top" onClick={() => { onClickToolbar?.('add-top'); addRow('top'); }} disabled={loading || internalLoading}>
                <ToolbarIcon kind="add-top" />
              </button>
              <button className={styles.iconButton} title="Insert row bottom" aria-label="Insert row bottom" onClick={() => { onClickToolbar?.('add-bottom'); addRow('bottom'); }} disabled={loading || internalLoading}>
                <ToolbarIcon kind="add-bottom" />
              </button>
              <button className={styles.iconButton} title="Insert below selected" aria-label="Insert below selected" onClick={() => { onClickToolbar?.('add-after'); addRow('after'); }} disabled={loading || internalLoading || selectedKeys.length !== 1}>
                <ToolbarIcon kind="add-after" />
              </button>
            </>
          )}
        </div>}
      </div>

      {loading || internalLoading ? <div className={styles.loadingOverlay}><div className={styles.loaderSpinner} aria-hidden="true" /></div> : null}

      <div className={styles.tableWrap} data-row-height={rowHeight} data-sticky-header={stickyHeader}>
        {orderedRows.length ? (
          <table className={styles.table}>
            {showHeader ? <thead>
              <tr>
                <th className={styles.handleCol} />
                {multiSelectEnabled && <th className={styles.checkboxCol} />}
                <th className={styles.indexCol}>ID</th>
                {visibleColumns.map((column) => (
                  <th key={column.sourceKey} style={{ width: `${columnWidths[column.sourceKey] ?? column.width ?? 160}px`, textAlign: column.align ?? 'left' }} title={column.description}>
                    <div className={styles.headerCellInner}>
                      <span>{column.label ?? column.sourceKey}</span>
                      {column.resizable !== false ? <button className={styles.resizeHandle} aria-label={`Resize ${column.label ?? column.sourceKey}`} onPointerDown={(event) => startResize(column.sourceKey, event)} /> : null}
                    </div>
                  </th>
                ))}
              </tr>
            </thead> : null}
            <tbody>
              {groupByColumns.length ? groupedRows.map((group) => renderGroupNode(group)) : orderedRows.map((row) => renderRow(row))}
            </tbody>
          </table>
        ) : (
          <div className={styles.emptyState}>{emptyMessage}</div>
        )}
      </div>
      {addRowPosition === 'bottom' && (
        <div className={styles.bottomBar}>
          {saveVisible && <button className={`${styles.iconButton} ${styles.primaryIconButton}`} title="Save" aria-label="Save" disabled={disableSave || loading || internalLoading} onClick={() => { onClickToolbar?.('save'); void save(); }}><ToolbarIcon kind="save" /></button>}
          <button className={styles.iconButton} title="Undo changes" aria-label="Undo changes" onClick={() => { onClickToolbar?.('cancel'); clearChanges(); }} disabled={loading || internalLoading}><ToolbarIcon kind="cancel" /></button>
          {!disableAddRow && <>
          <button className={styles.iconButton} title="Insert row top" aria-label="Insert row top" onClick={() => { onClickToolbar?.('add-top'); addRow('top'); }} disabled={loading || internalLoading}>
            <ToolbarIcon kind="add-top" />
          </button>
          <button className={styles.iconButton} title="Insert row bottom" aria-label="Insert row bottom" onClick={() => { onClickToolbar?.('add-bottom'); addRow('bottom'); }} disabled={loading || internalLoading}>
            <ToolbarIcon kind="add-bottom" />
          </button>
          <button className={styles.iconButton} title="Insert below selected" aria-label="Insert below selected" onClick={() => { onClickToolbar?.('add-after'); addRow('after'); }} disabled={loading || internalLoading || selectedKeys.length !== 1}>
            <ToolbarIcon kind="add-after" />
          </button>
          </>}
        </div>
      )}
      {activeEditor && activeColumn ? (
        <div className={styles.editorLayer}>
          <div ref={editorPopoverRef} className={styles.editorPopover} style={editorStyle} onDoubleClick={(event) => event.stopPropagation()}>
            <EditorPopover
              column={activeColumn}
              value={activeValue}
              text={activeText}
              editorText={editorText}
              editorMultiText={editorMultiText}
              editorSelections={editorSelections}
              options={availableOptionsForColumn(activeColumn)}
              onChangeText={setEditorText}
              onChangeMultiText={setEditorMultiText}
              onChangeSelections={setEditorSelections}
              onCommitText={(next) => { commitEdit(activeEditor.rowKey, activeEditor.columnKey, next); closeEditor(); }}
              onCommitArray={commitArrayEditor}
              onClose={closeEditor}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

const CellRenderer: React.FC<{ column: TableColumn; value: unknown; row: RowData; text: string; editable: boolean; onToggleBoolean: () => void }> = ({ column, value, row, text, editable, onToggleBoolean }) => {
  const format = (column.format ?? 'string').toLowerCase();
  if (format === 'avatar') {
    const email = String(row.email ?? row.owner ?? '');
    return (
      <div className={styles.userCell}>
        <div className={styles.avatar}>{initials(value || text)}</div>
        <div className={styles.userMeta}>
          <div className={styles.userName}>{text}</div>
          {email ? <div className={styles.userSub}>{email}</div> : null}
        </div>
      </div>
    );
  }
  if (format === 'tag') {
    const label = text;
    return <span className={styles.tag} style={{ background: chipColor(label), color: chipTextColor(label) }}>{label}</span>;
  }
  if (format === 'multiple tags') {
    const tags = Array.isArray(value) ? value.map(String) : text.split(',').map((item) => item.trim()).filter(Boolean);
    return <div className={styles.tags}>{tags.map((tag) => <span key={tag} className={styles.tag} style={{ background: chipColor(tag), color: chipTextColor(tag) }}>{tag}</span>)}</div>;
  }
  if (format === 'boolean') {
    return (
      <button
        type="button"
        className={styles.booleanToggle}
        onClick={(event) => {
          event.stopPropagation();
          if (editable) onToggleBoolean();
        }}
        aria-label={value ? 'True' : 'False'}
      >
        <span className={styles.booleanCheckbox} data-checked={Boolean(value)}>
          <span className={styles.checkboxUi} aria-hidden="true" />
        </span>
      </button>
    );
  }
  if (format === 'link') {
    return <a className={styles.link} href={String(value ?? '#')} target="_blank" rel="noreferrer">{text}</a>;
  }
  if (format === 'email') {
    return <a className={styles.link} href={`mailto:${String(value ?? '')}`}>{text}</a>;
  }
  if (format === 'json') {
    return <span className={styles.json}>{text}</span>;
  }
  if (format === 'markdown') {
    return <span className={styles.markdown}>{text}</span>;
  }
  if (format === 'progress') {
    const percent = Number(value ?? 0);
    return <div className={styles.progress}><div className={styles.progressBar} style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} /></div>;
  }
  return <span className={styles.textCell}>{text}</span>;
};

const EditorPopover: React.FC<{
  column: TableColumn;
  value: unknown;
  text: string;
  editorText: string;
  editorMultiText: string;
  editorSelections: string[];
  options: string[];
  onChangeText: (next: string) => void;
  onChangeMultiText: (next: string) => void;
  onChangeSelections: (next: string[]) => void;
  onCommitText: (next: string) => void;
  onCommitArray: (next: string[]) => void;
  onClose: () => void;
}> = ({ column, value, text, editorText, editorMultiText, editorSelections, options, onChangeText, onChangeMultiText, onChangeSelections, onCommitText, onCommitArray, onClose }) => {
  const format = (column.format ?? 'string').toLowerCase();
  const tagOptions = Array.from(new Set([...(Array.isArray(value) ? value.map(String) : []), ...options, text].flatMap((item) => String(item).split(',').map((entry) => entry.trim()).filter(Boolean))));

  if (format === 'boolean') {
    return (
      <div className={styles.editorOptionList}>
        {[{ key: 'true', label: 'True' }, { key: 'false', label: 'False' }].map((option) => {
          const selected = String(Boolean(value)) === option.key;
          return (
            <button key={option.key} type="button" className={`${styles.editorOption} ${selected ? styles.editorOptionSelected : ''}`} onClick={() => onCommitText(option.key)}>
              <span className={styles.editorCheckboxRow}>
                <span className={styles.booleanCheckbox} data-checked={selected}><span className={styles.checkboxUi} aria-hidden="true" /></span>
                <span>{option.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  if (format === 'date' || format === 'date time') {
    return (
      <input
        className={styles.editorInput}
        type={format === 'date' ? 'date' : 'datetime-local'}
        value={editorText}
        onChange={(event) => onChangeText(event.target.value)}
        onBlur={() => onCommitText(editorText)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onCommitText(editorText);
          if (event.key === 'Escape') onClose();
        }}
        autoFocus
      />
    );
  }

  if (format === 'multiple tags') {
    const tags = editorSelections;
    const orderedTagOptions = Array.from(new Set([...options, ...tags, ...text.split(',').map((item) => item.trim()).filter(Boolean)]));
    return (
      <>
        <input className={styles.editorInput} value={editorMultiText} placeholder="Add tag" onChange={(event) => onChangeMultiText(event.target.value)} onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            const next = editorMultiText.trim();
            if (!next) return;
            const updated = Array.from(new Set([...tags, next]));
            onChangeSelections(updated);
            onCommitArray(updated);
            onChangeMultiText('');
          }
          if (event.key === 'Escape') onClose();
        }} autoFocus />
        <div className={styles.editorOptionList}>
          {orderedTagOptions.map((option) => {
            const selected = tags.includes(option);
            return <button key={option} type="button" className={`${styles.editorOption} ${selected ? styles.editorOptionSelected : ''}`} onClick={() => {
              const next = selected ? tags.filter((item) => item !== option) : [...tags, option];
              onChangeSelections(next);
              onCommitArray(next);
            }}><span className={styles.editorCheckboxRow}><span className={styles.booleanCheckbox} data-checked={selected}><span className={styles.checkboxUi} aria-hidden="true" /></span><span>{option}</span></span></button>;
          })}
        </div>
      </>
    );
  }

  if (isTextAreaFormat(format)) {
    return (
      <textarea
        className={`${styles.editorInput} ${styles.editorTextarea}`}
        value={editorText}
        onChange={(event) => onChangeText(event.target.value)}
        onBlur={() => onCommitText(editorText)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') onCommitText(editorText);
          if (event.key === 'Escape') onClose();
        }}
        autoFocus
      />
    );
  }

  if (format === 'tag') {
    return (
      <>
        <input className={styles.editorInput} value={editorText} placeholder="Set value" onChange={(event) => onChangeText(event.target.value)} onKeyDown={(event) => {
          if (event.key === 'Enter') onCommitText(editorText);
          if (event.key === 'Escape') onClose();
        }} autoFocus />
        <div className={styles.editorOptionList}>
          {tagOptions.map((option) => (
            <button key={option} type="button" className={`${styles.editorOption} ${editorText === option ? styles.editorOptionSelected : ''}`} onClick={() => onCommitText(option)}>{option}</button>
          ))}
        </div>
      </>
    );
  }

  if (format === 'email') {
    return (
      <input
        className={styles.editorInput}
        type="email"
        value={editorText}
        onChange={(event) => onChangeText(event.target.value)}
        onBlur={() => onCommitText(editorText)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onCommitText(editorText);
          if (event.key === 'Escape') onClose();
        }}
        autoFocus
      />
    );
  }

  return (
    <>
      <input
        className={styles.editorInput}
        value={editorText}
        onChange={(event) => onChangeText(event.target.value)}
        onBlur={() => onCommitText(editorText)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onCommitText(editorText);
          if (event.key === 'Escape') onClose();
        }}
        autoFocus
      />
    </>
  );
};
