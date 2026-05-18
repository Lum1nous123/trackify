"use client";

import React from "react";
import { HydrationBoundary, type DehydratedState } from "@tanstack/react-query";

export function KanbanJobsHydrationBoundary({
  dehydratedState,
  children,
}: {
  dehydratedState: DehydratedState;
  children: React.ReactNode;
}) {
  return (
    <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
  );
}
