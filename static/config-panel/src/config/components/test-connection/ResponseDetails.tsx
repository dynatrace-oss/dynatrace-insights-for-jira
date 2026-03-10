import React, { useState } from 'react';
import Button from '@atlaskit/button/new';
import { responseBoxStyles } from './styles';

const ResponseDetails = ({ data, defaultOpen }) => {
  const [showDetails, setShowDetails] = useState(defaultOpen);

  if (!data) {return null;}

  return (
    <div style={{ marginTop: '8px' }}>
      <Button
        appearance="subtle"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? 'Hide Response Details' : 'Show Response Details'}
      </Button>
      {showDetails && (
        <pre
          style={{
            ...responseBoxStyles,
            background: 'var(--ds-background-neutral, #F4F5F7)',
            color: undefined // Use theme/default font color
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ResponseDetails;
