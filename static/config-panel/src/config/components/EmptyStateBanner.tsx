import React from 'react';
import Button from '@atlaskit/button/new';

const EmptyStateBanner = ({ onAddTenant, isPending }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        borderRadius: '8px',
        textAlign: 'center',
        margin: '24px 0'
      }}
    >
      <div style={{ marginBottom: '8px' }}>
        {/* Icon can be added here if desired */}
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z" fill="#6B778C"/>
        </svg>
      </div>
      <h3 style={{ margin: '8px 0', color: '#172B4D', fontSize: '18px' }}>No Tenant Configurations</h3>
      <p style={{ margin: '8px 0 16px', color: '#505F79', maxWidth: '480px' }}>
        Configure your first Dynatrace tenant to start using the application. You'll need a tenant URL and optionally an API token.
      </p>
      <Button
        appearance="primary"
        onClick={onAddTenant}
        isDisabled={isPending}
      >
        Add Your First Tenant
      </Button>
    </div>
  );
};

export default EmptyStateBanner;
