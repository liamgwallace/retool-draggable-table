import type { FontToken, ReorderChange, RowData, TableColumn, ThemeTokens } from '../types';

export const DEFAULT_THEME: Required<ThemeTokens> = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  tertiary: '#0f766e',
  success: '#16a34a',
  danger: '#dc2626',
  warning: '#d97706',
  info: '#0ea5e9',
  highlight: '#dbeafe',
  canvas: '#eef2f7',
  surfacePrimary: '#ffffff',
  surfaceSecondary: '#f8fafc',
  surfacePrimaryBorder: '#d8e0ea',
  surfaceSecondaryBorder: '#e5eaf2',
  textDark: '#0f172a',
  textLight: '#64748b',
  borderRadius: '14px',
  defaultFont: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  labelFont: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  labelEmphasizedFont: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  lowElevation: '0 1px 2px rgba(15, 23, 42, 0.04)',
  mediumElevation: '0 8px 24px rgba(15, 23, 42, 0.09)',
  highElevation: '0 18px 44px rgba(15, 23, 42, 0.14)',
  automatic: ['#fde68a', '#eecff3', '#a7f3d0', '#bfdbfe', '#c7d2fe', '#fecaca', '#fcd6bb'],
};

export const fontFamilyValue = (font: string | FontToken | undefined, fallback: string) => {
  if (!font) return fallback;
  if (typeof font === 'string') return font;
  return font.name || fallback;
};

export const fontWeightValue = (font: string | FontToken | undefined, fallback: string | number) => {
  if (!font || typeof font === 'string') return String(fallback);
  return String(font.fontWeight ?? fallback);
};

export const fontSizeValue = (font: string | FontToken | undefined, fallback: string) => {
  if (!font || typeof font === 'string') return fallback;
  return font.size || fallback;
};

export const hexToRgba = (value: string | undefined, alpha: number, fallback: string) => {
  if (!value) return fallback;
  const normalized = value.trim();
  const hex = normalized.startsWith('#') ? normalized.slice(1) : normalized;
  if (![3, 6].includes(hex.length)) return fallback;
  const full = hex.length === 3 ? hex.split('').map((part) => `${part}${part}`).join('') : hex;
  const parsed = Number.parseInt(full, 16);
  if (Number.isNaN(parsed)) return fallback;
  const red = (parsed >> 16) & 255;
  const green = (parsed >> 8) & 255;
  const blue = parsed & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

export const cloneRows = (rows: RowData[]) => rows.map((row) => ({ ...row }));

export const createRowKey = (row: RowData, primaryKey?: string, indexColumn?: string, fallbackIndex = 0) => {
  const value = primaryKey ? row[primaryKey] : undefined;
  if (value !== undefined && value !== null && value !== '') return String(value);
  const orderValue = indexColumn ? row[indexColumn] : undefined;
  if (orderValue !== undefined && orderValue !== null && orderValue !== '') return String(orderValue);
  return `row_${fallbackIndex}`;
};

export const hashToHue = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash % 360;
};

export const chipColor = (value: string) => `hsl(${hashToHue(value)} 70% 92%)`;
export const chipTextColor = (value: string) => `hsl(${hashToHue(value)} 55% 28%)`;

export const initials = (value: unknown) => {
  const text = String(value ?? '').trim();
  if (!text) return '?';
  const parts = text.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || text[0]!.toUpperCase();
};

export const formatDate = (value: unknown, time = false) => {
  if (!value) return '';
  const date = new Date(value as string | number | Date);
  if (Number.isNaN(date.getTime())) return String(value);
  return time ? date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : date.toLocaleDateString([], { dateStyle: 'medium' });
};

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const formatInlineMarkdown = (value: string) => {
  const withLinks = value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label: string, href: string) => {
    const safeHref = /^(https?:|mailto:|\/)/i.test(href.trim()) ? href.trim() : '#';
    return `<a href="${escapeHtml(safeHref)}" target="_blank" rel="noreferrer">${label}</a>`;
  });

  return withLinks
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>');
};

export const stripHtmlTags = (value: string) => value.replace(/<[^>]*>/g, '');

