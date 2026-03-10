import React, { useState } from 'react';
import Button from '@atlaskit/button/new';
import TenantItem from './components/TenantItem';
import { useTenantConfigs } from './hooks/use-token-status';
import { useDeleteTenant, useDeleteTenantToken, useSaveTenant } from './hooks/use-tenant-mutations';
import { useTestConnection } from './hooks/use-test-connection';
import TenantForm from './TenantForm';
import TestConnectionDialog from './components/TestConnectionDialog';
import EmptyStateBanner from './components/EmptyStateBanner';
import SecurityBanner from './components/SecurityBanner';
import { useToast } from './context/ToastContext.tsx';

export const ConfigPage = () => {
  const [isAddingTenant, setIsAddingTenant] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const { showToast } = useToast();

  const { data: tenantConfigs = [], isLoading, isError, error } = useTenantConfigs();
  const saveTenantMutation = useSaveTenant();
  const deleteTenantTokenMutation = useDeleteTenantToken();
  const deleteTenantMutation = useDeleteTenant();
  const testConnectionMutation = useTestConnection();

  // Don't consider test connection mutations for disabling the background UI
  const isPending = saveTenantMutation.isPending ||
  deleteTenantTokenMutation.isPending ||
  deleteTenantMutation.isPending;

  const handleSaveTenant = ({ tenantId, url, token }) => {

    // Check for duplicate URL before updating
    // Normalize URL: trim, convert to lowercase, and remove trailing slashes
    const normalizedUrl = url.trim().toLowerCase().replace(/\/*$/, '');
    const isDuplicate = tenantConfigs.some(config => {
      // Normalize existing URLs the same way
      const normalizedConfigUrl = config.url.toLowerCase().replace(/\/*$/, '');
      return normalizedConfigUrl === normalizedUrl && config.id !== tenantId;
    });

    if (isDuplicate) {
      showToast('This tenant URL already exists. Duplicate URLs are not allowed.', 'error');
      return;
    }

    saveTenantMutation.mutate({ tenantId, url, token }, {
      onSuccess: () => {
        showToast('Tenant configuration saved successfully.');
      },
      onError: (error) => {
        showToast(`Failed to save tenant: ${error?.message || 'Unknown error'}`, 'error');
      }
    });
  };

  const handleOpenTestDialog = (tenant) => {
    setSelectedTenant(tenant);
    setTestResult(null);
    setTestDialogOpen(true);
  };

  const handleCloseTestDialog = () => {
    setTestDialogOpen(false);
    setSelectedTenant(null);
    setTestResult(null);
  };

  const handleRunTest = (data) => {
    setTestResult(null);
    testConnectionMutation.mutate(data, {
      onSuccess: (result: any) => {
        setTestResult(result);
      },
      onError: (error) => {
        setTestResult({
          success: false,
          message: `Error: ${error.message || 'Unknown error'}`
        } as any);
      }
    });
  };

  const handleAddTenant = ({ url, token, cancelled }) => {
    // If cancelled flag is true, just return
    if (cancelled) {return;}

    // Check for duplicate URL before saving
    // Normalize URL: trim, convert to lowercase, and remove trailing slashes
    const normalizedUrl = url.trim().toLowerCase().replace(/\/*$/, '');
    const isDuplicate = tenantConfigs.some(config => {
      // Normalize existing URLs the same way
      const normalizedConfigUrl = config.url.toLowerCase().replace(/\/*$/, '');
      return normalizedConfigUrl === normalizedUrl;
    });

    if (isDuplicate) {
      showToast('Failed: This tenant URL already exists. Duplicate URLs are not allowed.');
      return;
    }

    const tenantId = `tenant-${Date.now()}`;
    saveTenantMutation.mutate({ tenantId, url, token }, {
      onSuccess: () => {
        setIsAddingTenant(false);
        showToast('Tenant configuration saved successfully.');
      },
      onError: (error) => {
        showToast(`Failed to save tenant: ${error?.message || 'Unknown error'}`, 'error');
      }
    });
  };

  const handleDeleteToken = (tenantId) => {
    deleteTenantTokenMutation.mutate(tenantId, {
      onSuccess: () => {
        showToast('Tenant token deleted successfully.');
      },
      onError: (error) => {
        showToast(`Failed to delete token: ${error?.message || 'Unknown error'}`, 'error');
      }
    });
  };

  const handleDeleteTenant = (tenantId) => {
    deleteTenantMutation.mutate(tenantId, {
      onSuccess: () => {
        showToast('Tenant deleted successfully.');
      },
      onError: (error) => {
        showToast(`Failed to delete tenant: ${error?.message || 'Unknown error'}`, 'error');
      }
    });
  };

  const handleCancelAddTenant = () => {
    setIsAddingTenant(false);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <div style={{ fontSize: '16px', marginBottom: '8px' }}>Loading tenant configurations...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: '16px', color: '#DE350B' }}>
        <h2>Error Loading Configurations</h2>
        <div>There was a problem loading tenant configurations: {error?.message || 'Unknown error'}</div>
        <Button appearance="primary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 32px 32px 24px' }}>
      <h2>Tenants Configuration</h2>

      <SecurityBanner />

      {tenantConfigs.length > 0 ? (
        <div style={{ marginBottom: '16px', maxHeight: 'auto' }}>
          <h3>Configured Tenants</h3>
          <div style={{ marginTop: '8px' }}>
            {tenantConfigs.map(tenant => (
              <TenantItem
                key={tenant.id}
                tenant={tenant}
                onSaveTenant={handleSaveTenant}
                onDeleteToken={handleDeleteToken}
                onDeleteTenant={handleDeleteTenant}
                onTestConnection={handleOpenTestDialog}
                isPending={isPending}
              />
            ))}
          </div>
        </div>
      ) : !isAddingTenant && (
        <EmptyStateBanner
          onAddTenant={() => setIsAddingTenant(true)}
          isPending={isPending}
        />
      )}

      {isAddingTenant ? (
        <div>
          <h3>Add New Tenant</h3>
          <TenantForm
            tenant={undefined}
            onSave={data => {
              if (data.cancelled) {
                handleCancelAddTenant();
              } else {
                handleAddTenant(data);
              }
            }}
            isPending={isPending}
          />
        </div>
      ) : (
        tenantConfigs.length > 0 && tenantConfigs.length < 10 && (
          <Button
            appearance="primary"
            onClick={() => setIsAddingTenant(true)}
            isDisabled={isPending}
          >
            Add Tenant
          </Button>
        )
      )}

      {/* Test Connection Dialog */}
      {selectedTenant && (
        <TestConnectionDialog
          isOpen={testDialogOpen}
          onClose={handleCloseTestDialog}
          onRunTest={handleRunTest}
          tenant={selectedTenant}
          isPending={testConnectionMutation.isPending}
          testResult={testResult}
        />
      )}
    </div>
  );
};
