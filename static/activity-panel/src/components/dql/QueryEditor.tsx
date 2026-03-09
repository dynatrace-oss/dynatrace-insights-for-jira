import { useRef, useCallback, useState, useEffect } from 'react';
import { DqlTextarea } from './DqlTextarea';
import { useQueryVerification } from './useQueryVerification';
import { useQueryEditorKeyboard } from '../../hooks/useQueryEditorKeyboard';
import { SuggestionsList, useAutocomplete, getCurrentWord } from './autocomplete';
import type { SuggestionItem } from './autocomplete';

interface QueryEditorProps {
  query: string
  tenantId: string | undefined
  onQueryChange: (query: string) => void
  onExecute: () => void
  isExecuting: boolean
}

export function QueryEditor({ query, tenantId, onQueryChange, onExecute, isExecuting }: QueryEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [hasTypedSinceFocus, setHasTypedSinceFocus] = useState(false);

  // Hide autocomplete when query execution starts
  useEffect(() => {
    if (isExecuting) {
      setHasTypedSinceFocus(false);
    }
  }, [isExecuting]);

  const { errors } = useQueryVerification({
    tenantId,
    query,
    enabled: Boolean(tenantId) && !isExecuting,
  });

  const showAutocomplete = isFocused && hasTypedSinceFocus && !isExecuting;

  const { data: suggestions = [], isLoading } = useAutocomplete({
    tenantId,
    query,
    cursorPosition,
    enabled: Boolean(tenantId) && !isExecuting && showAutocomplete
  });

  const currentWord = getCurrentWord(query, cursorPosition);

  const applySuggestion = useCallback((suggestion: SuggestionItem) => {
    const wordLen = currentWord.length;
    const before = query.slice(0, cursorPosition - wordLen);
    const after = query.slice(cursorPosition);
    const insertText = suggestion.text + (suggestion.needsSpace ? ' ' : '');
    const newQuery = before + insertText + after;
    const newCursorPosition = before.length + insertText.length;

    onQueryChange(newQuery);
    setCursorPosition(newCursorPosition);
    setHasTypedSinceFocus(false);

    // Restore focus and cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  }, [query, cursorPosition, currentWord, onQueryChange]);

  const handleCloseSuggestions = useCallback(() => {
    setHasTypedSinceFocus(false);
  }, []);

  const isSuggestionsVisible = showAutocomplete && (suggestions.length > 0 || isLoading);

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onQueryChange(e.target.value);
    setCursorPosition(e.target.selectionStart);
    setHasTypedSinceFocus(true);
  }, [onQueryChange]);

  const handleCursorChange = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.currentTarget.selectionStart);
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setHasTypedSinceFocus(false);
  }, []);

  const { handleKeyDown } = useQueryEditorKeyboard({
    query,
    isExecuting,
    isSuggestionsVisible,
    onExecute,
  });

  return (
    <div className="relative h-full">
      <DqlTextarea
        ref={textareaRef}
        value={query}
        onChange={handleQueryChange}
        onKeyDown={handleKeyDown}
        onSelect={handleCursorChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Enter your DQL query here..."
        rows={6}
        disabled={isExecuting}
        errors={errors}
      />
      {isSuggestionsVisible && (
        <SuggestionsList
          suggestions={suggestions}
          isLoading={isLoading}
          highlightText={currentWord}
          onSelect={applySuggestion}
          onClose={handleCloseSuggestions}
        />
      )}
    </div>
  );
}
