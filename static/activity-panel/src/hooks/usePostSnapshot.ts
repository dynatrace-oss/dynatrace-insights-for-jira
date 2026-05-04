import { useState, useCallback, useRef, RefObject } from 'react';
import { invoke } from '@forge/bridge';
import type { ECharts } from 'echarts';
import type { TimeframeValue } from '../utils/timeframe.ts';
import { formatTimeframeLabel } from '../utils/timeframe.ts';
import { getThemeColors } from '../utils/chart-options.ts';

type SnapshotStatus = 'idle' | 'posting' | 'success' | 'error';

interface UsePostSnapshotOptions {
  issueId: string | undefined;
  echartsRef: RefObject<ECharts | null>;
  query: string;
  tenantUrl: string | undefined;
  timeframe: TimeframeValue | undefined;
}

export function usePostSnapshot({ issueId, echartsRef, query, tenantUrl, timeframe }: UsePostSnapshotOptions) {
  const [status, setStatus] = useState<SnapshotStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const busyRef = useRef(false);

  const postSnapshot = useCallback(async () => {
    const instance = echartsRef.current;
    if (!issueId || !instance || busyRef.current) { return; }
    busyRef.current = true;

    setStatus('posting');
    setError(null);

    try {
      const { backgroundColor } = getThemeColors();
      const dataURL = instance.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor });
      const imageBase64 = dataURL.split(',')[1];
      if (!imageBase64) {
        throw new Error('Failed to capture chart as PNG');
      }

      await invoke('postSnapshotComment', {
        issueId,
        imageBase64,
        fileName: `dt-insights-${Date.now()}.png`,
        query,
        tenantUrl,
        timeframe: timeframe ? formatTimeframeLabel(timeframe) : undefined,
      });

      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to post comment');
      setTimeout(() => setStatus('idle'), 3000);
    } finally {
      busyRef.current = false;
    }
  }, [issueId, echartsRef, query, tenantUrl, timeframe]);

  return { status, error, postSnapshot };
}
