"use client";

import React, { useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";

import type { JobKanbanCard } from "../types/kanban";
import { JobKanbanCardView } from "./JobKanbanCardView";

export function JobKanbanDraggableCard({
  card,
  tintTextClass,
  onSelect,
}: {
  card: JobKanbanCard;
  tintTextClass: string;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: card.id,
      data: { cardId: card.id, cardStatus: card.status },
    });

  const style = useMemo(() => {
    if (!transform) return undefined;
    return {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      opacity: isDragging ? 0.6 : 1,
    };
  }, [transform, isDragging]);

  return (
    <div
      ref={setNodeRef}
      style={style}
    >
      <div
        {...attributes}
        {...listeners}
      >
        <JobKanbanCardView
          card={card}
          tintTextClass={tintTextClass}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
}
