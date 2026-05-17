"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/core/http/axiosClient";
import { queryKeys } from "@/constants/query-keys";
import type {
  OverviewStatsResponse,
  PipelineFunnelResponse,
  StatusConversionRateResponse,
  TopMissingSkillResponse,
} from "@/types/analytics.type";

export function useAnalyticsOverviewStats(params: { userId?: string }) {
  return useQuery<OverviewStatsResponse>({
    queryKey: queryKeys.analytics.overviewStats({
      userId: params.userId ?? "",
    }),
    queryFn: () =>
      axiosClient
        .get<OverviewStatsResponse>("/api/proxy/jobs/overview-stats", {
          params: { userId: params.userId },
        })
        .then((r) => r.data),
    enabled: !!params.userId,
  });
}

export function useAnalyticsPipelineFunnel(params: { userId?: string }) {
  return useQuery<PipelineFunnelResponse>({
    queryKey: queryKeys.analytics.pipelineFunnel({
      userId: params.userId ?? "",
    }),
    queryFn: () =>
      axiosClient
        .get<PipelineFunnelResponse>("/api/proxy/jobs/pipeline-funnel", {
          params: { userId: params.userId },
        })
        .then((r) => r.data),
    enabled: !!params.userId,
  });
}

export function useAnalyticsTopMissingSkills(params: {
  userId?: string;
  limit: number;
}) {
  return useQuery<TopMissingSkillResponse[]>({
    queryKey: queryKeys.analytics.topMissingSkills({
      userId: params.userId ?? "",
      limit: params.limit,
    }),
    queryFn: () =>
      axiosClient
        .get<TopMissingSkillResponse[]>("/api/proxy/jobs/top-missing-skills", {
          params: { userId: params.userId, limit: params.limit },
        })
        .then((r) => r.data),
    enabled: !!params.userId && params.limit > 0,
  });
}

export function useAnalyticsStatusConversionRates(params: {
  userId?: string;
  limit: number;
}) {
  return useQuery<StatusConversionRateResponse[]>({
    queryKey: queryKeys.analytics.statusConversionRates({
      userId: params.userId ?? "",
      limit: params.limit,
    }),
    queryFn: () =>
      axiosClient
        .get<StatusConversionRateResponse[]>(
          "/api/proxy/jobs/status-conversion-rates",
          {
            params: { userId: params.userId, limit: params.limit },
          },
        )
        .then((r) => r.data),
    enabled: !!params.userId && params.limit > 0,
  });
}
