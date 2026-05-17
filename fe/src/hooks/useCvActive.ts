"use client";

import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/core/http/axiosClient";
import { queryKeys } from "@/constants/query-keys";
import type { CvActiveResponse } from "@/types/cv.type";

export function useCvActive() {
  return useQuery<CvActiveResponse | null>({
    queryKey: queryKeys.cv.active(),
    queryFn: () =>
      axiosClient
        .get<CvActiveResponse | null>("/api/proxy/cvs/active")
        .then((r) => r.data),
    retry: false,
    refetchOnWindowFocus: false,
  });
}
