import React, { useEffect, useState } from 'react';
import Button from '@atlaskit/button/new';
import Textfield from '@atlaskit/textfield';
import { useTenantConfigs } from './hooks/use-token-status';
import { router } from '@forge/bridge';

const TenantForm = ({ tenant, onSave, isPending }) => {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [formErrors, setFormErrors] = useState<any>({});
  const { data: tenantConfigs = [] } = useTenantConfigs();

  useEffect(() => {
    if (tenant) {
      setUrl(tenant.url || '');
      setToken('');
    } else {
      setUrl('');
      setToken('');
    }
    setFormErrors({});
  }, [tenant]);

  // Only allow subdomains ending with .dynatrace.com, not just dynatrace.com itself
  const isValidDynatraceUrl = (url: string) => {
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      const hostname = parsed.hostname.toLowerCase();
      return (
        hostname.endsWith('.dynatrace.com') &&
        hostname !== 'dynatrace.com'
      );
    } catch {
      return false;
    }
  };

  // Validate URL format
  const isValidUrl = (url) => {
    return url.trim() !== '' && /^https?:\/\/.+/.test(url) && isValidDynatraceUrl(url);
  };

  // Handle URL changes with validation
  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);

    // Clear error if URL becomes valid
    if (formErrors.url && isValidUrl(newUrl)) {
      setFormErrors(prev => ({ ...prev, url: undefined }));
    }
  };

  const validateForm = () => {
    const errors: any = {};
    if (!url.trim()) {
      errors.url = 'Tenant URL is required';
    } else if (!isValidUrl(url)) {
      errors.url = 'Please enter a valid Dynatrace URL (https://*.dynatrace.com)';
    } else {
      // Check for duplicate URL
      // Normalize URL: trim, convert to lowercase, and remove trailing slashes
      const normalizedUrl = url.trim().toLowerCase().replace(/\/*$/, '');
      const isDuplicate = tenantConfigs.some(config => {
        // Normalize existing URLs the same way
        const normalizedConfigUrl = config.url.toLowerCase().replace(/\/*$/, '');
        return normalizedConfigUrl === normalizedUrl && (!tenant || config.id !== tenant.id);
      });

      if (isDuplicate) {
        errors.url = 'This tenant URL already exists. Duplicate URLs are not allowed.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave({
        url: url.trim(),
        token: token.trim() || undefined
      });
    }
  };

  // Handle form submission on enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div style={{ marginBottom: '16px', marginTop: '10px' }}>
      <div style={{ marginBottom: '12px' }}>
        <label htmlFor="tenant-url" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
          Tenant URL *
        </label>
        <Textfield
          id="tenant-url"
          placeholder="https://yourtenant.dynatrace.com"
          value={url}
          onChange={handleUrlChange}
          onKeyDown={handleKeyDown}
          isDisabled={isPending}
          isInvalid={Boolean(formErrors.url)}
          style={{ width: '100%', maxWidth: '400px' }}
          autoFocus
          autoComplete="url"
        />
        {formErrors.url ? (
          <div style={{ color: '#DE350B', fontSize: '12px', marginTop: '4px' }}>
            {formErrors.url}
          </div>
        ) : (
          <div style={{ color: '#6B778C', fontSize: '12px', marginTop: '4px' }}>
            Example: https://abc12345.apps.dynatrace.com
          </div>
        )}
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="tenant-token" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
          API Token
        </label>
        <Textfield
          id="tenant-token"
          type="password"
          placeholder={tenant && tenant.hasToken ? 'Token already configured' : 'Enter API token'}
          value={token}
          onChange={(e) => setToken((e.target as any).value)}
          onKeyDown={handleKeyDown}
          isDisabled={isPending}
          style={{ width: '100%', maxWidth: '400px' }}
          autoComplete="new-password"
        />
        <div style={{ color: '#6B778C', fontSize: '12px', marginTop: '4px' }}>
          API token can be configured in your{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              router.open('https://myaccount.dynatrace.com/platformTokens');
            }}
            style={{ color: '#0052CC', textDecoration: 'none' }}
          >
            Dynatrace account settings (https://myaccount.dynatrace.com/platformTokens)
          </a>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Button
          appearance="primary"
          onClick={handleSubmit}
          isDisabled={isPending}
        >
          {isPending ? 'Saving...' : (tenant ? 'Update' : 'Save')}
        </Button>
        {!tenant && (
          <Button
            appearance="subtle"
            onClick={() => onSave({ cancelled: true })}
            isDisabled={isPending}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

export default TenantForm;
