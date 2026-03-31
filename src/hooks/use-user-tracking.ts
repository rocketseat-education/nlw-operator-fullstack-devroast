"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTRPC } from "@/trpc/client";

const SESSION_ID_COOKIE_NAME = "devroast_session_id";

function getOrCreateSessionId(): string {
  // Check if running in browser
  if (typeof window === "undefined") {
    return "";
  }

  // Try to get from cookie
  const cookies = document.cookie.split("; ");
  const sessionCookie = cookies.find((c) =>
    c.startsWith(SESSION_ID_COOKIE_NAME),
  );

  if (sessionCookie) {
    const id = sessionCookie.split("=")[1];
    return id;
  }

  // Create new session ID
  const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Set cookie (expires in 30 days)
  const expiresIn = 30 * 24 * 60 * 60 * 1000;
  const expires = new Date(Date.now() + expiresIn).toUTCString();
  document.cookie = `${SESSION_ID_COOKIE_NAME}=${newSessionId}; expires=${expires}; path=/`;

  return newSessionId;
}

export function useUserTracking() {
  const [sessionId, setSessionId] = useState<string>("");
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestCount, setRequestCount] = useState(0);

  const trpc = useTRPC();
  const trackRequest = useMutation(
    trpc.roast.trackRequest.mutationOptions(),
  );
  const decrementRequest = useMutation(
    trpc.roast.decrementRequestCount.mutationOptions(),
  );

  useEffect(() => {
    const id = getOrCreateSessionId();
    setSessionId(id);
  }, []);

  const trackRoastRequest = async () => {
    if (!sessionId) {
      return { shouldShowForm: false, requestCount: 0 };
    }

    try {
      const result = await trackRequest.mutateAsync({ sessionId });

      setRequestCount(result.requestCount);
      setShouldShowModal(result.shouldShowForm);

      if (result.shouldShowForm) {
        setIsModalOpen(true);
      }

      return result;
    } catch (error) {
      console.error("❌ Error tracking request:", error);
      return { shouldShowForm: false, requestCount: 0 };
    }
  };

  const handleCancelModal = async () => {
    if (!sessionId) {
      return;
    }

    try {
      const result = await decrementRequest.mutateAsync({ sessionId });
      setRequestCount(result.requestCount);
      setIsModalOpen(false);
    } catch (error) {
      console.error("❌ Error decrementing request:", error);
      setIsModalOpen(false);
    }
  };

  return {
    sessionId,
    requestCount,
    shouldShowModal,
    isModalOpen,
    setIsModalOpen,
    trackRoastRequest,
    handleCancelModal,
  };
}
