import type { Tint } from "@/features/dashboard/utils/tints";
import type { JobStatusKey } from "../types/kanban";

export const STAGE_TINT_BY_KEY: Record<JobStatusKey, Tint> = {
  SAVED: "indigo",
  APPLIED: "violet",
  INTERVIEW: "cyan",
  OFFER: "amber",
  REJECT: "amber",
};
