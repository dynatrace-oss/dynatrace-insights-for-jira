import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigPage } from './ConfigPage.tsx';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigPage/>
    </QueryClientProvider>
  );
}

export { App };
