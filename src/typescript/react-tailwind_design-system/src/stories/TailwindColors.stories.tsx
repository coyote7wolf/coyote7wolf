import React from 'react';

const colorTokens = [
  { name: 'Primary', className: 'bg-primary' },
  { name: 'Primary Light', className: 'bg-primary-light' },
  { name: 'Primary Dark', className: 'bg-primary-dark' },
  { name: 'Secondary', className: 'bg-secondary' },
  { name: 'Secondary Light', className: 'bg-secondary-light' },
  { name: 'Secondary Dark', className: 'bg-secondary-dark' },
  { name: 'Success', className: 'bg-success' },
  { name: 'Success Dark', className: 'bg-success-dark' },
  { name: 'Warning', className: 'bg-warning' },
  { name: 'Warning Dark', className: 'bg-warning-dark' },
  { name: 'Danger', className: 'bg-danger' },
  { name: 'Danger Dark', className: 'bg-danger-dark' },
  { name: 'Info', className: 'bg-info' },
  { name: 'Info Dark', className: 'bg-info-dark' },
  { name: 'Background', className: 'bg-background' },
  { name: 'Background Dark', className: 'bg-background-dark' },
  { name: 'Surface', className: 'bg-surface' },
  { name: 'Surface Dark', className: 'bg-surface-dark' },
  { name: 'Border', className: 'bg-border' },
  { name: 'Border Dark', className: 'bg-border-dark' },
  { name: 'Muted', className: 'bg-muted' },
  { name: 'Muted Dark', className: 'bg-muted-dark' },
  { name: 'Disabled', className: 'bg-disabled' },
  { name: 'Disabled Dark', className: 'bg-disabled-dark' },
  { name: 'Skeleton', className: 'bg-skeleton' },
];

export default {
  title: 'Design Tokens/Tailwind Colors',
};

export const TailwindColors = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
    {colorTokens.map((token) => (
      <div
        key={token.className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 120,
          marginBottom: 16,
        }}
      >
        <div className={`${token.className} w-12 h-12 rounded border`} />
        <span style={{ marginTop: 8, fontSize: 12, textAlign: 'center' }}>
          {token.name}
          <br />
          <code>{token.className}</code>
        </span>
      </div>
    ))}
  </div>
);
