import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { TenantConfigsProvider, useTenantConfigs } from './hooks/useTenantConfigs.tsx';
import { useIssueId } from './hooks/useIssueId.ts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IssueConfigProvider } from './hooks/useIssueConfig.tsx';
import { view } from '@forge/bridge';

const queryClient = new QueryClient();

function AppWrapper() {
  const issueId = useIssueId();
  const { tenantConfigs } = useTenantConfigs();

  useEffect(() => {
    view.theme.enable();
  }, []);

  if (issueId && tenantConfigs) {
    return (
      <IssueConfigProvider issueId={issueId}>
        <App/>
      </IssueConfigProvider>
    );
  }
  return <div>Loading...</div>;

}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TenantConfigsProvider>
        <AppWrapper />
      </TenantConfigsProvider>
    </QueryClientProvider>
  </StrictMode>
);
