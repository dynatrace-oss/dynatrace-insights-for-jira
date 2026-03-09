import { useMemo } from 'react';
import { QueryError } from './useQueryVerification';

interface ErrorOverlayProps {
  query: string;
  errors: QueryError[];
}

export function ErrorOverlay({ query, errors }: ErrorOverlayProps) {
  const overlayContent = useMemo(() => {
    if (errors.length === 0 || !query) {
      return null;
    }

    const errorPositions = new Set<number>();
    errors.forEach(error => {
      for (let i = error.start.index; i <= error.end.index; i++) {
        errorPositions.add(i);
      }
    });

    const chars: JSX.Element[] = [];

    for (let i = 0; i < query.length; i++) {
      const char = query[i];
      const isError = errorPositions.has(i);

      if (char === '\n') {
        // Preserve newlines
        chars.push(<br key={i} />);
      } else if (isError) {
        chars.push(
          <span
            key={i}
            className="text-red-500 relative"
            style={{ top: '0.5em' }}
          >
            ~
          </span>
        );
      } else {
        chars.push(
          <span key={i} style={{ color: 'transparent' }}>
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      }
    }

    return chars;
  }, [query, errors]);

  if (!overlayContent) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none px-3 py-2 font-mono text-sm whitespace-pre-wrap break-words overflow-hidden"
      aria-hidden="true"
    >
      {overlayContent}
    </div>
  );
}
