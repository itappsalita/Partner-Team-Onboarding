"use client";

import { useEffect, useRef, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";

/**
 * IdleTimer component: Detects user inactivity and signs out after 10 minutes.
 */
export default function IdleTimer() {
  const { status } = useSession();
  const timerRef = useRef<number | null>(null);
  
  // 10 minutes in milliseconds
  const IDLE_TIMEOUT = 10 * 60 * 1000;
  const STORAGE_KEY = "alita_last_activity";

  const handleLogout = useCallback(() => {
    console.log("[IdleTimer] Inactivity limit reached. Signing out...");
    signOut({ callbackUrl: "/" });
  }, []);

  const resetTimer = useCallback(() => {
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY, now.toString());

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    
    if (status === "authenticated") {
      timerRef.current = window.setTimeout(handleLogout, IDLE_TIMEOUT) as unknown as number;
    }
  }, [status, handleLogout, IDLE_TIMEOUT]);

  const checkIdleStatus = useCallback(() => {
    if (status !== "authenticated") return;

    const lastActivity = parseInt(localStorage.getItem(STORAGE_KEY) || "0");
    const now = Date.now();

    if (lastActivity > 0 && now - lastActivity >= IDLE_TIMEOUT) {
      console.log("[IdleTimer] Detected idle time from other tab or during sleep. Logging out...");
      handleLogout();
    } else {
      resetTimer();
    }
  }, [status, handleLogout, resetTimer, IDLE_TIMEOUT]);

  useEffect(() => {
    console.log(`[IdleTimer] Component mounted. Current status: ${status}`);
    
    if (status !== "authenticated") return;

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];
    const eventHandler = () => resetTimer();

    // Initial check and set
    resetTimer();

    // Activity listeners
    events.forEach((event) => {
      window.addEventListener(event, eventHandler);
    });

    // Visibility change listener (re-check when tab becomes visible)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[IdleTimer] Tab visible, checking idle status...");
        checkIdleStatus();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      console.log("[IdleTimer] Cleaning up listeners...");
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, eventHandler);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status, resetTimer, checkIdleStatus]);

  return null;
}
