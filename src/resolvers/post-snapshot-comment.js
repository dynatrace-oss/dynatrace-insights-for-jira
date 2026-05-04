import api, { route } from '@forge/api';

export const postSnapshotComment = async (req) => {
  const { issueId, imageBase64, fileName, query, tenantUrl, timeframe } = req.payload;
  if (!issueId || !imageBase64) {
    throw new Error('issueId and imageBase64 are required');
  }

  const safeName = (fileName || `dt-insights-${Date.now()}.png`).replace(/[^a-zA-Z0-9._-]/g, '_');
  const attachmentFileName = await uploadAttachment(issueId, imageBase64, safeName);
  await postComment(issueId, attachmentFileName, { query, tenantUrl, timeframe });

  return { success: true };
};

async function uploadAttachment(issueId, imageBase64, fileName) {
  const imgBuffer = Buffer.from(imageBase64, 'base64');
  const boundary = `FormBoundary${Date.now()}`;
  const CRLF = '\r\n';

  const headerBytes = Buffer.from(
    `--${boundary}${CRLF}` +
    `Content-Disposition: form-data; name="file"; filename="${fileName}"${CRLF}` +
    `Content-Type: image/png${CRLF}${CRLF}`
  );
  const footerBytes = Buffer.from(`${CRLF}--${boundary}--${CRLF}`);
  const body = new Blob(
    [Buffer.concat([headerBytes, imgBuffer, footerBytes])],
    { type: `multipart/form-data; boundary=${boundary}` }
  );

  const res = await api.asUser().requestJira(route`/rest/api/3/issue/${issueId}/attachments`, {
    method: 'POST',
    headers: {
      'X-Atlassian-Token': 'no-check',
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Attachment upload failed (${res.status}): ${text}`);
  }

  const [attachment] = await res.json();
  if (!attachment) {
    throw new Error('Attachment upload returned no data');
  }

  return attachment.filename;
}

async function postComment(issueId, attachmentFileName, { query, tenantUrl, timeframe }) {
  const lines = ['*Dynatrace Insights snapshot*\n'];

  if (tenantUrl) { lines.push(`*Environment:* ${tenantUrl}`); }
  if (timeframe) { lines.push(`*Timeframe:* ${timeframe}`); }
  if (query) { lines.push(`*Query:*\n{code}${query}{code}`); }
  lines.push('', `!${attachmentFileName}|width=800!`);

  const res = await api.asUser().requestJira(route`/rest/api/2/issue/${issueId}/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body: lines.join('\n') }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Comment post failed (${res.status}): ${text}`);
  }
}
