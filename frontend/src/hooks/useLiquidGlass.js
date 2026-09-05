import { useEffect, useRef } from 'react';
import { liquidGlass } from '../utils/liquid-glass';

/**
 * React hook for liquid glass effect.
 * Applies refraction to the referenced element on mount, cleans up on unmount.
 *
 * @param {Object} opts - liquidGlass options
 * @returns {React.RefObject} - Attach to the target element
 */
export function useLiquidGlass(opts = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const instance = liquidGlass(el, opts);

    return () => {
      instance.destroy();
    };
  }, []);

  return ref;
}
