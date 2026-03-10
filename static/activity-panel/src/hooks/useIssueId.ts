import { useEffect, useState } from 'react';
import { view } from '@forge/bridge';

export function useIssueId(): string | undefined {
  const [issueId, setIssueId] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function fetchIssueId() {
      try {
        console.log('>>>', view);
        const context = await view.getContext();
        console.log('>>>', context);
        setIssueId(context?.extension?.issue?.id);
      } catch (error) {
        console.error('ERROR!!:', error);
        setIssueId(undefined);
      }
    }
    fetchIssueId();
  }, []);

  return issueId;
}
