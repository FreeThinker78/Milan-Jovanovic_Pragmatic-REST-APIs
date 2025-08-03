import { HateoasResponse } from '../../types/api';

export enum HabitType {
  None = 0,
  Binary = 1,
  Measurable = 2,
}

export enum HabitStatus {
  None = 0,
  Active = 1,
  Completed = 2,
  Failed = 3,
}

export enum FrequencyType {
  None = 0,
  Daily = 1,
  Weekly = 2,
  Monthly = 3,
}

export enum AutomationSource {
  GitHub = 1,
}

export interface FrequencyDto {
  type: FrequencyType;
  timesPerPeriod: number;
}

export interface TargetDto {
  value: number;
  unit: string;
}

export interface MilestoneDto {
  target: number;
}

export interface CreateHabitDto {
  name: string;
  description?: string;
  type: HabitType;
  frequency: FrequencyDto;
  target: TargetDto;
  endDate?: string; // DateOnly will be sent as ISO string
  milestone?: MilestoneDto;
  automationSource?: AutomationSource;
}

export interface UpdateHabitDto {
  name: string;
  description?: string;
  type: HabitType;
  frequency: FrequencyDto;
  target: TargetDto;
  endDate?: string; // DateOnly will be sent as ISO string
  milestone?: MilestoneDto;
  automationSource?: AutomationSource;
}

export interface Habit extends CreateHabitDto, HateoasResponse {
  id: string;
  status: HabitStatus;
  isArchived: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  lastCompletedAtUtc: string | null;
  tags: string[];
  automationSource?: AutomationSource;
}
