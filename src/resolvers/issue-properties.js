import api, { route } from '@forge/api';

export const saveIssueProperties = async (req) => {
  const { issueId, propertyName, value } = req.payload;
  if (!issueId || !propertyName || typeof value !== 'object') {
    throw new Error('Issue ID, property name, and value object are required');
  }

  const res = await api.asApp().requestJira(route`/rest/api/3/issue/${issueId}/properties/${propertyName}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value)
  });

  return { success: res.ok };
};

export const getIssueProperties = async (req) => {
  const { issueId, propertyName } = req.payload;
  if (!issueId || !propertyName) {
    throw new Error('Issue ID and property name are required');
  }

  const propRes = await api.asApp().requestJira(route`/rest/api/3/issue/${issueId}/properties/${propertyName}`, {
    method: 'GET'
  });

  if (propRes.ok) {
    const propData = await propRes.json();
    return propData.value;
  }

  return {};
};
