import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  MoveDown,
  MoveUp,
  Plus,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type {
  EditorSelection,
  EditorTreeAction,
  EditorTreeSection,
} from "@/types/editor";

interface EditorSidebarProps {
  tree: EditorTreeSection[];
  selection: EditorSelection | null;
  onSelect: (selection: EditorSelection) => void;
  onAction: (payload: EditorTreeAction) => void;
}

export function EditorSidebar({ tree, selection, onSelect, onAction }: EditorSidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    topbar: true,
    branding: true,
    hero: true,
    categories: true,
    products: true,
  });

  const hasHiddenSections = useMemo(
    () => tree.some((section) => !section.visible),
    [tree],
  );
  const nextHiddenSection = useMemo(
    () => tree.find((section) => !section.visible)?.id ?? tree[0]?.id ?? "hero",
    [tree],
  );

  const toggleExpanded = (sectionId: string) => {
    setExpanded((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="px-3 py-3 border-b flex items-center justify-between gap-2">
        <h3 className="font-semibold text-sm">Secoes e blocos</h3>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7"
          onClick={() => onAction({ action: "add", sectionId: nextHiddenSection })}
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Secao
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {tree.map((section) => {
            const isSelectedSection =
              selection?.type === "section" && selection.sectionId === section.id;
            const isExpanded = expanded[section.id] ?? true;

            return (
              <div
                key={section.id}
                className={cn(
                  "rounded-lg border border-border/70 bg-background",
                  !section.visible && "opacity-60",
                )}
              >
                <div className="flex items-center gap-1 p-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => toggleExpanded(section.id)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>

                  <button
                    type="button"
                    className={cn(
                      "flex-1 text-left rounded-md px-2 py-1.5 text-sm",
                      isSelectedSection
                        ? "bg-secondary text-secondary-foreground font-semibold"
                        : "hover:bg-muted",
                    )}
                    onClick={() => onSelect({ type: "section", sectionId: section.id })}
                  >
                    {section.label}
                  </button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onAction({ action: "add", sectionId: section.id, blockId: "new" })}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onAction({ action: "move-up", sectionId: section.id })}
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onAction({ action: "move-down", sectionId: section.id })}
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onAction({ action: "duplicate", sectionId: section.id })}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onAction({ action: "delete", sectionId: section.id })}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      onAction({ action: "toggle-visibility", sectionId: section.id })
                    }
                  >
                    {section.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </Button>
                </div>

                {isExpanded && section.blocks.length > 0 ? (
                  <div className="px-2 pb-2 space-y-1">
                    {section.blocks.map((block) => {
                      const isSelectedBlock =
                        selection?.type === "block" &&
                        selection.sectionId === section.id &&
                        selection.blockId === block.id;

                      return (
                        <div key={block.id} className="flex items-center gap-1 pl-6">
                          <button
                            type="button"
                            className={cn(
                              "flex-1 text-left rounded-md px-2 py-1 text-xs",
                              isSelectedBlock
                                ? "bg-secondary text-secondary-foreground font-medium"
                                : "hover:bg-muted",
                            )}
                            onClick={() =>
                              onSelect({
                                type: "block",
                                sectionId: section.id,
                                blockId: block.id,
                              })
                            }
                          >
                            {block.label}
                          </button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              onAction({
                                action: "move-up",
                                sectionId: section.id,
                                blockId: block.id,
                              })
                            }
                          >
                            <MoveUp className="w-3 h-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              onAction({
                                action: "move-down",
                                sectionId: section.id,
                                blockId: block.id,
                              })
                            }
                          >
                            <MoveDown className="w-3 h-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              onAction({
                                action: "toggle-visibility",
                                sectionId: section.id,
                                blockId: block.id,
                              })
                            }
                          >
                            {block.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              onAction({
                                action: "duplicate",
                                sectionId: section.id,
                                blockId: block.id,
                              })
                            }
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              onAction({
                                action: "delete",
                                sectionId: section.id,
                                blockId: block.id,
                              })
                            }
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}

          {hasHiddenSections ? (
            <p className="text-[11px] text-muted-foreground px-1">
              Algumas secoes estao ocultas no template atual.
            </p>
          ) : null}
        </div>
      </ScrollArea>
    </div>
  );
}
