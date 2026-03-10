import React from 'react';

const TenantInfo = ({ tenant }) => (
  <div style={{
    backgroundColor: 'var(--ds-background-neutral, #F4F5F7)',
    padding: '12px 16px',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid var(--ds-border, #DFE1E6)'
  }}>
    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px', color: 'var(--ds-text, #172B4D)' }}>
      Testing Tenant: {tenant.url}
    </div>
    <div style={{ fontSize: '13px', color: tenant.hasToken ? 'var(--ds-text-success, #36B37E)' : 'var(--ds-text-danger, #DE350B)' }}>
      {tenant.hasToken ? 'API token is configured. Testing connection and permissions.' : 'No API token configured.'}
    </div>
  </div>
);

export default TenantInfo;
