"use client";

import React from "react";

interface DashboardSkeletonProps {
  title?: string;
  subtitle?: string;
  roleBadge?: string;
  cardsCount?: number;
}

export default function DashboardSkeleton({
  title,
  subtitle,
  roleBadge = "PORTAL BIMCOURSE",
  cardsCount = 4,
}: DashboardSkeletonProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Skeleton */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-black/5 dark:border-white/10 bg-white dark:bg-white/[0.02] shadow-sm">
        {/* Shimmer gradient line at top */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500/40 via-purple-500/40 to-blue-500/40 animate-pulse" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Role Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-200/80 dark:bg-white/10 animate-pulse">
              <div className="w-3.5 h-3.5 rounded-full bg-gray-300 dark:bg-white/20" />
              <div className="h-3 w-32 rounded bg-gray-300 dark:bg-white/20" />
            </div>

            {/* Title */}
            {title ? (
              <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">
                {title}
              </h1>
            ) : (
              <div className="h-8 sm:h-9 w-64 sm:w-80 rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse" />
            )}

            {/* Subtitle */}
            {subtitle ? (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
                {subtitle}
              </p>
            ) : (
              <div className="space-y-1.5">
                <div className="h-3.5 w-full max-w-md rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
                <div className="h-3.5 w-3/4 max-w-sm rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
              </div>
            )}
          </div>

          {/* Quick Action Button Skeleton */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-10 w-28 rounded-2xl bg-gray-200 dark:bg-white/10 animate-pulse" />
            <div className="h-10 w-36 rounded-2xl bg-gray-200 dark:bg-white/10 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Tabs Bar Skeleton */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 w-fit overflow-x-auto max-w-full">
        <div className="h-9 w-28 rounded-xl bg-white dark:bg-white/15 shadow-xs animate-pulse" />
        <div className="h-9 w-28 rounded-xl bg-gray-200/70 dark:bg-white/5 animate-pulse" />
        <div className="h-9 w-28 rounded-xl bg-gray-200/70 dark:bg-white/5 animate-pulse" />
        <div className="h-9 w-24 rounded-xl bg-gray-200/70 dark:bg-white/5 animate-pulse" />
      </div>

      {/* Metric Cards Skeleton Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {Array.from({ length: cardsCount }).map((_, i) => (
          <div
            key={i}
            className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/10 shadow-sm space-y-4 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-gray-200 dark:bg-white/10 animate-pulse" />
              <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-7 w-24 rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse" />
              <div className="h-3.5 w-36 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Filter / Search Bar Skeleton */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="h-10 w-full sm:w-72 rounded-2xl bg-gray-200 dark:bg-white/10 animate-pulse" />
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="h-9 w-24 rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse" />
          <div className="h-9 w-24 rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse" />
        </div>
      </div>

      {/* Content Table / List Skeleton */}
      <div className="rounded-3xl bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/10 shadow-sm overflow-hidden divide-y divide-black/5 dark:divide-white/5">
        {/* Table Header shimmer */}
        <div className="p-4 sm:px-6 bg-gray-50/70 dark:bg-white/[0.02] flex items-center justify-between">
          <div className="h-4 w-32 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
          <div className="h-4 w-20 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
        </div>

        {/* 4 Rows Skeleton */}
        {Array.from({ length: 4 }).map((_, rIdx) => (
          <div
            key={rIdx}
            className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gray-200 dark:bg-white/10 shrink-0" />
              <div className="space-y-2">
                <div className="h-4 w-48 sm:w-64 rounded bg-gray-200 dark:bg-white/10" />
                <div className="h-3 w-32 rounded bg-gray-200/80 dark:bg-white/5" />
              </div>
            </div>

            <div className="flex items-center gap-3 justify-between sm:justify-end">
              <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-white/10" />
              <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-white/10" />
              <div className="h-8 w-24 rounded-xl bg-gray-200 dark:bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
