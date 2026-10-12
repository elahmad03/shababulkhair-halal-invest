"use client";

import { useState, useEffect } from "react";
import { ScrollText } from "lucide-react";

function renderInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

interface Section {
  heading: string | null;
  items: string[];
}

function parseMarkdown(md: string): Section[] {
  const lines = md.split("\n");
  const sections: Section[] = [];
  let current: Section = { heading: null, items: [] };

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (current.items.length > 0 || current.heading) sections.push(current);
      current = { heading: line.replace(/^## /, ""), items: [] };
    } else if (!line.startsWith("# ")) {
      current.items.push(line);
    }
  }
  if (current.items.length > 0 || current.heading) sections.push(current);
  return sections;
}

export default function TermsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/terms.md")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.text();
      })
      .then((text) => setSections(parseMarkdown(text)))
      .catch(() => setError(true));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="p-3 bg-primary/10 rounded-xl">
            <ScrollText className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Terms and Conditions</h1>
            <p className="text-muted-foreground text-sm mt-1">Shabab Al-Khair Halal Investment Platform</p>
          </div>
        </div>

        {error && (
          <p className="text-destructive text-sm">
            Could not load Terms and Conditions. Please refresh the page.
          </p>
        )}

        <div className="space-y-10">
          {sections.map((section, si) => (
            <div key={si} className="space-y-3">
              {section.heading && (
                <h2 className="text-xl font-semibold text-foreground border-l-4 border-primary pl-4">
                  {section.heading}
                </h2>
              )}
              <div className="space-y-2 pl-1">
                {section.items.map((line, li) => {
                  if (line.trim() === "---") {
                    return <hr key={li} className="border-border my-4" />;
                  }
                  if (line.trim() === "") {
                    return <div key={li} className="h-1" />;
                  }
                  if (line.startsWith("- ")) {
                    const content = line.slice(2);
                    return (
                      <div key={li} className="flex gap-2 items-start">
                        <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-primary block" />
                        <p
                          className="text-muted-foreground text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: renderInline(content) }}
                        />
                      </div>
                    );
                  }
                  return (
                    <p
                      key={li}
                      className="text-muted-foreground text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: renderInline(line) }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-12 text-xs text-muted-foreground text-center">
          Last updated: October 2026 &mdash; Shabab Al-Khair
        </p>
      </div>
    </div>
  );
}
