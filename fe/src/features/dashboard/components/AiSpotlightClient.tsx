"use client";

import React from "react";
import { useKanbanJobs } from "@/features/kanban/hooks/useKanbanJobs";
import type { JobKanbanCard } from "@/features/kanban/types/kanban";
import { AiSpotlight } from "./AiSpotlight";

export function AiSpotlightClient() {
  const { data, isLoading } = useKanbanJobs();

  const cards: JobKanbanCard[] = Array.isArray(data?.cards) ? data.cards : [];

  return (
    <AiSpotlight
      cards={cards}
      isLoading={isLoading}
    />
  );
}
