import { IssuePanelContainer } from './components/IssuePanelContainer.tsx';
import { useTenantConfigs } from './hooks/useTenantConfigs.tsx';
import { NoTenantsConfigured } from './components/errors/NoTenantsConfigured.tsx';

function App() {
  const { tenantConfigs, isLoading } = useTenantConfigs();

  const renderContent = () => {
    if (isLoading) {
      return <div className="p-4 text-gray-800 dark:text-gray-200">Loading...</div>;
    }

    if (tenantConfigs.length === 0) {
      return <NoTenantsConfigured />;
    }

    return <IssuePanelContainer />;
  };

  return (
    <div className="min-h-[600px] p-4 space-y-4 bg-white dark:bg-gray-900 transition-colors">
      {renderContent()}
    </div>
  );
}

export default App;
