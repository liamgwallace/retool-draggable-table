import React, { useState } from 'react';
import { DraggableTable } from '../components/DraggableTable/DraggableTable';
import type { TableModel } from '../types';

const sampleRows = [
  { id: 0, user: 'Chic Footitt', email: 'chic.footitt@yahoo.com', role: 'Viewer', enabled: true, createdAt: '2023-01-16', teams: ['Workplace', 'Infrastructure'], website: 'https://chic.footitt.com', bio: '<strong>Nulla sit amet nibh</strong> at augue facilisis viverra quis id dui. <em>Nullam mattis</em> ultricies metus.', progress: 12 },
  { id: 1, user: 'Kenton Worling', email: 'kentonworling@icloud.com', role: 'Viewer', enabled: false, createdAt: '2021-12-24', teams: ['Workplace'], website: 'https://kenton.worling.com', bio: '<p>Duis viverra elementum ante, placerat sollicitudin ipsum laoreet nec.</p>', progress: 28 },
  { id: 2, user: 'Evelina Fender', email: 'efender@outlook.com', role: 'Editor', enabled: true, createdAt: '2022-01-03', teams: ['Product', 'Sales'], website: 'https://evelina.fender.com', bio: '<ul><li>Donec in lorem</li><li>Sed eu mollis felis</li></ul>', progress: 46 },
  { id: 3, user: 'Lexis Speers', email: 'lexisspeers@icloud.com', role: 'Admin', enabled: true, createdAt: '2022-12-13', teams: ['Infrastructure', 'Design'], website: 'https://lexis.speers.com', bio: '<a href="https://example.com">Linked note</a> with extra context.', progress: 64 },
  { id: 4, user: 'Kenton Antonioni', email: 'kenton.antonioni@icloud.com', role: 'Admin', enabled: true, createdAt: '2022-04-15', teams: ['Success', 'Recruiting', 'Data'], website: 'https://kenton.antonioni.com', bio: '<span style="font-style: italic;">Etiam bibendum auctor aliquet.</span>', progress: 81 },
  { id: 5, user: 'Nanon Stit', email: 'nanonstit@gmail.com', role: 'Editor', enabled: false, createdAt: '2022-10-14', teams: ['Data'], website: 'https://nanon.stit.com', bio: '<strong>Sed eu mollis felis.</strong> Nulla sit amet augue facilisis viverra.', progress: 93 },
];

export const LocalDemo: React.FC = () => {
  const [model, setModel] = useState<TableModel | null>(null);

  return (
    <div style={{ maxWidth: 1460, margin: '24px auto', padding: '0 16px 24px' }}>
      <DraggableTable
        dataSource={sampleRows}
        primaryKey="id"
        columns={[
          { sourceKey: 'user', label: 'User', format: 'avatar', editable: true, width: 260 },
          { sourceKey: 'role', label: 'Role', format: 'tag', editable: true, width: 110 },
          { sourceKey: 'enabled', label: 'Enabled', format: 'boolean', editable: true, width: 100, align: 'center' },
          { sourceKey: 'createdAt', label: 'Created at', format: 'date', editable: true, width: 140 },
          { sourceKey: 'teams', label: 'Teams', format: 'multiple tags', editable: true, width: 240 },
          { sourceKey: 'website', label: 'Website', format: 'link', editable: true, width: 240 },
          { sourceKey: 'bio', label: 'Bio', format: 'html', editable: true },
          { sourceKey: 'progress', label: 'Progress', format: 'progress', editable: true, width: 180, align: 'center' },
        ]}
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
