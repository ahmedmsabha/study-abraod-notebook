"use client";

import ReactMarkdown from "react-markdown";

export function NoteMarkdown({ content }: { content: string }) {
  return (
    <div className="space-y-3 text-sm [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_h1]:font-heading [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-medium [&_li]:ms-4 [&_li]:list-disc [&_ol>li]:list-decimal [&_p]:leading-relaxed [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3 [&_ul]:space-y-1">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
