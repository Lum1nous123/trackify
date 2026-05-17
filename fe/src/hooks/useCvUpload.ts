"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "@/core/http/axiosClient";
import { queryKeys } from "@/constants/query-keys";
import type { ApiResponse } from "@/types/api.type";
import type { CvUploadResponse } from "@/types/cv.type";

export function useCvUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      axiosClient
        .post<ApiResponse<CvUploadResponse>>("/api/proxy/cvs/upload", formData)
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cv.active() });
    },
  });
}
