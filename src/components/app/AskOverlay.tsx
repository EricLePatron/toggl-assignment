import { Sparkle, X } from "lucide-react";
import { askConversation } from "@/data/fixtures";

export function AskOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-10 backdrop-blur-sm">
      <div className="panel flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <Sparkle className="size-4 text-accent-pink" />
          <span className="text-sm font-semibold">Ask Toggl</span>
          <kbd className="ml-2 rounded border border-border px-1.5 text-[10px] text-subtle">
            ⌘K
          </kbd>
          <button
            onClick={onClose}
            className="ml-auto text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {askConversation.map((msg, i) =>
            msg.role === "user" ? (
              <div key={i} className="flex justify-end">
                <p className="max-w-[75%] rounded-2xl bg-surface-2 px-4 py-2.5 text-sm">
                  {msg.text}
                </p>
              </div>
            ) : (
              <div key={i} className="space-y-4 text-sm">
                <p className="text-foreground">{msg.text}</p>

                {msg.table && (
                  <div className="overflow-hidden rounded-xl border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-surface-2">
                          {msg.table.head.map((h) => (
                            <th key={h} className="label-caps px-3 py-2 text-left">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {msg.table.rows.map((row) => (
                          <tr key={row[0]} className="border-t border-border">
                            {row.map((cell, ci) => (
                              <td
                                key={ci}
                                className={
                                  ci === 0
                                    ? "px-3 py-2"
                                    : "tnum px-3 py-2 text-muted-foreground"
                                }
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {msg.takeaways && (
                  <div>
                    <div className="label-caps pb-1.5">Takeaways</div>
                    <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                      {msg.takeaways.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {msg.actions && (
                  <div className="flex flex-wrap gap-2">
                    {msg.actions.map((a) => (
                      <span key={a} className="pill">
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ),
          )}
        </div>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-subtle">
            Ask anything about your time, projects or clients…
          </div>
        </div>
      </div>
    </div>
  );
}
