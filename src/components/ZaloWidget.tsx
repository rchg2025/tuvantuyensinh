"use client";

import { useEffect, useRef } from "react";

export default function ZaloWidget({ html, position }: { html: string, position: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      
      // Clean up any global Zalo chat widgets that might have been injected to the body
    document.querySelectorAll('div[class*="zalo-chat-widget"]').forEach(el => {
      if (!containerRef.current?.contains(el)) {
        el.remove();
      }
    });
    document.querySelectorAll('iframe[src*="zalo.me/"], iframe[src*="chat.zalo.me/"]').forEach(el => {
      // Find the absolute positioned parent that Zalo usually creates
      let parent = el.parentElement;
      while (parent && parent !== document.body) {
        const style = window.getComputedStyle(parent);
        if (style.position === 'fixed' || style.position === 'absolute') {
          parent.remove();
          break;
        }
        parent = parent.parentElement;
      }
      if (document.body.contains(el)) el.remove();
    });

    // Clean up old scripts
    document.querySelectorAll('script[src*="sp.zalo.me"]').forEach(el => el.remove());
    if ((window as any).ZaloSocialPlugin) {
      delete (window as any).ZaloSocialPlugin;
    }

    // Clear previous
    containerRef.current.innerHTML = "";

    // Convert html string into real DOM nodes
    const slotHtml = document.createRange().createContextualFragment(html);
    
    // Append to container
    containerRef.current.appendChild(slotHtml);

    // Recreate script tags to ensure they get executed by the browser natively
    const scripts = containerRef.current.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
      newScript.text = oldScript.text;
        document.body.appendChild(newScript);
        oldScript.remove(); // Remove it from the container so it's not confusing
      });
    }, 3500); // Delay 3.5s to improve PageSpeed LCP and TBT

    return () => clearTimeout(timer);
  }, [html]);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .zalo-pos-left .zalo-chat-widget {
             left: 20px !important;
             right: auto !important;
          }
          .zalo-pos-right .zalo-chat-widget {
             right: 20px !important;
             left: auto !important;
          }
        `
      }} />
      <div ref={containerRef} suppressHydrationWarning className={`zalo-widget-container zalo-pos-${position}`} />
    </>
  );
}
