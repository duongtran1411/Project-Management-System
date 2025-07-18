import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { getCurrentUserId } from "@/helpers/utils";

interface UseSocketReturn {
  socket: Socket | null;
  connected: boolean;
  on: (
    event: string,
    callback: (...args: any[]) => void
  ) => (() => void) | null;
  off: (event: string, callback: (...args: any[]) => void) => void;
  emit: (event: string, data?: any) => void;
}

export const useSocket = (): UseSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const connectedRef = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const userId = getCurrentUserId();
    if (!userId) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

    socketRef.current = io(socketUrl, {
      transports: ["websocket", "polling"],
      auth: {
        userId,
      },
      reconnection: false,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected");
      connectedRef.current = true;
      reconnectAttemptsRef.current = 0;

      socketRef.current?.emit("join-user", userId);
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      connectedRef.current = false;

      if (reason === "io server disconnect") {
        socketRef.current?.connect();
      } else if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay =
          baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      }
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      connectedRef.current = false;
    });
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    connectedRef.current = false;
    reconnectAttemptsRef.current = 0;
  }, []);

  const on = useCallback(
    (event: string, callback: (...args: any[]) => void) => {
      if (!socketRef.current) return null;

      socketRef.current.on(event, callback);

      return () => {
        if (socketRef.current) {
          socketRef.current.off(event, callback);
        }
      };
    },
    []
  );

  const off = useCallback(
    (event: string, callback: (...args: any[]) => void) => {
      if (socketRef.current) {
        socketRef.current.off(event, callback);
      }
    },
    []
  );

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn("Socket not connected, cannot emit event:", event);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    socket: socketRef.current,
    connected: connectedRef.current,
    on,
    off,
    emit,
  };
};
