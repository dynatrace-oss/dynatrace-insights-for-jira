import React, { useState } from 'react';
import ModalDialog from '@atlaskit/modal-dialog/modal-dialog';
import ModalTransition from '@atlaskit/modal-dialog/modal-transition';

import TenantInfo from './test-connection/TenantInfo';
import QueryTypeSelector, { TEST_TYPES } from './test-connection/QueryTypeSelector';
import TestActions from './test-connection/TestActions';
import TestingStatus from './test-connection/TestingStatus';
import TestResult from './test-connection/TestResult';
import { modalContentStyles } from './test-connection/styles';

const TestConnectionDialog = ({ isOpen, onClose, onRunTest, tenant, isPending, testResult }) => {
  const [selectedTest, setSelectedTest] = useState(TEST_TYPES[0]);
  const [customQuery, setCustomQuery] = useState('');
  const [useCustomQuery, setUseCustomQuery] = useState(false);

  const handleRunTest = () => {
    onRunTest({
      tenantId: tenant.id,
      query: useCustomQuery ? customQuery : selectedTest.query
    });
  };

  const isRunTestDisabled = useCustomQuery && !customQuery.trim();

  return (
    <ModalTransition>
      {isOpen && (
        <ModalDialog
          onClose={onClose}
          width="large"
        >
          <div style={{
            ...modalContentStyles,
            background: 'var(--ds-background-neutral, transparent)',
            borderRadius: '3px'
          }}>
            <TenantInfo tenant={tenant} />

            <div style={{ marginBottom: '20px' }}>
              <p style={{ marginBottom: '8px' }}>Test the connection to your Dynatrace tenant using the token you provided.</p>
              <p style={{ color: 'var(--ds-text-subtle, #505F79)' }}>
                Select a test type or enter a custom DQL query to verify access permissions.
              </p>
            </div>

            <QueryTypeSelector
              useCustomQuery={useCustomQuery}
              setUseCustomQuery={setUseCustomQuery}
              selectedTest={selectedTest}
              setSelectedTest={setSelectedTest}
              customQuery={customQuery}
              setCustomQuery={setCustomQuery}
              isPending={isPending}
            />

            <TestActions
              onRunTest={handleRunTest}
              onCancel={onClose}
              isPending={isPending}
              isRunDisabled={isRunTestDisabled}
            />

            <TestingStatus isPending={isPending} tenantUrl={tenant.url} />

            <TestResult testResult={testResult} />
          </div>
        </ModalDialog>
      )}
    </ModalTransition>
  );
};

export default TestConnectionDialog;
