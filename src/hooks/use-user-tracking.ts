"use client";

import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useTRPC } from "@/trpc/client";

// Generate a session ID at module load time - runs ONCE per page load
// This is a pure memory-based session, no localStorage dependency
let SESSION_ID: string = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const REQUEST_COUNT_STORAGE_KEY = "devroast_request_count";

export function useUserTracking() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  const trpc = useTRPC();
  const trackRequest = useMutation(trpc.roast.trackRequest.mutationOptions());
  const decrementRequest = useMutation(trpc.roast.decrementRequestCount.mutationOptions());

  // Load persistent requestCount from localStorage AFTER hydration
  useEffect(() => {
    try {
      const stored = localStorage.getItem(REQUEST_COUNT_STORAGE_KEY);
      if (stored) {
        setRequestCount(parseInt(stored, 10));
      }
    } catch (e) {
      // ignore
    }
    setIsHydrated(true);
  }, []);

  // Save requestCount to localStorage whenever it changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(REQUEST_COUNT_STORAGE_KEY, String(requestCount));
    } catch (e) {
      // ignore
    }
  }, [requestCount, isHydrated]);

  const trackRoastRequest = async () => {
    // SESSION_ID is ALWAYS initialized at module load, never null/empty
    if (!SESSION_ID) return { shouldShowForm: false, requestCount: 0 };

    try {
      const result = await trackRequest.mutateAsync({ sessionId: SESSION_ID });
      setRequestCount(result.requestCount);

      if (result.shouldShowForm) {
        setIsModalOpen(true);
      }

      return result;
    } catch (error) {
      console.error("trackRoastRequest error:", error);
      return { shouldShowForm: false, requestCount: 0 };
    }
  };

  const handleCancelModal = async () => {
    if (!SESSION_ID) return;

    try {
      const result = await decrementRequest.mutateAsync({ sessionId: SESSION_ID });
      setRequestCount(result.requestCount);
      setIsModalOpen(false);
    } catch (error) {
      console.error("handleCancelModal error:", error);
      setIsModalOpen(false);
    }
  };

  return {
    sessionId: SESSION_ID,
    requestCount,
    isModalOpen,
    setIsModalOpen,
    trackRoastRequest,
    handleCancelModal,
  };
}
