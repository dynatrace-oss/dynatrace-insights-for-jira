import React from 'react';

const ErrorDetails = ({ errorDetails }) => {
  if (!errorDetails) {return null;}

  return (
    <div style={{ marginTop: '8px', fontSize: '13px' }}>
      {errorDetails.errorType && (
        <div>
          <strong>Error Type:</strong> {errorDetails.errorType}
        </div>
      )}
      {errorDetails.exceptionType && (
        <div>
          <strong>Exception:</strong> {errorDetails.exceptionType}
        </div>
      )}
    </div>
  );
};

export default ErrorDetails;
