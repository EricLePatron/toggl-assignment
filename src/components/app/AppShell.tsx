import { useEffect, useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { AskOverlay } from "./AskOverlay";

export function AppShell({ children }: { children: ReactNode }) {
  const [askOpen, setAskOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAskOpen((v) => !v);
      }
      if (e.key === "Escape") setAskOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar onOpenAsk={() => setAskOpen(true)} />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <AskOverlay open={askOpen} onClose={() => setAskOpen(false)} />
    </div>
  );
}
