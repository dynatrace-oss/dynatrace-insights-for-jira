import { forwardRef } from 'react';
import { ErrorOverlay } from './ErrorOverlay';
import { QueryError } from './useQueryVerification';

interface DqlTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onKeyUp?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSelect?: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  errors?: QueryError[];
}

export const DqlTextarea = forwardRef<HTMLTextAreaElement, DqlTextareaProps>(
  ({ value, onChange, onKeyDown, onKeyUp, onSelect, onFocus, onBlur, placeholder, rows = 6, disabled = false, errors = [] }, ref) => {
    return (
      <div className="relative h-full">
        <textarea
          ref={ref}
          id="query"
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          onSelect={onSelect}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className="w-full h-full min-h-[6rem] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 font-mono text-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <ErrorOverlay query={value} errors={errors} />
      </div>
    );
  }
);

DqlTextarea.displayName = 'DqlTextarea';
