import { RealityCheckScheduler } from "@/interface/RealityCheckScheduler";

export default {
  settings: {
    enabled: false,
    frequency: "every_4_hours" as const,
    customInterval: 240,
    startTime: "09:00",
    endTime: "22:00",
    message: "Are you dreaming?",
    daysOfWeek: [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ],
    timezone: "UTC",
  } as RealityCheckScheduler,
  loading: false,
  error: null as string | null,
  fcmToken: null as string | null,
  notificationPermission: "default" as NotificationPermission,
};
