import * as React from "react";
import { CheckCircle2, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SetupChecklistItem {
  id: string;
  title: string;
  done: boolean;
  onClick?: () => void;
}

export interface SetupChecklistProps extends React.HTMLAttributes<HTMLDivElement> {
  items: SetupChecklistItem[];
}

export function SetupChecklist({ items, className, ...props }: SetupChecklistProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-card text-card-foreground", className)} {...props}>
      <ul className="space-y-1 p-2">
        {items.map((item) => {
          const content = (
            <>
              {item.done ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 text-muted-foreground" />
              )}

              <span className={cn("text-sm leading-6", item.done ? "text-muted-foreground" : "text-foreground")}>
                {item.title}
              </span>
            </>
          );

          const baseClassName = cn(
            "flex w-full items-start gap-3 rounded-md px-3 py-2 text-left",
            item.onClick
              ? "hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              : null,
          );
          return (
            <li key={item.id}>
              {item.onClick ? (
                <button type="button" onClick={item.onClick} className={baseClassName}>
                  {content}
                </button>
              ) : (
                <div className={baseClassName}>{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
