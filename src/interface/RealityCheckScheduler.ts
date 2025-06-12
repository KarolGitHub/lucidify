export interface RealityCheckScheduler {
  enabled: boolean;
  frequency:
    | "hourly"
    | "every_1_5_hours"
    | "every_2_hours"
    | "every_4_hours"
    | "every_6_hours"
    | "daily"
    | "custom";
  customInterval: number; // minutes
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  message: string;
  daysOfWeek: string[];
  timezone: string;
}

export interface RealityCheckSchedulerResponse {
  realityCheckScheduler: RealityCheckScheduler;
}

export interface FCMTokenRequest {
  token: string;
}

export interface FCMTokenResponse {
  message: string;
}
