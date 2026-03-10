export interface SuggestionItem {
  text: string
  description: string
  type: string
  primary: boolean
  needsSpace: boolean
}

interface SuggestionListItemProps {
  suggestion: SuggestionItem
  isActive: boolean
  highlightText?: string
  onSelect: (suggestion: SuggestionItem) => void
}

function HighlightedText({ text, highlight }: { text: string; highlight?: string }) {
  if (!highlight) {
    return <>{text}</>;
  }

  const lowerText = text.toLowerCase();
  const lowerHighlight = highlight.toLowerCase();
  const index = lowerText.indexOf(lowerHighlight);

  if (index === -1) {
    return <>{text}</>;
  }

  const before = text.slice(0, index);
  const match = text.slice(index, index + highlight.length);
  const after = text.slice(index + highlight.length);

  return (
    <>
      {before}
      <span className="underline">{match}</span>
      {after}
    </>
  );
}

export function SuggestionListItem({
  suggestion,
  isActive,
  highlightText,
  onSelect
}: SuggestionListItemProps) {
  return (
    <div
      onMouseDown={(e) => {
        e.preventDefault();
        onSelect(suggestion);
      }}
      className={`px-3 py-2 text-sm cursor-pointer ${
        isActive
          ? 'bg-blue-500 text-white'
          : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <div className="font-mono font-semibold">
        <HighlightedText text={suggestion.text} highlight={highlightText} />
      </div>
      {suggestion.description && (
        <div
          className={`text-xs mt-0.5 ${
            isActive ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {suggestion.description}
        </div>
      )}
    </div>
  );
}