export const markdownToHtml = (value: unknown) => {
  const text = String(value ?? '').replace(/\r\n/g, '\n');
  if (!text.trim()) return '';

  const lines = text.split('\n');
  const blocks: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index]!;
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith('```')) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index]!.startsWith('```')) {
        codeLines.push(lines[index]!);
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      blocks.push(`<h${level}>${formatInlineMarkdown(escapeHtml(heading[2] ?? ''))}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index]!)) {
        quoteLines.push(lines[index]!.replace(/^>\s?/, ''));
        index += 1;
      }
      blocks.push(`<blockquote><p>${formatInlineMarkdown(escapeHtml(quoteLines.join(' ')))}</p></blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index]!)) {
        items.push(lines[index]!.replace(/^[-*]\s+/, ''));
        index += 1;
      }
      blocks.push(`<ul>${items.map((item) => `<li>${formatInlineMarkdown(escapeHtml(item))}</li>`).join('')}</ul>`);
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length && lines[index]!.trim() && !lines[index]!.startsWith('```') && !/^(#{1,6})\s+/.test(lines[index]!) && !/^>\s?/.test(lines[index]!) && !/^[-*]\s+/.test(lines[index]!)) {
      paragraphLines.push(lines[index]!);
      index += 1;
    }
    blocks.push(`<p>${formatInlineMarkdown(escapeHtml(paragraphLines.join(' ')))}</p>`);
  }

  return blocks.join('');
};

export const isDisplayEmptyValue = (value: unknown) => value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);

export const getEmptyDisplayValue = (column: TableColumn) => column.emptyDisplayValue ?? 'Enter value';

export const normalizeTagOptions = (values: unknown[]): string[] => Array.from(new Set(values.flatMap((value) => {
  if (Array.isArray(value)) return normalizeTagOptions(value);
  if (value === null || value === undefined) return [];
  const normalized = String(value).trim();
  return normalized ? [normalized] : [];
})));

export const extractTagValues = (value: unknown, format: TableColumn['format'] = 'tag'): string[] => {
  if (Array.isArray(value)) return normalizeTagOptions(value);
  if (value === null || value === undefined || value === '') return [];
  if ((format ?? 'tag').toLowerCase() === 'multiple tags') return normalizeTagOptions(String(value).split(','));
  return normalizeTagOptions([value]);
};

export const resolveTagOptions = (column: TableColumn, rows: RowData[], tagOptionsSources: Record<string, string[]> = {}): string[] => {
  const format = (column.format ?? 'string').toLowerCase();
  if (format !== 'tag' && format !== 'multiple tags') return [];
  if (Array.isArray(column.tagOptions)) return normalizeTagOptions(column.tagOptions);
  if (column.tagOptionsSource && Array.isArray(tagOptionsSources[column.tagOptionsSource])) {
    return normalizeTagOptions(tagOptionsSources[column.tagOptionsSource]!);
  }
  return normalizeTagOptions(rows.flatMap((row) => extractTagValues(row[column.sourceKey], column.format)));
};

export const formatCellText = (value: unknown, column: TableColumn) => {
  const format = (column.format ?? 'string').toLowerCase();
  if (value === null || value === undefined) return '';
  if (format === 'date') return formatDate(value, false);
  if (format === 'date time') return formatDate(value, true);
  if (format === 'boolean') return value ? 'Yes' : 'No';
  if (format === 'multiple tags') return Array.isArray(value) ? value.map(String).join(', ') : String(value);
  if (format === 'html') return stripHtmlTags(String(value));
  return String(value);
};

export const isEditableFormat = (_format?: string) => true;

export const moveKeys = (orderedKeys: string[], movingKeys: string[], targetKey: string, insertBefore: boolean) => {
  const moving = orderedKeys.filter((key) => movingKeys.includes(key));
  const remaining = orderedKeys.filter((key) => !movingKeys.includes(key));
  let targetIndex = remaining.indexOf(targetKey);
  if (targetIndex < 0) targetIndex = remaining.length;
  if (!insertBefore) targetIndex += 1;
  remaining.splice(targetIndex, 0, ...moving);
  return remaining;
};

export const buildReorderChangeset = (currentKeys: string[], baselineKeys: string[]): ReorderChange[] =>
  currentKeys
    .map((key, to) => {
      const from = baselineKeys.indexOf(key);
      if (from < 0 || from === to) return null;
      return { key, from, to };
    })
    .filter(Boolean) as ReorderChange[];
