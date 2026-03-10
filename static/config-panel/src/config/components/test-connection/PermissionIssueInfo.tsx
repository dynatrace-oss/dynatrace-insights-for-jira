import React from 'react';

const PermissionIssueInfo = ({ hasPermissionIssue }) => {
  if (!hasPermissionIssue) {return null;}

  return (
    <div style={{
      marginTop: '12px',
      padding: '8px 12px',
      background: 'var(--ds-background-neutral, #F4F5F7)',
      borderRadius: '3px',
      border: '1px solid #FFE380'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
        Token Has Basic Authentication But Lacks Required Permissions
      </div>
      <div style={{ fontSize: '13px' }}>
        <p>Your token was accepted by Dynatrace but doesn't have all the permissions needed for this operation.</p>
        <p>Consider updating your token permissions in the Dynatrace console to include the specific access required.</p>
      </div>
    </div>
  );
};

export default PermissionIssueInfo;
