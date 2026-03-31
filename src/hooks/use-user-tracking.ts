"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTRPC } from "@/trpc/client";

const SESSION_ID_COOKIE_NAME = "devroast_session_id";
const SESSION_ID_STORAGE_KEY = "devroast_session_id_storage";

function getOrCreateSessionId(): string {
  // Check if running in browser
  if (typeof window === "undefined") {
    console.log("[sessionId] Running on server, returning empty");
    return "";
  }

  // Try to get from cookie first
  const cookies = document.cookie.split("; ");
  const sessionCookie = cookies.find((c) =>
    c.startsWith(SESSION_ID_COOKIE_NAME),
  );

  if (sessionCookie) {
    const id = sessionCookie.split("=")[1];
    console.log("[sessionId] Found in cookie:", id);
    return id;
  }

  // Try to get from localStorage as fallback
  try {
    const storedId = localStorage.getItem(SESSION_ID_STORAGE_KEY);
    if (storedId) {
      console.log("[sessionId] Found in localStorage:", storedId);
      // Re-sync to cookie
      const expiresIn = 30 * 24 * 60 * 60 * 1000;
      const expires = new Date(Date.now() + expiresIn).toUTCString();
      document.cookie = `${SESSION_ID_COOKIE_NAME}=${storedId}; expires=${expires}; path=/; Secure; SameSite=Lax`;
      return storedId;
    }
  } catch (e) {
    console.warn("[sessionId] localStorage error:", e);
  }

  // Create new session ID
  const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log("[sessionId] Creating new session ID:", newSessionId);

  // Set cookie (expires in 30 days)
  const expiresIn = 30 * 24 * 60 * 60 * 1000;
  const expires = new Date(Date.now() + expiresIn).toUTCString();
  document.cookie = `${SESSION_ID_COOKIE_NAME}=${newSessionId}; expires=${expires}; path=/; Secure; SameSite=Lax`;
  console.log("[sessionId] Cookie set");

  // Also store in localStorage as backup
  try {
    localStorage.setItem(SESSION_ID_STORAGE_KEY, newSessionId);
    console.log("[sessionId] Stored in localStorage");
  } catch (e) {
    console.warn("[sessionId] Could not store in localStorage:", e);
  }

  return newSessionId;
}

export function useUserTracking() {
  const [sessionId, setSessionId] = useState<string>("");
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const trpc = useTRPC();
  const trackRequest = useMutation(
    trpc.roast.trackRequest.mutationOptions(),
  );
  const decrementRequest = useMutation(
    trpc.roast.decrementRequestCount.mutationOptions(),
  );

  // Initialize sessionId only on client after mount
  useEffect(() => {
    console.log("[useUserTracking] Initializing on client mount...");
    const id = getOrCreateSessionId();
    console.log("[useUserTracking] sessionId initialized:", id);
    setSessionId(id);
    setIsMounted(true);
  }, []);

  const trackRoastRequest = async () => {
    if (!isMounted) {
      console.warn("[trackRoastRequest] ❌ Not mounted yet! Skipping track.");
      return { shouldShowForm: false, requestCount: 0 };
    }

    console.log("[trackRoastRequest] Called with sessionId:", sessionId);
    
    if (!sessionId) {
      console.warn("[trackRoastRequest] ❌ sessionId is empty!");
      return { shouldShowForm: false, requestCount: 0 };
    }

    try {
      console.log("[trackRoastRequest] Sending mutation...");
      const result = await trackRequest.mutateAsync({ sessionId });
      console.log("[trackRoastRequest] ✅ Result:", result);

      setRequestCount(result.requestCount);
      setShouldShowModal(result.shouldShowForm);

      if (result.shouldShowForm) {
        console.log("[trackRoastRequest] Setting isModalOpen = true");
        setIsModalOpen(true);
      } else {
        console.log("[trackRoastRequest] shouldShowForm is false, not opening modal");
      }

      return result;
    } catch (error) {
      console.error("[trackRoastRequest] ❌ Error:", error);
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
