import React from 'react';
import Button from '@atlaskit/button/new';
import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';

const TenantActions = ({
  tenant,
  isPending,
  onTestConnection,
  onAddToken,
  onDeleteToken,
  onDeleteTenant,
  isEditing
}) => {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      {tenant.hasToken && (
        <Button
          appearance="primary"
          isDisabled={isPending}
          onClick={onTestConnection}
        >
          Test Connection
        </Button>
      )}
      {!tenant.hasToken && !isEditing && (
        <Button
          appearance="primary"
          isDisabled={isPending}
          onClick={onAddToken}
        >
          Add Token
        </Button>
      )}
      <DropdownMenu
        trigger={({ triggerRef, ...props }) => (
          <Button
            {...props}
            ref={triggerRef}
            appearance="default"
            isDisabled={isPending}
          ><span style={{ margin: '0 4px' }}>⋮</span></Button>
        )}
      >
        <DropdownItemGroup>
          {tenant.hasToken && (
            <DropdownItem
              onClick={() => onDeleteToken()}
            >
              Remove token
            </DropdownItem>
          )}
          <DropdownItem
            onClick={() => onDeleteTenant()}
          >
            Remove tenant
          </DropdownItem>
        </DropdownItemGroup>
      </DropdownMenu>
    </div>
  );
};

export default TenantActions;
