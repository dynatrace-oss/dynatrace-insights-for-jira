import { storage } from '@forge/api';

export const fetchDqlData = async (req) => {
  const { tenantId, query, defaultTimeframeStart, defaultTimeframeEnd } = req.payload;
  const tenantConfigs = await storage.get('tenantConfigs') || [];
  const tenant = tenantConfigs.find(t => t.id === tenantId);
  const token = await storage.getSecret(tenant.tokenKey);
  const baseUrl = tenant.url;

  try {
    const requestBody = {
      query,
      defaultTimeframeStart,
      defaultTimeframeEnd,
      maxResultRecords: 10000,
      maxResultBytes: 4000000,
      defaultScanLimitGbytes: 500,
      filterSegments: [],
      enablePreview: true,
      timezone: 'UTC',
      locale: 'en-US'
    };
    const result = await fetch(`${baseUrl}/platform/storage/query/v1/query:execute?enrich=metric-metadata`, {
      'headers': {
        'accept': 'application/json',
        'accept-language': 'en-US,en;q=0.9,pl;q=0.8',
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        'dt-language': 'en',
        'pragma': 'no-cache',
        'priority': 'u=1, i',
        'Authorization': `Bearer ${token}`
      },
      'body': JSON.stringify(requestBody),
      'method': 'POST',
      'mode': 'cors',
      'credentials': 'include'
    });

    const resultJSON = await result.json();

    const { requestToken } = resultJSON;

    if (resultJSON?.error?.message?.length > 0) {
      return {
        code: resultJSON.error.code,
        error: resultJSON.error.message,
        errorMessage: resultJSON.error.details?.errorMessage,
        exceptionType: resultJSON.error.details?.exceptionType
      };
    }

    let status = 'RUNNING';
    let queryResultData = {};

    while (status === 'RUNNING') {
      const dataResult = await fetch(`${baseUrl}/platform/storage/query/v1/query:poll?request-token=${encodeURIComponent(requestToken)}&enrich=metric-metadata`, {
        'headers': {
          'accept': 'application/json',
          'accept-language': 'en-US,en;q=0.9,pl;q=0.8',
          'cache-control': 'no-cache',
          'content-type': 'application/json',
          'dt-language': 'en',
          'pragma': 'no-cache',
          'priority': 'u=1, i',
          'Authorization': `Bearer ${token}`
        },
        'body': null,
        'method': 'GET'
      });

      queryResultData = await dataResult.json();
      status = queryResultData.state;

      if (status === 'SUCCEEDED' || status === 'FAILED') {
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return queryResultData;
  } catch (error) {
    console.error('Error executing query:', error);
    throw new Error('Failed to execute query');
  }
};

export const verifyDqlQuery = async (req) => {
  const { tenantId, query } = req.payload;
  const tenantConfigs = await storage.get('tenantConfigs') || [];
  const tenant = tenantConfigs.find(t => t.id === tenantId);
  if (!tenant) {return { errors: [] };}
  const token = await storage.getSecret(tenant.tokenKey);
  const baseUrl = tenant.url;

  try {
    const result = await fetch(`${baseUrl}/platform/storage/query/v1/query:verify`, {
      'headers': {
        'accept': 'application/json',
        'content-type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      'body': JSON.stringify({ query }),
      'method': 'POST'
    });

    const resultJSON = await result.json();

    let errors = [];
    if (resultJSON && Array.isArray(resultJSON.notifications)) {
      errors = resultJSON.notifications
        .filter(n => n.severity === 'ERROR' && n.syntaxPosition)
        .map(n => ({
          message: n.message,
          start: n.syntaxPosition.start,
          end: n.syntaxPosition.end
        }));
    }
    return { errors };
  } catch (error) {
    return { errors: [] };
  }
};
