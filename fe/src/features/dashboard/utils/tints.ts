export type Tint = "indigo" | "violet" | "cyan" | "amber";

export const TINTS: Record<
  Tint,
  {
    border: string;
    bgSoft: string;
    text: string;
    ring: string;
    icon: string;
  }
> = {
  indigo: {
    border: "border-indigo-500/40",
    bgSoft: "bg-indigo-500/10",
    text: "text-indigo-700",
    ring: "ring-indigo-500/20",
    icon: "text-indigo-700",
  },
  violet: {
    border: "border-violet-500/40",
    bgSoft: "bg-violet-500/10",
    text: "text-violet-700",
    ring: "ring-violet-500/20",
    icon: "text-violet-700",
  },
  cyan: {
    border: "border-cyan-500/40",
    bgSoft: "bg-cyan-500/10",
    text: "text-cyan-700",
    ring: "ring-cyan-500/20",
    icon: "text-cyan-700",
  },
  amber: {
    border: "border-amber-500/40",
    bgSoft: "bg-amber-500/10",
    text: "text-amber-700",
    ring: "ring-amber-500/20",
    icon: "text-amber-700",
  },
};
