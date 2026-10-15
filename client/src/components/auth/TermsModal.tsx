"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ScrollText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

function renderInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function parseMarkdown(md: string) {
  const lines = md.split("\n");
  const sections: { heading: string | null; items: string[] }[] = [];
  let current: { heading: string | null; items: string[] } = { heading: null, items: [] };

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

export default function TermsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
  const [sections, setSections] = useState<{ heading: string | null; items: string[] }[]>([]);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setHasScrolledToBottom(false);
    setLoadError(false);
    fetch("/terms.md")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.text();
      })
      .then((text) => setSections(parseMarkdown(text)))
      .catch(() => setLoadError(true));
  }, [isOpen]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 80) {
      setHasScrolledToBottom(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="w-full max-w-2xl p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ScrollText className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-lg font-bold text-foreground">
                Terms and Conditions
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Scroll through all sections, then click &ldquo;I Accept&rdquo;.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable body */}
        <div
          className="flex-1 overflow-y-auto px-6 py-5 space-y-6"
          onScroll={handleScroll}
        >
          {loadError && (
            <p className="text-destructive text-sm">
              Could not load Terms and Conditions. Please try again.
            </p>
          )}

          {sections.map((section, si) => (
            <div key={si} className="space-y-2">
              {section.heading && (
                <h3 className="text-base font-semibold text-foreground border-l-2 border-primary pl-3">
                  {section.heading}
                </h3>
              )}
              <div className="space-y-1.5">
                {section.items.map((line, li) => {
                  if (line.trim() === "---") {
                    return <hr key={li} className="border-border my-3" />;
                  }
                  if (line.trim() === "") {
                    return <div key={li} className="h-1" />;
                  }
                  if (line.startsWith("- ")) {
                    const content = line.slice(2);
                    return (
                      <div key={li} className="flex gap-2 items-start">
                        <span className="text-primary mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-primary block" />
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

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 shrink-0 space-y-3">
          {!hasScrolledToBottom && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-muted-foreground text-center"
            >
              ↓ Scroll to the bottom to unlock acceptance
            </motion.p>
          )}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1 gap-2"
              disabled={!hasScrolledToBottom}
              onClick={() => { onAccept(); onClose(); }}
            >
              <CheckCircle2 className="w-4 h-4" />
              I Accept
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
