export type DeadlineTone = "OK" | "SOON" | "OVERDUE";

function toLocalMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function getDeadlineTone(deadline?: string): DeadlineTone {
  if (!deadline) return "OK";

  // deadline from BE is LocalDate serialized: "yyyy-MM-dd"
  const target = new Date(`${deadline}T00:00:00`);
  if (Number.isNaN(target.getTime())) return "OK";

  const now = new Date();
  const today = toLocalMidnight(now);
  const targetMidnight = toLocalMidnight(target);

  const diffMs = targetMidnight.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "OVERDUE";
  if (diffDays <= 3) return "SOON";
  return "OK";
}

export function formatDeadline(deadline?: string): string {
  if (!deadline) return "No deadline";
  // Keep it simple and stable: dd/mm from yyyy-mm-dd
  const parts = deadline.split("-");
  if (parts.length !== 3) return deadline;

  const [yyyy, mm, dd] = parts;
  void yyyy;
  return `${dd}/${mm}`;
}

export function deadlineBadgeClasses(tone: DeadlineTone): string {
  switch (tone) {
    case "SOON":
      return "bg-orange-50 text-[#D97706] ring-1 ring-[#F59E0B]/20 border border-[#F59E0B]/20";
    case "OVERDUE":
      return "bg-red-50 text-[#DC2626] ring-1 ring-[#EF4444]/20 border border-[#EF4444]/20";
    case "OK":
    default:
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20 border border-emerald-500/20";
  }
}
