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
    border: "border-[#5e6ad2]/40",
    bgSoft: "bg-[#5e6ad2]/10",
    text: "text-[#5e6ad2]",
    ring: "ring-[#5e6ad2]/20",
    icon: "text-[#5e6ad2]",
  },
  violet: {
    border: "border-[#5e6ad2]/40",
    bgSoft: "bg-[#5e6ad2]/10",
    text: "text-[#5e6ad2]",
    ring: "ring-[#5e6ad2]/20",
    icon: "text-[#5e6ad2]",
  },
  cyan: {
    border: "border-[#5e6ad2]/40",
    bgSoft: "bg-[#5e6ad2]/10",
    text: "text-[#5e6ad2]",
    ring: "ring-[#5e6ad2]/20",
    icon: "text-[#5e6ad2]",
  },
  amber: {
    border: "border-[#5e6ad2]/40",
    bgSoft: "bg-[#5e6ad2]/10",
    text: "text-[#5e6ad2]",
    ring: "ring-[#5e6ad2]/20",
    icon: "text-[#5e6ad2]",
  },
};
