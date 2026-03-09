import React from 'react';

const TestingStatus = ({ isPending, tenantUrl }) => {
  if (!isPending) {return null;}

  return (
    <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '16px', color: '#505F79' }}>
      <div>Testing connection to {tenantUrl}...</div>
      <div style={{ fontSize: '13px', marginTop: '4px' }}>This may take a few seconds</div>
    </div>
  );
};

export default TestingStatus;
