import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Custom hook that safely detects client mount state using React's useSyncExternalStore.
 * Returns false on the server (SSR), and true on the client after hydration,
 * preventing hydration mismatch errors without triggering cascading useEffect renders.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
