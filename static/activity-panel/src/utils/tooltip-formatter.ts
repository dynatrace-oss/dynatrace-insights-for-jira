import { formatAxisValue } from './dql-data';

function formatTooltipTime(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return isoString; // fallback for non-ISO values
  }
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Returns HTML string without inline styles to avoid Content Security Policy violations
 */
export function createTooltipFormatter(params: any): string {
  if (!params || params.length === 0) {return '';}

  const sorted = [...params].sort((a, b) => {
    const valA = typeof a.value === 'number' ? a.value : -Infinity;
    const valB = typeof b.value === 'number' ? b.value : -Infinity;
    return valB - valA;
  });

  const topItems = sorted.slice(0, 5);

  const truncate = (str: string, max: number) =>
    str.length > max ? `${str.slice(0, max - 1)}…` : str;

  let html = `<strong>${formatTooltipTime(params[0].axisValue)}</strong><br/>`;

  topItems.forEach((item) => {
    const valueStr = typeof item.value === 'number'
      ? formatAxisValue(item.value)
      : String(item.value ?? 'N/A');
    const truncateLen = Math.max(12, 40 - valueStr.length);
    const seriesName = truncate(item.seriesName, truncateLen);

    html += `${seriesName}: <b>${valueStr}</b><br/>`;
  });

  if (params.length > 5) {
    html += `<i>+${params.length - 5} more...</i>`;
  }

  return html;
}
