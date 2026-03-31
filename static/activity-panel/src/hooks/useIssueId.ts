import { useEffect, useState } from 'react';
import { view } from '@forge/bridge';

export function useIssueId(): string | undefined {
  const [issueId, setIssueId] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function fetchIssueId() {
      try {
        const context = await view.getContext();
        setIssueId(context?.extension?.issue?.id);
      } catch (error) {
        console.error(error);
        setIssueId(undefined);
      }
    }
    fetchIssueId();
  }, []);

  return issueId;
}
