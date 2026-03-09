import { storage } from '@forge/api';

export const autocompleteDql = async (req) => {
  const { tenantId, query, cursorPosition } = req.payload;

  if (!tenantId || query === undefined) {
    throw new Error('Tenant ID and query are required');
  }

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
    // Call the Dynatrace autocomplete API
    const autocompleteEndpoint = `${tenant.url}/platform/storage/query/v1/query:autocomplete`;

    const response = await fetch(autocompleteEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query,
        cursorPosition: cursorPosition || query.length, // Default to end of query if not specified
        maxSuggestions: 10
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Failed to parse error response'
      }));

      return {
        success: false,
        status: response.status,
        message: `Error: ${response.statusText}`,
        data: errorData
      };
    }

    const apiResponse = await response.json();

    const transformedSuggestions = [];

    if (apiResponse && apiResponse.suggestions && apiResponse.suggestions.length > 0) {
      apiResponse.suggestions.forEach(suggestion => {
        if (suggestion.parts && suggestion.parts.length > 0) {
          const mainPart = suggestion.parts.find(part => part.type !== 'SPACE');

          if (mainPart) {
            transformedSuggestions.push({
              text: mainPart.suggestion,
              description: mainPart.info || mainPart.synopsis || '',
              type: mainPart.type || 'SUGGESTION',
              primary: true,
              needsSpace: suggestion.parts.some(part => part.type === 'SPACE')
            });
          } else {
            // If no main part found, use the full suggestion
            transformedSuggestions.push({
              text: suggestion.suggestion,
              description: '',
              type: 'SUGGESTION',
              primary: false,
              needsSpace: false
            });
          }
        }
      });
    }

    return {
      success: true,
      data: {
        suggestions: transformedSuggestions,
        optional: apiResponse.optional || false
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Error: ${error.message || 'Unknown error'}`,
      data: { error: error.toString() }
    };
  }
};
