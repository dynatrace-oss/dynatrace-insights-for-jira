import { storage } from '@forge/api';

export const saveTenantConfig = async (req) => {
  const { tenantId, url, token } = req.payload;
  if (!tenantId || !url) {
    throw new Error('Tenant ID and URL are required');
  }

  const tenantConfigs = await storage.get('tenantConfigs') || [];

  const existingTenantIndex = tenantConfigs.findIndex(t => t.id === tenantId);

  if (existingTenantIndex >= 0) {
    const updatedTenant = {
      ...tenantConfigs[existingTenantIndex],
      url
    };

    if (token) {
      updatedTenant.tokenKey = `tenant_token_${tenantId}`;
    }

    tenantConfigs[existingTenantIndex] = updatedTenant;
  } else {
    if (tenantConfigs.length >= 10) {
      throw new Error('Maximum of 10 tenant configurations allowed');
    }
    tenantConfigs.push({
      id: tenantId,
      url,
      ...(token ? { tokenKey: `tenant_token_${tenantId}` } : {})
    });
  }

  await storage.set('tenantConfigs', tenantConfigs);

  if (token) {
    await storage.setSecret(`tenant_token_${tenantId}`, token);
  }

  return { success: true };
};

export const getTenantConfigs = async () => {
  const tenantConfigs = await storage.get('tenantConfigs') || [];

  const configsWithTokenStatus = await Promise.all(
    tenantConfigs.map(async (tenant) => {
      const hasToken = tenant.tokenKey ?
        Boolean(await storage.getSecret(tenant.tokenKey)) : false;

      return {
        ...tenant,
        hasToken
      };
    })
  );

  return { tenantConfigs: configsWithTokenStatus };
};

export const deleteTenantToken = async (req) => {
  const { tenantId } = req.payload;
  if (!tenantId) {
    throw new Error('Tenant ID is required');
  }

  const tenantConfigs = await storage.get('tenantConfigs') || [];
  const tenant = tenantConfigs.find(t => t.id === tenantId);

  if (!tenant || !tenant.tokenKey) {
    throw new Error('Tenant not found or has no token');
  }

  // Delete the token
  await storage.deleteSecret(tenant.tokenKey);

  return { success: true };
};

export const testTenantConnection = async (req) => {
  const { tenantId, query } = req.payload;
  if (!tenantId) {
    throw new Error('Tenant ID is required');
  }
  if (!query) {
    throw new Error('Query is required');
  }

  // Get tenant configuration
  const tenantConfigs = await storage.get('tenantConfigs') || [];
  const tenant = tenantConfigs.find(t => t.id === tenantId);

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  if (!tenant.tokenKey) {
    throw new Error('No API token configured for this tenant');
  }

  // Get the token
  const token = await storage.getSecret(tenant.tokenKey);
  if (!token) {
    throw new Error('API token not found');
  }

  try {
    // Execute the DQL query against the Grail endpoint
    const grailEndpoint = `${tenant.url}/platform/storage/query/v1/query:execute`;
    const currentTime = new Date();
    const oneHourAgo = new Date(currentTime.getTime() - (60 * 60 * 1000));

    const response = await fetch(grailEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query,
        defaultTimeframeStart: oneHourAgo.toISOString(),
        defaultTimeframeEnd: currentTime.toISOString(),
        timezone: 'UTC',
        locale: 'en-US',
        maxResultRecords: 10,
        maxResultBytes: 100000,
        fetchTimeoutSeconds: 30,
        enablePreview: true
      })
    });

    // Check for HTTP error
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;

      // Check for permission errors in the response
      if (errorData && errorData.error) {
        if (errorData.error.details && errorData.error.details.errorType) {
          const { details } = errorData.error;

          // Handle specific authorization errors
          if (details.errorType === 'NOT_AUTHORIZED_FOR_TABLE' ||
                        details.errorType === 'AUTHORIZATION_REQUIRED') {
            return {
              success: false,
              status: response.status,
              permissionIssue: true,
              message: `Permission Error: ${details.errorMessage || 'Insufficient permissions'}`,
              data: errorData
            };
          } else if (details.exceptionType === 'DQL-AUTHORIZATION') {
            return {
              success: false,
              status: response.status,
              permissionIssue: true,
              message: `Authorization Error: ${details.errorMessage || errorData.error.message || 'Access denied'}`,
              data: errorData
            };
          }
        } else if (errorData.error.message) {
          errorMessage = `Error: ${errorData.error.message}`;
        }
      }

      return {
        success: false,
        status: response.status,
        message: errorMessage,
        data: errorData
      };
    }

    // Parse the response JSON
    const responseData = await response.json();

    // If we get a requestToken, it means the query is running asynchronously
    if (responseData.requestToken) {
      return {
        success: true,
        message: 'Query started successfully. You have the correct permissions to execute this query.',
        data: responseData
      };
    }

    return {
      success: true,
      message: 'Connection successful!',
      data: responseData
    };
  } catch (error) {
    return {
      success: false,
      message: `Error: ${error.message || 'Unknown error'}`,
      data: { error: error.toString() }
    };
  }
};

export const deleteTenantConfig = async (req) => {
  const { tenantId } = req.payload;
  if (!tenantId) {
    throw new Error('Tenant ID is required');
  }

  // Get existing tenant configurations
  let tenantConfigs = await storage.get('tenantConfigs') || [];
  const tenant = tenantConfigs.find(t => t.id === tenantId);

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  // Delete the token if exists
  if (tenant.tokenKey) {
    await storage.deleteSecret(tenant.tokenKey);
  }

  // Remove tenant from configurations
  tenantConfigs = tenantConfigs.filter(t => t.id !== tenantId);
  await storage.set('tenantConfigs', tenantConfigs);

  return { success: true };
};
