import React, { useState } from 'react';
import { DraggableTable } from '../components/DraggableTable/DraggableTable';
import type { TableModel } from '../types';
import { DEFAULT_SAMPLE_COLUMNS, DEFAULT_SAMPLE_ROWS } from '../sampleData';

export const LocalDemo: React.FC = () => {
  const [model, setModel] = useState<TableModel | null>(null);

  return (
    <div style={{ maxWidth: 1460, margin: '24px auto', padding: '0 16px 24px' }}>
      <DraggableTable
        dataSource={DEFAULT_SAMPLE_ROWS}
        primaryKey="id"
        columns={DEFAULT_SAMPLE_COLUMNS}
        multiSelectEnabled
        showSavePrompt
        saveVisible
        onModelChange={setModel}
      />

      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: '#fff', border: '1px solid #d8e0ea', borderRadius: 14, padding: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Selection</div>
          <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>{JSON.stringify(model?.selectedRowKeys ?? [], null, 2)}</pre>
        </div>
        <div style={{ background: '#fff', border: '1px solid #d8e0ea', borderRadius: 14, padding: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Order</div>
          <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>{JSON.stringify(model?.orderedRowKeys ?? [], null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};
