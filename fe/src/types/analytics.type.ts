export type OverviewStatsResponse = {
  totalApplications: number;
  responseRate: number; // [0..1]
  avgMatchScore: number;
};

export type PipelineFunnelResponse = Record<string, number>;

export type TopMissingSkillResponse = {
  skillName: string;
  count: number;
};

export type StatusConversionRateResponse = {
  fromStatus: string;
  toStatus: string;
  rate: number; // [0..1]
  count: number;
};

export type AnalyticsOverviewBundle = {
  overviewStats: OverviewStatsResponse;
  pipelineFunnel: PipelineFunnelResponse;
  topMissingSkills: TopMissingSkillResponse[];
  statusConversionRates: StatusConversionRateResponse[];
};
