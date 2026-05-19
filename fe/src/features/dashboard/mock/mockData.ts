export type StatAccent = "indigo" | "violet" | "cyan" | "amber";

export type DashboardStat = {
  key: string;
  title: string;
  value: string;
  accent: StatAccent;
  deltaText?: string;
};

export type PipelineStageKey = "SAVED" | "APPLIED" | "INTERVIEW" | "OFFER";

export type PipelineStage = {
  key: PipelineStageKey;
  label: string;
  count: number;
  tint: "indigo" | "violet" | "cyan" | "amber";
};

export type ActivityItem = {
  id: string;
  initials: string;
  name: string;
  company: string;
  statusText: string;
  whenText: string;
  tint: "violet" | "indigo" | "cyan" | "amber";
  companyLogoUrl?: string | null;
};

export type DeadlineItem = {
  id: string;
  companyInitial: string;
  title: string;
  subtitle: string;
  whenText: string;
  urgencyTint: "indigo" | "violet" | "cyan" | "amber";
  companyLogoUrl?: string | null;
};

export const mockDashboard = {
  stats: [
    {
      key: "total",
      title: "TOTAL APPLICATIONS",
      value: "24",
      accent: "indigo",
      deltaText: "↑ +3 this week",
    },
    {
      key: "thisMonth",
      title: "THIS MONTH",
      value: "8",
      accent: "violet",
      deltaText: "↑ +3 this week",
    },
    {
      key: "interviewRate",
      title: "INTERVIEW RATE",
      value: "40%",
      accent: "cyan",
    },
    {
      key: "offers",
      title: "OFFERS",
      value: "2",
      accent: "amber",
      deltaText: "↑ +1 this week",
    },
  ] satisfies DashboardStat[],

  pipeline: [
    { key: "SAVED", label: "SAVED", count: 24, tint: "indigo" },
    { key: "APPLIED", label: "APPLIED", count: 16, tint: "violet" },
    { key: "INTERVIEW", label: "INTERVIEW", count: 7, tint: "cyan" },
    { key: "OFFER", label: "OFFER", count: 2, tint: "indigo" },
  ] satisfies PipelineStage[],

  recentActivity: [
    {
      id: "a1",
      initials: "V",
      name: "VNG Corporation",
      company: "Senior Frontend Developer",
      statusText: "Applied",
      whenText: "Applied • 2h ago",
      tint: "violet",
    },
    {
      id: "a2",
      initials: "T",
      name: "Tiki",
      company: "UI/UX Designer",
      statusText: "Interviewing",
      whenText: "Interviewing • 1d ago",
      tint: "indigo",
    },
    {
      id: "a3",
      initials: "S",
      name: "Shopee",
      company: "Product Manager",
      statusText: "Offer Received",
      whenText: "Offer Received • 2d ago",
      tint: "amber",
    },
    {
      id: "a4",
      initials: "V",
      name: "VNG Corporation",
      company: "Senior Frontend Developer",
      statusText: "Applied",
      whenText: "Applied • 4d ago",
      tint: "cyan",
    },
  ] satisfies ActivityItem[],

  upcomingDeadlines: [
    {
      id: "d1",
      companyInitial: "G",
      title: "Google",
      subtitle: "Full Stack Engineer",
      whenText: "2 days left",
      urgencyTint: "amber",
    },
    {
      id: "d2",
      companyInitial: "M",
      title: "Meta",
      subtitle: "Security Researcher",
      whenText: "Due Today",
      urgencyTint: "violet",
    },
    {
      id: "d3",
      companyInitial: "A",
      title: "Apple",
      subtitle: "iOS Developer",
      whenText: "12 days left",
      urgencyTint: "cyan",
    },
    {
      id: "d4",
      companyInitial: "N",
      title: "Netflix",
      subtitle: "Backend Engineer",
      whenText: "8 days left",
      urgencyTint: "indigo",
    },
  ] satisfies DeadlineItem[],
};
