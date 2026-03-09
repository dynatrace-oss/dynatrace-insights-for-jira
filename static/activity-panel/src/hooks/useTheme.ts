import { useEffect, useState } from 'react';

/**
 * Custom hook that forces component re-render when theme changes
 * Observes both data-color-mode attribute (Forge) and .dark class (Tailwind)
 *
 * Use this hook in components that need to update their appearance when the theme switches.
 */
export function useForceRenderOnThemeChange() {
  const [, setThemeUpdate] = useState(0);

  useEffect(() => {
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      setThemeUpdate(prev => prev + 1);
    });

    // Observe changes to data-color-mode and class attributes
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-color-mode', 'class']
    });

    return () => observer.disconnect();
  }, []);
}
