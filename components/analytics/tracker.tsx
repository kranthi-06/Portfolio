"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function getSessionId() {
  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    // Generate temporary ID to send to server. Server will return the real DB session ID
    sessionId = "temp_" + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
}

function setSessionId(id: string) {
  sessionStorage.setItem("analytics_session_id", id);
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Initial Pageview
    const trackPageview = async () => {
      const payload = {
        pathname,
        searchParams: searchParams.toString() ? Object.fromEntries(searchParams.entries()) : {},
        referrer: document.referrer || "direct",
        resolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
      };

      try {
        const res = await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "pageview",
            payload,
            sessionId: getSessionId()
          }),
        });
        
        const data = await res.json();
        if (data.sessionId && data.sessionId.startsWith("temp_") === false) {
          setSessionId(data.sessionId);
        }
      } catch (err) {
        console.error("Failed to track pageview", err);
      }
    };

    trackPageview();

    // Heartbeat for "Time on Page" and "Live Users"
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const sessionId = getSessionId();
      if (!sessionId.startsWith("temp_")) {
        // Use sendBeacon if available, fallback to fetch
        const payload = JSON.stringify({ action: "ping", sessionId });
        if (navigator.sendBeacon) {
          navigator.sendBeacon("/api/analytics/track", payload);
        } else {
          fetch("/api/analytics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      }
    }, 10000); // 10 seconds

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pathname, searchParams]);

  // Global event listener for links
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Find closest anchor tag or element with data-track
      const trackElement = target.closest('[data-track]');
      const anchorElement = target.closest('a');
      
      let eventName = "";
      let eventData: any = {};
      
      if (trackElement) {
        eventName = trackElement.getAttribute('data-track') || "click";
        eventData.label = trackElement.getAttribute('data-track-label') || trackElement.textContent?.trim();
      } else if (anchorElement) {
        const href = anchorElement.getAttribute('href');
        if (href && href.startsWith('http') && !href.includes(window.location.host)) {
          eventName = "external_link";
          eventData.url = href;
          if (href.includes("github.com")) eventName = "github_click";
          if (href.includes("linkedin.com")) eventName = "linkedin_click";
        }
      }

      if (eventName) {
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "event",
            payload: { eventName, eventData },
            sessionId: getSessionId()
          }),
          keepalive: true,
        }).catch(() => {});
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  return null;
}
