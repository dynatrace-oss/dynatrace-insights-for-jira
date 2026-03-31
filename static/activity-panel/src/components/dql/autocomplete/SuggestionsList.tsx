import { useRef, useEffect } from 'react';
import { SuggestionListItem, SuggestionItem } from './SuggestionListItem';
import { useAutocompleteNavigation } from '../../../hooks/useAutocompleteNavigation';

interface SuggestionsListProps {
  suggestions: SuggestionItem[]
  isLoading?: boolean
  highlightText?: string
  onSelect: (suggestion: SuggestionItem) => void
  onClose: () => void
}

export function SuggestionsList({
  suggestions,
  isLoading,
  highlightText,
  onSelect,
  onClose,
}: SuggestionsListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = suggestions.filter((s) => s.text !== '');

  const { selectedIndex } = useAutocompleteNavigation({
    items: filteredSuggestions,
    onSelect,
    onClose,
  });

  // Scroll active item into view
  useEffect(() => {
    if (activeItemRef.current && listRef.current) {
      activeItemRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'instant',
      });
    }
  }, [selectedIndex]);

  return (
    <div
      ref={listRef}
      role="listbox"
      className="absolute left-0 mt-1 w-80 max-h-[200px] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-50"
    >
      {isLoading ? (
        <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
          Loading suggestions...
        </div>
      ) : (
        filteredSuggestions.map((suggestion, index) => (
          <div
            key={`${suggestion.text}-${index}`}
            ref={index === selectedIndex ? activeItemRef : undefined}
            role="option"
            aria-selected={index === selectedIndex}
          >
            <SuggestionListItem
              suggestion={suggestion}
              isActive={index === selectedIndex}
              highlightText={highlightText}
              onSelect={onSelect}
            />
          </div>
        ))
      )}
    </div>
  );
}
