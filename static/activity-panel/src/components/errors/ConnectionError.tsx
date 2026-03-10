interface ConnectionErrorProps {
  error: string
}

export function ConnectionError({ error }: ConnectionErrorProps) {
  return (
    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
      <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">Connection Error</h3>
      <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
    </div>
  );
}
