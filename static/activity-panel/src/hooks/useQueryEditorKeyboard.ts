import { useCallback } from 'react';

const SUGGESTION_NAV_KEYS = new Set(['ArrowUp', 'ArrowDown', 'Escape']);

interface UseQueryEditorKeyboardProps {
  query: string;
  isExecuting: boolean;
  isSuggestionsVisible: boolean;
  onExecute: () => void;
}

export function useQueryEditorKeyboard({
  query,
  isExecuting,
  isSuggestionsVisible,
  onExecute,
}: UseQueryEditorKeyboardProps) {
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      if (!isExecuting && query.trim()) {
        onExecute();
        return;
      }
    }

    if (isSuggestionsVisible && SUGGESTION_NAV_KEYS.has(e.key)) {
      e.preventDefault();
    }
  }, [isExecuting, isSuggestionsVisible, query, onExecute]);

  return { handleKeyDown };
}
