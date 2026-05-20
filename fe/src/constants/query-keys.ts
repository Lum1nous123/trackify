export const queryKeys = {
  auth: {
    me: () => ["auth", "me"] as const,
  },
  kanban: {
    jobs: () => ["kanban", "jobs"] as const,
  },
  cv: {
    active: () => ["cv", "active"] as const,
  },
  analytics: {
    overviewStats: (params: { userId: string }) =>
      ["analytics", "overview-stats", params] as const,
    pipelineFunnel: (params: { userId: string }) =>
      ["analytics", "pipeline-funnel", params] as const,
    topMissingSkills: (params: { userId: string; limit: number }) =>
      ["analytics", "top-missing-skills", params] as const,
    statusConversionRates: (params: { userId: string; limit: number }) =>
      ["analytics", "status-conversion-rates", params] as const,
  },
  applications: {
    jobs: () => ["applications", "jobs"] as const,
  },
  reminders: {
    settings: () => ["reminders", "settings"] as const,
    logs: (params: { limit: number }) => ["reminders", "logs", params] as const,
  },
} as const;
