import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { invoke } from '@forge/bridge';
import { SuggestionItem } from './SuggestionListItem';

interface AutocompleteResponse {
  success: boolean
  data?: {
    suggestions: SuggestionItem[]
  }
}

interface UseAutocompleteOptions {
  tenantId: string | undefined
  query: string
  cursorPosition: number
  enabled?: boolean
}

// Word boundary characters for DQL queries
const WORD_BOUNDARY_CHARS = new Set([' ', '\n', '|', '(', ')', '[', ']', '{', '}', "'", '"', '<', '>', ',']);

/**
 * Analyzes the current word at the cursor position.
 * Returns both the word start position and the current word text.
 * Used for caching (fetch at word boundary) and local filtering.
 */
function getWordContext(text: string, cursorPosition: number): { startPosition: number; word: string } {
  let startPosition = cursorPosition;

  while (startPosition > 0 && !WORD_BOUNDARY_CHARS.has(text[startPosition - 1])) {
    startPosition--;
  }

  return {
    startPosition,
    word: text.slice(startPosition, cursorPosition).toLowerCase()
  };
}

export function getCurrentWord(text: string, cursorPosition: number): string {
  return getWordContext(text, cursorPosition).word;
}

function filterSuggestionsByPrefix(suggestions: SuggestionItem[], currentWord: string): SuggestionItem[] {
  if (!currentWord) {
    return suggestions;
  }

  return suggestions.filter(s => s.text.toLowerCase().startsWith(currentWord));
}

function sortSuggestions(suggestions: SuggestionItem[], currentWord: string): SuggestionItem[] {
  if (!currentWord) {
    return suggestions;
  }

  return [...suggestions].sort((a, b) => {
    const aLower = a.text.toLowerCase();
    const bLower = b.text.toLowerCase();
    const aStartsWith = aLower.startsWith(currentWord);
    const bStartsWith = bLower.startsWith(currentWord);

    // Prioritize suggestions that start with the current word
    if (aStartsWith && !bStartsWith) {
      return -1;
    }
    if (!aStartsWith && bStartsWith) {
      return 1;
    }

    // If both start with or both don't start with, sort alphabetically
    return aLower.localeCompare(bLower);
  });
}

async function fetchSuggestions(tenantId: string, query: string, wordStartPosition: number): Promise<SuggestionItem[]> {
  // Fetch suggestions for the position at the start of the current word
  // This allows caching results and filtering locally as user types more characters
  const queryUpToWordStart = query.slice(0, wordStartPosition);

  const response = await invoke<AutocompleteResponse>('autocompleteDql', {
    tenantId,
    query: queryUpToWordStart,
    cursorPosition: wordStartPosition
  });

  if (response?.success && response.data?.suggestions) {
    return response.data.suggestions;
  }

  return [];
}

export function useAutocomplete({ tenantId, query, cursorPosition, enabled = true }: UseAutocompleteOptions) {
  // Calculate word boundaries for caching optimization
  const { startPosition: wordStartPosition, word: currentWord } = getWordContext(query, cursorPosition);
  const queryUpToWordStart = query.slice(0, wordStartPosition);

  const queryResult = useQuery({
    // Cache key uses query up to word start, so "fetch f", "fetch fe", "fetch fetch" all share cache
    queryKey: ['autocomplete', tenantId, queryUpToWordStart, wordStartPosition],
    queryFn: ({ signal }) => {
      // Check if aborted before starting
      if (signal?.aborted) {
        return Promise.reject(new Error('Aborted'));
      }

      return fetchSuggestions(tenantId!, query, wordStartPosition);
    },
    enabled: enabled && Boolean(tenantId) && query.trim().length > 0,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 60000, // Keep in cache for 1 minute
  });

  // Filter and sort suggestions locally based on current word
  const filteredData = useMemo(() => {
    if (!queryResult.data) {
      return undefined;
    }
    const filtered = filterSuggestionsByPrefix(queryResult.data, currentWord);
    return sortSuggestions(filtered, currentWord);
  }, [queryResult.data, currentWord]);

  return {
    ...queryResult,
    data: filteredData,
  };
}
