import DropdownMenu, { DropdownItem, DropdownItemGroup } from '@atlaskit/dropdown-menu';
import type { TenantConfig } from '../types/tenant';

interface TenantSelectorProps {
  tenants: TenantConfig[]
  selectedTenantId: string | undefined
  onChange: (tenantId: string) => void
}

export function TenantSelector({ tenants, selectedTenantId, onChange }: TenantSelectorProps) {
  const selected = tenants.find(t => t.id === selectedTenantId);
  const label = selected ? selected.url.replace('https://', '') : 'Select tenant';

  return (
    <DropdownMenu trigger={label} shouldRenderToParent spacing="compact">
      <DropdownItemGroup>
        {tenants.map(tenant => (
          <DropdownItem
            key={tenant.id}
            onClick={() => onChange(tenant.id)}
            isSelected={tenant.id === selectedTenantId}
          >
            {tenant.url.replace('https://', '')}
          </DropdownItem>
        ))}
      </DropdownItemGroup>
    </DropdownMenu>
  );
}
