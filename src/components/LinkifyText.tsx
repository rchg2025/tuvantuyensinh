import React from "react";

export default function LinkifyText({ text }: { text: string }) {
  if (!text) return null;
  // Regex matches URLs, Emails, and Vietnamese Phone numbers (10-11 digits)
  const combinedRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|(?:0|\+84)[0-9]{9,10}\b)/g;
  const parts = text.split(combinedRegex);

  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;

        if (part.match(/^https?:\/\/[^\s]+$/)) {
          return (
            <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
              {part}
            </a>
          );
        } else if (part.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
          return (
            <a key={i} href={`mailto:${part}`} className="text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
              {part}
            </a>
          );
        } else if (part.match(/^(?:0|\+84)[0-9]{9,10}$/)) {
          return (
            <a key={i} href={`tel:${part}`} className="text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
              {part}
            </a>
          );
        }

        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
