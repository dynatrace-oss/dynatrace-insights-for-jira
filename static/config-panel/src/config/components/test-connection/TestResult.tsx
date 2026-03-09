import React from 'react';
import ErrorDetails from './ErrorDetails';
import PermissionIssueInfo from './PermissionIssueInfo';
import ResponseDetails from './ResponseDetails';

const TestResult = ({ testResult }) => {
  if (!testResult) {return null;}

  // Choose colors based on result
  let backgroundColor = 'var(--ds-background-neutral, transparent)';
  let borderColor = 'var(--ds-border, #DFE1E6)';
  let textColor = 'var(--ds-text, #172B4D)';

  if (testResult.success) {
    backgroundColor = 'var(--ds-background-success, #E3FCEF)';
    borderColor = 'var(--ds-border-success, #36B37E)';
    textColor = 'var(--ds-text-success, #36B37E)';
  } else if (testResult.permissionIssue) {
    backgroundColor = 'var(--ds-background-warning, #FFFAE6)';
    borderColor = 'var(--ds-border-warning, #FFAB00)';
    textColor = 'var(--ds-text-warning, #FFAB00)';
  } else {
    backgroundColor = 'var(--ds-background-danger, #FFEBE6)';
    borderColor = 'var(--ds-border-danger, #DE350B)';
    textColor = 'var(--ds-text-danger, #DE350B)';
  }

  const resultTitle = testResult.success ? 'Connection Successful' :
    (testResult.permissionIssue ? 'Permission Issue' : 'Connection Error');

  const errorDetails = testResult.data?.error?.details;
  return (
    <div style={{ marginTop: '20px' }}>
      <h4 style={{
        marginBottom: '12px',
        borderBottom: '1px solid var(--ds-border, #DFE1E6)',
        paddingBottom: '8px'
      }}>Test Result:</h4>
      <div
        style={{
          backgroundColor,
          padding: '8px 12px',
          borderRadius: '3px',
          border: `1px solid ${borderColor}`,
          color: textColor
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
          {resultTitle}
        </div>
        <div>
          {testResult.message}
        </div>
        {testResult.status === 500 && (
          <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--ds-text-warning, #FFAB00)' }}>
            Please check for typos or mistakes in your Dynatrace tenant domain.
          </div>
        )}
        <PermissionIssueInfo hasPermissionIssue={testResult.permissionIssue} />

        <ErrorDetails errorDetails={errorDetails} />

        <ResponseDetails
          data={testResult.data}
          defaultOpen={!testResult.success}
        />
      </div>
    </div>
  );
};

export default TestResult;
