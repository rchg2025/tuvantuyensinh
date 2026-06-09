"use client";

import { useEffect, useRef } from "react";

export default function ZaloWidget({ html, position }: { html: string, position: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!containerRef.current || initialized.current) return;
    initialized.current = true;
    
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
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
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
