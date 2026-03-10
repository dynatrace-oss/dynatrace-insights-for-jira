import React, { useState } from 'react';
import Button from '@atlaskit/button/new';
import Textfield from '@atlaskit/textfield';
import TenantActions from './TenantActions';
import ConfirmationDialog from './ConfirmationDialog';

interface Tenant {
  id: string;
  url: string;
  hasToken: boolean;
}

interface TenantItemProps {
  tenant: Tenant;
  onSaveTenant: (data: { tenantId: string; url: string; token: string }) => void;
  onDeleteToken: (tenantId: string) => void;
  onDeleteTenant: (tenantId: string) => void;
  onTestConnection: (tenant: Tenant) => void;
  isPending: boolean;
}

const TenantItem: React.FC<TenantItemProps> = ({
  tenant,
  onSaveTenant,
  onDeleteToken,
  onDeleteTenant,
  onTestConnection,
  isPending
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tokenValue, setTokenValue] = useState<string>('');
  const [showDeleteTokenConfirm, setShowDeleteTokenConfirm] = useState<boolean>(false);
  const [showDeleteTenantConfirm, setShowDeleteTenantConfirm] = useState<boolean>(false);

  const handleSaveToken = () => {
    if (tokenValue.trim()) {
      onSaveTenant({
        tenantId: tenant.id,
        url: tenant.url,
        token: tokenValue.trim()
      });
      setIsEditing(false);
      setTokenValue('');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setTokenValue('');
  };

  const handleTestConnection = () => {
    onTestConnection(tenant);
  };

  return (
    <div
      style={{
        border: '1px solid var(--ds-border, #DFE1E6)',
        borderRadius: '3px',
        padding: '12px',
        marginBottom: '12px',
        background: 'var(--ds-background-neutral, transparent)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 'bold' }}>{tenant.url}</div>
          <div
            style={{
              fontSize: '12px',
              color: tenant.hasToken
                ? 'var(--ds-text-success, #36B37E)'
                : 'var(--ds-text-danger, #DE350B)',
              marginBottom: '8px'
            }}
          >
            {tenant.hasToken ? 'API Token configured' : 'API Token not configured'}
          </div>

          {isEditing && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ marginBottom: '8px' }}>
                <Textfield
                  type="password"
                  placeholder="Enter API token"
                  value={tokenValue}
                  onChange={(e) => setTokenValue((e.target as HTMLInputElement).value)}
                  isDisabled={isPending}
                  style={{ width: '300px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button appearance="primary" onClick={handleSaveToken} isDisabled={isPending || !tokenValue.trim()}>
                  {isPending ? 'Saving...' : 'Save Token'}
                </Button>
                <Button appearance="subtle" onClick={handleCancelEdit} isDisabled={isPending}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
        <TenantActions
          tenant={tenant}
          isPending={isPending}
          onTestConnection={handleTestConnection}
          onAddToken={() => setIsEditing(true)}
          onDeleteToken={() => setShowDeleteTokenConfirm(true)}
          onDeleteTenant={() => setShowDeleteTenantConfirm(true)}
          isEditing={isEditing}
        />
      </div>

      {/* Token Removal Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteTokenConfirm}
        onClose={() => setShowDeleteTokenConfirm(false)}
        onConfirm={() => {
          onDeleteToken(tenant.id);
          setShowDeleteTokenConfirm(false);
        }}
        title="Remove API Token"
        message={`Are you sure you want to remove the API token for ${tenant.url}?

      This will revoke access to the tenant's data without removing the tenant configuration itself. This action cannot be undone.`}
        confirmButtonText="Remove Token"
        cancelButtonText="Keep Token"
        isPending={isPending}
      />

      {/* Tenant Removal Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteTenantConfirm}
        onClose={() => setShowDeleteTenantConfirm(false)}
        onConfirm={() => {
          onDeleteTenant(tenant.id);
          setShowDeleteTenantConfirm(false);
        }}
        title="Remove Tenant"
        message={`Are you sure you want to completely remove the tenant ${tenant.url}?

      This will delete the tenant configuration and its API token. All access to this tenant's data will be revoked. This action cannot be undone.`}
        confirmButtonText="Remove Tenant"
        cancelButtonText="Keep Tenant"
        isPending={isPending}
      />
    </div>
  );
};

export default TenantItem;
