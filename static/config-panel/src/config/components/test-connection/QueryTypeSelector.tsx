import React from 'react';
import Select from '@atlaskit/select';
import Textfield from '@atlaskit/textfield';

const TEST_TYPES = [
  { label: 'Logs', value: 'logs', query: 'fetch logs | limit 1' },
  { label: 'Events', value: 'events', query: 'fetch events | limit 1' }
];

const QueryTypeSelector = ({
  useCustomQuery,
  setUseCustomQuery,
  selectedTest,
  setSelectedTest,
  customQuery,
  setCustomQuery,
  isPending
}) => {
  return (
    <>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <input
            type="radio"
            id="predefined"
            name="queryType"
            checked={!useCustomQuery}
            onChange={() => setUseCustomQuery(false)}
            style={{ marginRight: '8px' }}
          />
          <label htmlFor="predefined" style={{ fontWeight: !useCustomQuery ? 'bold' : 'normal' }}>Use predefined query</label>
        </div>

        {!useCustomQuery && (
          <Select
            options={TEST_TYPES}
            value={selectedTest}
            onChange={option => setSelectedTest(option)}
            isDisabled={isPending || useCustomQuery}
            menuPortalTarget={document.body}
            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
          />
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <input
            type="radio"
            id="custom"
            name="queryType"
            checked={useCustomQuery}
            onChange={() => setUseCustomQuery(true)}
            style={{ marginRight: '8px' }}
          />
          <label htmlFor="custom" style={{ fontWeight: useCustomQuery ? 'bold' : 'normal' }}>Use custom DQL query</label>
        </div>

        {useCustomQuery && (
          <Textfield
            placeholder="Enter your DQL query (e.g. fetch logs | limit 1)"
            value={customQuery}
            onChange={e => setCustomQuery((e.target as any).value)}
            isDisabled={isPending || !useCustomQuery}
            style={{ width: '100%' }}
          />
        )}
      </div>
    </>
  );
};

export { TEST_TYPES };
export default QueryTypeSelector;
