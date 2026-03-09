import { useState, useCallback, useEffect } from 'react';

interface UseAutocompleteNavigationProps<T> {
  items: T[];
  onSelect: (item: T) => void;
  onClose: () => void;
}

export function useAutocompleteNavigation<T>({
  items,
  onSelect,
  onClose,
}: UseAutocompleteNavigationProps<T>) {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const resetSelection = useCallback(() => {
    setSelectedIndex(-1);
  }, []);

  useEffect(() => {
    resetSelection();
  }, [items.length, resetSelection]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < items.length - 1 ? prev + 1 : 0
        );
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : items.length - 1
        );
        break;
      }
      case 'Enter': {
        setSelectedIndex((prev) => {
          if (prev >= 0 && prev < items.length) {
            e.preventDefault();
            onSelect(items[prev]);
          }
          return prev;
        });
        break;
      }
      case 'Escape': {
        e.preventDefault();
        onClose();
        break;
      }
      default:
        break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [items, onSelect, onClose]);

  return { selectedIndex, resetSelection };
}
