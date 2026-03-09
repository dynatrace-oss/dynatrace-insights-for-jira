import React from 'react';
import Button from '@atlaskit/button/new';

const TestActions = ({ onRunTest, onCancel, isPending, isRunDisabled }) => (
  <div style={{ marginTop: '24px', marginBottom: '24px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
      <Button
        appearance="primary"
        onClick={onRunTest}
        isDisabled={isPending || isRunDisabled}
      >
        {isPending ? 'Testing...' : 'Run Test'}
      </Button>

      <Button
        appearance="default"
        onClick={onCancel}>
        Cancel
      </Button>
    </div>
  </div>
);

export default TestActions;
