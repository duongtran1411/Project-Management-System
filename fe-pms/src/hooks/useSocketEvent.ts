import { useEffect } from "react";
import { useSocket } from "./useSocket";

export function useSocketEvent(
  event: string,
  handler: (...args: any[]) => void,
  deps: any[] = []
) {
  const { socket, on } = useSocket();
  useEffect(() => {
    if (!socket) return;
    const cleanup = on(event, handler);
    return () => {
      if (cleanup) cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, event, ...deps]);
}
