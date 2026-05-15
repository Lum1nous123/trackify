import type { Tint } from "@/features/dashboard/utils/tints";
import type { KanbanStageKey } from "../mock/mockKanbanData";

export const STAGE_TINT_BY_KEY: Record<KanbanStageKey, Tint> = {
  SAVED: "indigo",
  APPLIED: "violet",
  INTERVIEW: "cyan",
  OFFER: "amber",
};
