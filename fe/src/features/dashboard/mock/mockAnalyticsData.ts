export type AnalyticsOverviewStats = {
  totalApplications: number;
  responseRate: number; // [0..1]
  avgMatchScore: number; // e.g. 58 means 58%
};

export type AnalyticsPipelineFunnel = Record<
  string,
  number // count
>;

export type AnalyticsTopMissingSkill = {
  skillName: string;
  count: number;
};

export type AnalyticsStatusConversionRate = {
  fromStatus: string;
  toStatus: string;
  rate: number; // [0..1]
  count: number;
};

export type ApplicationsOverTimePoint = {
  weekLabel: string;
  count: number;
};

export type MatchScoreBucket = {
  label: "Low" | "Mid" | "High";
  color: "red" | "amber" | "teal";
  count: number;
};

export type MockAnalyticsData = {
  overviewStats: AnalyticsOverviewStats;
  pipelineFunnel: AnalyticsPipelineFunnel;
  topMissingSkills: AnalyticsTopMissingSkill[];
  statusConversionRates: AnalyticsStatusConversionRate[];

  applicationsOverTime: ApplicationsOverTimePoint[];
  matchScoreBuckets: MatchScoreBucket[];
  matchScoreTotal: number;

  avgTimeToOfferDays: number;
};

// NOTE: This mock data is shaped from BE analytics endpoints in JobController:
// - /overview-stats
// - /pipeline-funnel
// - /top-missing-skills
// - /status-conversion-rates
export const mockAnalyticsData: MockAnalyticsData = {
  overviewStats: {
    totalApplications: 24,
    responseRate: 0.4,
    avgMatchScore: 58,
  },

  // job statuses -> counts (BE: Map<String, Long>)
  pipelineFunnel: {
    SAVED: 24,
    APPLIED: 16,
    INTERVIEW: 7,
    OFFER: 2,
    REJECT: 5,
  },

  topMissingSkills: [
    { skillName: "Docker", count: 18 },
    { skillName: "AWS", count: 14 },
    { skillName: "GraphQL", count: 11 },
    { skillName: "Kubernetes", count: 8 },
  ],

  statusConversionRates: [
    // 16 / 24 = 0.666... -> 67%
    { fromStatus: "SAVED", toStatus: "APPLIED", rate: 0.67, count: 16 },
    // 7 / 16 = 0.4375 -> 44%
    {
      fromStatus: "APPLIED",
      toStatus: "INTERVIEW",
      rate: 0.44,
      count: 7,
    },
    // 2 / 7 = 0.2857 -> 29%
    { fromStatus: "INTERVIEW", toStatus: "OFFER", rate: 0.29, count: 2 },
    // mocked rejection bucket (UI labels it as "Any → Rejected")
    // 5 / 24 = 0.208... -> 21%
    { fromStatus: "APPLIED", toStatus: "REJECT", rate: 0.21, count: 5 },
  ],

  // purely visual mock series for the chart (derived from the total)
  applicationsOverTime: [
    { weekLabel: "Week 1", count: 6 },
    { weekLabel: "Week 2", count: 5 },
    { weekLabel: "Week 3", count: 7 },
    { weekLabel: "Week 4", count: 12 },
    { weekLabel: "Week 5", count: 14 },
    { weekLabel: "Week 6", count: 9 },
    { weekLabel: "Week 7", count: 13 },
    { weekLabel: "Week 8", count: 4 },
  ],

  // Visual mock distribution; we still keep total/targets consistent with overviewStats.totalApplications
  matchScoreTotal: 24,
  matchScoreBuckets: [
    { label: "Low", color: "red", count: 8 },
    { label: "Mid", color: "amber", count: 11 },
    { label: "High", color: "teal", count: 5 },
  ],

  // Not provided by BE JobController yet (UI mock only for now)
  avgTimeToOfferDays: 18,
};
