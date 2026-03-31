import { filterKnownNotifications } from '../utils/dql-notifications.ts';
import type { DqlResult } from '../types/dql.ts';

interface DqlQueryNotificationsProps {
  queryResult: DqlResult
}

export function DqlQueryNotifications({ queryResult }: DqlQueryNotificationsProps) {
  const notifications = filterKnownNotifications(queryResult);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification, index) => (
        <div
          key={`${notification.notificationType}-${index}`}
          className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md"
        >
          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
            {notification.meta.title}
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {notification.message}
          </p>
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            {notification.meta.hint}
          </p>
        </div>
      ))}
    </div>
  );
}
