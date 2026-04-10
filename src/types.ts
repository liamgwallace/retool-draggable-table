export type ColumnFormat =
  | 'string'
  | 'multiline string'
  | 'number'
  | 'date'
  | 'date time'
  | 'boolean'
  | 'tag'
  | 'multiple tags'
  | 'avatar'
  | 'link'
  | 'email'
  | 'html'
  | 'markdown'
  | 'progress';

export type Align = 'left' | 'center' | 'right';

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

export interface FontToken {
  size?: string;
  fontWeight?: number | string;
  name?: string;
}

export interface ThemeTokens {
  primary?: string;
  secondary?: string;
  tertiary?: string;
  success?: string;
  danger?: string;
  warning?: string;
  info?: string;
  highlight?: string;
  canvas?: string;
  surfacePrimary?: string;
  surfaceSecondary?: string;
  surfacePrimaryBorder?: string;
  surfaceSecondaryBorder?: string;
  textDark?: string;
  textLight?: string;
  borderRadius?: string;
  defaultFont?: string | FontToken;
  labelFont?: string | FontToken;
  labelEmphasizedFont?: string | FontToken;
  lowElevation?: string;
  mediumElevation?: string;
  highElevation?: string;
  automatic?: string[];
}

export type RowData = Record<string, unknown>;

export interface ReorderChange {
  key: string;
  from: number;
  to: number;
}

export interface SelectedCell {
  rowKey: string;
  columnKey: string;
  value: unknown;
}

export interface TableModel {
  selectedRow: RowData | null;
  selectedRows: RowData[];
  selectedRowKey: string | null;
  selectedRowKeys: string[];
  selectedDataIndex: number | null;
  selectedDataIndexes: number[];
  selectedDisplayIndex: number | null;
  selectedDisplayIndexes: number[];
  selectedCell: SelectedCell | null;
  orderedRows: RowData[];
  orderedRowKeys: string[];
  reorderChangeset: ReorderChange[];
  changesetArray: Array<{ key: string; changes: Partial<RowData> }>;
  changesetObject: Record<string, Partial<RowData>>;
  newRows: RowData[];
  isDirty: boolean;
  disableEdits: boolean;
  disableSave: boolean;
  isLoading: boolean;
}

export interface DraggableTableProps {
  dataSource: RowData[];
  primaryKey?: string;
  indexColumn?: string;
  columns?: TableColumn[];
  columnOrdering?: string[];
  groupByColumns?: string[];
  tagOptionsSources?: Record<string, string[]>;
  allowGroupReorder?: boolean;
  allowCrossGroupDrag?: boolean;
  multiSelectEnabled?: boolean;
  editable?: boolean;
  showSavePrompt?: boolean;
  saveVisible?: boolean;
  showHeader?: boolean;
  showTitle?: boolean;
  stickyHeader?: boolean;
  loading?: boolean;
  addRowPosition?: 'top' | 'bottom';
  rowHeight?: 'extra small' | 'small' | 'medium' | 'high' | 'auto';
  theme?: ThemeTokens;
  themeStyles?: Partial<React.CSSProperties>;
  disableEdits?: boolean;
  disableSave?: boolean;
  disableReorder?: boolean;
  disableAddRow?: boolean;
  showDisplayIndexColumn?: boolean;
  emptyMessage?: string;
  title?: string;
  onModelChange?: (model: TableModel) => void;
  onRowClick?: (rowKey: string, row: RowData) => void;
  onDoubleClickRow?: (rowKey: string, row: RowData) => void;
  onSelectRow?: (rowKey: string, row: RowData) => void;
  onDeselectRow?: (rowKey: string, row: RowData) => void;
  onChangeRowSelection?: (rowKeys: string[]) => void;
  onClickCell?: (cell: SelectedCell) => void;
  onChangeCell?: (cell: SelectedCell) => void;
  onClickAction?: (action: string) => void;
  onClickToolbar?: (action: string) => void;
  onRowReorderStart?: (model: TableModel) => void;
  onRowReorderCancel?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onChange?: (model: TableModel) => void;
  onRowReorder?: (model: TableModel) => void;
  onSave?: (model: TableModel) => void | Promise<void>;
  onCancel?: () => void;
}
