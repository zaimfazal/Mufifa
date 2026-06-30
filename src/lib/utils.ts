import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { TournamentStage } from "@/types/database"
import { ALL_TOURNAMENT_STAGES } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatScore(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format((Number(value) || 0) / 100)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateStr))
}

export function getStageLabel(stage: TournamentStage): string {
  return ALL_TOURNAMENT_STAGES.find((s) => s.value === stage)?.label || stage
}
